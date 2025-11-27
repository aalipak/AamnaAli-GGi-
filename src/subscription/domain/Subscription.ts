export type SubscriptionTier = 'Basic' | 'Pro' | 'Enterprise';
export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id?: number;
  userId: number;
  tier: SubscriptionTier;
  maxMessages: number;
  remainingMessages: number;
  price: number;
  billingCycle: BillingCycle;
  autoRenew: boolean;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  renewalDate: Date | null;
  createdAt: Date;
}

export class SubscriptionEntity {
  private static readonly TIER_CONFIG = {
    Basic: { maxMessages: 10, monthlyPrice: 9.99, yearlyPrice: 99.99 },
    Pro: { maxMessages: 100, monthlyPrice: 29.99, yearlyPrice: 299.99 },
    Enterprise: {
      maxMessages: -1,
      monthlyPrice: 99.99,
      yearlyPrice: 999.99,
    }, // -1 = unlimited
  };

  constructor(
    public userId: number,
    public tier: SubscriptionTier,
    public billingCycle: BillingCycle,
    public autoRenew: boolean,
    public id?: number,
    public isActive: boolean = true
  ) {}

  static createNew(
    userId: number,
    tier: SubscriptionTier,
    billingCycle: BillingCycle,
    autoRenew: boolean
  ): Subscription {
    const config = SubscriptionEntity.TIER_CONFIG[tier];
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const price =
      billingCycle === 'monthly' ? config.monthlyPrice : config.yearlyPrice;
    const maxMessages = config.maxMessages;

    return {
      userId,
      tier,
      maxMessages,
      remainingMessages: maxMessages,
      price,
      billingCycle,
      autoRenew,
      isActive: true,
      startDate,
      endDate,
      renewalDate: autoRenew ? endDate : null,
      createdAt: new Date(),
    };
  }
}