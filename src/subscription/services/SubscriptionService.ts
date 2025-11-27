import { SubscriptionRepository } from '../repositories/SubscriptionRepository';
import {
  SubscriptionEntity,
  SubscriptionTier,
  BillingCycle,
} from '../domain/Subscription';

export class SubscriptionService {
  constructor(private subscriptionRepository: SubscriptionRepository) {}

  async createSubscription(
    userId: number,
    tier: SubscriptionTier,
    billingCycle: BillingCycle,
    autoRenew: boolean
  ) {
    const subscription = SubscriptionEntity.createNew(
      userId,
      tier,
      billingCycle,
      autoRenew
    );

    const subscriptionId =
      await this.subscriptionRepository.create(subscription);

    return {
      id: subscriptionId,
      ...subscription,
    };
  }

  async getUserSubscriptions(userId: number) {
    return await this.subscriptionRepository.getActiveSubscriptions(userId);
  }

  async cancelSubscription(subscriptionId: number, userId: number) {
    const subscription =
      await this.subscriptionRepository.getById(subscriptionId);

    if (!subscription) {
      throw {
        code: 'NOT_FOUND',
        message: 'Subscription not found',
        statusCode: 404,
      };
    }

    if (subscription.userId !== userId) {
      throw {
        code: 'FORBIDDEN',
        message: 'You do not have permission to cancel this subscription',
        statusCode: 403,
      };
    }

    await this.subscriptionRepository.cancelSubscription(subscriptionId);

    return {
      message: 'Subscription cancelled. It will remain active until end date.',
      endDate: subscription.endDate,
    };
  }

  async processRenewals() {
    // This would typically be called by a cron job
    // For now, it's a method that can be manually triggered
    const today = new Date();

    // Get all subscriptions that need renewal
    // In a real implementation, you'd query for subscriptions where renewalDate <= today
    // For simplicity, we'll just simulate the renewal logic

    console.log('Processing subscription renewals...');
    // Simulated renewal logic would go here
  }

  async simulatePayment(subscriptionId: number): Promise<boolean> {
    // Simulate payment with 20% failure rate
    const success = Math.random() > 0.2;

    if (!success) {
      await this.subscriptionRepository.markInactive(subscriptionId);
      return false;
    }

    const subscription =
      await this.subscriptionRepository.getById(subscriptionId);
    if (subscription && subscription.autoRenew) {
      await this.subscriptionRepository.renewSubscription(subscription);
    }

    return true;
  }
}