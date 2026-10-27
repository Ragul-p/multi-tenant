import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from '../database/entities/sale.entity';
import { SaleItem } from '../database/entities/sale-item.entity';
import { Product } from '../database/entities/product.entity';
import { Inventory } from '../database/entities/inventory.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Product, Inventory]), PaymentsModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
