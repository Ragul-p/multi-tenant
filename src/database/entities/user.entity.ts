import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Store } from './store.entity';
export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';
@Entity('users')
@Index(['merchantId', 'email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() merchantId: string;
  @Column() storeId: string;
  @ManyToOne(() => Store, { onDelete: 'CASCADE' }) store: Store;
  @Column({ length: 255 }) email: string;
  @Column({ length: 255, select: false }) passwordHash: string;
  @Column({ type: 'varchar', length: 20, default: 'CASHIER' }) role: UserRole;
  @Column({ default: true }) active: boolean;
}
