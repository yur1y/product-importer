import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { ProductImportProcessor } from './processors/product-import.processor';
import { Product } from './entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    BullModule.registerQueue({
      name: 'product-import',
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductImportProcessor],
})
export class ProductsModule {}
