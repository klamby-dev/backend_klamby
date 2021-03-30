/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class CreateCustomerGroup {

    @IsNotEmpty({
        message: 'name is required',
    })
    public name: string;

    public description: string;

    @IsNotEmpty({
        message: 'colorcode is required',
    })
    public colorcode: string;

    @IsNotEmpty({
        message: 'status is required',
    })
    public status: number;
}
