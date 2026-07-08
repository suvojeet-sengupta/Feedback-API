import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackStatus } from '../entities/feedback.entity';

export class UpdateFeedbackStatusDto {
  @ApiProperty({ description: 'New status', enum: FeedbackStatus })
  @IsEnum(FeedbackStatus, { message: `Status must be one of: ${Object.values(FeedbackStatus).join(', ')}` })
  status: FeedbackStatus;

  @ApiPropertyOptional({ description: 'Internal note about the status change' })
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  })
  @IsString({ message: 'Note must be a string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Note cannot exceed 1000 characters' })
  note?: string;
}
