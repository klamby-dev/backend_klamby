/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import { OptionDescription } from './OptionDescription';
import moment = require('moment');
@Entity('option')
export class Option extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'option_id' })
    public optionId: number;

    @Column({ name: 'type' })
    public type: string;

    @Column({ name: 'sort_order' })
    public sortOrder: number;

    @OneToMany(type => OptionDescription, optionDescription => optionDescription.option)
    public optionDescription: OptionDescription[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
