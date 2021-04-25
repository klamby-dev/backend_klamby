/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { Post, JsonController, Req, Res, Get, QueryParam, Body, Authorized } from 'routing-controllers';
import { classToPlain } from 'class-transformer';
import { CustomerCheckoutRequest } from './requests/CustomerCheckoutRequest';
import { OrderService } from '../../services/OrderService';
import { OrderProductService } from '../../services/OrderProductService';
import { OrderTotalService } from '../../services/OrderTotalService';
import { Order } from '../../models/Order';
import { OrderProduct } from '../../models/OrderProduct';
import { OrderTotal } from '../../models/OrderTotal';
import { MAILService } from '../../../auth/mail.services';
import { ProductService } from '../../services/ProductService';
import { ProductImageService } from '../../services/ProductImageService';
import { SettingService } from '../../services/SettingService';
import { EmailTemplateService } from '../../services/EmailTemplateService';
import { UserService } from '../../services/UserService';
import { CurrencyService } from '../../services/CurrencyService';
import { PluginService } from '../../services/PluginService';
import { OrderOption } from '../../models/OrderOption';
import { OrderOptionService } from '../../services/OrderOptionService';
import { ProductRatingService } from '../../services/RatingService';
import { CustomerService } from '../../services/CustomerService';
import { ProductRating } from '../../models/ProductRating';
import { ProductDiscountService } from '../../services/ProductDiscountService';
import { ProductSpecialService } from '../../services/ProductSpecialService';
import { ProductOptionValueService } from '../../services/ProductOptionValueService';
import { CountryService } from '../../services/CountryService';
import { ZoneService } from '../../services/zoneService';
import { PDFService } from '../../services/PdfService';
import { ToWords } from 'to-words';

@JsonController('/orders')
export class CustomerOrderController {
    constructor(private orderService: OrderService, private orderProductService: OrderProductService, private orderTotalService: OrderTotalService,
                private productService: ProductService, private productImageService: ProductImageService, private settingService: SettingService,
                private emailTemplateService: EmailTemplateService, private currencyService: CurrencyService, private orderOptionService: OrderOptionService,
                private pluginService: PluginService, private userService: UserService, private productDiscountService: ProductDiscountService,
                private productSpecialService: ProductSpecialService, private productOptionValueService: ProductOptionValueService,
                private productRatingService: ProductRatingService, private customerService: CustomerService, private countrySevice: CountryService, private zoneService: ZoneService) {
            }

