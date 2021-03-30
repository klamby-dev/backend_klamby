/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { EntityRepository, Repository } from 'typeorm';
import { ProductRelated } from '../models/ProductRelated';

@EntityRepository(ProductRelated)
export class ProductRelatedRepository extends Repository<ProductRelated>  {

}
