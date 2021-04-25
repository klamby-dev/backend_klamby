import {MigrationInterface, QueryRunner} from 'typeorm';

export class UpdateOrder1618406463299 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN discount int(11) NOT NULL DEFAULT 0');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN shipping_total_weight float NOT NULL DEFAULT 0');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN shipping_cost int(11) NOT NULL DEFAULT 0');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN grand_total int(11) NOT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN promo_code varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN payment_reminder int(11) DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN snap_js_json text COLLATE utf8mb4_unicode_ci DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN snap_trans_id varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN snap_callback text COLLATE utf8mb4_unicode_ci DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN stock_returned int(11) DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN paid_at timestamp NULL DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN settlement_at timestamp NULL DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN cancelled_at timestamp NULL DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN is_po int(11) DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN is_manual int(11) NOT NULL DEFAULT 0');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN admin_cid varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN va_number varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN bank varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL');
        await queryRunner.query('ALTER TABLE `order` ADD COLUMN point_used int(10) unsigned DEFAULT NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('');
    }

}
