import { Injectable } from '@nestjs/common';
import { ProducerService } from 'src/kafka/producer.service';
import { WithdrawOrderEvent } from './event/withdraw-order.event';
import { WithdrawRequest } from './request/withdraw-request.dto';
import { WithdrawRepository } from './withdraw.repository';

@Injectable()
export class WithdrawService {
    constructor(
        private readonly withdrawRepository: WithdrawRepository
    ) { }
    async checkUserWithdraw(withdrawRequest: WithdrawRequest) {
        await this.withdrawRepository.checkUserAccount(withdrawRequest)
    }

    async createWithdraw(withdrawOrderEvent: any) {
        const withdraw = await this.withdrawRepository.createWithdrawOrder(withdrawOrderEvent)
    }

    async withdrawSuccess(withdrawOrderEvent: WithdrawOrderEvent) {
        console.log(`UserId : ${withdrawOrderEvent.account_number} => Withdraw success`);
    }

    async withdrawFailed(data: any) {
        const withdraw = await this.withdrawRepository.deleteWithdrawOrder(data)
    }
}
