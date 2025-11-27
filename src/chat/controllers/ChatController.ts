import { Request, Response } from 'express';
import { ChatService } from '../services/ChatService';

export class ChatController {
  constructor(private chatService: ChatService) {}

  async askQuestion(req: Request, res: Response) {
    try {
      const { userId, question } = req.body;

      if (!userId || !question) {
        return res.status(400).json({
          error: 'BAD_REQUEST',
          message: 'userId and question are required',
        });
      }

      const result = await this.chatService.processQuestion(userId, question);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.code === 'QUOTA_EXCEEDED') {
        return res.status(error.statusCode).json({
          error: error.code,
          message: error.message,
        });
      }

      console.error('Chat error:', error);
      res.status(500).json({
        error: 'INTERNAL_ERROR',
        message: 'An error occurred processing your request',
      });
    }
  }
}