import { Body, Controller, Patch } from '@nestjs/common';
import { CardService } from '../services/card.service';
import { ActiveCardDto } from '../dtos/ActiveCard.dto';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Patch('activate')
  async activateCard(@Body() activeCardDto: ActiveCardDto): Promise<string> {
    return this.cardService.activeCard(activeCardDto.cardId);
  }
}
