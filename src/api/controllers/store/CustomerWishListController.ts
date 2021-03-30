/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { Post, JsonController, Res, Req, Authorized, Delete, Param, Get, QueryParam } from 'routing-controllers';
import { CustomerWishlist } from '../../models/CustomerWishlist';
import { ProductService } from '../../services/ProductService';
import { CustomerWishlistService } from '../../services/CustomerWishlistService';
import { ProductImageService } from '../../services/ProductImageService';
import { ProductOptionService } from '../../services/ProductOptionService';
import { OptionDescriptionService } from '../../services/OptionDescriptionService';
import { ProductOptionValueService } from '../../services/ProductOptionValueService';
import { OptionValueDescriptionService } from '../../services/OptionValueDescriptionService';
import { ProductSpecialService } from '../../services/ProductSpecialService';
import { ProductDiscountService } from '../../services/ProductDiscountService';

@JsonController('/customer')
export class CustomerController {
    constructor(private customerWishlistService: CustomerWishlistService, private productOptionService: ProductOptionService, private productOptionValueService: ProductOptionValueService, private optionValueDescriptionService: OptionValueDescriptionService, private optionDescriptionService: OptionDescriptionService,
                private productImageService: ProductImageService, private productService: ProductService, private productDiscountService: ProductDiscountService, private productSpecialService: ProductSpecialService) {
    }

    // Add Product To Wishlist API
    /**
     * @api {post} /api/customer/add-product-to-wishlist Add Product To Wishlist
     * @apiGroup Store wishlist
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} productId Product Id
     * @apiParam (Request body) {String} productOptionValueId Product Option Value Id
     * @apiParamExample {json} Input
     * {
     *      "productId" : "",
     *      "ProductOptionValueId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Thank you product added to the wishlist successfully.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/add-product-to-wishlist
     * @apiErrorExample {json} Add Product To Wishlist error
     * HTTP/1.1 500 Internal Server Error
     */
    // Add Product To Wishlist Function
    @Post('/add-product-to-wishlist')
    @Authorized('customer')
    public async addProductToWishlist(@Req() request: any, @Res() response: any): Promise<any> {
        return new Promise(async () => {
            const pId = await this.productService.findOne({
                where: {
                    productId: request.body.productId,
                },
            });
            if (!pId) {
                const errorResponse: any = {
                    status: 0,
                    message: 'productid not found',
                };
                return response.status(400).send(errorResponse);
            }
            const data = await this.customerWishlistService.findOne({
                where: {
                    productId: request.body.productId,
                    customerId: request.user.id,
                },
            });
            if (data) {
                const errorResponse: any = {
                    status: 1,
                    message: 'Already added this product to wishlist.',
                };
                return response.status(400).send(errorResponse);
            }
            const newProduct = new CustomerWishlist();
            newProduct.customerId = request.user.id;
            newProduct.productId = request.body.productId;
            if (request.body.productOptionValueId !== '') {
                newProduct.productOptionValueId = request.body.productOptionValueId;
            } else {
                const optionId: any = await this.productOptionService.find({
                    where: {
                        productId: request.body.productId,
                        required: 1,
                    },
                });
                const row: any = [];
                if (optionId.length >= 1) {
                    for (const productOpt of optionId) {
                        const val: any = await this.productOptionValueService.findData({
                            where: {
                                productOptionId: productOpt.productOptionId,
                            },
                        });
                        row.push(val.productOptionValueId);
                    }
                }
                const optionvalue = row.toString();
                newProduct.productOptionValueId = optionvalue;
            }
            newProduct.isActive = 1;
            const resultData = await this.customerWishlistService.create(newProduct);
            const id = resultData.wishlistProductId;
            const Product = await this.productService.findOne({ where: { productId: resultData.productId } });
            if (!Product) {
                const errorResponse: any = {
                    status: 0,
                    message: 'invalid product Id',
                };
                return response.status(400).send(errorResponse);
            }
            const image = await this.productImageService.findOne({
                where: {
                    productId: resultData.productId,
                    defaultImage: 1,
                },
            });
            const successResponse: any = {
                status: 1,
                message: 'Thank you product added to the wishlist successfully.',
                data: {
                    wishlistProductId: id,
                    product: Product,
                    productImage: image,
                },
            };
            return response.status(200).send(successResponse);
        });
    }

