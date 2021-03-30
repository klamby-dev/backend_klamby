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
import { OrderOption } from '../models/OrderOption';
import { OrderOptionRepository } from '../repositories/OrderOptionRepository';

@Service()
export class OrderOptionService {
    constructor(
        @OrmRepository() private orderOptionRepository: OrderOptionRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a product option data
    public async create(orderOptionData: any): Promise<OrderOption> {
        this.log.info('create order option data');
        return this.orderOptionRepository.save(orderOptionData);
    }
    // findone product option a data
    public findOne(id: any): Promise<OrderOption> {
        this.log.info('Find a order option data');
        return this.orderOptionRepository.findOne(id);
    }

    // find product option a data
    public find(option: any): Promise<OrderOption[]> {
        this.log.info('Find a order option data');
        return this.orderOptionRepository.find(option);
    }
}
