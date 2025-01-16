import { IsUUID } from 'class-validator';

export class ActiveCardDto {
  @IsUUID()
  cardId: string;
}
