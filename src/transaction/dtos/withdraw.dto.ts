import { IsNumber, IsUUID, Min } from 'class-validator';

export class WithdrawDto {
  @IsUUID()
  cardId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsUUID()
  atmBankId: string;
}
