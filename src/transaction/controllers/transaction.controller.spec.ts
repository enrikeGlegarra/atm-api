import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from '../services/transaction.service';
import { CardActivationGuard } from '../../card/guard/card-activation.guard';
import { ExecutionContext } from '@nestjs/common';
import { TransactionType } from '../entities/transaction.entity';

describe('TransactionController', () => {
  let transactionController: TransactionController;
  let transactionService: TransactionService;
  let cardActivationGuard: CardActivationGuard;

  const mockTransactionService = {
    getTransactionsByAccount: jest.fn(),
  };

  const mockCardActivationGuard: CardActivationGuard = {
    canActivate: jest.fn(() => true),
  } as unknown as CardActivationGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    })
      .overrideGuard(CardActivationGuard)
      .useValue(mockCardActivationGuard)
      .compile();

    transactionController = module.get<TransactionController>(
      TransactionController,
    );
    transactionService = module.get<TransactionService>(TransactionService);
    cardActivationGuard = module.get<CardActivationGuard>(CardActivationGuard);
  });

  it('should be defined', () => {
    expect(transactionController).toBeDefined();
    expect(transactionService).toBeDefined();
    expect(cardActivationGuard).toBeDefined();
  });

  it('should call TransactionService with the correct accountId', async () => {
    const accountId = '12345';
    const mockTransactions = [
      {
        id: '1',
        type: TransactionType.DEPOSIT,
        amount: 100,
        createdAt: new Date(),
      },
      {
        id: '2',
        type: TransactionType.WITHDRAWAL,
        amount: 50,
        createdAt: new Date(),
      },
    ];
    mockTransactionService.getTransactionsByAccount.mockResolvedValue(
      mockTransactions,
    );
    const result =
      await transactionController.getTransactionsByAccount(accountId);
    expect(
      mockTransactionService.getTransactionsByAccount,
    ).toHaveBeenCalledWith(accountId);
    expect(result).toEqual(mockTransactions);
  });

  it('should apply CardActivationGuard', async () => {
    const canActivateSpy = jest.spyOn(mockCardActivationGuard, 'canActivate');
    const mockExecutionContext: ExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ params: { accountId: '12345' } }),
      }),
    } as unknown as ExecutionContext;

    const isAllowed = cardActivationGuard.canActivate(mockExecutionContext);

    expect(canActivateSpy).toHaveBeenCalled();
    expect(isAllowed).toBe(true);
  });
});
