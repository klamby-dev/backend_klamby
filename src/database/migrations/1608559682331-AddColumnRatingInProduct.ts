import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm';

export class AddColumnRatingInProduct1608559682331 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const ifExist = await queryRunner.hasColumn('product', 'rating');
        if (!ifExist) {
            await queryRunner.addColumn('product', new TableColumn({
                name: 'rating',
                type: 'integer',
                length: '11',
                isPrimary: false,
                isNullable: true,
               }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('product', 'rating');
    }

}
