/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';
export class AddCategory {

    @IsNotEmpty()
    public name: string;

    public image: string;

    public parentInt: number;

    @IsNotEmpty()
    public sortOrder: number;

    public metaTagTitle: string;

    public metaTagDescription: string;

    public metaTagKeyword: string;

    public status: number;
}
