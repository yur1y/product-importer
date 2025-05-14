import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Product } from '../entities/product.entity';
import axios from 'axios';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectQueue('product-import')
    private productImportQueue: Queue,
  ) {}

  async startImport() {
    const job = await this.productImportQueue.add(
      'import',
      {},
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    return {
      message: 'Product import started',
      jobId: job.id,
    };
  }
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (search) {
      queryBuilder.where('product.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const [products, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: products,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async fetchProductsFromAPI() {
    const response = await axios.get('https://dummyjson.com/products');
    return response.data.products;
  }
}
