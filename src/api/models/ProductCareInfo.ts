import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { BaseModel } from './BaseModel';
import moment = require('moment');
@Entity('product_care_info')
export class ProductCareInfo extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'product_care_info_id' })
    public productCareInfoId: number;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'code' })
    public code: string;

    @Column({ name: 'content' })
    public content: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
