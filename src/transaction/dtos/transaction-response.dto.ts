import { TransactionType } from '../entities/transaction.entity';

export class TransactionResponseDto {
  id: string;
  type: TransactionType;
  amount: number;
  description?: string;
  createdAt: Date;

  constructor(partial: Partial<TransactionResponseDto>) {
    Object.assign(this, partial);
  }
}
