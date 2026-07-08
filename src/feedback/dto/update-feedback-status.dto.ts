import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackStatus } from '../entities/feedback.entity';

export class UpdateFeedbackStatusDto {
  @ApiProperty({ description: 'New status', enum: FeedbackStatus })
  @IsEnum(FeedbackStatus)
  status: FeedbackStatus;

  @ApiPropertyOptional({ description: 'Internal note about the status change' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  note?: string;
}
