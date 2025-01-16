import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';
import { Card } from '../../card/entities/card.entity';
import { Account } from '../../account/entities/account.entity';
import { WithdrawDto } from '../dtos/withdraw.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
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

  async withdraw(withdrawDto: WithdrawDto): Promise<string> {
    const { cardId, amount, atmBankId } = withdrawDto;

    const card = await this.validateCardExists(cardId);
    this.validateWithdrawalLimit(card, amount);
    this.validateFunds(card, amount);

    const finalAmount = this.calculateFinalAmount(card, amount, atmBankId);

    await this.updateBalances(card, finalAmount);

    return this.getSuccessMessage(
      amount,
      finalAmount,
      atmBankId !== card.account.bankId,
    );
  }

  private async validateCardExists(cardId: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['account'],
    });
    if (!card) {
      throw new NotFoundException(`Card with ID ${cardId} not found`);
    }
    return card;
  }

  private validateWithdrawalLimit(card: Card, amount: number): void {
    if (amount > card.withdrawalLimit) {
      throw new BadRequestException(
        'Amount exceeds the withdrawal limit for this card',
      );
    }
  }

  private validateFunds(card: Card, amount: number): void {
    const account = card.account;

    if (card.type === 'DEBIT') {
      if (amount > account.balance) {
        throw new BadRequestException('Insufficient balance in the account');
      }
    } else if (card.type === 'CREDIT') {
      if (amount > card.creditLimit) {
        throw new BadRequestException('Amount exceeds the credit limit');
      }
    }
  }

  private calculateFinalAmount(
    card: Card,
    amount: number,
    atmBankId: string,
  ): number {
    const isExternalBank = atmBankId !== card.account.bankId;
    let finalAmount = amount;

    if (isExternalBank) {
      const commission = amount * 0.02;
      finalAmount += commission;

      if (card.type === 'DEBIT' && finalAmount > card.account.balance) {
        throw new BadRequestException(
          'Insufficient balance to cover withdrawal and commission',
        );
      }
    }

    return finalAmount;
  }

  private async updateBalances(card: Card, finalAmount: number): Promise<void> {
    const account = card.account;

    if (card.type === 'DEBIT') {
      account.balance -= finalAmount;
    } else if (card.type === 'CREDIT') {
      card.creditLimit -= finalAmount;
    }

    await this.accountRepository.save(account);
    await this.cardRepository.save(card);
  }

  private getSuccessMessage(
    amount: number,
    finalAmount: number,
    isExternalBank: boolean,
  ): string {
    const commission = isExternalBank ? finalAmount - amount : 0;
    return `Withdrawal of ${amount} successful. Commission: ${commission}`;
  }
}
