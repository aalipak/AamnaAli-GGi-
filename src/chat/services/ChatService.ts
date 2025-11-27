import { ChatRepository } from '../repositories/ChatRepository';
import { SubscriptionRepository } from '../../subscription/repositories/SubscriptionRepository';
import { ChatMessageEntity, ChatMessage } from '../domain/ChatMessage';
import { UsageTrackerEntity } from '../domain/UsageTracker';

export class ChatService {
  constructor(
    private chatRepository: ChatRepository,
    private subscriptionRepository: SubscriptionRepository
  ) {}

  async processQuestion(userId: number, question: string) {
    await this.simulateApiDelay();

    const answer = this.generateMockResponse(question);
    const tokens = this.calculateTokens(question, answer);

    // Check usage quota
    await this.checkAndDeductQuota(userId);

    // Save chat message
    const message: ChatMessage = new ChatMessageEntity(
      userId,
      question,
      answer,
      tokens,
      undefined,
      new Date()
    );

    const messageId = await this.chatRepository.saveChatMessage(message);

    return {
      id: messageId,
      question,
      answer,
      tokens,
      timestamp: new Date().toISOString(),
    };
  }

  private async simulateApiDelay(): Promise<void> {
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private generateMockResponse(question: string): string {
    const responses = [
      `That's an interesting question about "${question}". Based on my analysis, here's what I think...`,
      `Let me help you with that. Regarding "${question}", the answer is...`,
      `Great question! About "${question}", I can tell you that...`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private calculateTokens(question: string, answer: string): number {
    // Simple token calculation: ~4 chars per token
    return Math.ceil((question.length + answer.length) / 4);
  }

  private async checkAndDeductQuota(userId: number): Promise<void> {
    const currentMonth = UsageTrackerEntity.getCurrentMonth();

    // Get or create monthly usage
    let usage = await this.chatRepository.getMonthlyUsage(userId, currentMonth);
    if (!usage) {
      await this.chatRepository.createMonthlyUsage(userId, currentMonth);
      usage = { userId, month: currentMonth, freeMessagesUsed: 0 };
    }

    const usageTracker = new UsageTrackerEntity(
      usage.userId,
      usage.month,
      usage.freeMessagesUsed
    );

    // Try to use free message
    if (usageTracker.canUseFreeMessage()) {
      await this.chatRepository.incrementFreeUsage(userId, currentMonth);
      return;
    }

    // Need to use subscription
    const subscriptions =
      await this.subscriptionRepository.getActiveSubscriptions(userId);

    if (subscriptions.length === 0) {
      throw {
        code: 'QUOTA_EXCEEDED',
        message: 'No active subscription found. Please subscribe to continue.',
        statusCode: 403,
      };
    }

    // Find subscription with remaining quota (prioritize by tier and remaining messages)
    let deducted = false;
    for (const sub of subscriptions) {
      if (sub.tier === 'Enterprise' || sub.remainingMessages > 0) {
        await this.subscriptionRepository.deductMessage(sub.id!);
        deducted = true;
        break;
      }
    }

    if (!deducted) {
      throw {
        code: 'QUOTA_EXCEEDED',
        message: 'All subscription quotas exhausted. Please upgrade or renew.',
        statusCode: 403,
      };
    }
  }

}