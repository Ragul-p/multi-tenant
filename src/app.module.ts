import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './database/entities/merchant.entity';
import { Store } from './database/entities/store.entity';
import { User } from './database/entities/user.entity';
import { Product } from './database/entities/product.entity';
import { Inventory } from './database/entities/inventory.entity';
import { Sale } from './database/entities/sale.entity';
import { SaleItem } from './database/entities/sale-item.entity';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { PaymentsModule } from './payments/payments.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (c: ConfigService) => ({
            type: 'postgres',
            host: c.get('DATABASE_HOST', 'localhost'),
            port: Number(c.get('DATABASE_PORT', 5432)),
            username: c.get('DATABASE_USER', 'postgres'),
            password: c.get('DATABASE_PASSWORD', 'postgres'),
            database: c.get('DATABASE_NAME', 'swazei_pos'),
            entities: [Merchant, Store, User, Product, Inventory, Sale, SaleItem],
            synchronize: c.get('NODE_ENV') === 'development'
        })
    }),
        AuthModule, ProductsModule, InventoryModule, SalesModule, PaymentsModule]
})
export class AppModule { }

