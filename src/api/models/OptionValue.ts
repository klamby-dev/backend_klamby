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
@Entity('option_value')
export class OptionValue extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'option_value_id' })
    public optionValueId: number;

    @Column({ name: 'option_id' })
    public optionId: number;

    @Column({ name: 'image' })
    public image: string;

    @Column({ name: 'sort_order' })
    public sortOrder: number;

    @Column({ name: 'image_path' })
    public imagePath: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
