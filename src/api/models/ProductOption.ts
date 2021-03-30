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
@Entity('product_option')
export class ProductOption extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'product_option_id' })
    public productOptionId: number;

    @Column({ name: 'product_id' })
    public productId: number;

    @Column({ name: 'option_id' })
    public optionId: number;

    @Column({ name: 'value' })
    public value: string;

    @Column({ name: 'required' })
    public required: number;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
