/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import {
    Get,
    Post,
    Delete,
    Put,
    Body,
    QueryParam,
    Param,
    JsonController,
    Authorized,
    Req,
    Res
} from 'routing-controllers';
import jwt from 'jsonwebtoken';
import * as AWS from 'aws-sdk';
import { classToPlain } from 'class-transformer';
import { aws_setup } from '../../env';
import { CustomerService } from '../services/CustomerService';
import { Customer } from '../models/Customer';
import { CreateCustomer } from './requests/CreateCustomerRequest';
import { User } from '../models/User';
import { MAILService } from '../../auth/mail.services';
import { UpdateCustomer } from './requests/UpdateCustomerRequest';
import { OrderService } from '../services/OrderService';
import { ProductImageService } from '../services/ProductImageService';
import { ProductService } from '../services/ProductService';
import { OrderProductService } from '../services/OrderProductService';
import { EmailTemplateService } from '../services/EmailTemplateService';
import { DeleteCustomerRequest } from './requests/DeleteCustomerRequest';
import { CustomerGroupService } from '../services/CustomerGroupService';
import * as fs from 'fs';
import { UserLogin as LoginRequest } from './requests/UserLoginRequest';
import { AccessToken } from '../models/AccessTokenModel';
import { AccessTokenService } from '../services/AccessTokenService';

@JsonController('/customer')
export class CustomerController {
    constructor(private customerService: CustomerService, private orderProductService: OrderProductService,
                private productService: ProductService,
                private accessTokenService: AccessTokenService,
                private productImageService: ProductImageService,
                private orderService: OrderService,
                private customerGroupService: CustomerGroupService,
                private emailTemplateService: EmailTemplateService) {
    }

    // customer profile API
    /**
     * @api {get} /api/customer/me My profile API
     * @apiGroup Customer
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Me",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/me
     * @apiErrorExample {json} User Profile error
     * HTTP/1.1 500 Internal Server Error
     */
     @Get('/me')
     @Authorized(['customer'])
     public async me(@Res() response: any, @Req() request: any): Promise<any> {
        const user = await this.customerService.findOne({
            where: {
                id: request.user.id,
            }, relations: ['customerGroup'],
        });
         const successResponse: any = {
             status: 1,
             data: classToPlain(user),
             message: 'Successfully get Me',
         };
         return response.status(200).send(successResponse);
     }

