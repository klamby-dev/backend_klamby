import { EntityRepository, Repository } from 'typeorm';
import { ProductCareInfo } from '../models/ProductCareInfo';

@EntityRepository(ProductCareInfo)
export class ProductCareInfoRepository extends Repository<ProductCareInfo>  {

}
