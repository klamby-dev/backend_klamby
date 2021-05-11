/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { IsNotEmpty } from 'class-validator';
import { BeforeInsert, Column, Entity, BeforeUpdate, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment from 'moment';
import { ProductToCategory } from './ProductToCategory';
import { ProductImage } from './ProductImage';
import { OrderProduct } from './OrderProduct';
import { CustomerWishlist } from './CustomerWishlist';
import { ProductRating } from './ProductRating';
import { ProductRelated } from './ProductRelated';

@Entity('product')
export class Product extends BaseModel {
    @PrimaryGeneratedColumn({ name: 'product_id' })
    @IsNotEmpty()
    public productId: number;

    @Column({ name: 'sku' })
    public sku: string;

    @Column({ name: 'upc' })
    public upc: string;

    @Column({ name: 'location' })
    public location: string;

    @Column({ name: 'quantity' })
    public quantity: number;

    @Column({ name: 'minimum_quantity' })
    public minimumQuantity: number;

    @Column({ name: 'subtract_stock' })
    public subtractStock: number;

    @IsNotEmpty()
    @Column({ name: 'stock_status_id' })
    public stockStatusId: number;

    @Column({ name: 'image' })
    public image: string;

    @Column({ name: 'image_path' })
    public imagePath: string;

    @Column({ name: 'measurement_image' })
    public measurementImage: string;

    @Column({ name: 'measurement_container' })
    public measurementContainer: string;

    @Column({ name: 'manufacturer_id' })
    public manufacturerId: number;

    @Column({ name: 'shipping' })
    public shipping: number;

    @IsNotEmpty()
    @Column({ name: 'price' })
    public price: number;

    @Column({ name: 'date_available' })
    public dateAvailable: Date;

    @Column({ name: 'publish_date' })
    public publishDate: Date;

    @Column({ name: 'release_date' })
    public releaseDate: Date;

    @Column({ name: 'sort_order' })
    public sortOrder: number;

    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'description' })
    public description: string;

    @Column({ name: 'amount' })
    public amount: number;

    @Column({ name: 'meta_tag_title' })
    public metaTagTitle: string;

    @Column({ name: 'meta_tag_description' })
    public metaTagDescription: string;

    @Column({ name: 'meta_tag_keyword' })
    public metaTagKeyword: string;

    @Column({ name: 'discount' })
    public discount: number;

    @Column({ name: 'delete_flag' })
    public deleteFlag: number;

    @Column({ name: 'today_deals' })
    public todayDeals: number;

    @Column({ name: 'condition' })
    public condition: number;

    @Column({ name: 'is_active' })
    public isActive: number;

    @Column({ name: 'is_po' })
    public isPo: number;

    @Column({ name: 'rating' })
    public rating: number;

    @OneToMany(type => ProductToCategory, productToCategory => productToCategory.product)
    public productToCategory: ProductToCategory[];

    @OneToMany(type => ProductImage, productImage => productImage.product)
    public productImage: ProductImage[];

    @OneToMany(type => OrderProduct, orderProduct => orderProduct.productInformationDetail)
    public orderProduct: OrderProduct[];

    @OneToMany(type => CustomerWishlist, customerWishlist => customerWishlist.product)
    public wishlist: CustomerWishlist[];

    @OneToMany(type => ProductRating, productRating => productRating.product)
    public productRating: ProductRating[];

    @OneToMany(type => ProductRelated, productRelated => productRelated.productDetails)
    public productRelated: ProductRelated[];

    @OneToMany(type => ProductRelated, relatedProduct => relatedProduct.productRelatedDetails)
    public relatedProduct: ProductRelated[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
