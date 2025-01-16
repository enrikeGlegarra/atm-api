import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';
import { CardService } from '../services/card.service';
import { ActiveCardDto } from '../dtos/ActiveCard.dto';

describe('CardController', () => {
  let cardController: CardController;
  let cardService: CardService;

  const mockCardService = {
    activeCard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        {
          provide: CardService,
          useValue: mockCardService,
        },
      ],
    }).compile();

    cardController = module.get<CardController>(CardController);
    cardService = module.get<CardService>(CardService);
  });

  it('should be defined', () => {
    expect(cardController).toBeDefined();
    expect(cardService).toBeDefined();
  });

  it('should activate a card and return a success message', async () => {
    const mockDto: ActiveCardDto = { cardId: '12345' };
    const successMessage = 'Card activated successfully';
    mockCardService.activeCard.mockResolvedValue(successMessage);

    const result = await cardController.activateCard(mockDto);

    expect(cardService.activeCard).toHaveBeenCalledWith(mockDto.cardId);
    expect(result).toBe(successMessage);
  });

  it('should throw an error if activation fails', async () => {
    const mockDto: ActiveCardDto = { cardId: '12345' };
    const errorMessage = 'Card activation failed';
    mockCardService.activeCard.mockRejectedValue(new Error(errorMessage));

    await expect(cardController.activateCard(mockDto)).rejects.toThrowError(
      errorMessage,
    );
    expect(cardService.activeCard).toHaveBeenCalledWith(mockDto.cardId);
  });
});
