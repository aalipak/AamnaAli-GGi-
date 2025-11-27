import { Request, Response } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { BillingCycle, SubscriptionTier } from '../domain/Subscription';

export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  async createSubscription(req: Request, res: Response) {
    try {
      const { userId, tier, billingCycle, autoRenew } = req.body;

      if (!userId || !tier || !billingCycle) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'userId, tier, and billingCycle are required',
        });
      }

      if (!['Basic', 'Pro', 'Enterprise'].includes(tier)) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'tier must be Basic, Pro, or Enterprise',
        });
      }

      if (!['monthly', 'yearly'].includes(billingCycle)) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'billingCycle must be monthly or yearly',
        });
      }

      const subscription = await this.subscriptionService.createSubscription(
        userId,
        tier as SubscriptionTier,
        billingCycle as BillingCycle,
        autoRenew === true
      );

      res.status(201).json({
        success: true,
        data: subscription,
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An error occurred creating the subscription',
      });
    }
  }

  async getUserSubscriptions(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Invalid userId',
        });
      }

      const subscriptions =
        await this.subscriptionService.getUserSubscriptions(userId);

      res.status(200).json({
        success: true,
        data: subscriptions,
      });
    } catch (error: any) {
      console.error('Get subscriptions error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An error occurred retrieving subscriptions',
      });
    }
  }

  async cancelSubscription(req: Request, res: Response) {
    try {
      const subscriptionId = parseInt(req.params.subscriptionId);
      const { userId } = req.body;

      if (isNaN(subscriptionId) || !userId) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Valid subscriptionId and userId are required',
        });
      }

      const result = await this.subscriptionService.cancelSubscription(
        subscriptionId,
        userId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.code === 'NOT_FOUND') {
        return res.status(error.statusCode).json({
          error: error.code,
          message: error.message,
        });
      }

      if (error.code === 'FORBIDDEN') {
        return res.status(error.statusCode).json({
          error: error.code,
          message: error.message,
        });
      }

      console.error('Cancel subscription error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An error occurred cancelling the subscription',
      });
    }
  }

  async simulatePayment(req: Request, res: Response) {
    try {
      const subscriptionId = parseInt(req.params.subscriptionId);

      if (isNaN(subscriptionId)) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'Valid subscriptionId is required',
        });
      }

      const success =
        await this.subscriptionService.simulatePayment(subscriptionId);

      res.status(200).json({
        success: true,
        data: {
          paymentSuccess: success,
          message: success
            ? 'Payment successful, subscription renewed'
            : 'Payment failed, subscription marked inactive',
        },
      });
    } catch (error: any) {
      console.error('Simulate payment error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An error occurred processing payment',
      });
    }
  }
}