import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from '../services/transaction.service';
import { TransactionResponseDto } from '../dtos/TransactionResponse.dto';
import { TransactionType } from '../entities/transaction.entity';

describe('TransactionController', () => {
  let transactionController: TransactionController;
  let transactionService: TransactionService;

  const mockTransactionService = {
    getTransactionsByAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    transactionController = module.get<TransactionController>(
      TransactionController,
    );
    transactionService = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(transactionController).toBeDefined();
    expect(transactionService).toBeDefined();
  });

  it('should call TransactionService with the correct accountId', async () => {
    // Arrange
    const accountId = '12345';
    const mockTransactions: TransactionResponseDto[] = [
      new TransactionResponseDto({
        id: '1',
        type: TransactionType.DEPOSIT,
        amount: 100,
        description: 'Test deposit',
        createdAt: new Date(),
      }),
    ];

    mockTransactionService.getTransactionsByAccount.mockResolvedValue(
      mockTransactions,
    );

    // Act
    const result =
      await transactionController.getTransactionsByAccount(accountId);

    // Assert
    expect(
      mockTransactionService.getTransactionsByAccount,
    ).toHaveBeenCalledWith(accountId);
    expect(result).toEqual(mockTransactions);
  });
});
