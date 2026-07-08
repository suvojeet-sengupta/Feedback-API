import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackCategory, FeedbackStatus } from '../entities/feedback.entity';

export class QueryFeedbackDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by app name' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString({ message: 'App name must be a string' })
  @IsOptional()
  appName?: string;

  @ApiPropertyOptional({ description: 'Filter by category', enum: FeedbackCategory })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsEnum(FeedbackCategory, { message: `Category must be one of: ${Object.values(FeedbackCategory).join(', ')}` })
  @IsOptional()
  category?: FeedbackCategory;

  @ApiPropertyOptional({ description: 'Filter by status', enum: FeedbackStatus })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsEnum(FeedbackStatus, { message: `Status must be one of: ${Object.values(FeedbackStatus).join(', ')}` })
  @IsOptional()
  status?: FeedbackStatus;

  @ApiPropertyOptional({ description: 'Filter by minimum rating' })
  @Type(() => Number)
  @IsInt({ message: 'Minimum rating must be an integer' })
  @Min(1, { message: 'Minimum rating must be at least 1' })
  @Max(5, { message: 'Minimum rating cannot exceed 5' })
  @IsOptional()
  minRating?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum rating' })
  @Type(() => Number)
  @IsInt({ message: 'Maximum rating must be an integer' })
  @Min(1, { message: 'Maximum rating must be at least 1' })
  @Max(5, { message: 'Maximum rating cannot exceed 5' })
  @IsOptional()
  maxRating?: number;

  @ApiPropertyOptional({ description: 'Search in message text' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString({ message: 'Search query must be a string' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString({ message: 'Sort by field must be a string' })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsString({ message: 'Sort order must be a string' })
  @IsEnum(['ASC', 'DESC'], { message: 'Sort order must be either ASC or DESC' })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
