import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Product } from '../entities/product.entity';
import { ProductsService } from '../services/products.service';

@Processor('product-import')
export class ProductImportProcessor {
  private readonly logger = new Logger(ProductImportProcessor.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productsService: ProductsService,
  ) {}

  @Process('import')
  async handleImport(job: Job) {
    try {
      this.logger.log('Starting product import...');

      // Fetch current products from database
      const existingProducts = await this.productRepository.find();
      const existingProductsMap = new Map(
        existingProducts.map((product) => [product.id, product]),
      );

      // Fetch products from API
      const apiProducts = await this.productsService.fetchProductsFromAPI();

      // Process products in batches for better performance
      const batchSize = 50;
      for (let i = 0; i < apiProducts.length; i += batchSize) {
        const batch = apiProducts.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (apiProduct) => {
            const existingProduct = existingProductsMap.get(apiProduct.id);

            if (!existingProduct) {
              // Create new product
              this.logger.debug(`Creating new product: ${apiProduct.title}`);
              await this.productRepository.save(apiProduct);
            } else {
              // Check if product needs update by comparing fields
              const hasChanged = this.hasProductChanged(
                existingProduct,
                apiProduct,
              );
              if (hasChanged) {
                this.logger.debug(`Updating product: ${apiProduct.title}`);
                await this.productRepository.update(apiProduct.id, apiProduct);
              }
            }
            // Remove from map to track deletions
            existingProductsMap.delete(apiProduct.id);
          }),
        );

        // Update progress
        await job.progress(((i + batch.length) / apiProducts.length) * 100);
      }

      // Delete products that no longer exist in API
      const productsToDelete = Array.from(existingProductsMap.keys());
      if (productsToDelete.length > 0) {
        this.logger.debug(
          `Deleting ${productsToDelete.length} obsolete products`,
        );
        await this.productRepository.delete(productsToDelete);
      }

      this.logger.log('Product import completed successfully');
      return {
        success: true,
        processed: apiProducts.length,
        deleted: productsToDelete.length,
      };
    } catch (error) {
      this.logger.error('Error during product import:', error);
      throw error;
    }
  }

  private hasProductChanged(existing: Product, updated: Product): boolean {
    return (
      existing.title !== updated.title ||
      existing.description !== updated.description ||
      existing.price !== updated.price ||
      existing.discountPercentage !== updated.discountPercentage ||
      existing.rating !== updated.rating ||
      existing.stock !== updated.stock ||
      existing.brand !== updated.brand ||
      existing.category !== updated.category ||
      existing.thumbnail !== updated.thumbnail ||
      JSON.stringify(existing.images) !== JSON.stringify(updated.images)
    );
  }
}
