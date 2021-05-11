/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { IsNotEmpty } from 'class-validator';

export class AddProductRequest {

    @IsNotEmpty()
    public productName: string;

    // @IsNotEmpty()
    public productDescription: string;

    @IsNotEmpty()
    public sku: string;

    public upc: string;

    public metaTagTitle: string;

    @IsNotEmpty()
    public categoryId: string;

    @IsNotEmpty()
    public image: string;

    public measurementContainer: string;
    public measurementImage: string;
    public publishDate: Date;
    public releaseDate: Date;
    public isPo: number;

    @IsNotEmpty()
    public model: number;

    @IsNotEmpty()
    public price: string;

    public location: string;

    @IsNotEmpty()
    public outOfStockStatus: number;

    // @IsNotEmpty()
    public requiredShipping: number;

    // @IsNotEmpty()
    public dateAvailable: string;

    @IsNotEmpty()
    public condition: number;

    @IsNotEmpty()
    public status: number;

    // @IsNotEmpty()
    public sortOrder: number;

    public defaultImage: number;

    public productDiscount: [];

    public productSpecial: [];

    public productOptions: [];

    public productRelated: [];

}
