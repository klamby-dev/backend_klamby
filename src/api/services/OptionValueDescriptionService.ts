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
import { OptionValueDescription } from '../models/OptionValueDescription';
import { OptionValueDescriptionRepository } from '../repositories/OptionValueDescriptionRepository';

@Service()
export class OptionValueDescriptionService {
    constructor(@OrmRepository() private optionValueDescriptionRepository: OptionValueDescriptionRepository,
                @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(data: any): Promise<OptionValueDescription> {
        this.log.info('create a data');
        return this.optionValueDescriptionRepository.save(data);
    }
    // findone a data
    public findOne(id: any): Promise<OptionValueDescription> {
        this.log.info('Find a data');
        return this.optionValueDescriptionRepository.findOne(id);
    }

    // find condition
    public find(option: any): Promise<OptionValueDescription[]> {
        return this.optionValueDescriptionRepository.find(option);
    }

    // delete OptionValue
    public async delete(id: any): Promise<any> {
        this.log.info('Delete a OptionValueDescription');
        await this.optionValueDescriptionRepository.delete(id);
        return;
    }
}
