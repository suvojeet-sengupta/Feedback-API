import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Feedback } from '../feedback/entities/feedback.entity';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.get<string>('telegram.botToken') ?? '';
    this.chatId = this.configService.get<string>('telegram.chatId') ?? '';
    this.enabled = this.configService.get<boolean>('telegram.enabled') ?? false;
  }

  async sendFeedbackNotification(feedback: Feedback): Promise<void> {
    if (!this.enabled) {
      this.logger.debug('Telegram notifications are disabled');
      return;
    }

    if (!this.botToken || !this.chatId) {
      this.logger.warn('Telegram bot token or chat ID not configured');
      return;
    }

    let text = `*New Feedback Received*\n\n`;
    text += `*App:* ${this.escapeMarkdown(feedback.appName)}`;
    if (feedback.appVersion) text += ` \\(v${this.escapeMarkdown(feedback.appVersion)}\\)`;
    text += `\n`;
    text += `*Rating:* ${feedback.rating}/5\n`;
    text += `*Category:* ${this.escapeMarkdown(feedback.category)}\n`;
    text += `*Status:* ${this.escapeMarkdown(feedback.status)}\n\n`;
    text += `*Message:*\n${this.escapeMarkdown(feedback.message)}\n`;

    if (feedback.userName || feedback.userEmail) {
      text += `\n*User:* `;
      if (feedback.userName) text += this.escapeMarkdown(feedback.userName);
      if (feedback.userEmail) text += ` \\(${this.escapeMarkdown(feedback.userEmail)}\\)`;
      text += `\n`;
    }

    if (feedback.deviceModel || feedback.osVersion) {
      text += `\n*Device:* `;
      const parts: string[] = [];
      if (feedback.deviceBrand) parts.push(this.escapeMarkdown(feedback.deviceBrand));
      if (feedback.deviceModel) parts.push(this.escapeMarkdown(feedback.deviceModel));
      if (feedback.osVersion) parts.push(this.escapeMarkdown(feedback.osVersion));
      text += parts.join(' · ');
      text += `\n`;
    }

    if (feedback.tags && feedback.tags.length > 0) {
      text += `\n*Tags:* ${feedback.tags.map(t => `#${this.escapeMarkdown(t)}`).join(' ')}\n`;
    }

    text += `\n*Date:* ${this.escapeMarkdown(feedback.createdAt.toISOString())}`;
    text += `\n*ID:* \`${feedback.id}\``;

    await this.sendMessage(text);
  }

  async sendStatusUpdateNotification(feedback: Feedback, previousStatus: string): Promise<void> {
    if (!this.enabled) return;

    let text = `*Feedback Status Updated*\n\n`;
    text += `*App:* ${this.escapeMarkdown(feedback.appName)}\n`;
    text += `*Status:* ${this.escapeMarkdown(previousStatus)} \\-\\> *${this.escapeMarkdown(feedback.status)}*\n`;
    text += `*Rating:* ${feedback.rating}/5\n`;
    text += `\n*Message:*\n${this.escapeMarkdown(feedback.message.substring(0, 100))}${feedback.message.length > 100 ? '\\.\\.\\.' : ''}\n`;
    text += `\n*ID:* \`${feedback.id}\``;

    await this.sendMessage(text);
  }

  async sendDailySummary(stats: {
    totalToday: number;
    averageRating: number;
    byCategory: Record<string, number>;
    byApp: Record<string, number>;
  }): Promise<void> {
    if (!this.enabled) return;

    let text = `*Daily Feedback Summary*\n\n`;
    text += `*Total Feedback Today:* ${stats.totalToday}\n`;
    text += `*Average Rating:* ${stats.averageRating.toFixed(1)}\/5\n`;

    if (Object.keys(stats.byApp).length > 0) {
      text += `\n*By App:*\n`;
      for (const [app, count] of Object.entries(stats.byApp)) {
        text += `  \\- ${this.escapeMarkdown(app)}\: ${count}\n`;
      }
    }

    if (Object.keys(stats.byCategory).length > 0) {
      text += `\n*By Category:*\n`;
      for (const [cat, count] of Object.entries(stats.byCategory)) {
        text += `  \\- ${this.escapeMarkdown(cat)}\: ${count}\n`;
      }
    }

    await this.sendMessage(text);
  }

  private async sendMessage(text: string): Promise<void> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Telegram API error: ${response.status} - ${error}`);
      } else {
        this.logger.debug('Telegram notification sent successfully');
      }
    } catch (error) {
      this.logger.error(`Failed to send Telegram notification: ${(error as Error).message}`);
    }
  }

  private escapeMarkdown(text: string): string {
    if (!text) return '';
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
  }
}
