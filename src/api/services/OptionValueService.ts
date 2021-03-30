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
import { OptionValue } from '../models/OptionValue';
import { OptionValueRepository } from '../repositories/OptionValueRepository';

@Service()
export class OptionValueService {
    constructor(
        @OrmRepository() private optionValueRepository: OptionValueRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(data: any): Promise<OptionValue> {
        this.log.info('create a data');
        return this.optionValueRepository.save(data);
    }
    // findone a data
    public findOne(id: number): Promise<OptionValue> {
        this.log.info('Find a data');
        return this.optionValueRepository.findOne(id);
    }
    // find condition
    public find(option: any): Promise<OptionValue[]> {
        return this.optionValueRepository.find(option);
    }

    // delete OptionValue
    public async delete(id: any): Promise<any> {
        this.log.info('Delete a OptionValue');
        await this.optionValueRepository.delete(id);
        return;
    }
}
