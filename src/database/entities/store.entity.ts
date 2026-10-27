import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { Merchant } from './merchant.entity';
import { Inventory } from './inventory.entity';
import { Sale } from './sale.entity';

@Entity('stores')
@Index(['merchantId', 'name'], { unique: true })
export class Store {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() merchantId: string;
  @ManyToOne(() => Merchant, merchant => merchant.stores, { onDelete: 'CASCADE' })
  merchant: Merchant;
  @Column() name: string;
  @OneToMany(() => Inventory, inventory => inventory.store) inventory: Inventory[];
  @OneToMany(() => Sale, sale => sale.store) sales: Sale[];
}
