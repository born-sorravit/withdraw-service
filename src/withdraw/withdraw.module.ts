import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from 'src/kafka/kafka.module';
import { Withdraw } from './entites/withdraw.entity';
import { WithdrawController } from './withdraw.controller';
import { WithdrawRepository } from './withdraw.repository';
import { WithdrawService } from './withdraw.service';

@Module({
  imports: [
    KafkaModule,
    TypeOrmModule.forFeature([Withdraw]),
  ],
  controllers: [WithdrawController],
  providers: [WithdrawService, WithdrawRepository],
  exports: [WithdrawService]
})
export class WithdrawModule { }
