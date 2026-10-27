import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Merchant } from './entities/merchant.entity';
import { Store } from './entities/store.entity';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Inventory } from './entities/inventory.entity';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
async function seed() {

  const db = new DataSource({
    type: 'postgres', host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 5432),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'swazei_pos',
    entities: [Merchant, Store, User, Product, Inventory, Sale, SaleItem],
    synchronize: true
  });
  await db.initialize();

  const mr = db.getRepository(Merchant), sr = db.getRepository(Store), ur = db.getRepository(User), pr = db.getRepository(Product), ir = db.getRepository(Inventory);

  let merchant = await mr.findOne({ where: { name: 'Demo Merchant' } });
  if (!merchant) merchant = await mr.save(mr.create({ name: 'Demo Merchant' }));
  let store = await sr.findOne({ where: { merchantId: merchant.id, name: 'Main Store' } });
  if (!store) store = await sr.save(sr.create({ merchantId: merchant.id, name: 'Main Store' }));

  let user = await ur.findOne({ where: { merchantId: merchant.id, email: 'admin@gmail.com' } });
  if (!user) await ur.save(ur.create({
    merchantId: merchant.id, storeId: store.id, email: 'admin@gmail.com',
    passwordHash: await bcrypt.hash('Test@123', 12), role: 'ADMIN', active: true
  }));

  for (const p of [{ sku: 'KB-001', name: 'Keyboard', pricePaise: 100000 }, { sku: 'MS-001', name: 'Mouse', pricePaise: 50000 }]) {
    let product = await pr.findOne({ where: { merchantId: merchant.id, sku: p.sku } });
    if (!product) product = await pr.save(pr.create({ ...p, merchantId: merchant.id, active: true }));
    const stock = await ir.findOne({ where: { storeId: store.id, productId: product.id } });
    if (!stock) await ir.save(ir.create({ storeId: store.id, productId: product.id, quantity: 10 }));
  }

  console.log('Seed complete: admin@gmail.com / Test@123 (local development only)');
  console.log('Merchant ID:', merchant.id, 'Store ID:', store.id);
  await db.destroy();
}
seed().catch(e => { console.error(e); process.exit(1); });
