/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import moment = require('moment');
@Entity('product_option_value')
export class ProductOptionValue extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'product_option_value_id' })
    public productOptionValueId: number;

    @Column({ name: 'product_option_id' })
    public productOptionId: number;

    @Column({ name: 'product_id' })
    public productId: number;

    @Column({ name: 'option_id' })
    public optionId: number;

    @Column({ name: 'option_value_id' })
    public optionValueId: number;

    @Column({ name: 'quantity' })
    public quantity: number;

    @Column({ name: 'subtract' })
    public subtractStock: number;

    @Column({ name: 'price' })
    public price: number;

    @Column({ name: 'price_prefix' })
    public pricePrefix: string;

    @Column({ name: 'points' })
    public points: number;

    @Column({ name: 'points_prefix' })
    public pointsPrefix: string;

    @Column({ name: 'weight' })
    public weight: number;

    @Column({ name: 'sku' })
    public sku: string;

    @Column({ name: 'max' })
    public max: number;

    @Column({ name: 'first_stock' })
    public firstStock: number;

    @Column({ name: 'discount' })
    public discount: number;

    @Column({ name: 'weight_prefix' })
    public weightPrefix: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
