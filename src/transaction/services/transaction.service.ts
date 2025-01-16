import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionResponseDto } from '../dtos/TransactionResponse.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getTransactionsByAccount(
    accountId: string,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { account: { id: accountId } },
      relations: ['account'],
      order: { createdAt: 'DESC' },
    });

    return transactions.map(
      (transaction) =>
        new TransactionResponseDto({
          id: transaction.id,
          type: transaction.type,
          amount: Number(transaction.amount),
          description: transaction.description,
          createdAt: transaction.createdAt,
        }),
    );
  }
}
