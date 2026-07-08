import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { Request } from 'express';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { QueryFeedbackDto } from './dto/query-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';

@ApiTags('Feedback')
@Controller('api/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit new feedback' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    return this.feedbackService.create(createFeedbackDto, ipAddress);
  }

  @Get()
  @ApiOperation({ summary: 'List all feedback with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Feedback list retrieved' })
  async findAll(@Query() query: QueryFeedbackDto) {
    return this.feedbackService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get feedback statistics and analytics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiQuery({ name: 'appName', required: false, description: 'Filter stats by app name' })
  async getStats(@Query('appName') appName?: string) {
    return this.feedbackService.getStats(appName);
  }

  @Get('apps')
  @ApiOperation({ summary: 'Get list of all app names that have feedback' })
  @ApiResponse({ status: 200, description: 'App names retrieved' })
  async getAppNames() {
    return this.feedbackService.getAppNames();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single feedback by ID' })
  @ApiParam({ name: 'id', description: 'Feedback UUID' })
  @ApiResponse({ status: 200, description: 'Feedback found' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feedbackService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update feedback status' })
  @ApiParam({ name: 'id', description: 'Feedback UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateFeedbackStatusDto,
  ) {
    return this.feedbackService.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a feedback entry' })
  @ApiParam({ name: 'id', description: 'Feedback UUID' })
  @ApiResponse({ status: 204, description: 'Feedback deleted' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feedbackService.remove(id);
  }
}
