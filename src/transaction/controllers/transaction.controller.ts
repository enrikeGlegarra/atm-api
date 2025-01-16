import { Controller, Get } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':accountId')
  async getTransactionsByAccount(accountId: string) {
    return this.transactionService.getTransactionsByAccount(accountId);
  }
}
