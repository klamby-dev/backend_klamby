/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { Get, JsonController, Authorized, QueryParam, Res, Req, Post, Body, Delete, Param, BodyParam } from 'routing-controllers';
import { OrderService } from '../services/OrderService';
import { UpdateOrderChangeStatus } from './requests/UpdateOrderChangeStatus';
import { DeleteOrderRequest } from './requests/DeleteOrderRequest';
import { OrderLogService } from '../services/OrderLogService';
import { OrderProductService } from '../services/OrderProductService';
import { OrderStatusService } from '../services/OrderStatusService';
import { OrderOptionService } from '../services/OrderOptionService';
import { PaymentService } from '../services/PaymentService';
import { PaymentItemsService } from '../services/PaymentItemsService';
import * as fs from 'fs';
import moment from 'moment';
import { Payment } from '../models/Payment';
import { PaymentItems } from '../models/PaymentItems';
import { PDFService } from '../services/PdfService';
import { ToWords } from 'to-words';
import { SettingService } from '../services/SettingService';
import { CountryService } from '../services/CountryService';
import { ZoneService } from '../services/zoneService';

@JsonController('/order')
export class OrderController {
    constructor(private orderService: OrderService, private orderLogService: OrderLogService,
                private orderProductService: OrderProductService, private orderOptionService: OrderOptionService,
                private orderStatusService: OrderStatusService, private paymentService: PaymentService,
                private paymentItemsService: PaymentItemsService, private settingService: SettingService,
                private countryService: CountryService, private zoneService: ZoneService
    ) {
    }

