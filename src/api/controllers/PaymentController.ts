/*
 * spurtcommerce marketplace API
 * version 4.0
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { Get, QueryParam, JsonController, Authorized, Res } from 'routing-controllers';
import { PaymentService } from '../services/PaymentService';
import { PaymentItemsService } from '../services/PaymentItemsService';
import * as fs from 'fs';

@JsonController('/payment')
export class PaymentController {
    constructor(private paymentService: PaymentService,
                private paymentItemsService: PaymentItemsService
    ) {
    }

    // Payment List API
    /**
     * @api {get} /api/payment/payment-list Payment List API
     * @apiGroup Payment
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} customerName search by customerName
     * @apiParam (Request body) {String} startDate search by startDate
     * @apiParam (Request body) {String} endDate search by endDate
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get payment list",
     *      "data":{
     *      "orderId" : "",
     *      "orderStatusId" : "",
     *      "customerName" : "",
     *      "totalAmount" : "",
     *      "dateModified" : "",
     *      "status" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/payment/payment-list
     * @apiErrorExample {json} payment error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/payment-list')
    @Authorized()
    public async paymentList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('customerName') customerName: string,
                             @QueryParam('startDate') startDate: string, @QueryParam('endDate') endDate: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {

        const select = [
            'Payment.paymentId as paymentId',
            'orderDetail.orderId as orderId',
            'orderDetail.orderStatusId as orderStatusId',
            'orderDetail.orderPrefixId as orderPrefixId',
            'orderDetail.currencySymbolLeft as currencySymbolLeft',
            'orderDetail.currencySymbolRight as currencySymbolRight',
            'orderDetail.shippingFirstname as shippingFirstname',
            'orderDetail.total as total',
            'orderDetail.createdDate as createdDate',
            'orderDetail.paymentType as paymentType',
            'orderDetail.paymentDetails as paymentDetails',
            'orderDetail.customerId as customerId',
            'orderDetail.isActive as isActive'];

        const relations = [
            {
                tableName: 'Payment.orderDetail',
                aliasName: 'orderDetail',
            },
        ];
        const groupBy = [];

        const whereConditions = [];

        if (startDate && startDate !== '') {

            whereConditions.push({
                name: '`Payment`.`created_date`',
                op: 'raw',
                sign: '>=',
                value: startDate + ' 00:00:00',
            });

        }

        if (endDate && endDate !== '') {

            whereConditions.push({
                name: '`Payment`.`created_date`',
                op: 'raw',
                sign: '<=',
                value: endDate + ' 23:59:59',
            });

        }

        const searchConditions = [];
        if (customerName && customerName !== '') {
            searchConditions.push({
                name: ['orderDetail.shippingFirstname'],
                value: customerName.toLowerCase(),
            });
        }

        const sort = [];
        sort.push({
            name: 'Payment.createdDate',
            order: 'DESC',
        });

        const paymentList: any = await this.paymentService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        const paymentResponse = paymentList.map(async (value: any) => {
            const payment = value;
            const subOrderSelect = [
                'orderProduct.orderProductId as orderProductId',
                'orderProduct.orderProductPrefixId as orderProductPrefixId',
                'orderProduct.productId as productId',
                'orderProduct.orderId as orderId',
                'orderProduct.quantity as quantity',
                'orderProduct.name as name',
                'orderProduct.productPrice as price',
                'orderProduct.total as total',
            ];

            const subOrderRelations = [
                {
                    tableName: 'PaymentItems.orderProduct',
                    aliasName: 'orderProduct',
                },
            ];
            const subOrderWhereConditions = [
                {
                    name: 'orderProduct.order_id',
                    op: 'where',
                    value: value.orderId,
                },
            ];
            const paymentItemsList: any = await this.paymentItemsService.listByQueryBuilder(0, 0, subOrderSelect, subOrderWhereConditions, [], subOrderRelations, [], [], false, true);
            payment.subOrderDetails = paymentItemsList;
            return payment;
        });
        const paymentListDetails = await Promise.all(paymentResponse);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete payment list.',
            data: paymentListDetails,
        };
        return response.status(200).send(successResponse);
    }
    // Payment List Count API
    /**
     * @api {get} /api/payment/payment-list-count Payment List Count API
     * @apiGroup Payment
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} customerName search by customerName
     * @apiParam (Request body) {String} startDate search by startDate
     * @apiParam (Request body) {String} endDate search by endDate
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get payment list",
     *      "data":{
     *      "orderId" : "",
     *      "orderStatusId" : "",
     *      "customerName" : "",
     *      "totalAmount" : "",
     *      "dateModified" : "",
     *      "status" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/payment/payment-list-count
     * @apiErrorExample {json} payment error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/payment-list-count')
    @Authorized()
    public async paymentListCount(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('customerName') customerName: string,
                                  @QueryParam('startDate') startDate: string, @QueryParam('endDate') endDate: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {

        const select = [
            'Payment.paymentId as paymentId',
            'orderDetail.orderId as orderId',
            'orderDetail.orderStatusId as orderStatusId',
            'orderDetail.orderPrefixId as orderPrefixId',
            'orderDetail.currencySymbolLeft as currencySymbolLeft',
            'orderDetail.currencySymbolRight as currencySymbolRight',
            'orderDetail.shippingFirstname as shippingFirstname',
            'orderDetail.total as total',
            'orderDetail.createdDate as createdDate',
            'orderDetail.paymentType as paymentType',
            'orderDetail.paymentDetails as paymentDetails',
            'orderDetail.customerId as customerId',
            'orderDetail.isActive as isActive'];

        const relations = [
            {
                tableName: 'Payment.orderDetail',
                aliasName: 'orderDetail',
            },
        ];
        const groupBy = [
            // {
            //     name: 'Payment.order_id',
            // },
        ];

        const whereConditions = [];

        // whereConditions.push({
        //     name: 'orderDetail.payment_flag',
        //     op: 'and',
        //     value: 1,
        // });

        if (startDate && startDate !== '') {

            whereConditions.push({
                name: '`Payment`.`created_date`',
                op: 'raw',
                sign: '>=',
                value: startDate + ' 00:00:00',
            });

        }

        if (endDate && endDate !== '') {

            whereConditions.push({
                name: '`Payment`.`created_date`',
                op: 'raw',
                sign: '<=',
                value: endDate + ' 23:59:59',
            });

        }

        const searchConditions = [];
        if (customerName && customerName !== '') {
            searchConditions.push({
                name: ['orderDetail.shippingFirstname'],
                value: customerName.toLowerCase(),
            });
        }
        const paymentList: any = await this.paymentService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, [], true, true);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the payment list count.',
            data: paymentList,
        };
        return response.status(200).send(successResponse);
    }

    // Export Payment List API
    /**
     * @api {get} /api/payment/export-payment-list Export Payment List API
     * @apiGroup Payment
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} paymentId paymentId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get payment list",
     *      "data":{
     *      "orderId" : "",
     *      "orderStatusId" : "",
     *      "customerName" : "",
     *      "totalAmount" : "",
     *      "dateModified" : "",
     *      "status" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/payment/export-payment-list
     * @apiErrorExample {json} payment error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/export-payment-list')
    @Authorized()
    public async exportPaymentList(@QueryParam('paymentId') paymentId: string, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workBook = new excel.Workbook();
        const workSheet = workBook.addWorksheet('payment Excel Sheet');
        const rows = [];
        const paymentid = paymentId.split(',');
        for (const id of paymentid) {
            const dataId = await this.paymentService.findOne({ where: { paymentId: id } });
            if (!dataId) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid paymentId',
                };
                return response.status(400).send(errorResponse);
            }
        }
        // Excel sheet column define
        workSheet.columns = [
            { header: 'Order Id', key: 'orderPrefixId', size: 16, width: 15 },
            { header: 'Customer Name', key: 'shippingFirstname', size: 16, width: 15 },
            { header: 'Email', key: 'email', size: 16, width: 15 },
            { header: 'Total Amount', key: 'total', size: 16, width: 15 },
            { header: 'Payment Date', key: 'paymentDate', size: 16, width: 15 },
            { header: 'Payment Method', key: 'paymentMethod', size: 16, width: 15 },
            { header: 'Payment Detail', key: 'paymentDetail', size: 16, width: 15 },
        ];
        workSheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (const id of paymentid) {
            const select = [
                'Payment.paymentId as paymentId',
                'orderDetail.orderId as orderId',
                'orderDetail.orderPrefixId as orderPrefixId',
                'orderDetail.currencySymbolLeft as currencySymbolLeft',
                'orderDetail.currencySymbolRight as currencySymbolRight',
                'orderDetail.shippingFirstname as shippingFirstname',
                'orderDetail.email as email',
                'orderDetail.total as total',
                'orderDetail.createdDate as createdDate',
                'orderDetail.paymentType as paymentType',
                'orderDetail.paymentDetails as paymentDetails',
                'orderDetail.customerId as customerId',
                'orderDetail.isActive as isActive'];

            const relations = [
                {
                    tableName: 'Payment.orderDetail',
                    aliasName: 'orderDetail',
                },
            ];
            const groupBy = [];

            const whereConditions = [];

            whereConditions.push({
                name: 'Payment.paymentId',
                op: 'and',
                value: id,
            });

            const searchConditions = [];
            const sort = [];
            sort.push({
                name: 'Payment.createdDate',
                order: 'DESC',
            });

            const paymentList: any = await this.paymentService.listByQueryBuilder(0, 0, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
            rows.push([paymentList[0].orderPrefixId, paymentList[0].shippingFirstname, paymentList[0].email, paymentList[0].total, paymentList[0].createdDate, paymentList[0].paymentType, paymentList[0].paymentDetails]);
        }

        // Add all rows data in sheet
        workSheet.addRows(rows);
        const fileName = './PaymentExcel_' + Date.now() + '.xlsx';
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

    // Bulk Export Payment List API
    /**
     * @api {get} /api/payment/bulk-export-payment-list Bulk Export Payment List API
     * @apiGroup Payment
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get payment list",
     *      "data":{
     *      "orderId" : "",
     *      "orderStatusId" : "",
     *      "customerName" : "",
     *      "totalAmount" : "",
     *      "dateModified" : "",
     *      "status" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/payment/bulk-export-payment-list
     * @apiErrorExample {json} payment error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/bulk-export-payment-list')
    public async bulkExportPaymentList(@Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workBook = new excel.Workbook();
        const workSheet = workBook.addWorksheet('payment Excel Sheet');
        const rows = [];
        const dataId = await this.paymentService.findData();
        if (dataId.length < 0) {
            const errorResponse: any = {
                status: 0,
                message: 'list is empty',
            };
            return response.status(400).send(errorResponse);
        }
        // Excel sheet column define
        workSheet.columns = [
            { header: 'Order Id', key: 'orderPrefixId', size: 16, width: 15 },
            { header: 'Customer Name', key: 'shippingFirstname', size: 16, width: 15 },
            { header: 'Email', key: 'email', size: 16, width: 15 },
            { header: 'Total Amount', key: 'total', size: 16, width: 15 },
            { header: 'Payment Date', key: 'paymentDate', size: 16, width: 15 },
            { header: 'Payment Method', key: 'paymentMethod', size: 16, width: 15 },
            { header: 'Payment Detail', key: 'paymentDetail', size: 16, width: 15 },
        ];
        workSheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        workSheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (const id of dataId) {
            const select = [
                'Payment.paymentId as paymentId',
                'orderDetail.orderId as orderId',
                'orderDetail.orderPrefixId as orderPrefixId',
                'orderDetail.currencySymbolLeft as currencySymbolLeft',
                'orderDetail.currencySymbolRight as currencySymbolRight',
                'orderDetail.shippingFirstname as shippingFirstname',
                'orderDetail.email as email',
                'orderDetail.total as total',
                'orderDetail.createdDate as createdDate',
                'orderDetail.paymentType as paymentType',
                'orderDetail.paymentDetails as paymentDetails',
                'orderDetail.customerId as customerId',
                'orderDetail.isActive as isActive'];

            const relations = [
                {
                    tableName: 'Payment.orderDetail',
                    aliasName: 'orderDetail',
                },
            ];
            const groupBy = [];

            const whereConditions = [];

            whereConditions.push({
                name: 'Payment.paymentId',
                op: 'and',
                value: id.paymentId,
            });

            const searchConditions = [];
            const sort = [];
            sort.push({
                name: 'orderDetail.createdDate',
                order: 'DESC',
            });

            const paymentList: any = await this.paymentService.listByQueryBuilder(0, 0, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
            rows.push([paymentList[0].orderPrefixId, paymentList[0].shippingFirstname, paymentList[0].email, paymentList[0].total, paymentList[0].createdDate, paymentList[0].paymentType, paymentList[0].paymentDetails]);
        }

        // Add all rows data in sheet
        workSheet.addRows(rows);
        const fileName = './BulkPaymentExcel_' + Date.now() + '.xlsx';
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
