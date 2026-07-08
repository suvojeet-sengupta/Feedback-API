import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum FeedbackCategory {
  BUG = 'bug',
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  UI_UX = 'ui_ux',
  PERFORMANCE = 'performance',
  GENERAL = 'general',
  OTHER = 'other',
}

export enum FeedbackStatus {
  NEW = 'new',
  REVIEWED = 'reviewed',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'app_name' })
  appName: string;

  @Column({ name: 'app_version', nullable: true })
  appVersion: string;

  @Column({ name: 'app_package', nullable: true })
  appPackage: string;

  @Index()
  @Column({ type: 'integer' })
  rating: number;

  @Index()
  @Column({ type: 'varchar', default: FeedbackCategory.GENERAL })
  category: FeedbackCategory;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'user_email', nullable: true })
  userEmail: string;

  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'device_model', nullable: true })
  deviceModel: string;

  @Column({ name: 'device_brand', nullable: true })
  deviceBrand: string;

  @Column({ name: 'os_version', nullable: true })
  osVersion: string;

  @Column({ name: 'sdk_version', nullable: true })
  sdkVersion: string;

  @Column({ name: 'screen_resolution', nullable: true })
  screenResolution: string;

  @Column({ nullable: true })
  locale: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ name: 'network_type', nullable: true })
  networkType: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  tags: string[];

  @Index()
  @Column({ type: 'varchar', default: FeedbackStatus.NEW })
  status: FeedbackStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
