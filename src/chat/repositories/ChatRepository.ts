import { Database } from 'sqlite3';
import { ChatMessage } from '../domain/ChatMessage';
import { MonthlyUsage } from '../domain/UsageTracker';

export class ChatRepository {
  constructor(private db: Database) {}

  async saveChatMessage(message: ChatMessage): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO chat_messages (userId, question, answer, tokens, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `;
      this.db.run(
        query,
        [
          message.userId,
          message.question,
          message.answer,
          message.tokens,
          message.createdAt.toISOString(),
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async getMonthlyUsage(
    userId: number,
    month: string
  ): Promise<MonthlyUsage | null> {
    return new Promise((resolve, reject) => {
      const query =
        'SELECT * FROM monthly_usage WHERE userId = ? AND month = ?';
      this.db.get(query, [userId, month], (err, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  async createMonthlyUsage(userId: number, month: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query =
        'INSERT INTO monthly_usage (userId, month, freeMessagesUsed) VALUES (?, ?, 0)';
      this.db.run(query, [userId, month], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async incrementFreeUsage(userId: number, month: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE monthly_usage 
        SET freeMessagesUsed = freeMessagesUsed + 1 
        WHERE userId = ? AND month = ?
      `;
      this.db.run(query, [userId, month], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM chat_messages WHERE userId = ? ORDER BY createdAt DESC';
      this.db.all(query, [userId], (err, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}