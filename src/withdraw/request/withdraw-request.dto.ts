export class WithdrawRequest {
    constructor(
        public readonly account_number: string,
        public readonly amount: string,
        public readonly transaction_type: string,
    ) { }
}