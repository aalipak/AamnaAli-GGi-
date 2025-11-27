export interface ChatMessage {
  id?: number;
  userId: number;
  question: string;
  answer: string;
  tokens: number;
  createdAt: Date;
}

export class ChatMessageEntity implements ChatMessage {
  public createdAt: Date;

  constructor(
    public userId: number,
    public question: string,
    public answer: string,
    public tokens: number,
    public id?: number,
    createdAt?: Date
  ) {
    this.createdAt = createdAt || new Date();
  }
}