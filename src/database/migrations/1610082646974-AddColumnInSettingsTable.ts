import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm';

export class AddColumnInSettingsTable1610082646974 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const ifExist = await queryRunner.hasColumn('settings', 'store_language_name');
        if (!ifExist) {
            await queryRunner.addColumn('settings', new TableColumn({
                name: 'store_language_name',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
               }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('settings', 'store_language_name');
    }

}
