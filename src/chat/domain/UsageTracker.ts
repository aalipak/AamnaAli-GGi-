export interface MonthlyUsage {
  userId: number;
  month: string;
  freeMessagesUsed: number;
}

export class UsageTrackerEntity {
  private static readonly FREE_MESSAGES_PER_MONTH = 3;

  constructor(
    public userId: number,
    public month: string,
    public freeMessagesUsed: number
  ) {}

  canUseFreeMessage(): boolean {
    return this.freeMessagesUsed < UsageTrackerEntity.FREE_MESSAGES_PER_MONTH;
  }

  incrementFreeUsage(): void {
    this.freeMessagesUsed++;
  }

  static getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}