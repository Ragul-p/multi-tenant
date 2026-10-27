import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sale } from './sale.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() saleId: string;
  @ManyToOne(() => Sale, sale => sale.items, { onDelete: 'CASCADE' }) sale: Sale;
  @Column() productId: string;
  @Column({ type: 'integer' }) quantity: number;
  @Column({ type: 'integer' }) unitPricePaise: number;
  @Column({ type: 'integer' }) lineTotalPaise: number;
}
