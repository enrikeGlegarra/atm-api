import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionResponseDto } from '../dtos/TransactionResponse.dto';

describe('TransactionService', () => {
  let service: TransactionService;
  let repository: Repository<Transaction>;

  const mockTransactionRepository = {
    find: jest.fn(),
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
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    repository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
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
});
