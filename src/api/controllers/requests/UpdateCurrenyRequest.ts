/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateCurrency {

    @IsNotEmpty()
    public currencyId: number;

    @MaxLength(30, {
        message: 'title is maximum 30 character',
    })
    @IsNotEmpty()
    public title: string;

    @MaxLength(3, {
        message: 'code is maximum 3 character',
    })
    public code: string;

    public symbolLeft: string;

    public symbolRight: string;

    public value: number;

    @IsNotEmpty()
    public status: number;
}
