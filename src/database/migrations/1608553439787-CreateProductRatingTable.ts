import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProductRatingTable1608553439787 implements MigrationInterface {
    private tableForeignKey = new TableForeignKey({
        name: 'fk_product_rating_product1',
        columnNames: ['product_id'],
        referencedColumnNames: ['product_id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
    });
    private tableForeignKey1 = new TableForeignKey({
        name: 'fk_product_rating_order-product',
        columnNames: ['order_product_id'],
        referencedColumnNames: ['order_product_id'],
        referencedTableName: 'order_product',
        onDelete: 'CASCADE',
    });

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'product_rating',
            columns: [
                {
                    name: 'rating_id',
                    type: 'integer',
                    length: '11',
                    isGenerated: true,
                    generationStrategy: 'increment',
                    isPrimary: true,
                    isNullable: false,
                }, {
                    name: 'product_id',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'order_product_id',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'customer_id',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'first_name',
                    type: 'varchar',
                    length: '512',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'last_name',
                    type: 'varchar',
                    length: '512',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'email',
                    type: 'varchar',
                    length: '512',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'rating',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'review',
                    type: 'TEXT',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'image_path',
                    type: 'TEXT',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'image',
                    type: 'varchar',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'is_active',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
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

        const ifExsist = await queryRunner.hasTable('product_rating');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
        const table1 = await queryRunner.getTable('product_rating');
        const ifDataExsist = table1.foreignKeys.find(fk => fk.columnNames.indexOf('product_id') !== -1);
        if (!ifDataExsist) {
            await queryRunner.createForeignKey(table1, this.tableForeignKey);
        }
        const table2 = await queryRunner.getTable('product_rating');
        const ifDataExsist1 = table2.foreignKeys.find(fk => fk.columnNames.indexOf('order_product_id') !== -1);
        if (!ifDataExsist1) {
            await queryRunner.createForeignKey(table2, this.tableForeignKey1);
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('product_rating', true);
        const table = await queryRunner.getTable('product_rating');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('product_id') !== -1);
        if (ifDataExsist) {
            await queryRunner.dropForeignKey(table, this.tableForeignKey);
        }
        const table1 = await queryRunner.getTable('product_rating');
        const ifDataExsist1 = table1.foreignKeys.find(fk => fk.columnNames.indexOf('order_product_id') !== -1);
        if (ifDataExsist1) {
            await queryRunner.dropForeignKey(table1, this.tableForeignKey1);
        }

    }

}
