import {MigrationInterface, QueryRunner, TableColumn} from 'typeorm';

export class AddColumnInWishListTable1596004204692 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const ifExist = await queryRunner.hasColumn('customer_wishlist', 'product_option_value_id');
        if (!ifExist) {
            await queryRunner.addColumn('customer_wishlist', new TableColumn({
                name: 'product_option_value_id',
                type: 'varchar',
                length: '255',
                isPrimary: false,
                isNullable: true,
               }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('customer_wishlist', 'product_option_value_id');
    }

}
