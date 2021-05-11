import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateCategory1620731989420 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `category` ADD `facebook_category_id` VARCHAR(255) NULL DEFAULT NULL AFTER `is_active`');
        await queryRunner.query('ALTER TABLE `category` ADD `google_category_id` VARCHAR(255) NULL DEFAULT NULL AFTER `is_active`');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `category` DROP `facebook_category_id`');
        await queryRunner.query('ALTER TABLE `category` DROP `google_category_id`');
    }

}
