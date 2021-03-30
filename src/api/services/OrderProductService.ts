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
import { OrderProduct } from '../models/OrderProduct';
import { OrderProductRepository } from '../repositories/OrderProductRepository';

@Service()
export class OrderProductService {
    constructor(
        @OrmRepository() private orderProductRepository: OrderProductRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public async createData(checkoutData: any): Promise<OrderProduct> {
        this.log.info('create a order product data');
        return this.orderProductRepository.save(checkoutData);
    }
    public async findData(productid: number, orderid: number, orderProductid: number): Promise<any> {
        this.log.info('find a order product data');
        return this.orderProductRepository.find({ where: { productId: productid, orderId: orderid, orderProductId: orderProductid } });

    }

    public find(order: any): Promise<any> {
        return this.orderProductRepository.find(order);
    }

    public findOne(productData: any): Promise<any> {
        return this.orderProductRepository.findOne(productData);
    }

    // order list
    public List(limit: number): Promise<any> {
        return this.orderProductRepository.List(limit);
    }

    // order count
    public findAndCount(where: any): Promise<any> {
        return this.orderProductRepository.findAndCount(where);
    }
}
