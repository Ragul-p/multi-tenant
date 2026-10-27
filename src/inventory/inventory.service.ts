import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../database/entities/inventory.entity';
import { Product } from '../database/entities/product.entity';
@Injectable()
export class InventoryService {
  constructor(@InjectRepository(Inventory) private inventory: Repository<Inventory>, @InjectRepository(Product) private products: Repository<Product>) {}
  list(merchantId: string, storeId: string) { return this.inventory.createQueryBuilder('i').innerJoinAndSelect('i.product', 'p').where('i.storeId = :storeId', { storeId }).andWhere('p.merchantId = :merchantId', { merchantId }).orderBy('p.name', 'ASC').getMany(); }
  async adjust(merchantId: string, storeId: string, productId: string, quantity: number) {
    const product = await this.products.findOne({ where: { id: productId, merchantId, active: true } });
    if (!product) throw new NotFoundException('Product not found');
    let row = await this.inventory.findOne({ where: { storeId, productId } });
    if (!row) row = this.inventory.create({ storeId, productId, quantity }); else row.quantity = quantity;
    return this.inventory.save(row);
  }
}
