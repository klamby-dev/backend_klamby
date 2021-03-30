/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { EntityRepository, Repository } from 'typeorm';
import { OptionValueDescription } from '../models/OptionValueDescription';

@EntityRepository(OptionValueDescription)
export class OptionValueDescriptionRepository extends Repository<OptionValueDescription>  {

}
