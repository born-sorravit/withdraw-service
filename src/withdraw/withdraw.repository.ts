import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Withdraw } from './entites/withdraw.entity';
import { WithdrawOrderEvent } from './event/withdraw-order.event';

@Injectable()
export class WithdrawRepository extends Repository<Withdraw> {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Withdraw) private withdrawRepository: Repository<Withdraw>
    ) {
        super(Withdraw, dataSource.createEntityManager());
    }

    async createWithdrawOrder(withdrawOrderEvent: WithdrawOrderEvent) {
        try {
            const newBalance = Number(withdrawOrderEvent.balance) - Number(withdrawOrderEvent.amount);
            const withdrawOrder = await this.withdrawRepository.create({
                accountNumber: withdrawOrderEvent.account_number,
                transactionType: withdrawOrderEvent.transaction_type,
                oldBalance: withdrawOrderEvent.balance,
                withdrawAmount: withdrawOrderEvent.amount,
                newBalance: newBalance.toString()
            })
            await this.withdrawRepository.save(withdrawOrder)
        } catch (error) {
            console.log(error);
        }
    }
}
