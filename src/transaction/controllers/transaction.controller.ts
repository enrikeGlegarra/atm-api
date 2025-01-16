import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { CardActivationGuard } from '../../card/guard/card-activation.guard';
import { WithdrawDto } from '../dtos/withdraw.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':accountId')
  @UseGuards(CardActivationGuard)
  async getTransactionsByAccount(accountId: string) {
    return this.transactionService.getTransactionsByAccount(accountId);
  }

  @Post('withdraw')
  @UseGuards(CardActivationGuard)
  async withdraw(@Body() withdrawDto: WithdrawDto): Promise<string> {
    return this.transactionService.withdraw(withdrawDto);
  }
}
