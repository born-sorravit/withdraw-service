import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProducerService } from 'src/kafka/producer.service';
import { DataSource, Repository } from 'typeorm';
import { Withdraw } from './entites/withdraw.entity';
import { WithdrawOrderEvent } from './event/withdraw-order.event';
import { WithdrawRequest } from './request/withdraw-request.dto';

@Injectable()
export class WithdrawRepository extends Repository<Withdraw> {
    constructor(
        private readonly producerService: ProducerService,
        private dataSource: DataSource,
        @InjectRepository(Withdraw) private withdrawRepository: Repository<Withdraw>
    ) {
        super(Withdraw, dataSource.createEntityManager());
    }

    async checkUserAccount(withdrawRequest: WithdrawRequest) {
        return this.producerService.produce({
            topic: 'account_check_user',
            messages: [
                {
                    value: JSON.stringify({
                        account_number: withdrawRequest.account_number,
                        amount: withdrawRequest.amount,
                        payment_type: withdrawRequest.transaction_type
                    }),
                }
            ]
        })
    }

    async createWithdrawOrder(withdrawOrderEvent: WithdrawOrderEvent) {
        try {

            const newBalance = Number(withdrawOrderEvent.balance) - Number(withdrawOrderEvent.amount);
            if (newBalance >= 0) {
                const withdrawOrder = await this.withdrawRepository.create({
                    accountNumber: withdrawOrderEvent.account_number,
                    transactionType: withdrawOrderEvent.transaction_type,
                    oldBalance: withdrawOrderEvent.balance,
                    withdrawAmount: withdrawOrderEvent.amount,
                    newBalance: newBalance.toString()
                })
                await this.withdrawRepository.save(withdrawOrder)
                this.producerService.produce({
                    topic: 'account_update_balance',
                    messages: [
                        {
                            value: JSON.stringify({
                                account_number: withdrawOrderEvent.account_number,
                                old_balance: withdrawOrderEvent.balance,
                                amount: withdrawOrderEvent.amount,
                                new_balance: newBalance,
                                payment_type: withdrawOrderEvent.transaction_type
                            }),
                        }
                    ]
                })
            }
        } catch (error) {
            console.log(error);
        }
    }
}
