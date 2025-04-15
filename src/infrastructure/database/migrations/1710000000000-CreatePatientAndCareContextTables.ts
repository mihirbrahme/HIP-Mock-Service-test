import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePatientAndCareContextTables1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Patient table
        await queryRunner.createTable(
            new Table({
                name: 'patients',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'abha_number',
                        type: 'varchar',
                        length: '14',
                        isUnique: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'gender',
                        type: 'varchar',
                        length: '10',
                    },
                    {
                        name: 'date_of_birth',
                        type: 'date',
                    },
                    {
                        name: 'contact',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Create CareContext table
        await queryRunner.createTable(
            new Table({
                name: 'care_contexts',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'patient_id',
                        type: 'uuid',
                    },
                    {
                        name: 'reference_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                    },
                    {
                        name: 'display',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'additional_info',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Add foreign key constraint
        await queryRunner.createForeignKey(
            'care_contexts',
            new TableForeignKey({
                columnNames: ['patient_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'patients',
                onDelete: 'CASCADE',
            })
        );

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX idx_patients_abha_number ON patients (abha_number);
            CREATE INDEX idx_patients_name ON patients (name);
            CREATE INDEX idx_care_contexts_patient_id ON care_contexts (patient_id);
            CREATE INDEX idx_care_contexts_reference_number ON care_contexts (reference_number);
        `);

        // Create trigger for updated_at
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            CREATE TRIGGER update_patients_updated_at
                BEFORE UPDATE ON patients
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE TRIGGER update_care_contexts_updated_at
                BEFORE UPDATE ON care_contexts
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop triggers first
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_care_contexts_updated_at ON care_contexts;
            DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
            DROP FUNCTION IF EXISTS update_updated_at_column;
        `);

        // Drop foreign key
        const careContextTable = await queryRunner.getTable('care_contexts');
        const foreignKey = careContextTable?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('patient_id') !== -1
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey('care_contexts', foreignKey);
        }

        // Drop tables
        await queryRunner.dropTable('care_contexts');
        await queryRunner.dropTable('patients');
    }
} 