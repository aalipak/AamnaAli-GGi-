import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

export function initDatabase(): Promise<Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./database.sqlite', (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Create tables
      db.serialize(() => {
        // Chat messages table
        db.run(`
          CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            tokens INTEGER NOT NULL,
            createdAt TEXT NOT NULL
          )
        `);

        // Monthly usage table
        db.run(`
          CREATE TABLE IF NOT EXISTS monthly_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            month TEXT NOT NULL,
            freeMessagesUsed INTEGER DEFAULT 0,
            UNIQUE(userId, month)
          )
        `);

        // Subscriptions table
        db.run(`
          CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            tier TEXT NOT NULL,
            maxMessages INTEGER NOT NULL,
            remainingMessages INTEGER NOT NULL,
            price REAL NOT NULL,
            billingCycle TEXT NOT NULL,
            autoRenew INTEGER NOT NULL,
            isActive INTEGER NOT NULL,
            startDate TEXT NOT NULL,
            endDate TEXT NOT NULL,
            renewalDate TEXT,
            createdAt TEXT NOT NULL
          )
        `);

        resolve(db);
      });
    });
  });
}