import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from '../services/transaction.service';
import { CardActivationGuard } from '../../card/guard/card-activation.guard';
import { ExecutionContext } from '@nestjs/common';
import { TransactionType } from '../entities/transaction.entity';
import { WithdrawDto } from '../dtos/withdraw.dto';

describe('TransactionController', () => {
  let transactionController: TransactionController;
  let transactionService: TransactionService;
  let cardActivationGuard: CardActivationGuard;

  const mockTransactionService = {
    getTransactionsByAccount: jest.fn(),
    withdraw: jest.fn(),
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
  it('should call TransactionService.withdraw with the correct parameters', async () => {
    const mockWithdrawDto: WithdrawDto = {
      cardId: '12345',
      amount: 100,
      atmBankId: '67890',
    };
    const successMessage = 'Withdrawal of 100 successful. Commission: 0';
    mockTransactionService.withdraw.mockResolvedValue(successMessage);

    const result = await transactionController.withdraw(mockWithdrawDto);

    expect(mockTransactionService.withdraw).toHaveBeenCalledWith(
      mockWithdrawDto,
    );
    expect(result).toBe(successMessage);
  });

  it('should throw an error if TransactionService.withdraw fails', async () => {
    const mockWithdrawDto: WithdrawDto = {
      cardId: '12345',
      amount: 100,
      atmBankId: '67890',
    };
    const errorMessage = 'Withdrawal failed';
    mockTransactionService.withdraw.mockRejectedValue(new Error(errorMessage));

    await expect(
      transactionController.withdraw(mockWithdrawDto),
    ).rejects.toThrowError(errorMessage);
    expect(mockTransactionService.withdraw).toHaveBeenCalledWith(
      mockWithdrawDto,
    );
  });
});
