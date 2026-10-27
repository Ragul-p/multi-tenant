import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, Check } from 'typeorm';
import { Store } from './store.entity';
import { Product } from './product.entity';

@Entity('inventory')
@Index(['storeId', 'productId'], { unique: true })
@Check('quantity_nonnegative', 'quantity >= 0')
export class Inventory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() storeId: string;
  @ManyToOne(() => Store, store => store.inventory, { onDelete: 'CASCADE' })
  store: Store;
  @Column() productId: string;
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;
  @Column({ type: 'integer', default: 0 }) quantity: number;
}
