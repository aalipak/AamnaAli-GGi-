import express, { Express } from 'express';
import { Database } from 'sqlite3';
import { ChatController } from './chat/controllers/ChatController';
import { ChatService } from './chat/services/ChatService';
import { ChatRepository } from './chat/repositories/ChatRepository';
import { SubscriptionController } from './subscription/controllers/SubscriptionController';
import { SubscriptionService } from './subscription/services/SubscriptionService';
import { SubscriptionRepository } from './subscription/repositories/SubscriptionRepository';

export function createApp(db: Database): Express {
  const app = express();

  // Middleware
  app.use(express.json());

  // Initialize repositories
  const chatRepository = new ChatRepository(db);
  const subscriptionRepository = new SubscriptionRepository(db);

  // Initialize services
  const chatService = new ChatService(chatRepository, subscriptionRepository);
  const subscriptionService = new SubscriptionService(subscriptionRepository);

  // Initialize controllers
  const chatController = new ChatController(chatService);
  const subscriptionController = new SubscriptionController(
    subscriptionService
  );

  // Chat routes
  app.post('/api/chat/ask', (req, res) => chatController.askQuestion(req, res));
  // Subscription routes
  app.post('/api/subscriptions', (req, res) =>
    subscriptionController.createSubscription(req, res)
  );
  app.get('/api/subscriptions/user/:userId', (req, res) =>
    subscriptionController.getUserSubscriptions(req, res)
  );
  app.post('/api/subscriptions/:subscriptionId/cancel', (req, res) =>
    subscriptionController.cancelSubscription(req, res)
  );
  app.post('/api/subscriptions/:subscriptionId/simulate-payment', (req, res) =>
    subscriptionController.simulatePayment(req, res)
  );

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}