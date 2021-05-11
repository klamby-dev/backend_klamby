/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { Post, Body, JsonController, Authorized, Res, Get, Delete, Req, Param, QueryParam } from 'routing-controllers';
import { OptionService } from '../services/OptionService';
import { Option } from '../models/Option';
import { OptionDescription } from '../models/OptionDescription';
import { CreateOption } from './requests/CreateOptionRequest';
import { UpdateOption } from './requests/UpdateOptionRequest';
import { DeleteOption } from './requests/DeleteOptionRequest';
import { classToPlain } from 'class-transformer';
import { OptionDescriptionService } from '../services/OptionDescriptionService';
import { OptionValue } from '../models/OptionValue';
import { OptionValueService } from '../services/OptionValueService';
import { OptionValueDescription } from '../models/OptionValueDescription';
import { OptionValueDescriptionService } from '../services/OptionValueDescriptionService';
import { env } from '../../env';
import { ImageService } from '../services/ImageService';
import { S3Service } from '../services/S3Service';
import { ProductOptionService } from '../services/ProductOptionService';

@JsonController('/option')
export class OptionController {
    constructor(private optionService: OptionService,
                private optionDescriptionService: OptionDescriptionService,
                private optionValueService: OptionValueService,
                private optionValueDescriptionService: OptionValueDescriptionService,
                private s3Service: S3Service,
                private imageService: ImageService,
                private productOptionService: ProductOptionService) {
    }

    @Get('/generate-option')
    @Authorized()
    public async generate(): Promise<any> {
        const size = [
            'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
        ];

        const newOption = new Option();
        newOption.type = 'select';
        newOption.sortOrder = 0;
        const optionSave = await this.optionService.create(newOption);
        const newOptionDescription = new OptionDescription();
        newOptionDescription.optionId = optionSave.optionId;
        newOptionDescription.name = 'size';
        await this.optionDescriptionService.create(newOptionDescription);
        const optionValue: any = size;
        if (optionValue !== undefined) {
            const promise = optionValue.map(async (result: any, i) => {
                const optionValues = new OptionValue();

                optionValues.sortOrder = i;
                optionValues.optionId = optionSave.optionId;
                const multipleOptionValues = await this.optionValueService.create(optionValues);
                const optionValueDescription = new OptionValueDescription();
                optionValueDescription.name = result;
                optionValueDescription.optionValueId = multipleOptionValues.optionValueId;
                optionValueDescription.optionId = optionSave.optionId;
                await this.optionValueDescriptionService.create(optionValueDescription);
                const temp: any = result;
                return temp;
            });
            await Promise.all(promise);
        }
    }

