import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConsumerService } from "./kafka/consumer.service";
import { formatJSON } from "./utils/formatJSON";

@Injectable()
export class TestConsumer implements OnModuleInit {
    constructor(private readonly consumerService: ConsumerService) { }

    async onModuleInit() {
        await this.consumerService.consume(
            { topics: ["test-kafka", 'born'] },
            {
                eachMessage: async ({ topic, partition, message }) => {
                    if (topic !== 'born') {
                        return console.log({
                            value: formatJSON(message.value),
                            topic: topic.toString(),
                            partition: partition.toString()
                        });
                    } else {
                        return console.log('Hello born');
                    }
                }
            }
        )
    }
}