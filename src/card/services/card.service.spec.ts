import { Test, TestingModule } from '@nestjs/testing';
import { CardService } from './card.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from '../entities/card.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CardService', () => {
  let cardService: CardService;
  let cardRepository: Repository<Card>;

  const mockCardRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockCardRepository,
        },
      ],
    }).compile();

    cardService = module.get<CardService>(CardService);
    cardRepository = module.get<Repository<Card>>(getRepositoryToken(Card));
  });

  it('should be defined', () => {
    expect(cardService).toBeDefined();
    expect(cardRepository).toBeDefined();
  });

  describe('activeCard', () => {
    it('should activate the card OK', async () => {
      const mockCard = { id: '123', isActive: false };
      mockCardRepository.findOne.mockResolvedValue(mockCard);
      mockCardRepository.save.mockResolvedValue({
        ...mockCard,
        isActive: true,
      });

      const result = await cardService.activeCard('123');

      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(mockCardRepository.save).toHaveBeenCalledWith({
        ...mockCard,
        isActive: true,
      });
      expect(result).toBe('Card activated successfully');
    });

    it('should throw NotFoundException if card is not found', async () => {
      mockCardRepository.findOne.mockResolvedValue(null);

      await expect(cardService.activeCard('123')).rejects.toThrow(
        new NotFoundException('Card with id 123 not found'),
      );

      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });

    it('should throw BadRequestException if card is already active', async () => {
      const mockCard = { id: '123', isActive: true };
      mockCardRepository.findOne.mockResolvedValue(mockCard);

      await expect(cardService.activeCard('123')).rejects.toThrow(
        new BadRequestException('Card with id 123 is already active'),
      );

      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });

  describe('getCardById', () => {
    it('should return the card if found', async () => {
      const mockCard = { id: '123', isActive: false };
      mockCardRepository.findOne.mockResolvedValue(mockCard);

      const result = await cardService.getCardById('123');

      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
      expect(result).toBe(mockCard);
    });

    it('should throw NotFoundException if card is not found', async () => {
      mockCardRepository.findOne.mockResolvedValue(null);

      await expect(cardService.getCardById('123')).rejects.toThrow(
        new NotFoundException('Card with id 123 not found'),
      );

      expect(mockCardRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });
});
