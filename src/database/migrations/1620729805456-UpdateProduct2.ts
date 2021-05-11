import {MigrationInterface, QueryRunner} from 'typeorm';

export class UpdateProduct21620729805456 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `product` DROP `measurement_image_path`');
        await queryRunner.query('ALTER TABLE `product` ADD `measurement_container` VARCHAR(255)  NULL DEFAULT NULL AFTER `measurement_image`');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `product` ADD `measurement_image_path` TEXT  NULL  DEFAULT NULL  AFTER `measurement_image`');
        await queryRunner.query('ALTER TABLE `product` DROP `measurement_container`');
    }

}
