import { Injectable } from '@nestjs/common';
import { ProducerService } from 'src/kafka/producer.service';
import { WithdrawRequest } from './request/withdraw-request.dto';

@Injectable()
export class WithdrawService {
    constructor(private readonly producerService: ProducerService) { }
    async checkUser(withdrawRequest: WithdrawRequest) {
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
}
