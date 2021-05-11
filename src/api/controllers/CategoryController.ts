/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import 'reflect-metadata';
import { Get, Post, Put, Delete, Body, JsonController, Authorized, QueryParam, Res, Req } from 'routing-controllers';
import { classToPlain } from 'class-transformer';
import { CategoryService } from '../services/CategoryService';
import { AddCategory } from './requests/AddCategoryRequest';
import { UpdateCategoryRequest } from './requests/UpdateCategoryRequest';
import { Category } from '../models/CategoryModel';
import { CategoryPath } from '../models/CategoryPath';
import arrayToTree from 'array-to-tree';
import { DeleteCategoryRequest } from './requests/DeleteCategoryRequest';
import { CategoryPathService } from '../services/CategoryPathService';

@JsonController()
export class CategoryController {
    constructor(private categoryService: CategoryService,
                private categoryPathService: CategoryPathService
    ) {
    }

    // create Category API
    /**
     * @api {post} /api/add-category Add Category API
     * @apiGroup Category
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} name Category name
     * @apiParam (Request body) {number} parentInt Category  parentInt
     * @apiParam (Request body) {number} sortOrder Category sortOrder
     * @apiParam (Request body) {String} metaTagTitle Category metaTagTitle
     * @apiParam (Request body) {String} metaTagDescription Category metaTagDescription
     * @apiParam (Request body) {String} facebookCategoryId facebookCategoryId
     * @apiParam (Request body) {String} googleCategoryId googleCategoryId
     * @apiParam (Request body) {String} metaTagKeyword Category metaTagKeyword
     * @apiParam (Request body) {Number} status Category status 1-> Active 0-> inactive
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "parentInt" : "",
     *      "sortOrder" : "",
     *      "metaTagTitle" : "",
     *      "metaTagDescription" : "",
     *      "metaTagKeyword" : "",
     *      "facebookCategoryId": "",
     *      "googleCategoryId": "",
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully created new Category.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/add-category
     * @apiErrorExample {json} Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/add-category')
    @Authorized()
    public async addCategory(@Body({ validate: true }) category: AddCategory, @Res() response: any): Promise<Category> {
        const newCategory = new Category();
        newCategory.name = category.name;
        newCategory.parentInt = category.parentInt;
        newCategory.sortOrder = category.sortOrder;
        newCategory.metaTagTitle = category.metaTagTitle;
        newCategory.metaTagDescription = category.metaTagDescription;
        newCategory.metaTagKeyword = category.metaTagKeyword;
        newCategory.isActive = category.status;
        newCategory.googleCategoryId = category.googleCategoryId;
        newCategory.facebookCategoryId = category.facebookCategoryId;
        const categorySave = await this.categoryService.create(newCategory);

        const getAllPath: any = await this.categoryPathService.find({
            where: { categoryId: category.parentInt },
            order: { level: 'ASC' },
        });
        let level = 0;
        for (const path of getAllPath) {
            const categoryPathLoop: any = new CategoryPath();
            categoryPathLoop.categoryId = categorySave.categoryId;
            categoryPathLoop.pathId = path.pathId;
            categoryPathLoop.level = level;
            await this.categoryPathService.create(categoryPathLoop);
            level++;
        }

        const newCategoryPath = new CategoryPath();
        newCategoryPath.categoryId = categorySave.categoryId;
        newCategoryPath.pathId = categorySave.categoryId;
        newCategoryPath.level = level;
        await this.categoryPathService.create(newCategoryPath);

        if (categorySave !== undefined) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully created new category.',
                data: categorySave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to create the category. ',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Update Category API
    /**
     * @api {put} /api/update-category/:id Update Category API
     * @apiGroup Category
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} categoryId Category categoryId
     * @apiParam (Request body) {String} name Category name
     * @apiParam (Request body) {number} parentInt Category  parentInt
     * @apiParam (Request body) {number} sortOrder Category sortOrder
     * @apiParam (Request body) {String} facebookCategoryId facebookCategoryId
     * @apiParam (Request body) {String} googleCategoryId googleCategoryId
     * @apiParam (Request body) {String} metaTagTitle Category metaTagTitle
     * @apiParam (Request body) {String} metaTagDescription Category metaTagDescription
     * @apiParam (Request body) {String} metaTagKeyword Category metaTagKeyword
     * @apiParam (Request body) {Number} status Category status 1-> Active 0-> inactive
     * @apiParamExample {json} Input
     * {
     *      "categoryId" : "",
     *      "name" : "",
     *      "parentInt" : "",
     *      "sortOrder" : "",
     *      "facebookCategoryId": "",
     *      "googleCategoryId": "",
     *      "metaTagTitle" : "",
     *      "metaTagDescription" : "",
     *      "metaTagKeyword" : "",
     *      "status" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated Category.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/update-category/:id
     * @apiErrorExample {json} Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-category/:id')
    @Authorized()
    public async updateCategory(@Body({ validate: true }) category: UpdateCategoryRequest, @Res() response: any, @Req() request: any): Promise<Category> {
        const categoryId = await this.categoryService.findOne({
            where: {
                categoryId: category.categoryId,
            },
        });
        if (!categoryId) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid categoryId',
            };
            return response.status(400).send(errorResponse);
        }
        categoryId.name = category.name;
        categoryId.parentInt = category.parentInt;
        categoryId.sortOrder = category.sortOrder;
        categoryId.metaTagTitle = category.metaTagTitle;
        categoryId.metaTagDescription = category.metaTagDescription;
        categoryId.metaTagKeyword = category.metaTagKeyword;
        categoryId.isActive = category.status;
        categoryId.googleCategoryId = category.googleCategoryId;
        categoryId.facebookCategoryId = category.facebookCategoryId;
        const categorySave = await this.categoryService.create(categoryId);

        const deleteCategory = await this.categoryPathService.find({ where: { categoryId: category.categoryId } });
        for (const val of deleteCategory) {
            await this.categoryPathService.delete(val.categoryPathId);
        }

        const getAllPath: any = await this.categoryPathService.find({
            where: { categoryId: category.parentInt },
            order: { level: 'ASC' },
        });
        let level = 0;
        for (const path of getAllPath) {
            const categoryPathLoop: any = new CategoryPath();
            categoryPathLoop.categoryId = categorySave.categoryId;
            categoryPathLoop.pathId = path.pathId;
            categoryPathLoop.level = level;
            this.categoryPathService.create(categoryPathLoop);
            level++;
        }

        const newCategoryPath = new CategoryPath();
        newCategoryPath.categoryId = categorySave.categoryId;
        newCategoryPath.pathId = categorySave.categoryId;
        newCategoryPath.level = level;
        await this.categoryPathService.create(newCategoryPath);

        if (categorySave !== undefined) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated category.',
                data: classToPlain(categorySave),
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to update the category. ',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // delete Category API
    /**
     * @api {delete} /api/delete-category/:id Delete Category API
     * @apiGroup Category
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} categoryId Category categoryId
     * @apiParamExample {json} Input
     * {
     *      "categoryId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully deleted Category.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/delete-category/:id
     * @apiErrorExample {json} Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-category/:id')
    @Authorized()
    public async deleteCategory(@Body({ validate: true }) category: DeleteCategoryRequest, @Res() response: any, @Req() request: any): Promise<Category> {

        const categoryId = await this.categoryService.findOne({
            where: {
                categoryId: category.categoryId,
            },
        });
        if (!categoryId) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid categoryId',
            };
            return response.status(400).send(errorResponse);
        }
        const parentCategoryId = await this.categoryService.findOne({
            where: {
                parentInt: category.categoryId,
            },
        });
        if (parentCategoryId) {
            const errorresponse: any = {
                status: 0,
                message: 'you cannot delete parent categoryId',
            };
            return response.status(400).send(errorresponse);
        }
        const categoryPath: any = await this.categoryPathService.find({ where: { categoryId: category.categoryId } });
        for (const path of categoryPath) {
            await this.categoryPathService.delete(path.categoryPathId);
        }
        const deleteCategory = await this.categoryService.delete(categoryId);
        if (!deleteCategory) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully deleted category.',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to delete the category. ',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Category List API
    /**
     * @api {get} /api/categorylist Category List API
     * @apiGroup Category
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} sortOrder sortOrder
     * @apiParam (Request body) {Number} status status
     * @apiParam (Request body) {String} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete category list.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/categorylist
     * @apiErrorExample {json} Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/categorylist')
    @Authorized()
    public async categoryList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('sortOrder') sortOrder: number, @QueryParam('status') status: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['categoryId', 'name', 'parentInt', 'sortOrder', 'metaTagTitle', 'metaTagDescription', 'metaTagKeyword', 'isActive', 'googleCategoryId', 'facebookCategoryId'];

        const search = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            }, {
                name: 'isActive',
                op: 'where',
                value: status,
            },
        ];
        const whereConditions = [];
        const category: any = await this.categoryService.list(limit, offset, select, search, whereConditions, sortOrder, count);
        if (count) {
            const successResponse: any = {
                status: 1,
                message: 'successfully got the complete category list. ',
                data: category,
            };
            return response.status(200).send(successResponse);
        }
        const promise = category.map(async (result: any) => {
            const temp: any = result;
            const categoryLevel: any = await this.categoryPathService.find({
                select: ['level', 'pathId'],
                where: { categoryId: result.categoryId },
                order: { level: 'ASC' },
            }).then((values) => {
                const categories = values.map(async (val: any) => {
                    const categoryNames = await this.categoryService.findOne({ categoryId: val.pathId });
                    const jsonData = JSON.stringify(categoryNames);
                    const parseData = JSON.parse(jsonData);
                    const tempVal: any = val;
                    tempVal.categoryName = parseData ? parseData.name : '';
                    return tempVal;
                });
                const results = Promise.all(categories);
                return results;
            });
            temp.levels = categoryLevel;
            return temp;
        });
        const value = await Promise.all(promise);
        if (category) {
            const successResponse: any = {
                status: 1,
                message: 'successfully got the complete category list. ',
                data: value,
            };
            return response.status(200).send(successResponse);
        }
    }

    // Category List Tree API
    /**
     * @api {get} /api/category-list-intree Category List InTree API
     * @apiGroup Category
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} sortOrder sortOrder
     * @apiParam (Request body) {String} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the complete category list.",
     *      "data":"{}"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/category-list-intree
     * @apiErrorExample {json} Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/category-list-intree')
    @Authorized()
    public async categoryListTree(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('sortOrder') sortOrder: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<Category> {
        const select = ['categoryId', 'name', 'parentInt', 'sortOrder', 'metaTagTitle', 'metaTagDescription', 'metaTagKeyword', 'isActive', 'facebookCategoryId', 'googleCategoryId'];

        const search = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            },
        ];
        const whereConditions = [];
        const category: any = await this.categoryService.list(limit, offset, select, search, whereConditions, sortOrder, count);
        if (count) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully get category List count',
                data: category,
            };
            return response.status(200).send(successResponse);
        } else {
            const categoryList = arrayToTree(category, {
                parentProperty: 'parentInt',
                customID: 'categoryId',
            });
            const successResponse: any = {
                status: 1,
                message: 'successfully got the complete category list.',
                data: categoryList,
            };
            return response.status(200).send(successResponse);
        }
    }
}
