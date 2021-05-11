import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateProductOptionValue1620142637959 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `product_option_value` ADD `sku` VARCHAR(100)  NULL  DEFAULT NULL  AFTER `weight_prefix`');
        await queryRunner.query('ALTER TABLE `product_option_value` ADD `max` INT  NULL  DEFAULT NULL  AFTER `sku`');
        await queryRunner.query('ALTER TABLE `product_option_value` ADD `first_stock` INT(1)  NULL  DEFAULT 1  AFTER `max`');
        await queryRunner.query('ALTER TABLE `product_option_value` ADD `discount` INT  NULL  DEFAULT NULL  AFTER `first_stock`');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `product_option_value` DROP `sku`');
        await queryRunner.query('ALTER TABLE `product_option_value` DROP `max`');
        await queryRunner.query('ALTER TABLE `product_option_value` DROP `first_stock`');
        await queryRunner.query('ALTER TABLE `product_option_value` DROP `discount`');
    }

}
