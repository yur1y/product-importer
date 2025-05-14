import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @Column('decimal')
  discountPercentage: number;

  @Column('decimal')
  rating: number;

  @Column()
  stock: number;

  @Column()
  brand: string;

  @Column()
  category: string;

  @Column()
  thumbnail: string;

  @Column('simple-array')
  images: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
}
