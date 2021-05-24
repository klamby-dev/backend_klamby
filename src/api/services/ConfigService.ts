import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Config } from '../models/Config';
import { ConfigRepository } from '../repositories/ConfigRepository';

@Service()
export class ConfigService {
    constructor(
        @OrmRepository() private configRepository: ConfigRepository,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    // create a data
    public async create(data: any): Promise<Config> {
        this.log.info('create a data');
        return this.configRepository.save(data);
    }
    // findone a data
    public findOne(id: any): Promise<Config> {
        this.log.info('Find a data');
        return this.configRepository.findOne(id);
    }
    // findone a data
    public findOneByKey(key: string): Promise<Config> {
        this.log.info('Find a data');
        return this.configRepository.findOne({
            where: { key },
        });
    }

    // delete product option
    public async delete(id: any): Promise<any> {
        this.log.info('Delete a product option');
        const deleteConfig = await this.configRepository.delete(id);
        return deleteConfig;
    }

    // find a data
    public find(config: any): Promise<any> {
        this.log.info('Find a data');
        return this.configRepository.find(config);
    }
}
