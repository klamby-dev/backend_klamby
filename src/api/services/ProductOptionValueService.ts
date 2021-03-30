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
import { ProductOptionValue } from '../models/ProductOptionValue';
import { ProductOptionValueRepository } from '../repositories/ProductOptionValueRepository';

@Service()
export class ProductOptionValueService {
    constructor(
        @OrmRepository() private productOptionValueRepository: ProductOptionValueRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(data: any): Promise<ProductOptionValue> {
        this.log.info('create a data');
        return this.productOptionValueRepository.save(data);
    }
    // findone a data
    public findOne(id: number): Promise<ProductOptionValue> {
        this.log.info('Find a data');
        return this.productOptionValueRepository.findOne(id);
    }

    // delete product option
    public async delete(id: any): Promise<any> {
        this.log.info('Delete a product option value');
        const deleteProductOptionValue = await this.productOptionValueRepository.delete(id);
        return deleteProductOptionValue;
    }

    // find a data
    public findAll(id: any): Promise<ProductOptionValue[]> {
        this.log.info('Find a data');
        return this.productOptionValueRepository.find(id);
    }

    // findone a data
    public findData(id: any): Promise<ProductOptionValue> {
        this.log.info('Find a data');
        return this.productOptionValueRepository.findOne(id);
    }

}
