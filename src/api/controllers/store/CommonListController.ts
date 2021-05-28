/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { Get, JsonController, Param, Res, Req, QueryParam, Body, Post, QueryParams } from 'routing-controllers';
import { BannerService } from '../../services/BannerService';
import { MAILService } from '../../../auth/mail.services';
import { classToPlain } from 'class-transformer';
import { CategoryService } from '../../services/CategoryService';
import { ProductService } from '../../services/ProductService';
import arrayToTree from 'array-to-tree';
import { ProductImageService } from '../../services/ProductImageService';
import { CountryService } from '../../services/CountryService';
import { ContactService } from '../../services/ContactService';
import { ContactRequest } from './requests/ContactRequest';
import { Contact } from '../../models/Contact';
import { EmailTemplateService } from '../../services/EmailTemplateService';
import { ZoneService } from '../../services/zoneService';
import { ProductToCategoryService } from '../../services/ProductToCategoryService';
import { CategoryPathService } from '../../services/CategoryPathService';
import { UserService } from '../../services/UserService';
import { CustomerWishlistService } from '../../services/CustomerWishlistService';
import jwt from 'jsonwebtoken';
import { ProductDiscountService } from '../../services/ProductDiscountService';
import { ProductSpecialService } from '../../services/ProductSpecialService';
import { PluginService } from '../../services/PluginService';
import { WidgetService } from '../../services/WidgetService';
import { WidgetItemService } from '../../services/WidgetItemService';
import { ProductRelatedService } from '../../services/ProductRelatedService';
import { ProductOptionValueService } from '../../services/ProductOptionValueService';
import { ConfigService } from '../../services/ConfigService';
import { LanguageService } from '../../services/LanguageService';
import { ProductRelatedRequest } from './requests/ProductRelatedRequest';

@JsonController('/list')
export class CommonListController {
    constructor(
                private bannerService: BannerService,
                private configService: ConfigService,
                private categoryService: CategoryService,
                private productService: ProductService,
                private productImageService: ProductImageService,
                private countryService: CountryService,
                private contactService: ContactService,
                private emailTemplateService: EmailTemplateService,
                private zoneService: ZoneService,
                private pluginService: PluginService,
                private widgetService: WidgetService,
                private widgetItemService: WidgetItemService,
                private productRelatedService: ProductRelatedService,
                private customerWishlistService: CustomerWishlistService, private languageService: LanguageService,
                private productOptionValueService: ProductOptionValueService,
                private productDiscountService: ProductDiscountService,
                private productSpecialService: ProductSpecialService,
                private productToCategoryService: ProductToCategoryService, private categoryPathService: CategoryPathService,
                private userService: UserService
    ) {
    }

