export class WithdrawOrderEvent {
    constructor(
        public readonly account_number: string,
        public readonly balance: string,
        public readonly amount: string,
        public readonly transaction_type: string,
    ) { }
}