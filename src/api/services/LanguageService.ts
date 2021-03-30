/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Like } from 'typeorm/index';
import { LanguageRepository } from '../repositories/LanguageRepository';

@Service()
export class LanguageService {

    constructor(@OrmRepository() private languageRepository: LanguageRepository,
                @Logger(__filename) private log: LoggerInterface) {
    }

    // create language
    public async create(language: any): Promise<any> {
        this.log.info('Create a new banner ');
        return this.languageRepository.save(language);
    }

    // find Condition
    public findOne(language: any): Promise<any> {
        return this.languageRepository.findOne(language);
    }

    // update language
    public update(language: any): Promise<any> {
        return this.languageRepository.save(language);
    }

    // language List
    public list(limit: any, offset: any, select: any = [], search: any = [], whereConditions: any = [], count: number | boolean): Promise<any> {
        const condition: any = {};

        if (select && select.length > 0) {
            condition.select = select;
        }
        condition.where = {};

        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                condition.where[item.name] = item.value;
            });
        }

        if (search && search.length > 0) {
            search.forEach((table: any) => {
                const operator: string = table.op;
                if (operator === 'where' && table.value !== undefined) {
                    condition.where[table.name] = table.value;
                } else if (operator === 'like' && table.value !== undefined) {
                    condition.where[table.name] = Like('%' + table.value + '%');
                }
            });
        }

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }

        condition.order = {
            sortOrder: 'ASC',
            createdDate: 'DESC',
        };

        if (count) {
            return this.languageRepository.count(condition);
        } else {
            return this.languageRepository.find(condition);
        }
    }

    // delete language
    public async delete(id: number): Promise<any> {
        return await this.languageRepository.delete(id);
    }
}
