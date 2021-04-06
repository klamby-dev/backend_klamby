import {MigrationInterface, QueryRunner} from 'typeorm';

export class UpdateCustomer1617689586288 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE customer ADD COLUMN user_cid varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL after id');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN fb_uid varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after user_cid');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN fb_email varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after fb_uid');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN google_uid varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after fb_email');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN google_email varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after google_uid');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN name varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL after google_email');
        await queryRunner.query('ALTER TABLE customer DROP COLUMN first_name');
        await queryRunner.query('ALTER TABLE customer DROP COLUMN username');
        await queryRunner.query('ALTER TABLE customer CHANGE COLUMN last_name last_name varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after name');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN salutation varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after last_name');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN province varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after address');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN district varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after city');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN postal_code varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after district');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN dob date DEFAULT NULL after mobile');
        await queryRunner.query('ALTER TABLE customer CHANGE mobile mobile VARCHAR(30)  CHARACTER SET latin1  COLLATE latin1_swedish_ci  NULL  DEFAULT NULL');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN is_subscribe int(11) DEFAULT NULL after dob');
        await queryRunner.query('ALTER TABLE customer CHANGE address address VARCHAR(255)  CHARACTER SET latin1  COLLATE latin1_swedish_ci  NULL  DEFAULT NULL');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN is_banned int(11) DEFAULT NULL after is_subscribe');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN unbanned_until timestamp NULL DEFAULT NULL after is_banned');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN remember_token varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after password');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN country varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after modified_date');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN company varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after country');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN points int(11) DEFAULT NULL after company');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN member_level varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after points');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN credit int(11) NOT NULL DEFAULT 0 after member_level');
        await queryRunner.query('ALTER TABLE customer ADD COLUMN otp_at datetime DEFAULT NULL after credit');
        await queryRunner.query('ALTER TABLE customer CHANGE COLUMN email email varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL after salutation');
        await queryRunner.query('ALTER TABLE customer CHANGE COLUMN address address text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after email');
        await queryRunner.query('ALTER TABLE customer CHANGE COLUMN province province varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after address');
        await queryRunner.query('ALTER TABLE customer CHANGE COLUMN city city varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after province');
        await queryRunner.query('ALTER TABLE customer CHANGE COLUMN district district varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after city');
        await queryRunner.query('ALTER TABLE customer CHANGE COLUMN postal_code postal_code varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after district');
        await queryRunner.query('ALTER TABLE customer CHANGE COLUMN mobile mobile varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL after postal_code');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('');
    }

}
