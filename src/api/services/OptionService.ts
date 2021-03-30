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
import { Option } from '../models/Option';
import { OptionRepository } from '../repositories/OptionRepository';

@Service()
export class OptionService {
    constructor(
        @OrmRepository() private optionRepository: OptionRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a option data
    public async create(optionData: any): Promise<Option> {
        this.log.info('create option data');
        return this.optionRepository.save(optionData);
    }
    // findone a data
    public findOne(id: any): Promise<Option> {
        this.log.info('Find a data');
        return this.optionRepository.findOne(id);
    }
    // Option List
    public list(limit: number, offset: number, select: any = [], relation: any = [], whereConditions: any = [], count: number | boolean): Promise<any> {
        const condition: any = {};
        condition.where = {};
        if (select && select.length > 0) {
            condition.select = select;
        }
        if (relation && relation.length > 0) {
            condition.relations = relation;
        }
        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                condition.where[item.name] = item.value;
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
            return this.optionRepository.count(condition);
        } else {
            return this.optionRepository.find(condition);
        }
    }

    // delete Option
    public async delete(id: number): Promise<any> {
        this.log.info('Delete a OptionDescription');
        await this.optionRepository.delete(id);
        return;
    }
}
