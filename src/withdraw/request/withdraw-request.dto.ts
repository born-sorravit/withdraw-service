export class WithdrawRequest {
    constructor(
        public readonly account_number: number,
        public readonly amount: string,
        public readonly transaction_type: string,
    ) { }
}