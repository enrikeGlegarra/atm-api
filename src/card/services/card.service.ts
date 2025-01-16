import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from '../entities/card.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
  ) {}

  async activeCard(cardId: string): Promise<string> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException(`Card with id ${cardId} not found`);
    }

    if (card.isActive) {
      throw new BadRequestException(`Card with id ${cardId} is already active`);
    }
    card.isActive = true;
    await this.cardRepository.save(card);
    return 'Card activated successfully';
  }

  async getCardById(cardId: string): Promise<Card> {
    const card = await this.cardRepository.findOne({ where: { id: cardId } });
    if (!card) {
      throw new NotFoundException(`Card with id ${cardId} not found`);
    }
    return card;
  }
}
