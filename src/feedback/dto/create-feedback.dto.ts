import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsEmail,
  IsObject,
  IsArray,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackCategory } from '../entities/feedback.entity';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Name of the app', example: 'MyAwesomeApp' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  appName: string;

  @ApiPropertyOptional({ description: 'App version', example: '2.1.0' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  appVersion?: string;

  @ApiPropertyOptional({ description: 'App package name', example: 'com.example.myapp' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  appPackage?: string;

  @ApiProperty({ description: 'Rating from 1 to 5', example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Feedback category', enum: FeedbackCategory, example: FeedbackCategory.GENERAL })
  @IsEnum(FeedbackCategory)
  @IsOptional()
  category?: FeedbackCategory;

  @ApiProperty({ description: 'Feedback message', example: 'Love the new dark mode!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message: string;

  @ApiPropertyOptional({ description: 'User email', example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @ApiPropertyOptional({ description: 'User display name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  userName?: string;

  @ApiPropertyOptional({ description: 'Unique user identifier from your app' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Device model', example: 'Pixel 8 Pro' })
  @IsString()
  @IsOptional()
  deviceModel?: string;

  @ApiPropertyOptional({ description: 'Device brand', example: 'Google' })
  @IsString()
  @IsOptional()
  deviceBrand?: string;

  @ApiPropertyOptional({ description: 'OS version', example: 'Android 15' })
  @IsString()
  @IsOptional()
  osVersion?: string;

  @ApiPropertyOptional({ description: 'SDK version', example: '35' })
  @IsString()
  @IsOptional()
  sdkVersion?: string;

  @ApiPropertyOptional({ description: 'Screen resolution', example: '1080x2400' })
  @IsString()
  @IsOptional()
  screenResolution?: string;

  @ApiPropertyOptional({ description: 'Device locale', example: 'en_US' })
  @IsString()
  @IsOptional()
  locale?: string;

  @ApiPropertyOptional({ description: 'Device timezone', example: 'America/New_York' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Network type', example: 'wifi' })
  @IsString()
  @IsOptional()
  networkType?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', example: { screen: 'settings', theme: 'dark' } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags for categorization', example: ['urgent', 'login-issue'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
