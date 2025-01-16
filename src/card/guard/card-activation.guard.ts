import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { CardService } from '../services/card.service';
import { Card } from '../entities/card.entity';

@Injectable()
export class CardActivationGuard implements CanActivate {
  constructor(private readonly cardService: CardService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cardId = request.body.cardId || request.params.cardId;

    if (!cardId) {
      throw new BadRequestException('Card ID is required');
    }

    const card: Card = await this.cardService.getCardById(cardId);

    if (!card.isActive) {
      throw new BadRequestException('Card is not active');
    }

    return true;
  }
}
