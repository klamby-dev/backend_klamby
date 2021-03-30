/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { Get, JsonController, Res, Body, Post } from 'routing-controllers';
import { SettingService } from '../services/SettingService';
import { Settings } from '../models/Setting';
import { CreateSettingRequest } from './requests/CreateSettingRequest';
import { env } from '../../env';
import { S3Service } from '../services/S3Service';
import { ImageService } from '../services/ImageService';
import { CurrencyService } from '../services/CurrencyService';

@JsonController('/settings')
export class SettingController {
    constructor(private settingService: SettingService, private s3Service: S3Service, private currencyService: CurrencyService, private imageService: ImageService) {
    }

    // Get Settings list API
    /**
     * @api {get} /api/settings/get-settings Get Setting API
     * @apiGroup Settings
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get settings",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/settings/get-settings
     * @apiErrorExample {json} getSettings error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/get-settings')
    public async settingsList(@Res() response: any): Promise<any> {

        const select = '';
        const relation = [];
        const whereConditions = [];
        const limit = 1;

        const settings: any = await this.settingService.list(limit, select, relation, whereConditions);
        const promise = settings.map(async (result: any) => {
            const currencyData: any = await this.currencyService.findOne({ where: { currencyId: result.storeCurrencyId } });
            const temp: any = result;
            temp.currencyCode = currencyData ? currencyData.code : '';
            temp.symbolLeft = currencyData ? currencyData.symbolLeft : '';
            temp.symbolRight = currencyData ? currencyData.symbolRight : '';
            return temp;
        });
        const value = await Promise.all(promise);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get settings',
            data: value,
        };
        return response.status(200).send(successResponse);
    }

    // create and update settings API
    /**
     * @api {post} /api/settings/create-settings Create Settings API
     * @apiGroup Settings
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} url  store url
     * @apiParam (Request body) {String} metaTagTitle metaTagTitle
     * @apiParam (Request body) {String} metaTagDescription metaTagDescription
     * @apiParam (Request body) {String} metaTagKeywords metaTagKeywords
     * @apiParam (Request body) {String} storeName storeName
     * @apiParam (Request body) {String} storeOwner storeOwner
     * @apiParam (Request body) {String} storeAddress storeAddress
     * @apiParam (Request body) {Number} countryId countryId
     * @apiParam (Request body) {String} zoneId zoneId
     * @apiParam (Request body) {String} storeEmail storeEmail
     * @apiParam (Request body) {String} storeTelephone storeTelephone
     * @apiParam (Request body) {String} storeFax storeFax
     * @apiParam (Request body) {String} storeLogo storeLog
     * @apiParam (Request body) {Number} maintenanceMode maintenanceMode
     * @apiParam (Request body) {String} storeImage storeImage
     * @apiParam (Request body) {String} invoicePrefix invoicePrefix
     * @apiParam (Request body) {Number} orderStatus orderStatus
     * @apiParam (Request body) {String} storeLanguageName storeLanguageName
     * @apiParam (Request body) {Number} categoryProductCount productCount should be 0 or 1
     * @apiParam (Request body) {Number} itemsPerPage ItemsPerPage
     * @apiParam (Request body) {String} facebook facebook
     * @apiParam (Request body) {String} twitter twitter
     * @apiParam (Request body) {String} instagram instagram
     * @apiParam (Request body) {String} google google
     * @apiParam (Request body) {Number} status status
     * @apiParamExample {json} Input
     * {
     *      "url" : "",
     *      "metaTagTitle" : "",
     *      "metaTagDescription" : "",
     *      "metaTagKeywords" : "",
     *      "storeName" : "",
     *      "storeOwner" : "",
     *      "storeAddress" : "",
     *      "countryId" : "",
     *      "zoneId" : "",
     *      "storeEmail" : "",
     *      "storeTelephone" : "",
     *      "storeFax" : "",
     *      "storeLogo" : "",
     *      "maintenanceMode" : "",
     *      "storeImage" : "",
     *      "invoicePrefix" : "",
     *      "orderStatus" : "",
     *      "storeLanguageName": "",
     *      "categoryProductCount" : "",
     *      "itemsPerPage" : "",
     *      "google" : "",
     *      "instagram" : "",
     *      "facebook" : "",
     *      "twitter" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully created setting.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/settings/create-settings
     * @apiErrorExample {json} addSettings error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/create-settings')
    public async createSettings(@Body({ validate: true }) settings: CreateSettingRequest, @Res() response: any): Promise<any> {
        const settingValue: any = await this.settingService.findOne();
        if (settingValue === undefined) {
            const newSettings: any = new Settings();
            newSettings.url = settings.url;
            newSettings.metaTagTitle = settings.metaTagTitle;
            newSettings.metaTagDescription = settings.metaTagDescription;
            newSettings.metaTagKeyword = settings.metaTagKeywords;
            newSettings.storeName = settings.storeName;
            newSettings.storeOwner = settings.storeOwner;
            newSettings.storeAddress = settings.storeAddress;
            newSettings.countryId = settings.countryId;
            newSettings.zoneId = settings.zoneId;
            newSettings.storeEmail = settings.storeEmail;
            newSettings.storeTelephone = settings.storeTelephone;
            newSettings.storeFax = settings.storeFax;
            newSettings.storeLanguageName = settings.storeLanguageName;
            if (settings.storeLogo) {
                const logo = settings.storeLogo;
                const type = logo.split(';')[0].split('/')[1];
                const name = 'Img_' + Date.now() + '.' + type;
                const path = 'storeLogo/';
                const base64Data = new Buffer(logo.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                if (env.imageserver === 's3') {
                    await this.s3Service.imageUpload((path + name), base64Data, type);
                } else {
                    await this.imageService.imageUpload((path + name), base64Data);
                }

                newSettings.storeLogo = name;
                newSettings.storeLogoPath = path;
            }

            newSettings.maintainanceMode = settings.maintenanceMode;
            newSettings.storeImage = settings.storeImage;
            settingValue.invoicePrefix = settings.invoicePrefix;
            newSettings.storeCurrencyId = settings.storeCurrencyId;
            settingValue.orderStatus = settings.orderStatus;
            settingValue.categoryProductCount = settings.categoryProductCount;
            settingValue.itemsPerPage = settings.itemsPerPage;
            newSettings.google = settings.google;
            newSettings.facebook = settings.facebook;
            newSettings.twitter = settings.twitter;
            newSettings.instagram = settings.instagram;
            newSettings.isActive = settings.status;
            const createdData: any = await this.settingService.create(newSettings);
            const successResponse: any = {
                status: 1,
                message: 'Settings created Successfully',
                data: createdData,

            };
            return response.status(200).send(successResponse);
        } else {
            settingValue.url = settings.url;
            settingValue.metaTagTitle = settings.metaTagTitle;
            settingValue.metaTagDescription = settings.metaTagDescription;
            settingValue.metaTagKeyword = settings.metaTagKeywords;
            settingValue.storeName = settings.storeName;
            settingValue.storeOwner = settings.storeOwner;
            settingValue.storeAddress = settings.storeAddress;
            settingValue.countryId = settings.countryId;
            settingValue.zoneId = settings.zoneId;
            settingValue.storeEmail = settings.storeEmail;
            settingValue.storeTelephone = settings.storeTelephone;
            settingValue.storeFax = settings.storeFax;
            settingValue.storeLogo = settings.storeLogo;
            settingValue.storeLanguageName = settings.storeLanguageName;
            if (settings.storeLogo) {
                const logo = settings.storeLogo;
                const type = logo.split(';')[0].split('/')[1];
                const name = 'Img_' + Date.now() + '.' + type;
                const path = 'storeLogo/';
                const base64Data = new Buffer(logo.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                if (env.imageserver === 's3') {
                    await this.s3Service.imageUpload((path + name), base64Data, type);
                } else {
                    await this.imageService.imageUpload((path + name), base64Data);
                }

                settingValue.storeLogo = name;
                settingValue.storeLogoPath = path;
            }

            settingValue.maintenanceMode = settings.maintenanceMode;
            settingValue.storeImage = settings.storeImage;
            settingValue.invoicePrefix = settings.invoicePrefix;
            settingValue.orderStatus = settings.orderStatus;
            settingValue.storeCurrencyId = settings.storeCurrencyId;
            settingValue.categoryProductCount = settings.categoryProductCount;
            settingValue.itemsPerPage = settings.itemsPerPage;
            settingValue.google = settings.google;
            settingValue.facebook = settings.facebook;
            settingValue.twitter = settings.twitter;
            settingValue.instagram = settings.instagram;
            settingValue.isActive = settings.status;
            const updatedData: any = await this.settingService.create(settingValue);
            const successResponse: any = {
                status: 1,
                message: 'Settings Updated Successfully',
                data: updatedData,

            };
            return response.status(200).send(successResponse);
        }
    }
}
