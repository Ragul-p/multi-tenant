import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from '../database/entities/inventory.entity';
import { Product } from '../database/entities/product.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
@Module({
    imports: [TypeOrmModule.forFeature([Inventory, Product])],
    controllers: [InventoryController],
    providers: [InventoryService]
})
export class InventoryModule { }
