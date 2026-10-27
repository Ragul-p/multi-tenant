import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Store } from './store.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) name: string;
  @OneToMany(() => Store, store => store.merchant) stores: Store[];
}
