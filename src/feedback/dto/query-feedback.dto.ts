import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackCategory, FeedbackStatus } from '../entities/feedback.entity';

export class QueryFeedbackDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by app name' })
  @IsString()
  @IsOptional()
  appName?: string;

  @ApiPropertyOptional({ description: 'Filter by category', enum: FeedbackCategory })
  @IsEnum(FeedbackCategory)
  @IsOptional()
  category?: FeedbackCategory;

  @ApiPropertyOptional({ description: 'Filter by status', enum: FeedbackStatus })
  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

  @ApiPropertyOptional({ description: 'Filter by minimum rating' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  minRating?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum rating' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  maxRating?: number;

  @ApiPropertyOptional({ description: 'Search in message text' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