    // Create Option
    /**
     * @api {post} /api/option/add-option Add Option API
     * @apiGroup Option
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} name name
     * @apiParam (Request body) {String} type type
     * @apiParam (Request body) {Number} sortOrder sortOrder
     * @apiParam (Request body) {object} optionValue optionValue
     * @apiParam (Request body) {String} optionValue.name Name
     * @apiParam (Request body) {String} optionValue.image image
     * @apiParam (Request body) {Number} optionValue.sortOrder sortOrder
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "type" : "",
     *      "sortOrder" : "",
     *      "optionValue" : [{
     *           "name" : "",
     *           "image" : "",
     *           "sortOrder" : ""
     *      }]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "New option is created successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/option/add-option
     * @apiErrorExample {json} addOption error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-option')
    @Authorized()
    public async createOption(@Body({ validate: true }) optionParam: CreateOption, @Res() response: any): Promise<any> {
        const newOption = new Option();
        newOption.type = optionParam.type;
        newOption.sortOrder = optionParam.sortOrder;
        const optionSave = await this.optionService.create(newOption);
        const newOptionDescription = new OptionDescription();
        newOptionDescription.optionId = optionSave.optionId;
        newOptionDescription.name = optionParam.name;
        await this.optionDescriptionService.create(newOptionDescription);
        const optionValue: any = optionParam.optionValue;
        if (optionValue !== undefined) {
            const promise = optionValue.map(async (result: any) => {
                const optionValues = new OptionValue();
                const image = result.image;
                if (image) {
                    const type = image.split(';')[0].split('/')[1];
                    const name = 'Img_' + Date.now() + '.' + type;
                    const path = 'option/';
                    const base64Data = new Buffer(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                    if (env.imageserver === 's3') {
                        await this.s3Service.imageUpload((path + name), base64Data, type);
                    } else {
                        await this.imageService.imageUpload((path + name), base64Data);
                    }
                    optionValues.image = name;
                    optionValues.imagePath = path;
                }
                optionValues.sortOrder = result.sortOrder;
                optionValues.optionId = optionSave.optionId;
                const multipleOptionValues = await this.optionValueService.create(optionValues);
                const optionValueDescription = new OptionValueDescription();
                optionValueDescription.name = result.name;
                optionValueDescription.optionValueId = multipleOptionValues.optionValueId;
                optionValueDescription.optionId = optionSave.optionId;
                await this.optionValueDescriptionService.create(optionValueDescription);
                const temp: any = result;
                return temp;
            });
            await Promise.all(promise);
        }
        if (optionSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully created option',
                data: optionSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to create option.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Option List API
    /**
     * @api {get} /api/option/option-list Option List API
     * @apiGroup Option
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} count count
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got option list",
     *      "data":{
     *      "name" : "",
     *      "type" : "",
     *      "sortOrder" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/option/option-list
     * @apiErrorExample {json} Option error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/option-list')
    @Authorized()
    public async optionList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['optionId', 'type', 'sortOrder'];
        const relation = [];
        const whereConditions = [];
        const optionList: any = await this.optionService.list(limit, offset, select, relation, whereConditions, count);
        if (count) {
            const Response: any = {
                status: 1,
                message: 'Successfully got option count.',
                data: optionList,
            };
            return response.status(200).send(Response);
        }
        const optionValueList = optionList.map(async (value: any) => {
            const optionDescription = await this.optionDescriptionService.findOne({
                where: { optionId: value.optionId },
                select: ['name'],
            });
            const optionValue: any = await this.optionValueService.find({
                where: { optionId: value.optionId },
                select: ['optionValueId', 'optionId', 'image', 'imagePath', 'sortOrder'],
                order: { sortOrder: 'ASC' },
            });
            const optionValueLists: any = optionValue.map(async (val: any) => {
                const optionValueName = await this.optionValueDescriptionService.findOne({
                    where: { optionValueId: val.optionValueId },
                    select: ['name'],
                });
                const OptionValuesList = Object.assign({}, val, optionValueName);
                return OptionValuesList;
            });
            const ValueName = await Promise.all(optionValueLists);
            const optionlist = Object.assign({}, value, optionDescription);
            const temp: any = optionlist;
            temp.OptionValue = ValueName;
            return temp;
        });
        const results = await Promise.all(optionValueList);

        if (optionList) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got the complete list of options. ',
                data: classToPlain(results),
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to list options',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Update Option
    /**
     * @api {post} /api/option/update-option Update Option API
     * @apiGroup Option
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} flag flag
     * @apiParam (Request body) {Number} optionId optionId
     * @apiParam (Request body) {String} name name
     * @apiParam (Request body) {String} type type
     * @apiParam (Request body) {Number} sortOrder sortOrder
     * @apiParam (Request body) {object} optionValue optionValue
     * @apiParam (Request body) {Number} optionValue.optionValueId optionValueId
     * @apiParam (Request body) {String} optionValue.name Name
     * @apiParam (Request body) {String} optionValue.image image
     * @apiParam (Request body) {Number} optionValue.sortOrder sortOrder
     * @apiParamExample {json} Input
     * {
     *      "flag" : "",
     *      "optionId" : "",
     *      "name" : "",
     *      "type" : "",
     *      "sortOrder" : "",
     *      "optionValue" : [{
     *           "optionValueId" : "",
     *           "name" : "",
     *           "image" : "",
     *           "sortOrder" : ""
     *      }]
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Option Updated Successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/option/update-option
     * @apiErrorExample {json} updateOption error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/update-option')
    @Authorized()
    public async updateOption(@Body({ validate: true }) optionParam: UpdateOption, @Res() response: any): Promise<any> {
        const optionId = await this.optionService.findOne({
            where: {
                optionId: optionParam.optionId,
            },
        });
        if (!optionId) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid optionId',
            };
            return response.status(400).send(errorResponse);
        }

        if (optionParam.flag === 0) {
            const productOption: any = await this.productOptionService.findOne({
                where: {
                    optionId: optionParam.optionId,
                },
            });
            if (productOption) {
                const errorResponse: any = {
                    status: 0,
                    message: 'This option is mapped with product, Are you sure you want to update it?',
                };
                return response.status(400).send(errorResponse);
            }
        }
        optionId.type = optionParam.type;
        optionId.sortOrder = optionParam.sortOrder;
        await this.optionService.create(optionId);
        const optionDescription = await this.optionDescriptionService.findOne({
            where: {
                optionId: optionParam.optionId,
            },
        });
        optionDescription.name = optionParam ? optionParam.name : '';
        await this.optionDescriptionService.create(optionDescription);
        const deleteOptionValue = await this.optionValueService.find({ where: { optionId: optionParam.optionId } });
        for (const val of deleteOptionValue) {
            await this.optionValueService.delete(val.optionValueId);
        }
        const deleteOptionValueDescription = await this.optionValueDescriptionService.find({ where: { optionId: optionParam.optionId } });
        for (const val of deleteOptionValueDescription) {
            await this.optionValueDescriptionService.delete(val.optionValueDescriptionId);
        }
        if (optionParam.optionValue) {
            const optionValues: any = optionParam.optionValue;
            for (const option of optionValues) {
                if (option.optionValueId) {
                    const optValue = new OptionValue();
                    optValue.optionValueId = option.optionValueId;
                    optValue.optionId = optionParam.optionId;
                    if (option.image) {
                        const type = option.image.split(';')[0].split('/')[1];
                        const name = 'Img_' + Date.now() + '.' + type;
                        const path = 'option/';
                        const base64Data = new Buffer(option.image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                        if (env.imageserver === 's3') {
                            await this.s3Service.imageUpload((path + name), base64Data, type);
                        } else {
                            await this.imageService.imageUpload((path + name), base64Data);
                        }
                        optValue.image = name;
                        optValue.imagePath = path;
                    } else {
                        optValue.image = undefined;
                        optValue.imagePath = undefined;
                    }
                    optValue.sortOrder = option.sortOrder;
                    const optValues = await this.optionValueService.create(optValue);
                    const optValueDescription = new OptionValueDescription();
                    optValueDescription.optionValueId = optValues.optionValueId;
                    optValueDescription.optionId = optionParam.optionId;
                    optValueDescription.name = option.name;
                    await this.optionValueDescriptionService.create(optValueDescription);
                } else {
                    const opValue = new OptionValue();
                    opValue.optionId = optionParam.optionId;
                    if (option.image) {
                        const type = option.image.split(';')[0].split('/')[1];
                        const name = 'Img_' + Date.now() + '.' + type;
                        const path = 'option/';
                        const base64Data = new Buffer(option.image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                        if (env.imageserver === 's3') {
                            await this.s3Service.imageUpload((path + name), base64Data, type);
                        } else {
                            await this.imageService.imageUpload((path + name), base64Data);
                        }
                        opValue.image = name;
                        opValue.imagePath = path;
                    } else {
                        opValue.image = undefined;
                        opValue.imagePath = undefined;
                    }
                    opValue.sortOrder = option.sortOrder;
                    const optValues = await this.optionValueService.create(opValue);
                    const optValueDescription = new OptionValueDescription();
                    optValueDescription.optionValueId = optValues.optionValueId;
                    optValueDescription.optionId = optionParam.optionId;
                    optValueDescription.name = option.name;
                    await this.optionValueDescriptionService.create(optValueDescription);
                }
            }
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully Updated Options.',
        };
        return response.status(200).send(successResponse);
    }

    // Delete Option API
    /**
     * @api {delete} /api/option/option-delete/:id Option Delete API
     * @apiGroup Option
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} optionId optionId
     * @apiParamExample {json} Input
     * {
     * "optionId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully Deleted Option.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/option/option-delete/:id
     * @apiErrorExample {json} productDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/option-delete/:id')
    @Authorized()
    public async deleteOption(@Body({ validate: true }) delOption: DeleteOption, @Res() response: any, @Req() request: any): Promise<any> {
        const option = await this.optionService.findOne({
            where: {
                optionId: delOption.optionId,
            },
        });
        if (!option) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid optionId',
            };
            return response.status(400).send(errorResponse);
        }
        const productOption: any = await this.productOptionService.findOne({
            where: {
                optionId: delOption.optionId,
            },
        });
        if (productOption) {
            const errorResponse: any = {
                status: 0,
                message: 'You cannot delete this option',
            };
            return response.status(400).send(errorResponse);
        }

        const deleteOption = await this.optionService.delete(delOption.optionId);
        const deleteOptionDescription = await this.optionDescriptionService.findOne({ where: { optionId: delOption.optionId } });
        await this.optionDescriptionService.delete(deleteOptionDescription.optionDescriptionId);
        const deleteOptionValue = await this.optionValueService.find({ where: { optionId: delOption.optionId } });
        for (const val of deleteOptionValue) {
            await this.optionValueService.delete(val.optionValueId);
        }
        const deleteOptionValueDescription = await this.optionValueDescriptionService.find({ where: { optionId: delOption.optionId } });
        for (const val of deleteOptionValueDescription) {
            await this.optionValueDescriptionService.delete(val.optionValueDescriptionId);
        }
        if (deleteOption === undefined) {
            const successResponse: any = {
                status: 1,
                message: 'Option Deleted Successfully',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to delete Option',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Getting Option value
    /**
     * @api {get} /api/option/getting-option-value/:id Getting Option Value API
     * @apiGroup Option
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Option got Successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/option/getting-option-value/:id
     * @apiErrorExample {json} gettingOption error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/getting-option-value/:id')
    @Authorized()
    public async gettingOptionValue(@Param('id') id: number, @Res() response: any): Promise<any> {
        const optionValue = await this.optionValueDescriptionService.find({
            where: { optionId: id },
            select: ['name', 'optionValueId', 'optionId'],
        }
        );
        if (optionValue.length !== 0) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got the OptionsValue. ',
                options: optionValue,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid optionId',
            };
            return response.status(400).send(errorResponse);
        }

    }

    // searching Option
    /**
     * @api {get} /api/option/search-option Search Option API
     * @apiGroup Option
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} keyword keyword
     * @apiParamExample {json} Input
     * {
     *      "keyword" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Option got Successfully",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/option/search-option
     * @apiErrorExample {json} searchOption error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/search-option')
    @Authorized()
    public async searchOption(@QueryParam('keyword') keyword: string, @Res() response: any): Promise<any> {
        const select = ['name', 'optionId'];
        const whereConditions = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            }];
        const optionLists: any = await this.optionDescriptionService.list(select, whereConditions);
        const promises = optionLists.map(async (results: any) => {
            const type = await this.optionService.findOne({
                where: { optionId: results.optionId },
                select: ['type'],
            });
            const optionType = Object.assign({}, results, type);
            return optionType;
        });
        const result = await Promise.all(promises);
        if (optionLists) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got the option list. ',
                data: result,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'Unable to get option list.',

            };
            return response.status(400).send(errorResponse);
        }
    }
}