    // Login API
    /**
     * @api {post} /api/customer/login Login
     * @apiGroup Customer
     * @apiParam (Request body) {String} username User Email
     * @apiParam (Request body) {String} password User Password
     * @apiParamExample {json} Input
     * {
     *      "username" : "",
     *      "password" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "data": "{
     *         "token":''
     *      }",
     *      "message": "Successfully login",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/auth/login
     * @apiErrorExample {json} Login error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/login')
    public async login(@Body({ validate: true }) loginParam: LoginRequest, @Res() response: any): Promise<any> {
        const user = await this.customerService.findOne({
            where: {
                email: loginParam.username,
                deleteFlag: 0,
            }, relations: ['customerGroup'],
        });
        if (user) {
            if (await User.comparePassword(user, loginParam.password)) {
                // create a token
                const token = jwt.sign({ id: user.id }, '123##$$)(***&');
                if (user.customerGroup.isActive === 0) {
                    const errorResponse: any = {
                        status: 0,
                        message: 'InActive Role',
                    };
                    return response.status(400).send(errorResponse);
                }
                if (token) {
                    const newToken = new AccessToken();
                    newToken.userId = user.id;
                    newToken.token = token;
                    await this.accessTokenService.create(newToken);
                }
                const successResponse: any = {
                    status: 1,
                    message: 'Loggedin successful',
                    data: {
                        token,
                        user: classToPlain(user),
                    },
                };
                return response.status(200).send(successResponse);
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid password',
                };
                return response.status(400).send(errorResponse);
            }
        } else {

            const errorResponse: any = {
                status: 0,
                message: 'Invalid username',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Create Customer API
    /**
     * @api {post} /api/customer/add-customer Add Customer API
     * @apiGroup Customer
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} customerGroupId Customer customerGroupId
     * @apiParam (Request body) {String} username Customer username
     * @apiParam (Request body) {String} email Customer email
     * @apiParam (Request body) {Number} mobileNumber Customer mobileNumber
     * @apiParam (Request body) {String} password Customer password
     * @apiParam (Request body) {String} confirmPassword Customer confirmPassword
     * @apiParam (Request body) {String} avatar Customer avatar
     * @apiParam (Request body) {Number} mailStatus Customer mailStatus should be 1 or 0
     * @apiParam (Request body) {Number} status Customer status
     * @apiParamExample {json} Input
     * {
     *      "customerGroupId" : "",
     *      "userName" : "",
     *      "email" : "",
     *      "mobileNumber" : "",
     *      "password" : "",
     *      "confirmPassword" : "",
     *      "avatar" : "",
     *      "mailStatus" : "",
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Customer Created successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/add-customer
     * @apiErrorExample {json} Customer error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-customer')
    @Authorized()
    public async addCustomer(@Body({ validate: true }) customerParam: CreateCustomer, @Res() response: any): Promise<any> {

        const avatar = customerParam.avatar;
        const newCustomer: any = new Customer();
        const resultUser = await this.customerService.findOne({ where: { email: customerParam.email, deleteFlag: 0 } });
        if (resultUser) {
            const errorResponse: any = {
                status: 1,
                message: 'Already registered with this emailId.',
            };
            return response.status(400).send(errorResponse);
        }
        if (avatar) {
            const type = avatar.split(';')[0].split('/')[1];
            const name = 'Img_' + Date.now() + '.' + type;
            const s3 = new AWS.S3();
            const path = 'customer/';
            const base64Data = new Buffer(avatar.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            const params = {
                Bucket: aws_setup.AWS_BUCKET,
                Key: 'customer/' + name,
                Body: base64Data,
                ACL: 'public-read',
                ContentEncoding: 'base64',
                ContentType: `image/${type}`,
            };
            newCustomer.avatar = name;
            newCustomer.avatarPath = path;
            s3.upload(params, (err, data) => {
                if (err) {
                    return err;
                }
            });
        }
        if (customerParam.password === customerParam.confirmPassword) {
            const password = await User.hashPassword(customerParam.password);
            newCustomer.customerGroupId = customerParam.customerGroupId;
            newCustomer.firstName = customerParam.username;
            newCustomer.username = customerParam.email;
            newCustomer.email = customerParam.email;
            newCustomer.mobileNumber = customerParam.mobileNumber;
            newCustomer.password = password;
            newCustomer.mailStatus = customerParam.mailStatus;
            newCustomer.deleteFlag = 0;
            newCustomer.isActive = customerParam.status;

            const customerSave = await this.customerService.create(newCustomer);

            if (customerSave) {
                if (customerParam.mailStatus === 1) {
                    const emailContent = await this.emailTemplateService.findOne(4);
                    if (!emailContent) {
                        const errorResponse: any = {
                            status: 1,
                            message: 'Email Content not Found',
                        };
                        return response.status(400).send(errorResponse);
                    }
                    const message = emailContent.content.replace('{name}', customerParam.username).replace('{username}', customerParam.email).replace('{password}', customerParam.password);
                    MAILService.customerLoginMail(message, customerParam.email, emailContent.subject);
                    const successResponse: any = {
                        status: 1,
                        message: 'Successfully created new Customer with user name and password and send an email. ',
                        data: customerSave,
                    };
                    return response.status(200).send(successResponse);
                } else {
                    const successResponse: any = {
                        status: 1,
                        message: 'Customer Created Successfully',
                        data: customerSave,
                    };
                    return response.status(200).send(successResponse);
                }
            }
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Password does not match.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Customer List API
    /**
     * @api {get} /api/customer/customerlist Customer List API
     * @apiGroup Customer
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} searchAll search globally by firstname, lastname or email
     * @apiParam (Request body) {String} name search by name
     * @apiParam (Request body) {String} email search bu email
     * @apiParam (Request body) {Number} status 0->inactive 1-> active
     * @apiParam (Request body) {String} customerGroup search by customerGroup
     * @apiParam (Request body) {String} date search by date
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get customer list",
     *      "data":[{
     *      "createdBy": null,
     *      "createdDate": "2021-03-25T17:11:12.000Z",
     *      "modifiedBy": null,
     *      "modifiedDate": "2021-03-25T17:16:01.000Z",
     *      "id": 515775,
     *      "userCid": "cf383940-8d5a-11eb-8186-bf8e00d4c44e",
     *      "fbUid": null,
     *      "fbEmail": null,
     *      "googleUid": null,
     *      "googleEmail": null,
     *      "firstName": "Yustina",
     *      "lastName": "Mardianti",
     *      "salutation": null,
     *      "password": "$2y$10$Ffm.FVRCpgGWwV40goNh2OvFCaM/hdANa1bLcnGiMjGX1b0huQlni",
     *      "email": "julaehadede@gmail.com",
     *      "mobileNumber": "85711310834",
     *      "address": "Jalan Majalaya Rancaekek, Kp Solokan Garut Rt 04 Rw 06, Desa/Kec. Solokanjeruk ( KONTER AHR CELL)",
     *      "rememberToken": null,
     *      "province": "JAWA BARAT",
     *      "district": "BDO10130||Solokan Jeruk",
     *      "postalCode": "40376",
     *      "dob": null,
     *      "country": "INDONESIA",
     *      "company": null,
     *      "member_level": null,
     *      "points": null,
     *      "credit": 0,
     *      "otpAt": "2021-03-25T17:11:54.000Z",
     *      "unbannedUntil": null,
     *      "countryId": null,
     *      "isSubscribe": null,
     *      "isBanned": null,
     *      "zoneId": null,
     *      "city": "1||BDO10100||Kab. Bandung",
     *      "local": null,
     *      "oauthData": null,
     *      "avatar": null,
     *      "newsletter": null,
     *      "avatarPath": null,
     *      "customerGroupId": 1,
     *      "lastLogin": null,
     *      "safe": null,
     *      "ip": null,
     *      "mailStatus": null,
     *      "pincode": null,
     *      "deleteFlag": 0,
     *      "isActive": 1,
     *      "customerGroupName": "default"
     *      }]
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/customerlist
     * @apiErrorExample {json} customer error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/customerlist')
    @Authorized()
    public async customerList(
        @QueryParam('limit') limit: number,
        @QueryParam('offset') offset: number,
        @QueryParam('name') name: string,
        @QueryParam('status') status: string,
        @QueryParam('email') email: string,
        @QueryParam('searchAll') searchAll: string,
        @QueryParam('customerGroup') customerGroup: string,
        @QueryParam('date') date: string,
        @QueryParam('count') count: number | boolean,
        @Res() response: any
    ): Promise<any> {
        const search = [
            ...!!searchAll ? [{
                name: 'global',
                value: searchAll,
            }] : [],
            ...!!name ? [{
                name: 'firstName',
                op: 'like',
                value: name,
            }] : [],
            ...!!email ? [{
                name: 'email',
                op: 'like',
                value: email,
            }] : [],
            // {
            //     name: 'createdDate',
            //     op: 'like',
            //     value: date,
            // },
            {
                name: 'customerGroupId',
                op: 'where',
                value: customerGroup,
            },
            {
                name: 'isActive',
                op: 'where',
                value: status,
            },
        ];
        const whereConditions = [
            {
                name: 'deleteFlag',
                value: 0,
            },
        ];
        const customerList = await this.customerService.list(limit, offset, search, whereConditions, 0, count);
        if (count) {
            const successRes: any = {
                status: 1,
                message: 'Successfully got count ',
                data: customerList,
            };
            return response.status(200).send(successRes);
        }
        const data: any = customerList.map(async (value: any) => {
            const temp: any = value;
            if (value.customerGroupId !== null) {
                const customerGrp = await this.customerGroupService.findOne({ groupId: value.customerGroupId });
                if (customerGrp) {
                    temp.customerGroupName = customerGrp.name;
                } else {
                    temp.customerGroupName = '';
                }
            } else {
                temp.customerGroupName = '';
            }
            return temp;
        });
        const customers = await Promise.all(data);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got Customer list.',
            data: customers,
        };
        return response.status(200).send(successResponse);
    }

    // Delete Customer API
    /**
     * @api {delete} /api/customer/delete-customer/:id Delete Customer API
     * @apiGroup Customer
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "customerId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted customer.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/delete-customer/:id
     * @apiErrorExample {json} Customer error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-customer/:id')
    @Authorized()
    public async deleteCustomer(@Param('id') id: number, @Res() response: any, @Req() request: any): Promise<any> {

        const customer = await this.customerService.findOne({
            where: {
                id,
            },
        });
        if (!customer) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid customerId',
            };
            return response.status(400).send(errorResponse);
        }
        customer.deleteFlag = 1;
        const deleteCustomer = await this.customerService.create(customer);
        if (deleteCustomer) {
            const successResponse: any = {
                status: 1,
                message: 'Customer Deleted Successfully',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to change delete flag status',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Update Customer API
    /**
     * @api {put} /api/customer/update-customer/:id Update Customer API
     * @apiGroup Customer
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} customerGroupId Customer customerGroupId
     * @apiParam (Request body) {String} username Customer username
     * @apiParam (Request body) {String} email Customer email
     * @apiParam (Request body) {Number} mobileNumber Customer mobileNumber
     * @apiParam (Request body) {String} password Customer password
     * @apiParam (Request body) {String} confirmPassword Customer confirmPassword
     * @apiParam (Request body) {String} avatar Customer avatar
     * @apiParam (Request body) {Number} mailStatus Customer mailStatus should be 1 or 0
     * @apiParam (Request body) {Number} status Customer status
     * @apiParamExample {json} Input
     * {
     *      "customerGroupId" : "",
     *      "userName" : "",
     *      "email" : "",
     *      "mobileNumber" : "",
     *      "password" : "",
     *      "confirmPassword" : "",
     *      "avatar" : "",
     *      "mailStatus" : "",
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": " Customer is updated successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/update-customer/:id
     * @apiErrorExample {json} updateCustomer error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-customer/:id')
    @Authorized()
    public async updateCustomer(@Param('id') id: number, @Body({ validate: true }) customerParam: UpdateCustomer, @Res() response: any): Promise<any> {
        const customer = await this.customerService.findOne({
            where: {
                id,
            },
        });
        if (!customer) {
            const errorResponse: any = {
                status: 0,
                message: 'invalid customer id',
            };
            return response.status(400).send(errorResponse);
        }
        if (customerParam.password === customerParam.confirmPassword) {

            const avatar = customerParam.avatar;
            if (avatar) {
                const type = avatar.split(';')[0].split('/')[1];
                const name = 'Img_' + Date.now() + '.' + type;
                const s3 = new AWS.S3();
                const path = 'customer/';
                const base64Data = new Buffer(avatar.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                const params = {
                    Bucket: aws_setup.AWS_BUCKET,
                    Key: 'customer/' + name,
                    Body: base64Data,
                    ACL: 'public-read',
                    ContentEncoding: 'base64',
                    ContentType: `image/${type}`,
                };
                s3.upload(params, (err, data) => {
                    if (err) {
                        return err;
                    }
                });
                customer.avatar = name;
                customer.avatarPath = path;
            }
            customer.customerGroupId = customerParam.customerGroupId;
            customer.firstName = customerParam.username;
            customer.username = customerParam.email;
            customer.email = customerParam.email;
            customer.mobileNumber = customerParam.mobileNumber;
            if (customerParam.password) {
                const password = await User.hashPassword(customerParam.password);
                customer.password = password;
            }
            customer.mailStatus = customerParam.mailStatus;
            customer.isActive = customerParam.status;
            const customerSave = await this.customerService.create(customer);
            if (customerSave) {
                const successResponse: any = {
                    status: 1,
                    message: 'Customer Updated Successfully',
                    data: customerSave,
                };
                return response.status(200).send(successResponse);

            }
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Password does not match.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Get Customer Detail API
    /**
     * @api {get} /api/customer/customer-details/:id Customer Details API
     * @apiGroup Customer
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully get customer Details",
     * "data":{
     * "customerGroupId" : "",
     * "username" : "",
     * "email" : "",
     * "mobileNumber" : "",
     * "password" : "",
     * "avatar" : "",
     * "avatarPath" : "",
     * "newsletter" : "",
     * "status" : "",
     * "safe" : "",
     * }
     * "status": "1"
     * }
     * @apiSampleRequest /api/customer/customer-details/:id
     * @apiErrorExample {json} customer error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/customer-details/:id')
    @Authorized()
    public async customerDetails(@Param('id') Id: number, @Res() response: any): Promise<any> {
        const customer = await this.customerService.findOne({
            where: { id: Id },
        });
        if (!customer) {
            const errorResponse: any = {
                status: 0,
                message: 'invalid CustomerId',
            };
            return response.status(400).send(errorResponse);
        }

        const order = await this.orderService.find({ where: { customerId: Id } });
        const productLists = await order.map(async (result: any) => {
            const product = await this.orderProductService.find({
                where: { orderId: result.orderId },
                select: ['productId', 'orderId', 'name', 'model', 'total', 'createdDate'],
            });
            const productPromises = await product.map(async (value: any) => {
                const productsDetails: any = value;
                const products = await this.productService.find({ where: { productId: value.productId } });

                const productImages = await products.map(async (values: any) => {
                    const productImagesResult: any = values;
                    const Image = await this.productImageService.findOne({
                        select: ['productId', 'productImageId', 'image', 'containerName', 'defaultImage'],
                        where: { productId: values.productId, defaultImage: 1 },
                    });
                    productImagesResult.productImages = Image ? Image : '';
                    return productImagesResult;
                });
                const images = await Promise.all(productImages);
                productsDetails.productDetails = images;
                return productsDetails;
            });
            const productsListWithImages = await Promise.all(productPromises);
            const temp: any = await productsListWithImages;
            return temp;
        });

        const finalResult = await Promise.all(productLists);
        customer.productList = finalResult;
        customer.orderList = order;
        if (finalResult) {
            const successResponse: any = {
                status: 1,
                message: 'successfully got Customer details. ',
                data: customer,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to get customer Details',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Recently Added Customer List API
    /**
     * @api {get} /api/customer/recent-customerlist Recent Customer List API
     * @apiGroup Customer
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get customer list",
     *      "data":{
     *      "location" : "",
     *      "name" : "",
     *      "created date" : "",
     *      "isActive" : "",
     *      }
     * }
     * @apiSampleRequest /api/customer/recent-customerlist
     * @apiErrorExample {json} customer error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/recent-customerlist')
    @Authorized()
    public async recentCustomerList(@Res() response: any): Promise<any> {
        const order = 1;
        const whereConditions = [
            {
                name: 'deleteFlag',
                value: 0,
            },
        ];
        const customerList = await this.customerService.list(0, 0, 0, whereConditions, order, 0);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got Customer list.',
            data: classToPlain(customerList),
        };

        return response.status(200).send(successResponse);
    }

    //  Today Customer Count API
    /**
     * @api {get} /api/customer/today-customercount Today Customer Count API
     * @apiGroup Customer
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Today customer count",
     *      "data":{
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/customer/today-customercount
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/today-customercount')
    @Authorized()
    public async customerCount(@Res() response: any): Promise<any> {

        const nowDate = new Date();
        const todayDate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
        const customerCount = await this.customerService.todayCustomerCount(todayDate);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get customerCount',
            data: customerCount,
        };
        return response.status(200).send(successResponse);

    }

    // Delete Multiple Customer API
    /**
     * @api {post} /api/product/delete-customer Delete Multiple Customer API
     * @apiGroup Customer
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} customerId customerId
     * @apiParamExample {json} Input
     * {
     * "customerId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted customer.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/customer/delete-customer
     * @apiErrorExample {json} customerDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/delete-customer')
    @Authorized()
    public async deleteMultipleCustomer(@Body({ validate: true }) deleteCustomerId: DeleteCustomerRequest, @Res() response: any, @Req() request: any): Promise<any> {
        const customers = deleteCustomerId.customerId.toString();
        const customer: any = customers.split(',');
        const data: any = customer.map(async (id: any) => {
            const dataId = await this.customerService.findOne(id);
            if (dataId === undefined) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Please choose customer for delete',
                };
                return response.status(400).send(errorResponse);
            } else {
                dataId.deleteFlag = 1;
                return await this.customerService.create(dataId);
            }
        });
        const deleteCustomer = await Promise.all(data);
        if (deleteCustomer) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted customer',
            };
            return response.status(200).send(successResponse);
        }
    }

    // Customer Details Excel Document Download
    /**
     * @api {get} /api/customer/customer-excel-list Customer Excel
     * @apiGroup Customer
     * @apiParam (Request body) {String} customerId customerId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully download the Customer Excel List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/customer/customer-excel-list
     * @apiErrorExample {json} Customer Excel List error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/customer-excel-list')
    public async excelCustomerView(@QueryParam('customerId') customerId: string, @Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workBook = new excel.Workbook();
        const workSheet = workBook.addWorksheet('Order Detail Sheet');
        const rows = [];
        const customerid = customerId.split(',');
        for (const id of customerid) {
            const dataId = await this.customerService.findOne(id);
            if (dataId === undefined) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid customerId',
                };
                return response.status(400).send(errorResponse);
            }
        }
        // Excel sheet column define
        workSheet.columns = [
            { header: 'ID', key: 'id', size: 16, width: 15 },
            { header: 'Customer Name', key: 'first_name', size: 16, width: 15 },
            { header: 'Mobile', key: 'mobileNumber', size: 16, width: 15 },
            { header: 'Email', key: 'email', size: 16, width: 15 },
            { header: 'Address', key: 'address', size: 16, width: 24 },
            { header: 'Country', key: 'country', size: 16, width: 10 },
            { header: 'Province', key: 'province', size: 16, width: 15 },
            { header: 'City', key: 'city', size: 16, width: 15 },
            { header: 'District', key: 'district', size: 16, width: 15 },
            { header: 'Postal Code', key: 'postal', size: 16, width: 15 },
            { header: 'Status', key: 'status', size: 16, width: 15 },
            { header: 'Points', key: 'points', size: 16, width: 15 },
            { header: 'Created At', key: 'createdDate', size: 16, width: 15 },
        ];
        const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1', 'M1'];

        headerCells.forEach(cell => {
            workSheet.getCell(cell).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            workSheet.getCell(cell).fill = {
                type: 'pattern',
                pattern: 'darkTrellis',
                fgColor: { argb: 'FFFF00' },
                bgColor: { argb: 'FFFF00' },
            };
        });

        for (const id of customerid) {
            const dataId = await this.customerService.findOne(id);
            if (dataId.lastName === null) {
                dataId.lastName = '';
            }
            rows.push([
                dataId.id,
                dataId.firstName + ' ' + dataId.lastName,
                dataId.mobileNumber,
                dataId.email,
                dataId.address,
                dataId.country,
                dataId.province,
                dataId.city,
                dataId.district,
                dataId.postalCode,
                dataId.isActive ? 'Active' : 'Non Active',
                dataId.points,
                dataId.createdDate,
            ]);
        }
        // Add all rows data in sheet
        workSheet.addRows(rows);

        if (rows.length === 1) {
            // display customer order
        }

        const fileName = './Klamby_-_Customer_Sales_' + Date.now() + '.xlsx';
        await workBook.xlsx.writeFile(fileName);
        return new Promise((resolve, reject) => {
            response.download(fileName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    fs.unlinkSync(fileName);
                    return response.end();
                }
            });
        });
    }
}
