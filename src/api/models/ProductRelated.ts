/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import { Product } from './ProductModel';
import moment = require('moment/moment');

@Entity('product_related')
export class ProductRelated extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'related_id' })
    public relatedId: number;

    @Column({ name: 'product_id' })
    public productId: number;

    @Column({ name: 'related_product_id' })
    public relatedProductId: number;

    @Column({ name: 'is_active' })
    public isActive: number;

    @ManyToOne(type => Product, product => product.productRelated)
    @JoinColumn({ name: 'product_id' })
    public productDetails: Product;

    @ManyToOne(type => Product, productRelated => productRelated.relatedProduct)
    @JoinColumn({ name: 'related_product_id' })
    public productRelatedDetails: Product;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
