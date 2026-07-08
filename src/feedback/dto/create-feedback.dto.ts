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
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackCategory } from '../entities/feedback.entity';

// Helper function to trim strings and convert empty/null values to undefined for optional fields
const CleanOptionalString = () =>
  Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? undefined : trimmed;
    }
    return value;
  });

// Helper function to trim required string fields
const CleanRequiredString = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateFeedbackDto {
  @ApiProperty({ description: 'Name of the app', example: 'MyAwesomeApp' })
  @CleanRequiredString()
  @IsString({ message: 'App name must be a string' })
  @IsNotEmpty({ message: 'App name is required and cannot be empty' })
  @MaxLength(100, { message: 'App name cannot exceed 100 characters' })
  appName: string;

  @ApiPropertyOptional({ description: 'App version', example: '2.1.0' })
  @CleanOptionalString()
  @IsString({ message: 'App version must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'App version cannot exceed 20 characters' })
  appVersion?: string;

  @ApiPropertyOptional({ description: 'App package name', example: 'com.example.myapp' })
  @CleanOptionalString()
  @IsString({ message: 'App package must be a string' })
  @IsOptional()
  @MaxLength(150, { message: 'App package cannot exceed 150 characters' })
  appPackage?: string;

  @ApiProperty({ description: 'Rating from 1 to 5', example: 4, minimum: 1, maximum: 5 })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot be more than 5' })
  rating: number;

  @ApiPropertyOptional({ description: 'Feedback category', enum: FeedbackCategory, example: FeedbackCategory.GENERAL })
  @CleanOptionalString()
  @IsEnum(FeedbackCategory, { message: `Category must be one of: ${Object.values(FeedbackCategory).join(', ')}` })
  @IsOptional()
  category?: FeedbackCategory;

  @ApiProperty({ description: 'Feedback message', example: 'Love the new dark mode!' })
  @CleanRequiredString()
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required and cannot be empty' })
  @MaxLength(5000, { message: 'Message cannot exceed 5000 characters' })
  message: string;

  @ApiPropertyOptional({ description: 'User email', example: 'user@example.com' })
  @CleanOptionalString()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  userEmail?: string;

  @ApiPropertyOptional({ description: 'User display name', example: 'John Doe' })
  @CleanOptionalString()
  @IsString({ message: 'User name must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'User name cannot exceed 100 characters' })
  userName?: string;

  @ApiPropertyOptional({ description: 'Unique user identifier from your app' })
  @CleanOptionalString()
  @IsString({ message: 'User ID must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'User ID cannot exceed 100 characters' })
  userId?: string;

  @ApiPropertyOptional({ description: 'Device model', example: 'Pixel 8 Pro' })
  @CleanOptionalString()
  @IsString({ message: 'Device model must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'Device model cannot exceed 100 characters' })
  deviceModel?: string;

  @ApiPropertyOptional({ description: 'Device brand', example: 'Google' })
  @CleanOptionalString()
  @IsString({ message: 'Device brand must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'Device brand cannot exceed 100 characters' })
  deviceBrand?: string;

  @ApiPropertyOptional({ description: 'OS version', example: 'Android 15' })
  @CleanOptionalString()
  @IsString({ message: 'OS version must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'OS version cannot exceed 50 characters' })
  osVersion?: string;

  @ApiPropertyOptional({ description: 'SDK version', example: '35' })
  @CleanOptionalString()
  @IsString({ message: 'SDK version must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'SDK version cannot exceed 20 characters' })
  sdkVersion?: string;

  @ApiPropertyOptional({ description: 'Screen resolution', example: '1080x2400' })
  @CleanOptionalString()
  @IsString({ message: 'Screen resolution must be a string' })
  @IsOptional()
  @MaxLength(30, { message: 'Screen resolution cannot exceed 30 characters' })
  screenResolution?: string;

  @ApiPropertyOptional({ description: 'Device locale', example: 'en_US' })
  @CleanOptionalString()
  @IsString({ message: 'Locale must be a string' })
  @IsOptional()
  @MaxLength(20, { message: 'Locale cannot exceed 20 characters' })
  locale?: string;

  @ApiPropertyOptional({ description: 'Device timezone', example: 'America/New_York' })
  @CleanOptionalString()
  @IsString({ message: 'Timezone must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'Timezone cannot exceed 100 characters' })
  timezone?: string;

  @ApiPropertyOptional({ description: 'Network type', example: 'wifi' })
  @CleanOptionalString()
  @IsString({ message: 'Network type must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'Network type cannot exceed 50 characters' })
  networkType?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', example: { screen: 'settings', theme: 'dark' } })
  @IsObject({ message: 'Metadata must be a valid JSON object' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tags for categorization', example: ['urgent', 'login-issue'] })
  @IsArray({ message: 'Tags must be an array of strings' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @IsOptional()
  tags?: string[];
}
