import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index, CreateDateColumn } from 'typeorm';
import { Store } from './store.entity';
import { SaleItem } from './sale-item.entity';

export type SaleStatus = 'COMPLETED' | 'PAYMENT_FAILED';

@Entity('sales')
@Index(['storeId', 'idempotencyKey'], { unique: true })
export class Sale {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() merchantId: string;
  @Column() storeId: string;
  @ManyToOne(() => Store, store => store.sales, { onDelete: 'RESTRICT' })
  store: Store;
  @Column() idempotencyKey: string;
  @Column({ type: 'integer' }) totalPaise: number;
  @Column({ type: 'varchar', length: 30 }) status: SaleStatus;
  @Column({ type: 'varchar', length: 30 }) paymentStatus: 'SUCCESS' | 'FAILED';
  @OneToMany(() => SaleItem, item => item.sale, { cascade: true }) items: SaleItem[];
  @CreateDateColumn() createdAt: Date;
}
