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
import { OptionDescription } from '../models/OptionDescription';
import { OptionDescriptionRepository } from '../repositories/OptionDescriptionRepository';
import { Like } from 'typeorm';

@Service()
export class OptionDescriptionService {
    constructor(@OrmRepository() private optionDescriptionRepository: OptionDescriptionRepository,
                @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(Data: any): Promise<OptionDescription> {
        this.log.info('create a data');
        return this.optionDescriptionRepository.save(Data);
    }
    // findone a data
    public findOne(id: any): Promise<OptionDescription> {
        this.log.info('Find a data');
        return this.optionDescriptionRepository.findOne(id);
    }

    // Option search List
    public list(select: any = [], search: any = [], whereConditions: any = []): Promise<any> {
        const condition: any = {};
        condition.where = {};
        if (select && select.length > 0) {
            condition.select = select;
        }
        if (search && search.length > 0) {
            search.forEach((item: any) => {
                const operator: string = item.op;
                if (operator === 'like' && item.value !== '') {
                    condition.where[item.name] = Like('%' + item.value + '%');
                }
            });
        }
        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                condition.where[item.name] = item.value;
            });
        }
        return this.optionDescriptionRepository.find(condition);
    }

    // delete OptionValue
    public async delete(id: any): Promise<any> {
        this.log.info('Delete a OptionDescription');
        await this.optionDescriptionRepository.delete(id);
        return;
    }
}
