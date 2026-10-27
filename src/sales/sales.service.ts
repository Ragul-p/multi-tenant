import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Sale } from '../database/entities/sale.entity';
import { SaleItem } from '../database/entities/sale-item.entity';
import { Product } from '../database/entities/product.entity';
import { Inventory } from '../database/entities/inventory.entity';
import { MockPaymentProvider } from '../payments/payments.service';
import { CreateSaleDto } from './dto/create-sale.dto';
@Injectable()
export class SalesService {
  constructor(@InjectDataSource() private dataSource: DataSource, @InjectRepository(Sale) private sales: Repository<Sale>, private payments: MockPaymentProvider) { }

  async createSale(merchantId: string, storeId: string, key: string, dto: CreateSaleDto) {
    if (!key?.trim() || key.length > 150) throw new BadRequestException('Idempotency-Key header is required');

    const existing = await this.sales.findOne({ where: { merchantId, storeId, idempotencyKey: key }, relations: { items: true } });
    if (existing) return existing;
    try {
      return await this.dataSource.transaction(async manager => {

        const productRepo = manager.getRepository(Product),
          inventoryRepo = manager.getRepository(Inventory),
          saleRepo = manager.getRepository(Sale),
          itemRepo = manager.getRepository(SaleItem);

        const requested = new Map<string, number>();

        for (const line of dto.items) requested.set(line.productId, (requested.get(line.productId) || 0) + line.quantity);
        const prepared: { product: Product; inventory: Inventory; quantity: number }[] = [];
        let totalPaise = 0;

        for (const [productId, quantity] of [...requested.entries()].sort(([a], [b]) => a.localeCompare(b))) {
          const product = await productRepo.findOne({ where: { id: productId, merchantId, active: true } });
          if (!product) throw new NotFoundException('Product not found for this merchant');
          const inventory = await inventoryRepo.createQueryBuilder('i').setLock('pessimistic_write').where('i.storeId = :storeId AND i.productId = :productId', { storeId, productId }).getOne();
          if (!inventory) throw new NotFoundException('Inventory record not found');
          if (inventory.quantity < quantity) throw new ConflictException('Insufficient inventory');
          totalPaise += product.pricePaise * quantity;
          prepared.push({ product, inventory, quantity });
        }

        const payment = await this.payments.charge(totalPaise, key);
        const sale = await saleRepo.save(saleRepo.create({ merchantId, storeId, idempotencyKey: key, totalPaise, paymentStatus: payment.status, status: payment.status === 'SUCCESS' ? 'COMPLETED' : 'PAYMENT_FAILED' }));
        const items = prepared.map(({ product, inventory, quantity }) => {
          if (payment.status === 'SUCCESS') inventory.quantity -= quantity;
          return itemRepo.create({ saleId: sale.id, productId: product.id, quantity, unitPricePaise: product.pricePaise, lineTotalPaise: product.pricePaise * quantity });
        });

        if (payment.status === 'SUCCESS') await inventoryRepo.save(prepared.map(x => x.inventory));
        await itemRepo.save(items); sale.items = items; return sale;
      });
    } catch (error: any) {
      if (error?.code === '23505') {
        const winner = await this.sales.findOne({ where: { merchantId, storeId, idempotencyKey: key }, relations: { items: true } });
        if (winner) return winner;
      }
      throw error;
    }
  }

  list(merchantId: string, storeId: string) { return this.sales.find({ where: { merchantId, storeId }, relations: { items: true }, order: { createdAt: 'DESC' }, take: 100 }); }

  async get(merchantId: string, storeId: string, id: string) {
    const sale = await this.sales.findOne({ where: { id, merchantId, storeId }, relations: { items: true } });
    if (!sale) throw new NotFoundException('Sale not found'); return sale;
  }

}
