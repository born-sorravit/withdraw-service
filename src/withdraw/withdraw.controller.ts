import { Body, Controller, Get } from '@nestjs/common';
import { WithdrawRequest } from './request/withdraw-request.dto';
import { WithdrawService } from './withdraw.service';

@Controller('withdraw')
export class WithdrawController {
    constructor(private readonly withdrawService: WithdrawService) { }

    @Get('/')
    checkUserWithdraw(@Body() withdrawRequest: WithdrawRequest) {
        return this.withdrawService.checkUserWithdraw(withdrawRequest);
    }
}
