import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePatientAndCareContext1710864000000 implements MigrationInterface {
    name = 'CreatePatientAndCareContext1710864000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Gender enum type
        await queryRunner.query(`
            CREATE TYPE "public"."gender_enum" AS ENUM ('male', 'female', 'other', 'unknown')
        `);

        // Create patients table
        await queryRunner.query(`
            CREATE TABLE "patients" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "abha_number" varchar NOT NULL UNIQUE,
                "name" varchar NOT NULL,
                "date_of_birth" date NOT NULL,
                "gender" "public"."gender_enum" NOT NULL DEFAULT 'unknown',
                "contact" jsonb NOT NULL,
                "identifiers" jsonb,
                "health_id" varchar,
                "tags" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "is_active" boolean NOT NULL DEFAULT true
            )
        `);

        // Create care_contexts table
        await queryRunner.query(`
            CREATE TABLE "care_contexts" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "patient_id" uuid NOT NULL,
                "reference" varchar NOT NULL,
                "display" varchar NOT NULL,
                "metadata" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "is_active" boolean NOT NULL DEFAULT true,
                CONSTRAINT "fk_patient_care_context" FOREIGN KEY ("patient_id")
                    REFERENCES "patients"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "idx_patients_abha_number" ON "patients"("abha_number");
            CREATE INDEX "idx_patients_health_id" ON "patients"("health_id");
            CREATE INDEX "idx_care_contexts_patient_id" ON "care_contexts"("patient_id");
            CREATE INDEX "idx_care_contexts_reference" ON "care_contexts"("reference");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_care_contexts_reference";
            DROP INDEX IF EXISTS "idx_care_contexts_patient_id";
            DROP INDEX IF EXISTS "idx_patients_health_id";
            DROP INDEX IF EXISTS "idx_patients_abha_number";
        `);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "care_contexts"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "patients"`);

        // Drop enum type
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."gender_enum"`);
    }
} 