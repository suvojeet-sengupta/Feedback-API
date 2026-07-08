import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Feedback, FeedbackStatus } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly telegramService: TelegramService,
  ) {}

  async create(dto: CreateFeedbackDto, ipAddress?: string): Promise<Feedback> {
    const feedback = this.feedbackRepository.create({
      ...dto,
      ipAddress,
    });

    const saved = await this.feedbackRepository.save(feedback);
    this.logger.log(`New feedback created: ${saved.id} for app ${saved.appName}`);

    // Send Telegram notification (non-blocking)
    this.telegramService.sendFeedbackNotification(saved).catch((err) => {
      this.logger.error(`Failed to send Telegram notification: ${err.message}`);
    });

    return saved;
  }

  async findAll(query: QueryFeedbackDto): Promise<{
    data: Feedback[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { appName, category, status, minRating, maxRating, search } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';

    const qb = this.feedbackRepository.createQueryBuilder('feedback');

    if (appName) {
      qb.andWhere('feedback.appName = :appName', { appName });
    }

    if (category) {
      qb.andWhere('feedback.category = :category', { category });
    }

    if (status) {
      qb.andWhere('feedback.status = :status', { status });
    }

    if (minRating) {
      qb.andWhere('feedback.rating >= :minRating', { minRating });
    }

    if (maxRating) {
      qb.andWhere('feedback.rating <= :maxRating', { maxRating });
    }

    if (search) {
      qb.andWhere('feedback.message LIKE :search', { search: `%${search}%` });
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['createdAt', 'rating', 'appName', 'category', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`feedback.${safeSortBy}`, safeSortOrder);

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({ where: { id } });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID "${id}" not found`);
    }
    return feedback;
  }

  async updateStatus(id: string, dto: UpdateFeedbackStatusDto): Promise<Feedback> {
    const feedback = await this.findOne(id);
    const previousStatus = feedback.status;

    feedback.status = dto.status;
    const updated = await this.feedbackRepository.save(feedback);

    this.logger.log(`Feedback ${id} status updated: ${previousStatus} -> ${dto.status}`);

    // Send Telegram notification for status change (non-blocking)
    this.telegramService.sendStatusUpdateNotification(updated, previousStatus).catch((err) => {
      this.logger.error(`Failed to send status update notification: ${err.message}`);
    });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const feedback = await this.findOne(id);
    await this.feedbackRepository.remove(feedback);
    this.logger.log(`Feedback ${id} deleted`);
  }

  async getStats(appName?: string): Promise<{
    totalFeedback: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    categoryDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
    recentTrend: { date: string; count: number; avgRating: number }[];
    topApps: { appName: string; count: number; avgRating: number }[];
  }> {
    const qb = this.feedbackRepository.createQueryBuilder('feedback');

    if (appName) {
      qb.andWhere('feedback.appName = :appName', { appName });
    }

    const allFeedback = await qb.getMany();
    const totalFeedback = allFeedback.length;

    // Average rating
    const averageRating = totalFeedback > 0
      ? Number((allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(2))
      : 0;

    // Rating distribution
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allFeedback.forEach(f => {
      ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
    });

    // Category distribution
    const categoryDistribution: Record<string, number> = {};
    allFeedback.forEach(f => {
      categoryDistribution[f.category] = (categoryDistribution[f.category] || 0) + 1;
    });

    // Status distribution
    const statusDistribution: Record<string, number> = {};
    allFeedback.forEach(f => {
      statusDistribution[f.status] = (statusDistribution[f.status] || 0) + 1;
    });

    // Recent trend (last 7 days)
    const recentTrend: { date: string; count: number; avgRating: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayFeedback = allFeedback.filter(f => {
        const fDate = new Date(f.createdAt).toISOString().split('T')[0];
        return fDate === dateStr;
      });

      recentTrend.push({
        date: dateStr,
        count: dayFeedback.length,
        avgRating: dayFeedback.length > 0
          ? Number((dayFeedback.reduce((s, f) => s + f.rating, 0) / dayFeedback.length).toFixed(2))
          : 0,
      });
    }

    // Top apps
    const appMap = new Map<string, { count: number; totalRating: number }>();
    allFeedback.forEach(f => {
      const existing = appMap.get(f.appName) || { count: 0, totalRating: 0 };
      existing.count++;
      existing.totalRating += f.rating;
      appMap.set(f.appName, existing);
    });

    const topApps = Array.from(appMap.entries())
      .map(([name, data]) => ({
        appName: name,
        count: data.count,
        avgRating: Number((data.totalRating / data.count).toFixed(2)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalFeedback,
      averageRating,
      ratingDistribution,
      categoryDistribution,
      statusDistribution,
      recentTrend,
      topApps,
    };
  }

  async getAppNames(): Promise<string[]> {
    const result = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('DISTINCT feedback.appName', 'appName')
      .getRawMany();

    return result.map(r => r.appName);
  }
}
