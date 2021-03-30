import {MigrationInterface, QueryRunner, Table, TableForeignKey} from 'typeorm';

export class CreateProductRelatedTable1609940189989 implements MigrationInterface {
    private tableForeignKey = new TableForeignKey({
        name: 'fk_product_related_product1',
        columnNames: ['product_id'],
        referencedColumnNames: ['product_id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
    });
    private tableForeignKey1 = new TableForeignKey({
        name: 'fk_tbl_product_related_tbl_product_foreignKey',
        columnNames: ['related_product_id'],
        referencedColumnNames: ['product_id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
    });

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'product_related',
            columns: [
                {
                    name: 'related_id',
                    type: 'int',
                    length: '11',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                }, {
                    name: 'product_id',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'related_product_id',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'is_active',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'created_date',
                    type: 'datetime',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
                    name: 'modified_date',
                    type: 'datetime',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
                    name: 'created_by',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'modified_by',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },
            ],
        });
        const ifExsist = await queryRunner.hasTable('product_related');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
        const table1 = await queryRunner.getTable('product_related');
        const ifDataExsist = table1.foreignKeys.find(fk => fk.columnNames.indexOf('product_id') !== -1);
        if (!ifDataExsist) {
            await queryRunner.createForeignKey(table1, this.tableForeignKey);
        }
        const table2 = await queryRunner.getTable('product_related');
        const ifDataExsist1 = table2.foreignKeys.find(fk => fk.columnNames.indexOf('related_product_id') !== -1);
        if (!ifDataExsist1) {
            await queryRunner.createForeignKey(table2, this.tableForeignKey1);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('product_related', true);
        const table = await queryRunner.getTable('product_related');
        const ifDataExsist = table.foreignKeys.find(fk => fk.columnNames.indexOf('product_id') !== -1);
        if (ifDataExsist) {
            await queryRunner.dropForeignKey(table, this.tableForeignKey);
        }
        const table1 = await queryRunner.getTable('product_related');
        const ifDataExsist1 = table1.foreignKeys.find(fk => fk.columnNames.indexOf('related_product_id') !== -1);
        if (ifDataExsist1) {
            await queryRunner.dropForeignKey(table1, this.tableForeignKey1);
        }
    }

}
