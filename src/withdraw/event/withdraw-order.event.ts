export class WithdrawOrderEvent {
    constructor(
        public readonly account_number: number,
        public readonly balance: string,
        public readonly amount: string,
        public readonly transaction_type: string,
        public readonly payment_type: string,
    ) { }
}