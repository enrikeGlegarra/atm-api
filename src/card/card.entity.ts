import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Account } from '../account/entities/account.entity';

export enum CardType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity()
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  cardNumber: string;

  @Column({ type: 'enum', enum: CardType })
  type: CardType;

  @Column()
  pin: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 500 })
  withdrawalLimit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditLimit: number;

  @ManyToOne(() => Account, (account) => account.cards)
  account: Account;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
