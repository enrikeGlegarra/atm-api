import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';
import { Account } from '../../account/entities/account.entity';
import { Card } from '../../card/entities/card.entity';
import { WithdrawDto } from '../dtos/withdraw.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: Repository<Transaction>;
  let cardRepository: Repository<Card>;
  let accountRepository: Repository<Account>;

  const mockTransactionRepository = {
    find: jest.fn(),
  };

  const mockCardRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockAccountRepository = {
    save: jest.fn(),
  };

  const mockTransactions = [
    {
      id: '1a2b3c4d',
      type: TransactionType.DEPOSIT,
      amount: 1500,
      description: 'Salary',
      createdAt: new Date('2025-01-16T10:00:00Z'),
      account: { id: '12345' },
    },
    {
      id: '2b3c4d5e',
      type: TransactionType.WITHDRAWAL,
      amount: 200,
      description: 'ATM withdrawal',
      createdAt: new Date('2025-01-15T15:30:00Z'),
      account: { id: '12345' },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
    accountRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(transactionRepository).toBeDefined();
    expect(cardRepository).toBeDefined();
    expect(accountRepository).toBeDefined();
  });

  it('should return transactions for a given accountId', async () => {
    mockTransactionRepository.find.mockResolvedValue(mockTransactions);
    const result = await service.getTransactionsByAccount('12345');
    expect(mockTransactionRepository.find).toHaveBeenCalledWith({
      where: { account: { id: '12345' } },
      relations: ['account'],
      order: { createdAt: 'DESC' },
    });

    expect(result).toEqual(
      mockTransactions.map(
        (transaction) =>
          new TransactionResponseDto({
            id: transaction.id,
            type: transaction.type,
            amount: Number(transaction.amount),
            description: transaction.description,
            createdAt: transaction.createdAt,
          }),
      ),
    );
  });

  it('should return an empty array if not transactions ', async () => {
    mockTransactionRepository.find.mockResolvedValue([]);
    const result = await service.getTransactionsByAccount('12345');
    expect(mockTransactionRepository.find).toHaveBeenCalledWith({
      where: { account: { id: '12345' } },
      relations: ['account'],
      order: { createdAt: 'DESC' },
    });

    expect(result).toEqual([]);
  });

  describe('withdraw', () => {
    it('should throw NotFoundException if card is not found', async () => {
      mockCardRepository.findOne.mockResolvedValue(null);
      const withdrawDto: WithdrawDto = {
        cardId: '12345',
        amount: 100,
        atmBankId: '67890',
      };

      await expect(service.withdraw(withdrawDto)).rejects.toThrow(
        new NotFoundException('Card with ID 12345 not found'),
      );

      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: withdrawDto.cardId },
        relations: ['account'],
      });
    });

    it('should throw BadRequestException if withdrawal limit is exceeded', async () => {
      const mockCard = {
        id: '12345',
        isActive: true,
        withdrawalLimit: 50,
        account: { balance: 100 },
      };
      mockCardRepository.findOne.mockResolvedValue(mockCard);
      const withdrawDto: WithdrawDto = {
        cardId: '12345',
        amount: 100,
        atmBankId: '67890',
      };

      await expect(service.withdraw(withdrawDto)).rejects.toThrow(
        new BadRequestException(
          'Amount exceeds the withdrawal limit for this card',
        ),
      );

      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: withdrawDto.cardId },
        relations: ['account'],
      });
    });

    it('should throw BadRequestException if funds are insufficient', async () => {
      const mockCard = {
        id: '12345',
        isActive: true,
        withdrawalLimit: 200,
        type: 'DEBIT',
        account: { balance: 50, bankId: '67890' },
      };
      mockCardRepository.findOne.mockResolvedValue(mockCard);
      const withdrawDto: WithdrawDto = {
        cardId: '12345',
        amount: 100,
        atmBankId: '67890',
      };

      await expect(service.withdraw(withdrawDto)).rejects.toThrow(
        new BadRequestException('Insufficient balance in the account'),
      );
    });

    it('should update balances and return success message', async () => {
      const mockCard = {
        id: '12345',
        isActive: true,
        withdrawalLimit: 200,
        type: 'DEBIT',
        account: { balance: 150, bankId: '67890' },
      };
      mockCardRepository.findOne.mockResolvedValue(mockCard);
      mockAccountRepository.save.mockResolvedValue(true);
      mockCardRepository.save.mockResolvedValue(true);
      const withdrawDto: WithdrawDto = {
        cardId: '12345',
        amount: 100,
        atmBankId: '67890',
      };

      const result = await service.withdraw(withdrawDto);

      expect(mockAccountRepository.save).toHaveBeenCalledWith({
        balance: 50, // 150 - 100
        bankId: '67890',
      });
      expect(mockCardRepository.save).toHaveBeenCalledWith(mockCard);
      expect(result).toBe('Withdrawal of 100 successful. Commission: 0');
    });
  });
});
