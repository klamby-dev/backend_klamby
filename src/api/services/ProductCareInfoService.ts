import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { ProductCareInfo } from '../models/ProductCareInfo';
import { ProductCareInfoRepository } from '../repositories/ProductCareInfoRepository';

@Service()
export class ProductCareInfoService {
    constructor(
        @OrmRepository() private productCareInfoRepository: ProductCareInfoRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(data: any): Promise<ProductCareInfo> {
        this.log.info('create a data');
        return this.productCareInfoRepository.save(data);
    }
    // findone a data
    public findOne(id: any): Promise<ProductCareInfo> {
        this.log.info('Find a data');
        return this.productCareInfoRepository.findOne(id);
    }

    // delete product option
    public async delete(id: any): Promise<any> {
        this.log.info('Delete a product option');
        const deleteProductCareInfo = await this.productCareInfoRepository.delete(id);
        return deleteProductCareInfo;
    }

    // find a data
    public find(productCareInfo: any): Promise<any> {
        this.log.info('Find a data');
        return this.productCareInfoRepository.find(productCareInfo);
    }
}
