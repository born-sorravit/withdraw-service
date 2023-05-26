import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConsumerService } from "./kafka/consumer.service";
import { formatJSON } from "./utils/formatJSON";

@Injectable()
export class TestConsumer implements OnModuleInit {
    constructor(private readonly consumerService: ConsumerService) { }

    async onModuleInit() {
        await this.consumerService.consume(
            { topics: ["test-kafka"] },
            {
                eachMessage: async ({ topic, partition, message }) => {
                    console.log({
                        value: formatJSON(message.value),
                        topic: topic.toString(),
                        partition: partition.toString()
                    });
                }
            }
        )
    }
}