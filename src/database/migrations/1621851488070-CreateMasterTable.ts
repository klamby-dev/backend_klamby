import {MigrationInterface, QueryRunner, Table} from 'typeorm';

export class CreateMasterTable1621851488070 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `product` ADD `product_care_info_id` INT(11) NULL DEFAULT NULL AFTER `is_active`');

        const table = new Table({
            name: 'product_care_info',
            columns: [
                {
                    name: 'product_care_info_id',
                    type: 'integer',
                    length: '11',
                    isGenerated: true,
                    generationStrategy: 'increment',
                    isPrimary: true,
                    isNullable: false,
                }, {
                    name: 'title',
                    type: 'varchar',
                    length: '32',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'code',
                    type: 'varchar',
                    length: '5',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'content',
                    type: 'TEXT',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'created_by',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'modified_by',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'created_date',
                    type: 'DATETIME',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
                    name: 'modified_date',
                    type: 'DATETIME',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        });
        const ifExsist = await queryRunner.hasTable('product_care_info');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }

        const table2 = new Table({
            name: 'config',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    length: '11',
                    isGenerated: true,
                    generationStrategy: 'increment',
                    isPrimary: true,
                    isNullable: false,
                }, {
                    name: 'key',
                    type: 'varchar',
                    length: '32',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'content',
                    type: 'TEXT',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'created_by',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'modified_by',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'created_date',
                    type: 'DATETIME',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
                    name: 'modified_date',
                    type: 'DATETIME',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        });
        const ifExsist2 = await queryRunner.hasTable('config');
        if (!ifExsist2) {
            await queryRunner.createTable(table2);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `product` DROP `product_care_info_id`');
        await queryRunner.dropTable('product_care_info', true);
        await queryRunner.dropTable('config', true);
    }

}
