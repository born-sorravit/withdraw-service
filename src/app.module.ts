import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule } from './kafka/kafka.module';
import { WithdrawConsumer } from './withdraw/withdraw.consumer';
import { WithdrawModule } from './withdraw/withdraw.module';

@Module({
  imports: [
    KafkaModule,
    WithdrawModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        synchronize: true,
        entities: ['dist/**/*.entity{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      envFilePath: [`.env`]
    }),
  ],
  controllers: [AppController],
  providers: [AppService, WithdrawConsumer],
})
export class AppModule { }