    // Wish List Product Delete API
    /**
     * @api {delete} /api/customer/wishlist-product-delete/:id  Delete Product From Wishlist
     * @apiGroup Store wishlist
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "wishlistProductId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Thank you deleted the product from wishlist successfully.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/wishlist-product-delete/:id
     * @apiErrorExample {json} Wishlist Product Delete error
     * HTTP/1.1 500 Internal Server Error
     */
    // Add Product Wishlist Function
    @Delete('/wishlist-product-delete/:id')
    @Authorized('customer')
    public async wishlistProductDelete(@Param('id') wishlistId: number, @Req() request: any, @Res() response: any): Promise<any> {
        const customerWishListId = await this.customerWishlistService.findOne({ where: { productId: wishlistId, customerId: request.user.id } });
        if (!customerWishListId) {
            const errorResponse: any = {
                status: 0,
                message: 'id not found',
            };
            return response.status(400).send(errorResponse);
        }
        await this.customerWishlistService.delete(customerWishListId.wishlistProductId);
        const successResponse: any = {
            status: 1,
            message: 'Thank you, deleted the product from wishlist successfully.',
        };
        return response.status(200).send(successResponse);
    }

    // Wish List Product List API
    /**
     * @api {get} /api/customer/wishlist-product-list WishList Product List
     * @apiGroup Store wishlist
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the wishlist Product List",
     *      "status": "1",
     *      "data": "{}"
     * }
     * @apiSampleRequest /api/customer/wishlist-product-list
     * @apiErrorExample {json} Wishlist Product List error
     * HTTP/1.1 500 Internal Server Error
     */
    // View Product Wishlist Function
    @Get('/wishlist-product-list')
    @Authorized('customer')
    public async wishlistProductlist(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<CustomerWishlist> {
        const select = ['wishlistProductId', 'productId', 'productOptionValueId'];
        const whereConditions = [
            {
                customerId: request.user.id,
            },
        ];
        const wishlistData = await this.customerWishlistService.list(limit, offset, select, whereConditions, count);
        if (count) {
            const Response: any = {
                status: 1,
                message: 'Successfully get count',
                data: wishlistData,
            };
            return response.status(200).send(Response);
        }
        const promises = wishlistData.map(async (results: any) => {
            const productData = await this.productService.findOne({ where: { productId: results.productId } });
            const Image = await this.productImageService.findOne({ where: { productId: results.productId, defaultImage: 1 } });
            const temp: any = productData ? productData : '';
            const nowDate = new Date();
            const todayDate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
            const productSpecial = await this.productSpecialService.findSpecialPrice(results.productId, todayDate);
            const productDiscount = await this.productDiscountService.findDiscountPrice(results.productId, todayDate);
            if (productSpecial !== undefined) {
                temp.pricerefer = productSpecial.price;
                temp.flag = 1;
            } else if (productDiscount !== undefined) {
                temp.pricerefer = productDiscount.price;
                temp.flag = 0;
            } else {
                temp.pricerefer = '';
                temp.flag = '';
            }
            const datas = results.productOptionValueId;
            results.product = temp;
            results.productImage = Image ? Image : '';
            if (datas !== null && datas !== '') {
                const productOptionValueIds: any = datas.split(',');
                const val: any = [];
                for (const productOptionValue of productOptionValueIds) {
                    const productOptions = await this.productOptionValueService.findData({ where: { productOptionValueId: productOptionValue } });
                    if (productOptions !== undefined) {
                        val.push(productOptions.productOptionValueId);
                    }
                }
                const productOption = val.map(async (value: any) => {
                    const optionValue = await this.productOptionValueService.findData({
                        select: ['productOptionValueId', 'productOptionId', 'optionId', 'optionValueId', 'quantity', 'subtractStock', 'pricePrefix', 'price'],
                        where: { productOptionValueId: value },
                    });
                    const data: any = optionValue;
                    const optionDescription = await this.optionDescriptionService.findOne({
                        where: { optionId: optionValue.optionId },
                        select: ['name'],
                    });
                    const optionValueDescription = await this.optionValueDescriptionService.findOne({
                        where: { optionValueId: optionValue.optionValueId },
                        select: ['name'],
                    });
                    if (optionDescription !== undefined) {
                        data.optionName = optionDescription.name;
                    } else {
                        data.optionName = '';
                    }
                    if (optionValueDescription !== undefined) {
                        data.optionValue = optionValueDescription.name;
                    } else {
                        data.optionValue = '';
                    }
                    return data;
                });
                const optionData = await Promise.all(productOption);
                results.productOption = optionData;
            } else {
                results.productOption = [];
            }
            return results;
        });
        const result = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Successfully show the wishlist Product List',
            data: result,
        };
        return response.status(200).send(successResponse);
    }
}
