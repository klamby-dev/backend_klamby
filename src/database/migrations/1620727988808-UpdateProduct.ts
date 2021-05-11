import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateProduct1620727988808 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `product` ADD `measurement_image` VARCHAR(255)  NULL DEFAULT NULL  AFTER `image_path`');
        await queryRunner.query('ALTER TABLE `product` ADD `measurement_image_path` TEXT  NULL  DEFAULT NULL  AFTER `measurement_image`');
        await queryRunner.query('ALTER TABLE `product` ADD `is_po` INT(1)  NULL  DEFAULT 1  AFTER `measurement_image_path`');
        await queryRunner.query('ALTER TABLE `product` ADD `publish_date` DATETIME  NULL  AFTER `modified_date`');
        await queryRunner.query('ALTER TABLE `product` ADD `release_date` DATETIME  NULL  AFTER `publish_date`');

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `product` DROP `measurement_image`');
        await queryRunner.query('ALTER TABLE `product` DROP `measurement_image_path`');
        await queryRunner.query('ALTER TABLE `product` DROP `is_po`');
        await queryRunner.query('ALTER TABLE `product` DROP `publish_date`');
        await queryRunner.query('ALTER TABLE `product` DROP `release_date`');
    }

}
