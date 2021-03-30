/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Column, Entity } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';

@Entity('order_option')
export class OrderOption extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'order_option_id' })
    public orderOptionId: number;

    @Column({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'order_product_id' })
    public orderProductId: number;

    @Column({ name: 'product_option_id' })
    public productOptionId: number;

    @Column({ name: 'product_option_value_id' })
    public productOptionValueId: number;

    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'value' })
    public value: string;

    @Column({ name: 'type' })
    public type: string;

    @Column({ name: 'is_active' })
    public isActive: number;
}
