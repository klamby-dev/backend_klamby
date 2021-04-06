/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseModel } from './BaseModel';
import * as bcrypt from 'bcrypt';
import moment = require('moment/moment');
import { Exclude } from 'class-transformer';
import { CustomerGroup } from './CustomerGroup';
import { ProductRating } from './ProductRating';

@Entity('customer')
export class Customer extends BaseModel {

    public static hashPassword(password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    }

    public static comparePassword(user: Customer, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                resolve(res === true);
            });
        });
    }

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'user_cid' })
    public userCid: string;

    @Column({ name: 'fb_uid' })
    public fbUid: string;

    @Column({ name: 'fb_email' })
    public fbEmail: string;

    @Column({ name: 'google_uid' })
    public googleUid: string;

    @Column({ name: 'google_email' })
    public googleEmail: string;

    @Column({ name: 'name' })
    public firstName: string;

    @Column({ name: 'last_name' })
    public lastName: string;

    @Column({ name: 'salutation' })
    public salutation: string;

    @Exclude()
    @Column({ name: 'password' })
    public password: string;

    @Column({ name: 'email' })
    public email: string;

    @Column({ name: 'mobile' })
    public mobileNumber: number;

    @Column({ name: 'address' })
    public address: string;

    @Column({ name: 'remember_token' })
    public rememberToken: string;

    @Column({ name: 'province' })
    public province: string;

    @Column({ name: 'district' })
    public district: string;

    @Column({ name: 'postal_code' })
    public postalCode: string;

    @Column({ name: 'dob' })
    public dob: string;

    @Column({ name: 'country' })
    public country: string;

    @Column({ name: 'company' })
    public company: string;

    @Column({ name: 'member_level' })
    public member_level: string;

    @Column({ name: 'points' })
    public points: number;

    @Column({ name: 'credit' })
    public credit: number;

    @Column({ name: 'otp_at' })
    public otpAt: string;

    @Column({ name: 'unbanned_until' })
    public unbannedUntil: string;

    @Column({ name: 'country_id' })
    public countryId: number;

    @Column({ name: 'is_subscribe' })
    public isSubscribe: number;

    @Column({ name: 'is_banned' })
    public isBanned: number;

    @Column({ name: 'zone_id' })
    public zoneId: number;

    @Column({ name: 'city' })
    public city: string;

    @Column({ name: 'local' })
    public local: string;

    @Column({ name: 'oauth_data' })
    public oauthData: string;

    @Column({ name: 'avatar' })
    public avatar: string;
    @Exclude()
    @Column({ name: 'newsletter' })
    public newsletter: string;

    @Column({ name: 'avatar_path' })
    public avatarPath: string;
    @Exclude()
    @Column({ name: 'customer_group_id' })
    public customerGroupId: number;

    @Column({ name: 'last_login' })
    public lastLogin: string;
    @Exclude()
    @Column({ name: 'safe' })
    public safe: number;

    @Column({ name: 'ip' })
    public ip: number;
    @Exclude()
    @Column({ name: 'mail_status' })
    public mailStatus: number;

    @Column({ name: 'pincode' })
    public pincode: string;
    @Exclude()
    @Column({ name: 'delete_flag' })
    public deleteFlag: number;
    @Exclude()
    @Column({ name: 'is_active' })
    public isActive: number;

    @ManyToOne(type => CustomerGroup, customerGroup => customerGroup.customer)
    @JoinColumn({ name: 'customer_group_id' })
    public customerGroup: CustomerGroup;

    @OneToMany(type => ProductRating, productRating => productRating.product)
    public productRating: ProductRating[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
