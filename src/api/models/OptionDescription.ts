/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import { Option } from './Option';
import moment = require('moment');
@Entity('option_description')
export class OptionDescription extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'option_description_id' })
    public optionDescriptionId: number;

    @Column({ name: 'option_id' })
    public optionId: number;

    @Column({ name: 'language_id' })
    public languageId: number;

    @Column({ name: 'name' })
    public name: string;

    @OneToOne(type => Option, option => option.optionDescription)
    @JoinColumn({ name: 'option_id' })
    public option: Option;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