    // Banner List API
    /**
     * @api {get} /api/list/banner-list Banner List
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit Limit
     * @apiParam (Request body) {Number} offset Offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiParamExample {json} Input
     * {
     *      "limit" : "",
     *      "offset": "",
     *      "count": "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Thank you Banner list show successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/banner-list
     * @apiErrorExample {json} Banner List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Product list Function
    @Get('/banner-list')
    public async bannerList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['bannerId', 'title', 'image', 'imagePath', 'content', 'link', 'position', 'isActive'];
        const search = [
            {
                name: 'title',
                op: 'like',
                value: keyword,
            },
        ];
        const whereConditions = [
            {
                name: 'isActive',
                value: 1,
            },
        ];
        const bannerList: any = await this.bannerService.list(limit, offset, select, search, whereConditions, count);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got banner list',
            data: bannerList,
        };
        return response.status(200).send(successResponse);
    }

    // Get Config API
    /**
     * @api {get} /api/list/config/:key
     * @apiGroup Store List
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get config value",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/list/config/:key
     * @apiErrorExample {json} Banner List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Product list Function
    @Get('/config/:key')
    public async getConfig(@Param('key') key: string, @Req() request: any, @Res() response: any): Promise<any> {
        const config = await this.configService.findOneByKey(key);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get config value',
            data: config || {},
        };
        return response.status(200).send(successResponse);
    }

    // Category List Tree API
    /**
     * @api {get} /api/list/category-list Category List Tree API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit Limit
     * @apiParam (Request body) {Number} offset Offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} sortOrder sortOrder
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiParamExample {json} Input
     * {
     *      "limit" : "",
     *      "offset": "",
     *      "keyorder": "",
     *      "sortOrder": "",
     *      "count": "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "category list shown successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/category-list
     * @apiErrorExample {json} Category List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Category List Function
    @Get('/category-list')
    public async ParentCategoryList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('sortOrder') sortOrder: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = ['categoryId', 'name', 'parentInt', 'sortOrder', 'metaTagTitle', 'metaTagDescription', 'metaTagKeyword', 'isActive'];
        const search = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            }, {
                name: 'isActive',
                op: 'where',
                value: 1,
            }, {
                name: 'parentInt',
                op: 'where',
                value: 0,
            },
        ];
        const whereConditions = [];
        const categoryData = await this.categoryService.list(limit, offset, select, search, whereConditions, sortOrder, count);
        if (count) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully get All category List',
                data: categoryData,
            };
            return response.status(200).send(successResponse);
        } else {
            const category = categoryData.map(async (value: any) => {
                const tempVal: any = value;
                const child = await this.categoryService.find({
                    where: { parentInt: value.categoryId, isActive: 1 },
                    select: ['categoryId', 'name', 'parentInt', 'sortOrder', 'metaTagTitle', 'metaTagDescription', 'metaTagKeyword', 'isActive'],
                });
                const children = child.map(async (val: any) => {
                    const data: any = val;
                    const subChild = await this.categoryService.find({
                        where: { parentInt: val.categoryId, isActive: 1 },
                        select: ['categoryId', 'name', 'parentInt', 'sortOrder', 'metaTagTitle', 'metaTagDescription', 'metaTagKeyword', 'isActive'],
                    });
                    if (subChild.length > 0) {
                        data.children = subChild;
                        return data;
                    }
                    return data;
                });
                const childrenData = await Promise.all(children);
                tempVal.children = childrenData;
                return tempVal;
            });
            const result = await Promise.all(category);
            if (result) {
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully got the list of categories.',
                    data: result,
                };
                return response.status(200).send(successResponse);
            }
        }
    }

    // Product List API
    /**
     * @api {get} /api/list/productlist Product List API
     * @apiGroup Store List
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} manufacturerId manufacturerId
     * @apiParam (Request body) {String} categoryId categoryId
     * @apiParam (Request body) {Number} priceFrom price from you want to list
     * @apiParam (Request body) {Number} priceTo price to you want to list
     * @apiParam (Request body) {Number} price orderBy 0->desc 1->asc
     * @apiParam (Request body) {Number} condition  1->new 2->used
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {String} count count in boolean or number
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get product list",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/list/productlist
     * @apiErrorExample {json} productList error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/productlist')
    public async productList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string,
                             @QueryParam('manufacturerId') manufacturerId: string, @QueryParam('categoryId') categoryId: string, @QueryParam('priceFrom') priceFrom: string,
                             @QueryParam('priceTo') priceTo: string, @QueryParam('price') price: number, @QueryParam('condition') condition: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = ['product.productId', 'product.sku', 'product.name', 'product.quantity', 'product.description', 'product.price',
            'product.isActive AS isActive', 'product.manufacturerId AS manufacturerId', 'product.location AS location', 'product.minimumQuantity AS minimumQuantity',
            'product.subtractStock', 'product.stockStatusId', 'product.shipping', 'product.sortOrder', 'product.condition',
            'product.dateAvailable', 'product.amount', 'product.metaTagTitle', 'product.metaTagDescription', 'product.metaTagKeyword', 'product.discount'];

        const searchConditions = [
            {
                name: 'product.isActive',
                op: 'where',
                value: 1,
            },
            {
                name: 'product.manufacturerId',
                op: 'and',
                value: manufacturerId,
            },
            {
                name: 'product.name',
                op: 'and',
                value: keyword,
            },
            {
                name: 'product.condition',
                op: 'andWhere',
                value: condition,
            },
        ];

        const whereConditions: any = [{
            name: 'product.productId',
            op: 'inraw',
            value: categoryId,
        }];

        const productList: any = await this.productService.productList(limit, offset, select, searchConditions, whereConditions, categoryId, priceFrom, priceTo, price, count);
        if (count) {
            const Response: any = {
                status: 1,
                message: 'Successfully got Products count',
                data: productList,
            };
            return response.status(200).send(Response);
        }
        const promises = productList.map(async (result: any) => {
            const productToCategory = await this.productToCategoryService.findAll({
                select: ['categoryId', 'productId'],
                where: { productId: result.productId },
            }).then((val) => {
                const category = val.map(async (value: any) => {
                    const categoryNames = await this.categoryService.findOne({ categoryId: value.categoryId });
                    const tempValue: any = value;
                    tempValue.categoryName = categoryNames ? categoryNames.name : '';
                    return tempValue;
                });
                const results = Promise.all(category);
                return results;
            });
            const productImage = await this.productImageService.findOne({
                select: ['productId', 'image', 'containerName', 'defaultImage'],
                where: {
                    productId: result.productId,
                    defaultImage: 1,
                },
            });

            const opt = await this.productOptionValueService.findAll({
                select: ['discount', 'price', 'pricePrefix'],
                where: { productId: result.productId },
            }).then((val) => {
                const results = val.reduce((sum: any, value: any) => {
                    if (value.discount > sum.discount) {
                        sum.discount = value.discount;
                        sum.price = value.price;
                        sum.pricePrefix = value.pricePrefix;
                    }
                    return sum;
                }, {
                    discount: 0,
                    price: 0,
                    pricePrefix: 0,
                });
                return results;
            });

            const temp: any = result;
            temp.discount = opt.discount;
            temp.priceOption = opt.price;
            temp.pricePrefix = opt.pricePrefix;
            temp.Images = productImage ? productImage : '';
            temp.Category = productToCategory;
            const nowDate = new Date();
            const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
            const productSpecial = await this.productSpecialService.findSpecialPrice(result.productId, todaydate);
            const productDiscount = await this.productDiscountService.findDiscountPrice(result.productId, todaydate);
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
            if (request.header('authorization')) {
                const userId = jwt.verify(request.header('authorization').split(' ')[1], '123##$$)(***&');
                const userUniqueId: any = Object.keys(userId).map((key: any) => {
                    return [(key), userId[key]];
                });
                const wishStatus = await this.customerWishlistService.findOne({
                    where: {
                        productId: result.productId,
                        customerId: userUniqueId[0][1],
                    },
                });
                if (wishStatus !== undefined) {
                    temp.wishListStatus = 1;
                } else {
                    temp.wishListStatus = 0;
                }
            } else {
                temp.wishListStatus = 0;
            }
            return temp;
        });
        const finalResult = await Promise.all(promises);
        const maximum: any = ['Max(product.price) As maximumProductPrice'];
        const maximumPrice: any = await this.productService.productMaxPrice(maximum);
        const productPrice: any = maximumPrice.maximumProductPrice;
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete list of products.',
            data: {
                maximumProductPrice: productPrice,
                productList: finalResult,
            },
        };
        return response.status(200).send(successResponse);
    }

    // Custom Product List API
    /**
     * @api {get} /api/list/custom-product-list Custom Product List API
     * @apiGroup Store List
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} manufacturerId manufacturerId
     * @apiParam (Request body) {String} categoryId categoryId
     * @apiParam (Request body) {Number} priceFrom price from you want to list
     * @apiParam (Request body) {Number} priceTo price to you want to list
     * @apiParam (Request body) {String} price ASC OR DESC
     * @apiParam (Request body) {Number} condition  1->new 2->used
     * @apiParam (Request body) {String} keyword keyword
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get product list",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/list/custom-product-list
     * @apiErrorExample {json} productList error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/custom-product-list')
    public async customProductList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string,
                                   @QueryParam('manufacturerId') manufacturerId: number, @QueryParam('categoryId') categoryId: string, @QueryParam('priceFrom') priceFrom: string,
                                   @QueryParam('priceTo') priceTo: string, @QueryParam('price') price: string, @QueryParam('condition') condition: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        return new Promise(async () => {
            const productList: any = await this.productService.customProductList(limit, offset, categoryId, manufacturerId, condition, keyword, priceFrom, priceTo, price);
            const promises = productList.map(async (result: any) => {
                const productImage = await this.productImageService.findOne({
                    select: ['productId', 'image', 'containerName', 'defaultImage'],
                    where: {
                        productId: result.productId,
                        defaultImage: 1,
                    },
                });
                const temp: any = result;
                temp.Images = productImage ? productImage : '';
                const nowDate = new Date();
                const todayDate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
                const productSpecial = await this.productSpecialService.findSpecialPrice(result.productId, todayDate);
                const productDiscount = await this.productDiscountService.findDiscountPrice(result.productId, todayDate);
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
                if (request.header('authorization')) {
                    const userId = jwt.verify(request.header('authorization').split(' ')[1], '123##$$)(***&');
                    const userUniqueId: any = Object.keys(userId).map((key: any) => {
                        return [(key), userId[key]];
                    });
                    const wishStatus = await this.customerWishlistService.findOne({
                        where: {
                            productId: result.productId,
                            customerId: userUniqueId[0][1],
                        },
                    });
                    if (wishStatus) {
                        temp.wishListStatus = 1;
                    } else {
                        temp.wishListStatus = 0;
                    }
                } else {
                    temp.wishListStatus = 0;
                }
                return temp;
            });
            const finalResult = await
                Promise.all(promises);
            const successResponse: any = {
                status: 1,
                message: 'Successfully got the complete list of products.',
                data: finalResult,
            };
            return response.status(200).send(successResponse);
        });
    }

    // Country List API
    /**
     * @api {get} /api/list/country-list Country List API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get country list",
     *      "data":{
     *      "countryId"
     *      "name"
     *      "isoCode2"
     *      "isoCode3"
     *      "addressFormat"
     *      "postcodeRequired"
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/country-list
     * @apiErrorExample {json} countryFront error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/country-list')
    public async countryList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['countryId', 'name', 'isoCode2', 'isoCode3', 'postcodeRequired', 'isActive'];
        const search = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            },
            {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
        ];
        const whereConditions = [];
        const countryList = await this.countryService.list(limit, offset, select, search, whereConditions, count);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the list of countries.',
            data: countryList,
        };
        return response.status(200).send(successResponse);

    }

    // Contact Us API
    /**
     * @api {post} /api/list/contact-us  Contact Us API
     * @apiGroup Store List
     * @apiParam (Request body) {String} name Name
     * @apiParam (Request body) {String} email Email
     * @apiParam (Request body) {String} phoneNumber Phone Number
     * @apiParam (Request body) {String} message Message
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "email" : "",
     *      "phoneNumber" : "",
     *      "message" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Your mail send to admin..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/contact-us
     * @apiErrorExample {json} Contact error
     * HTTP/1.1 500 Internal Server Error
     */
    // ContactUs Function
    @Post('/contact-us')
    public async userContact(@Body({ validate: true }) contactParam: ContactRequest, @Req() request: any, @Res() response: any): Promise<any> {
        const contactInformation = new Contact();
        contactInformation.name = contactParam.name;
        contactInformation.email = contactParam.email;
        contactInformation.phoneNumber = contactParam.phoneNumber;
        contactInformation.message = contactParam.message;
        const informationData = await this.contactService.create(contactInformation);
        const emailContent = await this.emailTemplateService.findOne(3);
        if (!emailContent) {
            const errorResponse: any = {
                status: 0,
                message: 'Email Content Not found',
            };
            return response.status(400).send(errorResponse);
        }
        const message = emailContent.content.replace('{name}', informationData.name).replace('{email}', informationData.email).replace('{phoneNumber}', informationData.phoneNumber).replace('{message}', informationData.message);
        const adminId: any = [];
        const adminUser = await this.userService.findAll({ select: ['username'], where: { userGroupId: 1 } });
        for (const user of adminUser) {
            const val = user.username;
            adminId.push(val);
        }
        const sendMailRes = MAILService.contactMail(message, emailContent.subject, adminId);
        if (sendMailRes) {
            const successResponse: any = {
                status: 1,
                message: 'Your request Successfully send',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Mail does not send',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Zone List API
    /**
     * @api {get} /api/list/zone-list Zone List API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get zone list",
     *      "data":{
     *      "countryId"
     *      "code"
     *      "name"
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/zone-list
     * @apiErrorExample {json} Zone error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/zone-list')
    public async zonelist(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['zoneId', 'countryId', 'code', 'name', 'isActive'];
        const search = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            },
            {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
        ];

        const whereConditions = [];
        const relation = ['country'];

        const zoneList = await this.zoneService.list(limit, offset, select, search, whereConditions, relation, count);
        if (zoneList) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully get all zone List',
                data: classToPlain(zoneList),
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'unable to get zone List',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Specific parent Category List API
    /**
     * @api {get} /api/list/specific-category-list Specific Category List
     * @apiGroup Store List
     * @apiParam (Request body) {Number} categoryId categoryId
     * @apiParamExample {json} Input
     * {
     *      "parentInt" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Category listed successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/specific-category-list
     * @apiErrorExample {json} Category List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Category List Function
    @Get('/specific-category-list')
    public async specificCategoryList(@QueryParam('categoryId') categoryid: number, @Req() request: any, @Res() response: any): Promise<any> {
        const categoryDataId = await this.categoryService.findOne(categoryid);
        if (categoryDataId === undefined) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid categoryId',
            };
            return response.status(400).send(errorResponse);
        }
        const categoryDetailId = await this.categoryPathService.findOne({ categoryId: categoryid, level: 0 });
        if (!categoryDetailId) {
            const errResponse: any = {
                status: 0,
                message: 'invalid  Id',
            };
            return response.status(400).send(errResponse);
        }
        const select = ['categoryId', 'name', 'parentInt', 'sortOrder', 'metaTagTitle', 'metaTagDescription', 'metaTagKeyword'];
        const categoryData = await this.categoryService.list(0, 0, select, 0, 0, 0, 0);
        const categoryList = arrayToTree(categoryData, {
            parentProperty: 'parentInt',
            customID: 'categoryId',
        });
        const mainCategoryId = categoryDetailId.pathId;
        let dataList;
        const key = 'categoryId';
        for (const data of categoryList) {
            if (data[key] === mainCategoryId) {
                dataList = data;
            }
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully get the related category List',
            data: dataList,
        };
        return response.status(200).send(successResponse);
    }
    // Active product count API
    /**
     * @api {get} /api/list/product-count  Product Count API
     * @apiGroup Store List
     * @apiParam (Request body) {String} keyword keyword for search
     * @apiParam (Request body) {Number} manufacturerId manufacturerId
     * @apiParam (Request body) {Number} categoryId categoryId
     * @apiParam (Request body) {Number} priceFrom price from you want to list
     * @apiParam (Request body) {Number} priceTo price to you want to list
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Product Count",
     *      "data":{
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/product-count
     * @apiErrorExample {json} product count error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/product-count')
    public async productCount(@QueryParam('keyword') keyword: string, @QueryParam('manufacturerId') manufacturerId: number, @QueryParam('categoryId') categoryId: number, @QueryParam('priceFrom') priceFrom: number, @QueryParam('priceTo') priceTo: number, @Res() response: any): Promise<any> {
        const maximum: any = ['Max(product.price) As maximumProductPrice'];
        const maximumPrice: any = await this.productService.productMaxPrice(maximum);
        const productPrice: any = maximumPrice.maximumProductPrice;
        const productCount = await this.productService.productCount(keyword, manufacturerId, categoryId, priceFrom, priceTo);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get Product Count',
            data: {
                productCount: productCount.productCount,
                maximumProductPrice: productPrice,
            },
        };
        return response.status(200).send(successResponse);

    }
    // get payment setting API
    /**
     * @api {get} /api/list/get-payment-setting Get payment setting API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got payment setting",
     *      "data":{
     *      "plugin_name"
     *      "plugin_avatar"
     *      "plugin_avatar_path"
     *      "plugin_type"
     *      "plugin_status"
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/get-payment-setting
     * @apiErrorExample {json} get payment setting error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/get-payment-setting')
    public async paymentSettingList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['id', 'pluginName', 'pluginAvatar', 'pluginAvatarPath', 'pluginType', 'pluginAdditionalInfo', 'pluginStatus'];

        const search = [
            {
                name: 'pluginType',
                op: 'like',
                value: keyword,
            },
            {
                name: 'pluginStatus',
                op: 'where',
                value: 1,
            },
        ];
        const whereConditions = [];
        const paymentSettingList = await this.pluginService.list(limit, offset, select, search, whereConditions, count);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got payment List.',
            data: paymentSettingList,
        };
        return response.status(200).send(successResponse);
    }
    // Widget List API
    /**
     * @api {get} /api/list/widget-list Widget List
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit Limit
     * @apiParam (Request body) {Number} offset Offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiParamExample {json} Input
     * {
     *      "limit" : "",
     *      "offset": "",
     *      "count": "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Thank you Widget list show successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/widget-list
     * @apiErrorExample {json} Widget List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Widget list Function
    @Get('/widget-list')
    public async widgetList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = ['widgetId', 'widgetTitle', 'widgetLinkType', 'position', 'metaTagKeyword', 'metaTagDescription', 'metaTagTitle', 'widgetSlugName'];
        const search = [];
        const whereConditions = [
            {
                name: 'isActive',
                value: 1,
            },
        ];
        const widgetList: any = await this.widgetService.list(limit, offset, select, search, whereConditions, count);
        if (count) {
            return response.status(200).send({
                status: 1,
                message: 'Successfully get count',
                data: widgetList,
            });
        }

        const promise = widgetList.map(async (result: any) => {
            const temp: any = result;
            const BannerItem = await this.widgetItemService.find({
                where: {
                    widgetId: result.widgetId,
                },
            });
            const arr: any = [];
            for (const item of BannerItem) {
                arr.push(item.refId);
            }
            const selects = [
                ('DISTINCT Product.productId as productId'),
                'Product.name as name',
                'Product.price as price',
                'Product.description as description',
                'Product.sku as sku',
                'Product.upc as upc',
                'Product.quantity as quantity',
                'Product.metaTagTitle as metaTagTitle',
                'Product.metaTagDescription as metaTagDescription',
                'Product.metaTagKeyword as metaTagKeyword',
                'Product.stockStatusId as stockStatusId',
                'Product.created_date as createdDate',
            ];
            const whereCondition = [];
            const relations = [];
            const groupBy = [];
            if (result.widgetLinkType === 2) {
                whereCondition.push({
                    name: 'Product.isActive',
                    op: 'and',
                    value: 1,
                }, {
                    name: 'Product.product_id',
                    op: 'IN',
                    value: arr,
                });
            } else {
                relations.push({
                    tableName: 'Product.productToCategory',
                    aliasName: 'productToCategory',
                },
                    {
                        tableName: 'productToCategory.category',
                        aliasName: 'category',
                    });
                whereCondition.push({
                    name: 'Product.isActive',
                    op: 'and',
                    value: 1,
                }, {
                    name: 'category.is_active',
                    op: 'and',
                    value: 1,
                }, {
                    name: 'category.category_id',
                    op: 'IN',
                    value: arr,
                });
            }
            const searchConditions = [];
            const sort = [];
            sort.push({
                name: 'Product.createdDate',
                order: 'DESC',
            });
            const productList: any = await this.productService.listByQueryBuilder(0, 0, selects, whereCondition, searchConditions, relations, groupBy, sort, false, true);
            const promises = productList.map(async (resultData: any) => {
                const productImage = await this.productImageService.findOne({
                    select: ['productId', 'image', 'containerName', 'defaultImage'],
                    where: {
                        productId: resultData.productId,
                        defaultImage: 1,
                    },
                });
                const tempVal: any = resultData;
                tempVal.Images = productImage ? productImage : '';
                const nowDate = new Date();
                const todayDate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
                const productSpecial = await this.productSpecialService.findSpecialPrice(resultData.productId, todayDate);
                const productDiscount = await this.productDiscountService.findDiscountPrice(resultData.productId, todayDate);
                if (productSpecial !== undefined) {
                    tempVal.pricerefer = productSpecial.price;
                    tempVal.flag = 1;
                } else if (productDiscount !== undefined) {
                    tempVal.pricerefer = productDiscount.price;
                    tempVal.flag = 0;
                } else {
                    tempVal.pricerefer = '';
                    tempVal.flag = '';
                }
                if (request.header('authorization')) {
                    const userId = jwt.verify(request.header('authorization').split(' ')[1], '123##$$)(***&', { ignoreExpiration: true });
                    const userUniqueId: any = Object.keys(userId).map((key: any) => {
                        return [(key), userId[key]];
                    });
                    const wishStatus = await this.customerWishlistService.findOne({
                        where: {
                            productId: result.productId,
                            customerId: userUniqueId[0][1],
                        },
                    });
                    if (wishStatus) {
                        tempVal.wishListStatus = 1;
                    } else {
                        tempVal.wishListStatus = 0;
                    }
                } else {
                    tempVal.wishListStatus = 0;
                }
                return tempVal;
            });
            temp.items = await Promise.all(promises);
            return temp;
        });
        const value = await Promise.all(promise);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got widget list',
            data: value,
        };
        return response.status(200).send(successResponse);
    }

    // ProductRelated List API
    /**
     * @api {get} /api/list/productRelatedlist ProductRelated List API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} productId productId
     * @apiParam (Request body) {String} count count in boolean or number
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get ProductRelated list",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/list/productRelatedlist
     * @apiErrorExample {json} productRelatedlist error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/productRelatedlist')
    public async productRelatedList( @QueryParams() params: ProductRelatedRequest, @Res() response: any, @Req() request: any): Promise<any> {
        const relatedProduct = await this.productRelatedService.findOne({ where: { productId: params.productId } });
        if (!relatedProduct) {
            const errResponse: any = {
                status: 1,
                message: 'Invalid ProductId',
            };
            return response.status(400).send(errResponse);
        }
        const select = ['productRelatedDetails.productId AS productId',
                        'productRelatedDetails.sku AS sku',
                        'productRelatedDetails.name AS name',
                        'productRelatedDetails.quantity AS quantity',
                        'productRelatedDetails.description AS description',
                        'productRelatedDetails.price AS price',
                        'productRelatedDetails.isActive AS isActive',
                        'productRelatedDetails.manufacturerId AS manufacturerId',
                        'productRelatedDetails.location AS location',
                        'productRelatedDetails.minimumQuantity AS minimumQuantity',
                        'productRelatedDetails.subtractStock AS subtractStock',
                        'productRelatedDetails.stockStatusId AS stockStatusId',
                        'productRelatedDetails.shipping AS shipping',
                        'productRelatedDetails.sortOrder AS sortOrder',
                        'productRelatedDetails.condition AS conditions',
                        'productRelatedDetails.dateAvailable AS dateAvailable',
                        'productRelatedDetails.amount AS amount',
                        'productRelatedDetails.metaTagTitle AS metaTagTitle',
                        'productRelatedDetails.metaTagDescription AS metaTagDescription',
                        'productRelatedDetails.metaTagKeyword AS metaTagKeyword',
                        'productRelatedDetails.discount AS discount'];
        const relations = [
            {
                tableName: 'ProductRelated.productRelatedDetails',
                aliasName: 'productRelatedDetails',
            }];
        const whereConditions = [
            {
                name: 'ProductRelated.productId',
                op: 'and',
                value: params.productId,
            }, {
                name: 'productRelatedDetails.isActive',
                op: 'and',
                value: 1,
            }];
        const searchConditions = [];
        const groupBy = [];
        const sort = [];
        let productRelated;
        if (params.count) {
            productRelated = await this.productRelatedService.listByQueryBuilder(params.limit, params.offset, select, whereConditions, searchConditions, relations, groupBy, sort, true, true);
            const successRes: any = {
                status: 1,
                message: 'Successfully got count ',
                data: productRelated,
            };
            return response.status(200).send(successRes);
        }
        productRelated = await this.productRelatedService.listByQueryBuilder(params.limit, params.offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        const product = await productRelated.map(async (values) => {
            const productImage = await this.productImageService.findOne({
                select: ['productId', 'image', 'containerName', 'defaultImage'],
                where: {
                    productId: values.productId,
                    defaultImage: 1,
                },
            });
            const temp: any = values;
            temp.Images = productImage;
            const nowDate = new Date();
            const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
            const productSpecial = await this.productSpecialService.findSpecialPrice(values.productId, todaydate);
            const productDiscount = await this.productDiscountService.findDiscountPrice(values.productId, todaydate);
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
            if (request.header('authorization')) {
                const userId = jwt.verify(request.header('authorization').split(' ')[1], '123##$$)(***&');
                const userUniqueId: any = Object.keys(userId).map((key: any) => {
                    return [(key), userId[key]];
                });
                const wishStatus = await this.customerWishlistService.findOne({
                    where: {
                        productId: values.productId,
                        customerId: userUniqueId[0][1],
                    },
                });
                if (wishStatus !== undefined) {
                    temp.wishListStatus = 1;
                } else {
                    temp.wishListStatus = 0;
                }
            } else {
                temp.wishListStatus = 0;
            }
            return temp;
        });
        const result = await Promise.all(product);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete product list. ',
            data: classToPlain(result),
        };
        return response.status(200).send(successResponse);
    }
    // Language List
    /**
     * @api {get} /api/list/language-list Language List API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got lanuage list",
     *      "data":"{
     *      "languageId": "",
     *      "name": "",
     *      "code": "",
     *      "image": "",
     *      "imagePath": "",
     *      "locale": "",
     *      "sortOrder": "",
     *      "isActive": "",
     *      }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/language-list
     * @apiErrorExample {json} Language error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/language-list')
    public async languageList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('status') status: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['languageId', 'name', 'code', 'image', 'imagePath', 'locale', 'sortOrder', 'isActive'];
        const search = [];
        const whereConditions = [
            {
                name: 'isActive',
                value: 1,
            },
        ];
        const languageList: any = await this.languageService.list(limit, offset, select, search, whereConditions, count);
        if (count) {
            const successRes: any = {
                status: 1,
                message: 'Successfully got language count',
                data: languageList,
            };
            return response.status(200).send(successRes);
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully got language list',
            data: languageList,
        };
        return response.status(200).send(successResponse);
    }
}
