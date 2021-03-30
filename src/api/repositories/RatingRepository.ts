/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { EntityRepository, Repository } from 'typeorm';
import { ProductRating } from '../models/ProductRating';

@EntityRepository(ProductRating)
export class RatingRepository extends Repository<ProductRating>  {

    public async ratingConsolidate(id: number): Promise<any> {

        const consolidate = await this.manager.createQueryBuilder(ProductRating, 'rating')
            .select(['COUNT(rating.rating) as RatingCount'])
            .addSelect(['SUM(rating.rating) as RatingSum'])
            .where('rating.productId = :productId', { productId: id })
            .andWhere('rating.isActive = :value', { value: 1 })
            .getRawOne();
        return consolidate;
    }

    // rating statistics
    public async ratingStatistics(id: number): Promise<any> {
        const query: any = await this.manager.createQueryBuilder(ProductRating, 'productRating');
        query.select(['COUNT(productRating.rating) as rating']);
        query.addSelect(['COUNT(productRating.review) as review']);
        query.where('productRating.productId = :productId', { productId: id });
        query.andWhere('productRating.isActive = :value', { value: 1 });
        return query.getRawOne();
    }

    public async ratingConsolidateForVendor(id: number): Promise<any> {

        const consolidate = await this.manager.createQueryBuilder(ProductRating, 'rating')
            .select(['COUNT(rating.rating) as RatingCount'])
            .addSelect(['SUM(rating.rating) as RatingSum'])
            .innerJoin('rating.product', 'product')
            .innerJoin('product.vendorProducts', 'vendorProducts')
            .where('vendorProducts.vendorId = :vendorId', { vendorId: id })
            .andWhere('rating.isActive = :value', { value: 1 })
            .getRawOne();
        return consolidate;
    }
}
