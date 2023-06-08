import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConsumerService } from "src/kafka/consumer.service";
import { formatJSON } from "src/utils/formatJSON";
import { WithdrawService } from "./withdraw.service";

@Injectable()
export class WithdrawConsumer implements OnModuleInit {
    constructor(
        private readonly consumerService: ConsumerService,
        private readonly withdrawService: WithdrawService
    ) { }

    async onModuleInit() {
        console.log("================");
        await this.consumerService.consume(
            { topics: ["withdraw_process", "withdraw_process_success", "transfer_withdraw_process", "transfer_withdraw_process_failed"] },
            {
                eachMessage: async ({ topic, partition, message }) => {
                    console.log({ topic });
                    if (topic === "withdraw_process" || topic === "transfer_withdraw_process") {
                        await this.withdrawService.createWithdraw(formatJSON(message.value))
                    } else if (topic === "withdraw_process_success") {
                        await this.withdrawService.withdrawSuccess(formatJSON(message.value))
                    } else if (topic === "transfer_withdraw_process_failed") {
                        console.log("withdraw failed : ", formatJSON(message.value));
                        await this.withdrawService.withdrawFailed(formatJSON(message.value))
                    }
                }
            }
        );
    }
}