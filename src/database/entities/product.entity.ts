import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('products')
@Index(['merchantId', 'sku'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() merchantId: string;
  @Column() sku: string;
  @Column() name: string;
  // Store money as integer minor units (paise), avoiding floating point arithmetic.
  @Column({ type: 'integer' }) pricePaise: number;
  @Column({ default: true }) active: boolean;
}
