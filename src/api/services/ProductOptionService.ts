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
import { ProductOption } from '../models/ProductOption';
import { ProductOptionRepository } from '../repositories/ProductOptionRepository';

@Service()
export class ProductOptionService {
    constructor(
        @OrmRepository() private productOptionRepository: ProductOptionRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(data: any): Promise<ProductOption> {
        this.log.info('create a data');
        return this.productOptionRepository.save(data);
    }
    // findone a data
    public findOne(id: any): Promise<ProductOption> {
        this.log.info('Find a data');
        return this.productOptionRepository.findOne(id);
    }

    // delete product option
    public async delete(id: any): Promise<any> {
        this.log.info('Delete a product option');
        const deleteProductOption = await this.productOptionRepository.delete(id);
        return deleteProductOption;
    }

    // find a data
    public find(productOption: any): Promise<any> {
        this.log.info('Find a data');
        return this.productOptionRepository.find(productOption);
    }
}
