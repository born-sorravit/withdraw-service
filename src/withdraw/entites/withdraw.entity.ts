import { Column, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Withdraw {
    @PrimaryGeneratedColumn({
        name: 'withdraw_id',
    })
    withdrawId: string;

    @Column({ type: 'uuid', unique: true })
    @Generated('uuid')
    uuid: string;

    @Column({ name: 'account_number', nullable: false, })
    accountNumber: number;

    @Column({ name: 'transaction_type', nullable: false, default: '' })
    transactionType: string;

    @Column({ name: 'old_balance', nullable: false, default: 0 })
    oldBalance: string;

    @Column({ name: 'withdraw_amount', nullable: false, default: 0 })
    withdrawAmount: string;

    @Column({ name: 'new_balance', nullable: false, default: 0 })
    newBalance: string;
}