    // order List API
    /**
     * @api {get} /api/order/orderlist Order List API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} orderId search by orderId
     * @apiParam (Request body) {String} orderStatusId search by orderStatusId
     * @apiParam (Request body) {String} customerName search by customerName
     * @apiParam (Request body) {Number} totalAmount search by totalAmount
     * @apiParam (Request body) {Number} dateAdded search by dateAdded
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get order list",
     *      "data":{
     *      "orderId" : "",
     *      "orderStatusId" : "",
     *      "customerName" : "",
     *      "totalAmount" : "",
     *      "dateAdded" : "",
     *      "dateModified" : "",
     *      "status" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/orderlist
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/orderlist')
    @Authorized()
    public async orderList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('orderId') orderId: string, @QueryParam('orderStatusId') orderStatusId: string, @QueryParam('customerName') customerName: string,
                           @QueryParam('totalAmount') totalAmount: string, @QueryParam('dateAdded') dateAdded: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['orderId', 'orderStatusId', 'orderPrefixId', 'shippingFirstname', 'total', 'createdDate', 'customerId', 'isActive', 'modifiedDate'];
        const search = [
            {
                name: 'orderPrefixId',
                op: 'like',
                value: orderId,
            },
            {
                name: 'orderStatusId',
                op: 'like',
                value: orderStatusId,
            },
            {
                name: 'shippingFirstname',
                op: 'like',
                value: customerName,
            },
            {
                name: 'total',
                op: 'like',
                value: totalAmount,
            },
            {
                name: 'createdDate',
                op: 'like',
                value: dateAdded,
            },

        ];
        const whereConditions = [];
        const orderList = await this.orderService.list(limit, offset, select, search, whereConditions, 0, count);
        if (count) {
            const Response: any = {
                status: 1,
                message: 'Successfully got count.',
                data: orderList,
            };
            return response.status(200).send(Response);
        }
        const orderStatus = orderList.map(async (value: any) => {
            const status = await this.orderStatusService.findOne({
                where: { orderStatusId: value.orderStatusId },
                select: ['orderStatusId', 'name', 'colorCode'],
            });
            const temp: any = value;
            temp.orderStatus = status ? status : '';
            return temp;

        });
        const results = await Promise.all(orderStatus);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete order list.',
            data: results,
        };
        return response.status(200).send(successResponse);
    }

    //  Order Detail API
    /**
     * @api {get} /api/order/order-detail  Order Detail API
     * @apiGroup Order
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
     * @apiSampleRequest /api/order/order-detail
     * @apiErrorExample {json} Order Detail error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order Detail Function
    @Get('/order-detail')
    @Authorized()
    public async orderDetail(@QueryParam('orderId') orderid: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderData = await this.orderService.findOrder({
            where: { orderId: orderid }, select: ['orderId', 'orderStatusId', 'customerId', 'telephone', 'invoiceNo', 'invoicePrefix', 'orderPrefixId', 'shippingFirstname', 'shippingLastname', 'shippingCompany', 'shippingAddress1',
                'shippingAddress2', 'shippingCity', 'email', 'shippingZone', 'shippingPostcode', 'shippingCountry', 'shippingAddressFormat',
                'paymentFirstname', 'paymentLastname', 'paymentCompany', 'paymentAddress1', 'paymentAddress2', 'paymentCity', 'paymentFlag', 'paymentStatus', 'paymentType', 'paymentDetails',
                'paymentPostcode', 'paymentCountry', 'paymentZone', 'paymentAddressFormat', 'total', 'customerId', 'createdDate'],
        });
        if (!orderData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid orderId',
            };
            return response.status(400).send(errorResponse);
        }
        orderData.productList = await this.orderProductService.find({ where: { orderId: orderid }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice'] }).then((val) => {
            const productVal = val.map(async (value: any) => {
                const orderOption = await this.orderOptionService.find({
                    where: { orderProductId: value.orderProductId },
                    select: ['name', 'value', 'type', 'orderOptionId', 'orderProductId'],
                });
                const tempVal: any = value;
                tempVal.orderOptions = orderOption;
                return tempVal;
            });
            const results = Promise.all(productVal);
            return results;
        });
        const orderStatusData = await this.orderStatusService.findOne({
            where: { orderStatusId: orderData.orderStatusId },
            select: ['name', 'colorCode'],
        });
        if (orderStatusData) {
            orderData.orderStatusName = orderStatusData.name;
            orderData.statusColorCode = orderStatusData.colorCode;
        } else {
            orderData.orderStatusName = '';
            orderData.statusColorCode = '';
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order Detail. ',
            data: orderData,
        };
        return response.status(200).send(successResponse);
    }

    //  Download Invoice API
    /**
     * @api {get} /api/order/invoice-download  Download Invoice API
     * @apiGroup Order
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
     * @apiSampleRequest /api/order/invoice-download
     * @apiErrorExample {json} Download Invoice APIl error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/invoice-download')
    @Authorized()
    public async invoice(@QueryParam('orderId') orderid: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderData = await this.orderService.findOrder({
            where: { orderId: orderid }, select: ['orderId', 'orderStatusId', 'customerId', 'telephone', 'invoiceNo', 'invoicePrefix', 'orderPrefixId', 'shippingFirstname', 'shippingLastname', 'shippingCompany', 'shippingAddress1',
                'shippingAddress2', 'shippingCity', 'email', 'shippingZone', 'shippingPostcode', 'shippingCountry', 'shippingAddressFormat',
                'paymentFirstname', 'paymentLastname', 'paymentCompany', 'paymentAddress1', 'paymentAddress2', 'paymentCity', 'paymentFlag', 'paymentStatus', 'paymentType', 'paymentDetails',
                'paymentPostcode', 'paymentCountry', 'paymentZone', 'paymentAddressFormat', 'total', 'customerId', 'createdDate'],
        });
        if (!orderData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid orderId',
            };
            return response.status(400).send(errorResponse);
        }
        orderData.setting = await this.settingService.findOne();
        orderData.country = await this.countryService.findOne({ where: { countryId: orderData.setting.countryId } });
        if (!orderData.country) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid countryId',
            };
            return response.status(400).send(errorResponse);
        }
        orderData.Zone = await this.zoneService.findOne({ where: { zoneId: orderData.setting.zoneId } });
        if (!orderData.Zone) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid ZoneId',
            };
            return response.status(400).send(errorResponse);
        }
        const cDate = new Date(orderData.createdDate);
        orderData.createdDate = moment(cDate).format('DD/MM/YYYY');
        const toWords = new ToWords();
        orderData.words = toWords.convert(orderData.total);
        orderData.productList = await this.orderProductService.find({ where: { orderId: orderid }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice'] });
        const productVal = orderData.productList.map(async (value: any) => {
            const orderOption = await this.orderOptionService.find({
                where: { orderProductId: value.orderProductId },
                select: ['name', 'value', 'type', 'orderOptionId', 'orderProductId'],
            });
            const tempVal: any = value;
            tempVal.orderOptions = orderOption;
            return tempVal;
        });
        const results = await Promise.all(productVal);
        const render = await PDFService.renderFile(orderData, results);
        const pdf = await PDFService.pdfFile(render);
        const successResponse: any = {
            status: 1,
            message: 'Successfully Create Pdf file. ',
            data: pdf,
        };
        return response.status(200).send(successResponse);
    }

    // sales List API
    /**
     * @api {get} /api/order/saleslist Sales List API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get sales count list",
     *      "data":{
     *      }
     * }
     * @apiSampleRequest /api/order/saleslist
     * @apiErrorExample {json} sales error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/saleslist')
    @Authorized()
    public async salesList(@Res() response: any): Promise<any> {

        const orderList = await this.orderService.salesList();
        const promises = orderList.map(async (result: any) => {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
            ];
            const temp: any = result;
            temp.monthYear = monthNames[result.month] + '-' + result.year;
            return temp;
        });
        const finalResult = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get sales count List',
            data: finalResult,
        };
        return response.status(200).send(successResponse);

    }

    // total order amount API
    /**
     * @api {get} /api/order/total-order-amount total Order Amount API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get total order amount",
     *      "data":{
     *      "count" : "",
     *      }
     * }
     * @apiSampleRequest /api/order/total-order-amount
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/total-order-amount')
    @Authorized()
    public async totalOrderAmount(@Res() response: any): Promise<any> {
        let total = 0;
        const order = await this.orderService.findAll();
        let n = 0;
        for (n; n < order.length; n++) {
            total += +order[n].total;
        }
        if (order) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully get total order Amount',
                data: total,
            };

            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to get total order amount',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // today order amount API
    /**
     * @api {get} /api/order/today-order-amount today Order Amount API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get today order amount",
     *      "data":{
     *      }
     * }
     * @apiSampleRequest /api/order/today-order-amount
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/today-order-amount')
    @Authorized()
    public async todayOrderAmount(@Res() response: any): Promise<any> {
        const nowDate = new Date();
        const todayDate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
        let total = 0;
        const order = await this.orderService.findAlltodayOrder(todayDate);
        let n = 0;
        for (n; n < order.length; n++) {
            total += +order[n].total;
        }
        if (order) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully get today order Amount',
                data: total,
            };

            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to get today order amount',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Today order count API
    /**
     * @api {get} /api/order/today-order-count Today OrderCount API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Today order count",
     *      "data":{
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/today-order-count
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/today-order-count')
    @Authorized()
    public async orderCount(@Res() response: any): Promise<any> {

        const nowDate = new Date();
        const todayDate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();

        const orderCount = await this.orderService.findAllTodayOrderCount(todayDate);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get Today order count',
            data: orderCount,
        };
        return response.status(200).send(successResponse);

    }

    // Change order Status API
    /**
     * @api {post} /api/order/order-change-status   Change Order Status API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId Order Id
     * @apiParam (Request body) {Number} orderStatusId order Status Id
     * @apiParamExample {json} Input
     * {
     *   "orderDetails" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated order change status.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/order-change-status
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/order-change-status')
    @Authorized()
    public async orderChangeStatus(@Body({ validate: true }) orderChangeStatus: UpdateOrderChangeStatus, @Res() response: any): Promise<any> {
        const updateOrder = await this.orderService.findOrder(orderChangeStatus.orderId);
        if (!updateOrder) {
            const errorResponse: any = {
                status: 0,
                message: 'invalid order Id',
            };
            return response.status(400).send(errorResponse);
        }

        await this.orderLogService.create(updateOrder);

        updateOrder.orderStatusId = orderChangeStatus.orderStatusId;

        const orderSave = await this.orderService.create(updateOrder);
        if (orderSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated Order Status',
                data: orderSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to updated OrderStatus',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Order Details Excel Document download
    /**
     * @api {get} /api/order/order-excel-list Order Excel
     * @apiGroup Order
     * @apiParam (Request body) {String} orderId orderId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully download the Order Excel List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/order/order-excel-list
     * @apiErrorExample {json} Order Excel List error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/order-excel-list')
    public async excelOrderView(@QueryParam('orderId') orderId: string, @Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workBook = new excel.Workbook();
        const workSheet = workBook.addWorksheet('Order Detail Sheet');
        const rows = [];
        const orderid = orderId.split(',');
        for (const id of orderid) {
            const dataId = await this.orderService.find({ where: { orderId: id } });
            if (dataId.length === 0) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid orderId',
                };
                return response.status(400).send(errorResponse);
            }
        }
        // Excel sheet column define
        workSheet.columns = [
            { header: 'Order Id', key: 'orderPrefixId', size: 16, width: 15 },
            { header: 'Customer Name', key: 'shippingFirstname', size: 16, width: 15 },
            { header: 'Email', key: 'email', size: 16, width: 15 },
            { header: 'Mobile Number', key: 'telephone', size: 16, width: 15 },
            { header: 'Total Amount', key: 'total', size: 16, width: 15 },
            { header: 'Created Date', key: 'createdDate', size: 16, width: 15 },
            { header: 'Updated Date', key: 'modifiedDate', size: 16, width: 15 },
        ];
        workSheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (const id of orderid) {
            const dataId = await this.orderService.findOrder(id);
            rows.push([dataId.orderPrefixId, dataId.shippingFirstname + ' ' + dataId.shippingLastname, dataId.email, dataId.telephone, dataId.total, dataId.createdDate, dataId.modifiedDate]);
        }
        // Add all rows data in sheet
        workSheet.addRows(rows);
        const fileName = './OrderExcel_' + Date.now() + '.xlsx';
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

    // Delete Order API
    /**
     * @api {delete} /api/order/delete-order/:id Delete Single Order API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted Order.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/order/delete-order/:id
     * @apiErrorExample {json} orderDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-order/:id')
    @Authorized()
    public async deleteOrder(@Param('id') orderid: number, @Res() response: any, @Req() request: any): Promise<any> {
        const orderData = await this.orderService.find({ where: { orderId: orderid } });
        if (orderData.length === 0) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid orderId',
            };
            return response.status(400).send(errorResponse);
        }
        const deleteOrder = await this.orderService.delete(orderid);
        if (deleteOrder) {
            const successResponse: any = {
                status: 1,
                message: 'Order Deleted Successfully',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to delete Order',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Delete Multiple Order API
    /**
     * @api {post} /api/order/delete-order Delete Order API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} orderId orderId
     * @apiParamExample {json} Input
     * {
     * "orderId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted Order.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/order/delete-order
     * @apiErrorExample {json} orderDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/delete-order')
    @Authorized()
    public async deleteMultipleOrder(@Body({ validate: true }) orderDelete: DeleteOrderRequest, @Res() response: any, @Req() request: any): Promise<any> {

        const orderIdNo = orderDelete.orderId.toString();
        const orderId = orderIdNo.split(',');
        for (const id of orderId) {
            const orderData = await this.orderService.find({ where: { orderId: id } });
            if (orderData.length === 0) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Please choose a order for delete',
                };
                return response.status(400).send(errorResponse);
            }
        }

        for (const id of orderId) {
            const deleteOrderId = parseInt(id, 10);
            await this.orderService.delete(deleteOrderId);
        }
        const successResponse: any = {
            status: 1,
            message: 'Order Deleted Successfully',
        };
        return response.status(200).send(successResponse);
    }

    //  update payment status API
    /**
     * @api {post} /api/order/update-payment-status   update payment Status API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId Order Id
     * @apiParam (Request body) {Number} paymentStatusId 1->paid 2->fail 3-> refund
     * @apiParamExample {json} Input
     * {
     *   "orderId" : "",
     *   "paymentStatusId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated payment status.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/update-payment-status
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/update-payment-status')
    @Authorized()
    public async updatePaymentStatus(@BodyParam('orderId') orderId: number, @BodyParam('paymentStatusId') paymentStatusId: number, @Res() response: any): Promise<any> {
        const updateOrder = await this.orderService.findOrder(orderId);
        if (!updateOrder) {
            const errorResponse: any = {
                status: 0,
                message: 'invalid order Id',
            };
            return response.status(400).send(errorResponse);
        }
        updateOrder.paymentStatus = paymentStatusId;
        updateOrder.paymentFlag = paymentStatusId;
        updateOrder.paymentType = 'Cash On Delivery';
        const orderSave = await this.orderService.create(updateOrder);
        const paymentParams = new Payment();
        paymentParams.orderId = updateOrder.orderId;
        const date = new Date();
        paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
        paymentParams.paymentAmount = updateOrder.total;
        const payments = await this.paymentService.create(paymentParams);
        let i;
        const orderProduct = await this.orderProductService.find({ where: { orderId: updateOrder.orderId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice'] });
        for (i = 0; i < orderProduct.length; i++) {
            const paymentItems = new PaymentItems();
            paymentItems.paymentId = payments.paymentId;
            paymentItems.orderProductId = orderProduct[i].orderProductId;
            paymentItems.totalAmount = orderProduct[i].total;
            paymentItems.productName = orderProduct[i].name;
            paymentItems.productQuantity = orderProduct[i].quantity;
            paymentItems.productPrice = orderProduct[i].productPrice;
            await this.paymentItemsService.create(paymentItems);
        }
        if (orderSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated Payment Status',
                data: orderSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to update Payment Status',
            };
            return response.status(400).send(errorResponse);
        }
    }

}
