/*
 * spurtcommerce API
 * version 2.1
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class UpdateOption {
    @IsNotEmpty()
    public optionId: number;

    @IsNotEmpty()
    public name: string;

    public type: string;

    @IsNotEmpty()
    public sortOrder: number;

    public optionValue: [];

    public flag: number;
}
