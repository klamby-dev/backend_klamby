/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import { Payment } from './Payment';
import { OrderProduct } from './OrderProduct';
import moment = require('moment');
@Entity('payment_items')
export class PaymentItems extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'payment_item_id' })
    public paymentItemId: number;

    @Column({ name: 'order_product_id' })
    public orderProductId: number;

    @Column({ name: 'payment_id' })
    public paymentId: number;

    @Column({ name: 'total_amount' })
    public totalAmount: number;

    @Column({ name: 'product_name' })
    public productName: string;

    @Column({ name: 'product_quantity' })
    public productQuantity: number;

    @Column({ name: 'product_price' })
    public productPrice: number;

    @ManyToOne(type => OrderProduct, orderProduct => orderProduct.paymentItems)
    @JoinColumn({ name: 'order_product_id' })
    public orderProduct: OrderProduct;

    @ManyToOne(type => Payment, payment => payment.paymentItems)
    @JoinColumn({ name: 'payment_id' })
    public payment: Payment;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
