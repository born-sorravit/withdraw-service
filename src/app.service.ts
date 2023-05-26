import { Injectable } from '@nestjs/common';
import { ProducerService } from './kafka/producer.service';

@Injectable()
export class AppService {
  constructor(private readonly producerService: ProducerService) { }
  async getHello() {
    this.producerService.produce({
      topic: 'test-kafka',
      messages: [
        {
          value: JSON.stringify({
            account_type: '1',
            amount: 200,
            payment_type: 'withdraw'
          }),
        }
      ]
    })
    return 'Hello World!';
  }
}
