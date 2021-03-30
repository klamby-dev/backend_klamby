/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { ProductDiscount } from '../models/ProductDiscount';
import { ProductDiscountRepository } from '../repositories/ProductDiscountRepository';

@Service()
export class ProductDiscountService {
    constructor(@OrmRepository() private productDiscountRepository: ProductDiscountRepository,
                @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(data: any): Promise<ProductDiscount> {
        this.log.info('create a data');
        return this.productDiscountRepository.save(data);
    }
    // findone a data
    public findOne(id: number): Promise<ProductDiscount> {
        this.log.info('Find a data');
        return this.productDiscountRepository.findOne(id);
    }
    // find a data
    public findAll(productDiscount: any): Promise<ProductDiscount[]> {
        this.log.info('Find a data');
        return this.productDiscountRepository.find(productDiscount);
    }
    // delete product option
    public async delete(id: any): Promise<any> {
        this.log.info('Delete a product option');
        const deleteProductDiscount = await this.productDiscountRepository.delete(id);
        return deleteProductDiscount;
    }

    // find special price
    public async findDiscountPrice(productId: number, todayDate: string): Promise<any> {
        return await this.productDiscountRepository.findDiscountPrice(productId, todayDate);
    }
}