    // customer checkout
    /**
     * @api {post} /api/orders/customer-checkout Checkout
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} productDetail Product Details
     * @apiParam (Request body) {Number} paymentMethod paymentMethod
     * @apiParam (Request body) {String} shippingFirstName Shipping First name
     * @apiParam (Request body) {String} shippingLastName Shipping Last Name
     * @apiParam (Request body) {String} shippingCompany Shipping Company
     * @apiParam (Request body) {String} shippingAddress_1 Shipping Address 1
     * @apiParam (Request body) {String} shippingAddress_2 Shipping Address 2
     * @apiParam (Request body) {String} shippingCity Shipping City
     * @apiParam (Request body) {Number} shippingPostCode Shipping PostCode
     * @apiParam (Request body) {String} shippingCountry Shipping Country
     * @apiParam (Request body) {String} shippingZone Shipping Zone
     * @apiParam (Request body) {String} shippingAddressFormat Shipping Address Format
     * @apiparam (Request body) {Number} phoneNumber Customer Phone Number
     * @apiparam (Request body) {String} emailId Customer Email Id
     * @apiParamExample {json} Input
     * {
     *      "productDetail" :[
     *      {
     *      "productId" : "",
     *      "quantity" : "",
     *      "price" : "",
     *      "model" : "",
     *      "name"  : "",
     *      "productOptions":[
     *      {
     *       "productOptionId":
     *       "productOptionValueId":
     *       "name":
     *       "value":
     *       "type":
     *      }]
     *      }],
     *      "shippingFirstName" : "",
     *      "shippingLastName" : "",
     *      "shippingCompany" : "",
     *      "shippingAddress_1" : "",
     *      "shippingAddress_2" : "",
     *      "shippingCity" : "",
     *      "shippingPostCode" : "",
     *      "shippingCountry" : "",
     *      "shippingZone" : "",
     *      "shippingAddressFormat" : "",
     *      "phoneNumber" : "",
     *      "emailId" : "",
     *      "paymentMethod" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Check Out the product successfully And Send order detail in your mail ..!!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/orders/customer-checkout
     * @apiErrorExample {json} Checkout error
     * HTTP/1.1 500 Internal Server Error
     */
    // Customer Checkout Function
    @Post('/customer-checkout')
    @Authorized('customer')
    public async customerCheckout(@Body({ validate: true }) checkoutParam: CustomerCheckoutRequest, @Res() response: any, @Req() request: any): Promise<any> {
        const newOrder: any = new Order();
        const newOrderTotal = new OrderTotal();
        let orderProduct = [];
        let i;
        const errProd: any = [];
        const errProdOpt: any = [];
        const orderProducts: any = checkoutParam.productDetails;
        for (i = 0; i < orderProducts.length; i++) {
            const productValue = await this.productService.findOne({ where: { productId: orderProducts[i].productId } });
            if (!productValue) {
                errProd.push(1);
            }
            for (const productOptionsData of orderProducts[i].productOptions) {
                const productOptValue = await this.productOptionValueService.findOne(productOptionsData.productOptionValueId);
                if (!productOptValue) {
                    errProdOpt.push(1);
                }
            }
        }
        if (errProd.length > 0) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid product',
            };
            return response.status(400).send(errResponse);
        }
        if (errProdOpt.length > 0) {
            const errProdOptResponse: any = {
                status: 0,
                message: 'Invalid product option Value',
            };
            return response.status(400).send(errProdOptResponse);
        }
        let n;
        let totalProductAmount;
        let totalAmount = 0;
        const productDetailData = [];
        newOrder.customerId = request.user.id;
        newOrder.email = checkoutParam.emailId;
        newOrder.telephone = checkoutParam.phoneNumber;
        newOrder.shippingFirstname = checkoutParam.shippingFirstName;
        newOrder.shippingLastname = checkoutParam.shippingLastName;
        newOrder.shippingAddress1 = checkoutParam.shippingAddress_1;
        newOrder.shippingAddress2 = checkoutParam.shippingAddress_2;
        newOrder.shippingCompany = checkoutParam.shippingCompany;
        newOrder.shippingCity = checkoutParam.shippingCity;
        newOrder.shippingCountry = checkoutParam.shippingCountry;
        newOrder.shippingZone = checkoutParam.shippingZone;
        newOrder.shippingPostcode = checkoutParam.shippingPostCode;
        newOrder.shippingAddressFormat = checkoutParam.shippingAddressFormat;
        newOrder.paymentFirstname = checkoutParam.shippingFirstName;
        newOrder.paymentLastname = checkoutParam.shippingLastName;
        newOrder.paymentAddress1 = checkoutParam.shippingAddress_1;
        newOrder.paymentAddress2 = checkoutParam.shippingAddress_2;
        newOrder.paymentCompany = checkoutParam.shippingCompany;
        newOrder.paymentCity = checkoutParam.shippingCity;
        newOrder.paymentCountry = checkoutParam.shippingCountry;
        newOrder.paymentZone = checkoutParam.shippingZone;
        newOrder.paymentPostcode = checkoutParam.shippingPostCode;
        newOrder.isActive = 1;
        const setting = await this.settingService.findOne();
        newOrder.orderStatusId = setting.orderStatus;
        newOrder.invoicePrefix = setting.invoicePrefix;
        const currencyVal = await this.currencyService.findOne(setting.storeCurrencyId);
        if (!currencyVal) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid storecurrency id',
            };
            return response.status(400).send(errorResponse);
        }
        newOrder.currencyCode = currencyVal.code;
        newOrder.currencyValue = currencyVal.value;
        newOrder.currencySymbolLeft = currencyVal.symbolLeft;
        newOrder.currencySymbolRight = currencyVal.symbolRight;
        newOrder.currencyValue = currencyVal.value;
        newOrder.paymentAddressFormat = checkoutParam.shippingAddressFormat;
        const orderData = await this.orderService.create(newOrder);
        const currencySymbol = await this.currencyService.findOne(setting.storeCurrencyId);
        if (!currencySymbol) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid storecurrency id',
            };
            return response.status(400).send(errorResponse);
        }
        orderData.currencyRight = currencySymbol.symbolRight;
        orderData.currencyLeft = currencySymbol.symbolLeft;
        orderProduct = checkoutParam.productDetails;
        // let j = 1;
        for (i = 0; i < orderProduct.length; i++) {
            let price;
            const productValue = await this.productService.findOne({ where: { productId: orderProduct[i].productId } });
            let productPrice;
            const dateNow = new Date();
            const todayDate = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
            const productSpecial = await this.productSpecialService.findSpecialPrice(orderProduct[i].productId, todayDate);
            const productDiscount = await this.productDiscountService.findDiscountPrice(orderProduct[i].productId, todayDate);
            if (productSpecial !== undefined) {
                productPrice = productSpecial.price;
            } else if (productDiscount !== undefined) {
                productPrice = productDiscount.price;
            } else {
                productPrice = productValue.price;
            }
            let optionPrice: any = 0;
            for (const productOptionsData of orderProduct[i].productOptions) {
                const productOptValue = await this.productOptionValueService.findOne(productOptionsData.productOptionValueId);
                if (productOptValue.pricePrefix === '1') {
                    optionPrice += +productOptValue.price;
                } else {
                    optionPrice -= +productOptValue.price;
                }
            }
            price = parseInt(productPrice, 0) + parseInt(optionPrice, 0);
            const productDetails = new OrderProduct();
            productDetails.productId = orderProduct[i].productId;
            // const nwDate = new Date();
            // const odrDate = nwDate.getFullYear() + ('0' + (nwDate.getMonth() + 1)).slice(-2) + ('0' + nwDate.getDate()).slice(-2);
            // productDetails.orderProductPrefixId = orderData.invoicePrefix.concat('-' + odrDate + orderData.orderId) + j;
            productDetails.name = productValue.name;
            productDetails.orderId = orderData.orderId;
            productDetails.quantity = orderProduct[i].quantity;
            productDetails.productPrice = price;
            productDetails.total = +orderProduct[i].quantity * +price;
            productDetails.model = productValue.name;
            const productInformation = await this.orderProductService.createData(productDetails);
            const productImageData = await this.productService.findOne(productInformation.productId);
            const productImageDetail = await this.productImageService.findOne({ where: { productId: productInformation.productId } });
            productImageData.productInformationData = productInformation;
            productImageData.productImage = productImageDetail;
            totalProductAmount = await this.orderProductService.findData(orderProduct[i].productId, orderData.orderId, productInformation.orderProductId);
            for (n = 0; n < totalProductAmount.length; n++) {
                totalAmount += +totalProductAmount[n].total;
            }
            for (const productOptionsData of orderProduct[i].productOptions) {
                const productOptionModel = new OrderOption();
                productOptionModel.orderId = orderData.orderId;
                productOptionModel.orderProductId = productInformation.orderProductId;
                productOptionModel.productOptionId = productOptionsData.productOptionId;
                productOptionModel.productOptionValueId = productOptionsData.productOptionValueId;
                productOptionModel.name = productOptionsData.name;
                productOptionModel.value = productOptionsData.value;
                productOptionModel.type = productOptionsData.type;
                await this.orderOptionService.create(productOptionModel);
            }
            const productOptionValue = await this.orderOptionService.find({
                where: {
                    orderProductId: productInformation.orderProductId,
                    orderId: orderData.orderId,
                }, select: ['name', 'value'],
            });
            productImageData.productOption = productOptionValue;
            productDetailData.push(productImageData);
            // j++;
        }
        newOrder.total = totalAmount;
        newOrder.invoiceNo = 'INV00'.concat(orderData.orderId);
        const nowDate = new Date();
        const orderDate = nowDate.getFullYear() + ('0' + (nowDate.getMonth() + 1)).slice(-2) + ('0' + nowDate.getDate()).slice(-2);
        newOrder.orderPrefixId = setting.invoicePrefix.concat('-' + orderDate + orderData.orderId);
        const resultData = await this.orderService.update(orderData.orderId, newOrder);
        newOrderTotal.orderId = orderData.orderId;
        newOrderTotal.value = totalAmount;
        await this.orderTotalService.createOrderTotalData(newOrderTotal);
        const plugin = await this.pluginService.findOne({ where: { id: checkoutParam.paymentMethod } });
        if (!plugin) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid id',
            };
            return response.status(400).send(errorResponse);
        }
        if (plugin.pluginName === 'CashOnDelivery') {
            const emailContent = await this.emailTemplateService.findOne(5);
            if (!emailContent) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Email Content not found',
                };
                return response.status(400).send(errorResponse);
            }
            const adminEmailContent = await this.emailTemplateService.findOne(6);
            if (!adminEmailContent) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Email Content not found',
                };
                return response.status(400).send(errorResponse);
            }
            const today = ('0' + nowDate.getDate()).slice(-2) + '.' + ('0' + (nowDate.getMonth() + 1)).slice(-2) + '.' + nowDate.getFullYear();
            const customerFirstName = orderData.shippingFirstname;
            const customerLastName = orderData.shippingLastname;
            const customerName = customerFirstName + ' ' + customerLastName;
            const adminMessage = adminEmailContent.content.replace('{name}', customerName).replace('{orderId}', orderData.orderId);
            const customerMessage = emailContent.content.replace('{name}', customerName);
            const adminId: any = [];
            const adminUser = await this.userService.findAll({ select: ['username'], where: { userGroupId: 1, deleteFlag: 0 } });
            for (const user of adminUser) {
                const val = user.username;
                adminId.push(val);
            }
            MAILService.adminOrderMail(adminMessage, orderData, adminEmailContent.subject, productDetailData, today, adminId);
            MAILService.customerOrderMail(customerMessage, orderData, emailContent.subject, productDetailData, today);
            const successResponse: any = {
                status: 1,
                message: 'You successfully checked out the product and order details send to your mail',
                data: resultData,
            };
            return response.status(200).send(successResponse);
        } else {
            const pluginInfo = JSON.parse(plugin.pluginAdditionalInfo);
            const route = request.headers.host + pluginInfo.processRoute + '/' + orderData.orderPrefixId;
            const successResponse: any = {
                status: 3,
                message: 'Redirect to this url',
                data: route,
            };
            return response.status(200).send(successResponse);
        }
    }

    // Customer Order List API
    /**
     * @api {get} /api/orders/order-list My Order List
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the Order List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/order-list
     * @apiErrorExample {json} Order List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order List Function
    @Get('/order-list')
    @Authorized('customer')
    public async orderList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const search = [
            {
                name: 'customerId',
                op: 'where',
                value: request.user.id,
            },
        ];
        const whereConditions = 0;
        const select = ['orderId', 'customerId', 'orderStatus', 'total', 'createdDate', 'orderPrefixId'];
        const relation = ['orderStatus'];
        const OrderData = await this.orderService.list(limit, offset, select, search, whereConditions, relation, count);
        if (count) {
            const Response: any = {
                status: 1,
                message: 'Successfully get Count. ',
                data: OrderData,
            };
            return response.status(200).send(Response);
        }
        const promises = OrderData.map(async (results: any) => {
            const Id = results.orderId;
            const countValue = await this.orderProductService.findAndCount({ where: { orderId: Id } });
            results.items = countValue[1];
            return results;
        });
        const result = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order list. ',
            data: classToPlain(result),
        };
        return response.status(200).send(successResponse);
    }

    // Customer Order Detail API
    /**
     * @api {get} /api/orders/order-detail My OrderDetail
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId Order Id
     * @apiParamExample {json} Input
     * {
     *      "orderId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the Order Detail..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/order-detail
     * @apiErrorExample {json} Order Detail error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order Detail Function
    @Get('/order-detail')
    @Authorized('customer')
    public async orderDetail(@QueryParam('orderId') orderid: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderData = await this.orderService.findOrder({
            where: { orderId: orderid, customerId: request.user.id },
            select: ['orderId', 'orderStatusId', 'orderPrefixId', 'customerId', 'invoiceNo', 'telephone', 'shippingFirstname', 'shippingLastname', 'shippingCompany', 'shippingAddress1',
                'shippingAddress2', 'shippingCity', 'shippingZone', 'shippingPostcode', 'shippingCountry', 'shippingAddressFormat',
                'paymentFirstname', 'paymentLastname', 'paymentCompany', 'paymentAddress1', 'paymentAddress2', 'paymentCity',
                'paymentPostcode', 'paymentCountry', 'paymentZone', 'paymentAddressFormat', 'total', 'createdDate', 'currencyCode', 'currencySymbolLeft', 'currencySymbolRight'],
        });
        if (!orderData) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid orderId for this user',
            };
            return response.status(400).send(errResponse);
        }
        orderData.productList = await this.orderProductService.find({
            where: { orderId: orderid },
            select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice'],
        }).then((val) => {
            const productVal = val.map(async (value: any) => {
                const orderOption = await this.orderOptionService.find({
                    where: { orderProductId: value.orderProductId },
                    select: ['name', 'value', 'type', 'orderOptionId', 'orderProductId'],
                });
                const rating = await this.productRatingService.findOne({
                    select: ['rating', 'review'],
                    where: {
                        customerId: request.user.id,
                        orderProductId: value.orderProductId,
                        productId: value.productId,
                    },
                });
                const tempVal: any = value;
                tempVal.orderOptions = orderOption;
                if (rating !== undefined) {
                    tempVal.rating = rating.rating;
                    tempVal.review = rating.review;
                } else {
                    tempVal.rating = 0;
                    tempVal.review = '';
                }
                return tempVal;
            });
            const results = Promise.all(productVal);
            return results;
        });
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order Detail. ',
            data: orderData,
        };
        return response.status(200).send(successResponse);
    }
    // Product Rating  API
    /**
     * @api {post} /api/orders/add-rating Add Rating  API
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number}  productId
     * @apiParam (Request body) {Number}  orderProductId
     * @apiParam (Request body) {Number} rating
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully added rating!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/add-rating
     * @apiErrorExample {json} rating error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order List Function
    @Post('/add-rating')
    @Authorized('customer')
    public async Rating(@Body({ validate: true }) ratingValue: any, @Req() request: any, @Res() response: any): Promise<any> {
        const resultData = await this.productService.findOne({

            where: { productId: request.body.productId },
        });
        if (!resultData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid productId',
            };
            return response.status(400).send(errorResponse);
        }
        const orderProduct = await this.orderProductService.findOne({
            where: {
                orderProductId: request.body.orderProductId,
            },
        });
        if (!orderProduct) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid orderproduct id',
            };
            return response.status(400).send(errorResponse);
        }
        const order = await this.orderService.findOrder({
            where: {
                orderId: orderProduct.orderId, customerId: request.user.id,
            },
        });
        if (!order) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid rating for this user',
            };
            return response.status(400).send(errResponse);
        }
        const rating = await this.productRatingService.findOne({

            where: {
                orderProductId: request.body.orderProductId,
                customerId: request.user.id,
            },
        });
        if (rating) {
            rating.rating = request.body.rating;
            const updateRatings = await this.productRatingService.create(rating);
            if (updateRatings) {
                const updateRating: any = await this.productRatingService.consolidateRating(request.body.productId);
                resultData.rating = updateRating.RatingSum / updateRating.RatingCount;
                await this.productService.create(resultData);
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully updated your ratings',
                };
                return response.status(200).send(successResponse);
            }
        } else {
            const customer = await this.customerService.findOne({ where: { id: request.user.id } });
            if (!customer) {
                const errorResponse: any = {
                    status: 0,
                    message: 'invalid id',
                };
                return response.status(400).send(errorResponse);
            }
            const newRating: any = new ProductRating();
            newRating.rating = request.body.rating;
            newRating.orderProductId = request.body.orderProductId;
            newRating.productId = request.body.productId;
            newRating.customerId = request.user.id;
            newRating.firstName = customer.firstName;
            newRating.lastName = customer.lastName;
            newRating.email = customer.email;
            newRating.isActive = 1;
            const addRating = await this.productRatingService.create(newRating);
            if (addRating) {
                const updateRating: any = await this.productRatingService.consolidateRating(request.body.productId);
                resultData.rating = updateRating.RatingSum / updateRating.RatingCount;
                await this.productService.create(resultData);
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully created your ratings',
                };
                return response.status(200).send(successResponse);
            }
        }
    }

    // Product Reviews  API
    /**
     * @api {post} /api/orders/add-reviews Add Reviews  API
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number}  productId productId
     * @apiParam (Request body) {Number}  orderProductId
     * @apiParam (Request body) {String} reviews productReviews
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully added reviews!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/add-reviews
     * @apiErrorExample {json} reviews error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order List Function
    @Post('/add-reviews')
    @Authorized('customer')
    public async Reviews(@Body({ validate: true }) Value: any, @Req() request: any, @Res() response: any): Promise<any> {
        const resultData = await this.productService.findOne({

            where: { productId: request.body.productId },
        });
        if (!resultData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid productId',
            };
            return response.status(400).send(errorResponse);
        }
        const orderProduct = await this.orderProductService.findOne({
            where: {
                orderProductId: request.body.orderProductId,
            },
        });
        if (!orderProduct) {
            const errorResponse: any = {
                status: 0,
                message: 'invalid orderproduct id',
            };
            return response.status(400).send(errorResponse);
        }
        const order = await this.orderService.findOrder({
            where: {
                orderId: orderProduct.orderId, customerId: request.user.id,
            },
        });
        if (!order) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid rating for this user',
            };
            return response.status(400).send(errResponse);
        }
        const rating = await this.productRatingService.findOne({

            where: {
                orderProductId: request.body.orderProductId,
                customerId: request.user.id,
            },
        });
        if (rating) {
            rating.review = request.body.reviews;
            const updateRating = await this.productRatingService.create(rating);
            if (updateRating) {
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully updated your reviews',
                };
                return response.status(200).send(successResponse);
            }
        } else {
            const customer = await this.customerService.findOne({ where: { id: request.user.id } });
            if (!customer) {
                const errorResponse: any = {
                    status: 0,
                    message: 'customer id',
                };
                return response.status(400).send(errorResponse);
            }
            const newRating: any = new ProductRating();
            newRating.review = request.body.reviews;
            newRating.productId = request.body.productId;
            newRating.orderProductId = request.body.orderProductId;
            newRating.customerId = request.user.id;
            newRating.firstName = customer.firstName;
            newRating.lastName = customer.lastName;
            newRating.email = customer.email;
            newRating.isActive = 1;
            await this.productRatingService.create(newRating);

            const successResponse: any = {
                status: 1,
                message: 'Successfully created your reviews',
            };
            return response.status(200).send(successResponse);

        }
    }
    // Customer Download Invoice API
    /**
     * @api {get} /api/orders/download-invoice Download Invoice
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId Order Id
     * @apiParamExample {json} Input
     * {
     *      "orderId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully downloaded the invoice" ,
     *      "status": "1" ,
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/download-invoice
     * @apiErrorExample {json} Order Detail error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order Detail Function
    @Get('/download-invoice')
    @Authorized('customer')
    public async downloadInvoice(@QueryParam('orderId') orderid: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderData = await this.orderService.findOrder({
            where: { orderId: orderid, customerId: request.user.id },
            select: ['orderId', 'orderStatusId', 'orderPrefixId', 'customerId', 'invoiceNo', 'telephone', 'shippingFirstname', 'shippingLastname', 'shippingCompany', 'shippingAddress1',
                'shippingAddress2', 'shippingCity', 'shippingZone', 'shippingPostcode', 'shippingCountry', 'shippingAddressFormat',
                'paymentFirstname', 'paymentLastname', 'paymentCompany', 'paymentAddress1', 'paymentAddress2', 'paymentCity',
                'paymentPostcode', 'paymentCountry', 'paymentZone', 'paymentAddressFormat', 'total', 'createdDate', 'currencyCode', 'currencySymbolLeft', 'currencySymbolRight'],
        });
        if (!orderData) {
            const errResponse: any = {
                status: 1,
                message: 'invalid id',
            };
            return response.status(400).send(errResponse);
        }
        const total = new ToWords();
        orderData.words = total.convert(orderData.total);
        orderData.createdDate = ('0' + orderData.createdDate.getDate()).slice(-2) + '/' + ('0' + (orderData.createdDate.getMonth() + 1)).slice(-2) + '/' + orderData.createdDate.getFullYear();
        orderData.setting = await this.settingService.findOne();
        orderData.country = await this.countrySevice.findOne({ where: { countryId: orderData.setting.countryId } });
        if (!orderData.country) {
            const errorResponse: any = {
                status: 0,
                message: 'invalid country id',
            };
            return response.status(400).send(errorResponse);
        }
        orderData.Zone = await this.zoneService.findOne({ where: { zoneId: orderData.setting.zoneId } });
        if (!orderData.Zone) {
            const errorResponse: any = {
                status: 0,
                message: 'invalid zone id',
            };
            return response.status(400).send(errorResponse);
        }
        orderData.productList = await this.orderProductService.find({
            where: { orderId: orderid },
            select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice'],
        });
        const productVal = await orderData.productList.map(async (value: any) => {
            orderData.orderOption = await this.orderOptionService.find({
                where: { orderProductId: value.orderProductId },
                select: ['name', 'value', 'type', 'orderOptionId', 'orderProductId'],
            });

            const tempVal: any = value;
            tempVal.orderOptions = orderData.orderOption;
            return tempVal;
        });
        const results = await Promise.all(productVal);
        const ejsfile = await PDFService.renderFile(orderData, results);
        const pdf = await PDFService.pdfFile(ejsfile);
        const successResponse: any = {
            status: 1,
            message: 'Order Detail pdf . ',
            data: pdf,
        };
        return response.status(200).send(successResponse);
    }
}
