/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { EntityRepository, Repository } from 'typeorm';
import { ProductOptionValue } from '../models/ProductOptionValue';

@EntityRepository(ProductOptionValue)
export class ProductOptionValueRepository extends Repository<ProductOptionValue>  {

}
