import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../database/entities/product.entity';
@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}
  list(merchantId: string) { return this.repo.find({ where: { merchantId, active: true }, order: { name: 'ASC' } }); }
  
  async get(merchantId: string, id: string) {
    const product = await this.repo.findOne({ where: { id, merchantId, active: true } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(merchantId: string, dto: { sku: string; name: string; pricePaise: number }) {
    if (await this.repo.findOne({ where: { merchantId, sku: dto.sku } })) throw new ConflictException('SKU already exists');
    return this.repo.save(this.repo.create({ ...dto, merchantId, active: true }));
  }
}
