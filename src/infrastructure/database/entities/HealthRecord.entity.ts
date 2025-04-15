import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    VersionColumn
} from 'typeorm';
import { Patient } from './Patient.entity';
import { CareContext } from './CareContext.entity';
import { HealthRecordAccess } from './HealthRecordAccess.entity';
import { HealthRecordType } from '../../../services/health-record/types/HealthRecordType';

export enum RecordStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    DELETED = 'DELETED'
}

@Entity('health_records')
export class HealthRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    patientId: string;

    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patientId' })
    patient: Patient;

    @Column('uuid')
    careContextId: string;

    @ManyToOne(() => CareContext)
    @JoinColumn({ name: 'careContextId' })
    careContext: CareContext;

    @Column({
        type: 'enum',
        enum: HealthRecordType
    })
    recordType: HealthRecordType;

    @Column('jsonb')
    data: Record<string, unknown>;

    @Column('jsonb', { nullable: true })
    metadata: Record<string, unknown>;

    @Column({
        type: 'enum',
        enum: RecordStatus,
        default: RecordStatus.ACTIVE
    })
    status: RecordStatus;

    @Column('text', { nullable: true })
    version: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('timestamp', { nullable: true })
    deletedAt: Date | null;

    @OneToMany(() => HealthRecordAccess, access => access.healthRecord)
    accessLogs: HealthRecordAccess[];

    /**
     * Checks if the record is currently active
     * @returns true if the record is active, false otherwise
     */
    isActive(): boolean {
        return this.status === RecordStatus.ACTIVE;
    }

    /**
     * Archives the record
     */
    archive(): void {
        this.status = RecordStatus.ARCHIVED;
        this.updatedAt = new Date();
    }

    /**
     * Soft deletes the record
     */
    softDelete(): void {
        this.status = RecordStatus.DELETED;
        this.deletedAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Updates the record data
     * @param newData The new data to update
     * @param newVersion The new version identifier
     */
    updateData(newData: Record<string, unknown>, newVersion: string): void {
        this.data = newData;
        this.version = newVersion;
        this.updatedAt = new Date();
    }
} 