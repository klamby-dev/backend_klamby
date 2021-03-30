/*
 * spurtcommerce API
 * version 3.0.8
 * Copyright (c) 2021 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { EntityRepository, Repository } from 'typeorm';
import { OrderOption } from '../models/OrderOption';

@EntityRepository(OrderOption)
export class OrderOptionRepository extends Repository<OrderOption>  {

}
