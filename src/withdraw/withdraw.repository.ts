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
                        account_number: withdrawRequest.account_number.toString(),
                        amount: withdrawRequest.amount,
                        payment_type: withdrawRequest.transaction_type
                    }),
                }
            ]
        })
    }

    async createWithdrawOrder(withdrawOrderEvent: any) {
        try {
            let newBalance;
            let accountNumber;
            let balance;
            console.log("withdrawOrderEvent : ", withdrawOrderEvent);

            if (withdrawOrderEvent.payment_type === 'transfer') {
                let account;
                account = withdrawOrderEvent.balance.filter((accountId) => accountId.account_number === withdrawOrderEvent.from_account_number)
                accountNumber = account[0].account_number;
                balance = account[0].balance
                newBalance = balance - Number(withdrawOrderEvent.amount);
            } else {
                accountNumber = withdrawOrderEvent.account_number;
                balance = withdrawOrderEvent.balance;
                newBalance = Number(withdrawOrderEvent.balance) - Number(withdrawOrderEvent.amount);
            }
            if (newBalance >= 0) {
                const withdrawOrder = await this.withdrawRepository.create({
                    accountNumber: accountNumber,
                    transactionType: withdrawOrderEvent.payment_type,
                    oldBalance: balance,
                    withdrawAmount: withdrawOrderEvent.amount,
                    newBalance: newBalance.toString()
                })
                await this.withdrawRepository.save(withdrawOrder)
                this.producerService.produce({
                    topic: 'account_update_balance',
                    messages: [
                        {
                            value: JSON.stringify({
                                account_number: accountNumber,
                                old_balance: balance,
                                amount: withdrawOrderEvent.amount,
                                new_balance: newBalance,
                                payment_type: withdrawOrderEvent.payment_type
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
