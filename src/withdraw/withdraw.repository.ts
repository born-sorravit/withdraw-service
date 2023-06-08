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
            let fromAccountNumber;
            let fromAccountBalance;
            let toAccountBalance;
            let topic;
            if (withdrawOrderEvent.payment_type === 'transfer') {
                let account;
                let toAccount;
                console.log(" createWithdrawOrder withdrawOrderEvent : ", withdrawOrderEvent);
                // from_account_number: '1',
                // to_account_number: '2',
                // amount: 70,
                // payment_type: 'transfer',
                // balance: [
                //   { account_number: '1', balance: 374 },
                //   { account_number: '2', balance: 778 }
                // ],
                // transaction_id: 'c4c113c3-587e-41e4-839c-3d6dd9360107'
                account = withdrawOrderEvent.balance.filter((accountId) => accountId.account_number === withdrawOrderEvent.from_account_number)
                toAccount = withdrawOrderEvent.balance.filter((accountId) => accountId.account_number !== withdrawOrderEvent.from_account_number)
                fromAccountBalance = account[0].balance
                toAccountBalance = toAccount[0].balance
                newBalance = fromAccountBalance - Number(withdrawOrderEvent.amount);
                topic = 'transfer_deposit_process'
            } else {
                fromAccountNumber = withdrawOrderEvent.account_number;
                fromAccountBalance = withdrawOrderEvent.balance;
                newBalance = Number(withdrawOrderEvent.balance) - Number(withdrawOrderEvent.amount);
                topic = 'account_update_balance'
            }
            if (newBalance >= 0) {
                const withdrawOrder = await this.withdrawRepository.create({
                    accountNumber: withdrawOrderEvent.from_account_number,
                    transactionType: withdrawOrderEvent.payment_type,
                    oldBalance: fromAccountBalance,
                    withdrawAmount: withdrawOrderEvent.amount,
                    newBalance: newBalance.toString(),
                    transactionId: withdrawOrderEvent.transaction_id
                })
                const formatData = {
                    from_account: {
                        account_number: withdrawOrderEvent.from_account_number,
                        old_balance: fromAccountBalance,
                        new_balance: newBalance
                    },
                    to_account: {
                        account_number: withdrawOrderEvent.to_account_number,
                        old_balance: toAccountBalance,
                        new_balance: ''
                    },
                    amount: withdrawOrderEvent.amount,
                    payment_type: withdrawOrderEvent.payment_type,
                    transactionId: withdrawOrderEvent.transaction_id
                }
                await this.withdrawRepository.save(withdrawOrder)
                this.producerService.produce({
                    topic: topic,
                    messages: [
                        {
                            value: JSON.stringify(formatData),
                        }
                    ]
                })
            }

        } catch (error) {
            console.log(error);
        }
    }

    async deleteWithdrawOrder(data: any) {
        try {
            const withdraw = await this.withdrawRepository.delete({ transactionId: data.transactionId })
            await this.producerService.produce({
                topic: "transfer_deposit_process_failed",
                messages: [
                    {
                        value: JSON.stringify(data)
                    }
                ]
            })
        } catch (error) {

        }
    }
}
