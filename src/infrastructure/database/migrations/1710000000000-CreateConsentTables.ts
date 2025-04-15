import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateConsentTables1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ConsentRequest table
        await queryRunner.createTable(
            new Table({
                name: 'consent_requests',
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
                        name: 'requester_nid',
                        type: 'varchar',
                        comment: 'National ID of the HIP requesting consent',
                    },
                    {
                        name: 'purpose',
                        type: 'varchar',
                    },
                    {
                        name: 'hip_id',
                        type: 'varchar',
                    },
                    {
                        name: 'hiu_id',
                        type: 'varchar',
                    },
                    {
                        name: 'request_date',
                        type: 'timestamp',
                        default: 'NOW()',
                    },
                    {
                        name: 'expiry_date',
                        type: 'timestamp',
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        default: "'PENDING'",
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'NOW()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'NOW()',
                    },
                ],
            }),
            true
        );

        // Create ConsentArtefact table
        await queryRunner.createTable(
            new Table({
                name: 'consent_artefacts',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'consent_request_id',
                        type: 'uuid',
                    },
                    {
                        name: 'signature',
                        type: 'varchar',
                        comment: 'Digital signature of the consent',
                    },
                    {
                        name: 'access_mode',
                        type: 'varchar',
                        comment: 'View/Store/Query/Stream',
                    },
                    {
                        name: 'date_range_from',
                        type: 'timestamp',
                    },
                    {
                        name: 'date_range_to',
                        type: 'timestamp',
                    },
                    {
                        name: 'frequency',
                        type: 'jsonb',
                        isNullable: true,
                        comment: 'Frequency of data access',
                    },
                    {
                        name: 'data_categories',
                        type: 'jsonb',
                        comment: 'Categories of health data included',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'NOW()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'NOW()',
                    },
                ],
            }),
            true
        );

        // Add foreign key constraints
        await queryRunner.createForeignKey(
            'consent_requests',
            new TableForeignKey({
                columnNames: ['patient_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'patients',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'consent_artefacts',
            new TableForeignKey({
                columnNames: ['consent_request_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'consent_requests',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        const consentArtefactsTable = await queryRunner.getTable('consent_artefacts');
        const consentRequestsTable = await queryRunner.getTable('consent_requests');
        
        if (consentArtefactsTable) {
            const foreignKeys = consentArtefactsTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey('consent_artefacts', foreignKey);
            }
        }

        if (consentRequestsTable) {
            const foreignKeys = consentRequestsTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey('consent_requests', foreignKey);
            }
        }

        // Drop tables
        await queryRunner.dropTable('consent_artefacts');
        await queryRunner.dropTable('consent_requests');
    }
} 