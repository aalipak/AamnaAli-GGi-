import { Database } from 'sqlite3';
import { Subscription } from '../domain/Subscription';

export class SubscriptionRepository {
  constructor(private db: Database) {}

  async create(subscription: Subscription): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO subscriptions 
        (userId, tier, maxMessages, remainingMessages, price, billingCycle, 
         autoRenew, isActive, startDate, endDate, renewalDate, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        query,
        [
          subscription.userId,
          subscription.tier,
          subscription.maxMessages,
          subscription.remainingMessages,
          subscription.price,
          subscription.billingCycle,
          subscription.autoRenew ? 1 : 0,
          subscription.isActive ? 1 : 0,
          subscription.startDate.toISOString(),
          subscription.endDate.toISOString(),
          subscription.renewalDate?.toISOString() || null,
          subscription.createdAt.toISOString(),
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async getActiveSubscriptions(userId: number): Promise<Subscription[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM subscriptions 
        WHERE userId = ? AND isActive = 1 
        ORDER BY 
          CASE 
            WHEN tier = 'Enterprise' THEN 1
            WHEN tier = 'Pro' THEN 2
            WHEN tier = 'Basic' THEN 3
          END,
          remainingMessages DESC
      `;

      this.db.all(query, [userId], (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const subscriptions = rows.map((row) => ({
            ...row,
            autoRenew: row.autoRenew === 1,
            isActive: row.isActive === 1,
            startDate: new Date(row.startDate),
            endDate: new Date(row.endDate),
            renewalDate: row.renewalDate ? new Date(row.renewalDate) : null,
            createdAt: new Date(row.createdAt),
          }));
          resolve(subscriptions);
        }
      });
    });
  }

  async getById(subscriptionId: number): Promise<Subscription | null> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM subscriptions WHERE id = ?';
      this.db.get(query, [subscriptionId], (err, row: any) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else {
          resolve({
            ...row,
            autoRenew: row.autoRenew === 1,
            isActive: row.isActive === 1,
            startDate: new Date(row.startDate),
            endDate: new Date(row.endDate),
            renewalDate: row.renewalDate ? new Date(row.renewalDate) : null,
            createdAt: new Date(row.createdAt),
          });
        }
      });
    });
  }

  async deductMessage(subscriptionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE subscriptions 
        SET remainingMessages = remainingMessages - 1 
        WHERE id = ? AND maxMessages != -1
      `;

      this.db.run(query, [subscriptionId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async cancelSubscription(subscriptionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE subscriptions SET autoRenew = 0 WHERE id = ?';
      this.db.run(query, [subscriptionId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async markInactive(subscriptionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE subscriptions SET isActive = 0 WHERE id = ?';
      this.db.run(query, [subscriptionId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async renewSubscription(subscription: Subscription): Promise<void> {
    return new Promise((resolve, reject) => {
      const newStartDate = subscription.endDate;
      const newEndDate = new Date(newStartDate);

      if (subscription.billingCycle === 'monthly') {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      }

      const query = `
        UPDATE subscriptions 
        SET startDate = ?, endDate = ?, renewalDate = ?, 
            remainingMessages = maxMessages
        WHERE id = ?
      `;

      this.db.run(
        query,
        [
          newStartDate.toISOString(),
          newEndDate.toISOString(),
          newEndDate.toISOString(),
          subscription.id,
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}