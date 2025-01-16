import { Controller, Get, UseGuards } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { CardActivationGuard } from '../../card/guard/card-activation.guard';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':accountId')
  @UseGuards(CardActivationGuard)
  async getTransactionsByAccount(accountId: string) {
    return this.transactionService.getTransactionsByAccount(accountId);
  }
}
