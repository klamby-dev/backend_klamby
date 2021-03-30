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
    Put,
    Delete,
     Param,
     QueryParam,
    Post,
    Body,
    JsonController,
    Authorized,
    Res,
    Req
} from 'routing-controllers';
import { LanguageService } from '../services/LanguageService';
import { env } from '../../env';
import { Language } from '../models/language';
import { CreateLanguage } from './requests/CreateLanguageRequest';
import { UpdateLanguage } from './requests/UpdateLanguageRequest';
import { S3Service } from '../services/S3Service';
import { ImageService } from '../services/ImageService';

@JsonController('/language')
export class LanguageController {
    constructor(private languageService: LanguageService,
                private s3Service: S3Service,
                private imageService: ImageService) {
    }
// Create Language
    /**
     * @api {post} /api/language/add-language Add Language API
     * @apiGroup Language
     * @apiParam (Request body) {String} name name
     * @apiParam (Request body) {String} code code
     * @apiParam (Request body) {String} image image
     * @apiParam (Request body) {String} sortOrder sortOrder
     * @apiParam (Request body) {Number} status status
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "code" : "",
     *      "image" : "",
     *      "sortOrder" : "",
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New language is created successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest  /api/language/add-language
     * @apiErrorExample {json} Language error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-language')
    @Authorized()
    public async createLanguage(@Body({ validate: true }) languageParam: CreateLanguage, @Res() response: any): Promise<any> {

        const image = languageParam.image;
        if (image) {
            const type = image.split(';')[0].split('/')[1];
            const name = 'Img_' + Date.now() + '.' + type;
            const path = 'language/';
            const base64Data = new Buffer(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            if (env.imageserver === 's3') {
                await this.s3Service.imageUpload((path + name), base64Data, type);
            } else {
                await this.imageService.imageUpload((path + name), base64Data);
            }
            const newlanguage = new Language();
            newlanguage.name = languageParam.name;
            newlanguage.code = languageParam.code;
            newlanguage.image = name;
            newlanguage.imagePath = path;
            newlanguage.sortOrder = languageParam.sortOrder;
            newlanguage.isActive = languageParam.status;
            const languageSave = await this.languageService.create(newlanguage);

            if (languageSave) {
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully created new language.',
                    data: languageSave,
                };
                return response.status(200).send(successResponse);
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'Unable to create new language. ',
                };
                return response.status(400).send(errorResponse);
            }
        }
    }
    // Language List
    /**
     * @api {get} /api/language/language-list Language List API
     * @apiGroup Language
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} status status
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
     * @apiSampleRequest/api/language/language-list
     * @apiErrorExample {json} Language error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/language-list')
    @Authorized()
    public async languageList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('status') status: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = [ 'languageId', 'name', 'code', 'image', 'imagePath', 'locale',  'sortOrder', 'isActive'];
        const search = [
             {
                name: 'isActive',
                op: 'like',
                value: status,
            },
        ];
        const whereConditions = [];
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
    /**
     * @api {delete} /api/language/delete-language/:id  Delete Language API
     * @apiGroup Language
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "languageId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted Language.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/language/delete-language/:id
     * @apiErrorExample {json} Language error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-language/:id')
    @Authorized()
    public async deleteLanguage(@Param('id') id: number, @Res() response: any, @Req() request: any): Promise<any> {

        const language = await this.languageService.findOne({
            where: {
                languageId: id,
            },
        });
        if (!language) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid languageId',
            };
            return response.status(400).send(errorResponse);
        }

        const deleteLanguage = await this.languageService.delete(language);
        if (deleteLanguage) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted language',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to delete language',
            };
            return response.status(400).send(errorResponse);
        }
    }
     // Update Language
    /**
     * @api {put} /api/language/update-language/:id Update Language API
     * @apiGroup Language
     * @apiParam (Request body) {Number} languageId languageId
     * @apiParam (Request body) {String} name name
     * @apiParam (Request body) {String} code code
     * @apiParam (Request body) {String} image image
     * @apiParam (Request body) {String} sortOrder sortOrder
     * @apiParam (Request body) {Number} status status
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "languageId": "",
     *      "name" : "",
     *      "code" : "",
     *      "image" : "",,
     *      "sortOrder" : "",
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New language is created successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/language/update-language/:id
     * @apiErrorExample {json} Langugage error
     * HTTP/1.1 500 Internal Language Error
     */
    @Put('/update-language/:id')
    @Authorized()
    public async updateLanuage(@Body({ validate: true }) updateParam: UpdateLanguage, @Res() response: any, @Req() request: any): Promise<any> {

        const language = await this.languageService.findOne({
            where: {
                languageId: updateParam.languageId,
            },
        });
        if (!language) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid LanguageId',
            };
            return response.status(400).send(errorResponse);
        }
        const image = updateParam.image;
        if (image) {
            const type = image.split(';')[0].split('/')[1];
            const name = 'Img_' + Date.now() + '.' + type;
            const path = 'language/';
            const base64Data = new Buffer(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            if (env.imageserver === 's3') {
                await this.s3Service.imageUpload((path + name), base64Data, type);
            } else {
                await this.imageService.imageUpload((path + name), base64Data);
            }
            language.image = name;
            language.imagePath = path;
        }
        language.name = updateParam.name;
        language.code = updateParam.code;
        language.sortOrder = updateParam.sortOrder;
        language.isActive = updateParam.status;
        const languageSave = await this.languageService.create(language);

        if (languageSave ) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated language.',
                data: languageSave ,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to update the language. ',
            };
            return response.status(400).send(errorResponse);
        }
    }
}
