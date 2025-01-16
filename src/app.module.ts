import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { CardModule } from './card/card.module';
import { TransactionModule } from './transaction/transaction.module';
import { User } from './user/entities/user.entity';
import { Account } from './account/entities/account.entity';
import { Card } from './card/entities/card.entity';
import { Transaction } from './transaction/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'new_password',
      database: 'atm_db',
      entities: [User, Account, Card, Transaction],
      synchronize: true,
    }),
    UserModule,
    AccountModule,
    CardModule,
    TransactionModule,
    TypeOrmModule.forFeature([User, Account, Card, Transaction]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
