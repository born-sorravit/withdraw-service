import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConsumerService } from "src/kafka/consumer.service";
import { formatJSON } from "src/utils/formatJSON";
import { WithdrawService } from "./withdraw.service";

@Injectable()
export class TestConsumer implements OnModuleInit {
    constructor(
        private readonly consumerService: ConsumerService,
        private readonly withdrawService: WithdrawService
    ) { }

    async onModuleInit() {
        await this.consumerService.consume(
            { topics: ["withdraw_process", "withdraw_process_success"] },
            {
                eachMessage: async ({ topic, partition, message }) => {
                    if (topic === "withdraw_process") {
                        await this.withdrawService.createWithdraw(formatJSON(message.value))
                    } else if (topic === "withdraw_process_success") {
                        await this.withdrawService.withdrawSuccess(formatJSON(message.value))
                    }
                }
            }
        );
    }
}