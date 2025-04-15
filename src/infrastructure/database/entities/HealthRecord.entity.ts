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
import { HealthRecordType } from './enums/HealthRecordType';
import { RecordStatus } from './enums/RecordStatus';

@Entity('health_records')
export class HealthRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Patient, patient => patient.healthRecords)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ name: 'patient_id' })
    patientId: string;

    @ManyToOne(() => CareContext, careContext => careContext.healthRecords)
    @JoinColumn({ name: 'care_context_id' })
    careContext: CareContext;

    @Column({ name: 'care_context_id' })
    careContextId: string;

    @Column({
        type: 'enum',
        enum: HealthRecordType,
        name: 'record_type'
    })
    recordType: HealthRecordType;

    @Column({ type: 'jsonb' })
    data: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    metadata: {
        source?: string;
        facility?: string;
        department?: string;
        practitioner?: string;
        deviceId?: string;
        tags?: string[];
    };

    @Column({
        type: 'enum',
        enum: RecordStatus,
        default: RecordStatus.ACTIVE
    })
    status: RecordStatus;

    @VersionColumn()
    version: number;

    @OneToMany(() => HealthRecordAccess, access => access.healthRecord)
    accessLogs: HealthRecordAccess[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    /**
     * Checks if the record is accessible
     */
    isAccessible(): boolean {
        return this.status === RecordStatus.ACTIVE;
    }

    /**
     * Archives the record
     */
    archive(): void {
        this.status = RecordStatus.ARCHIVED;
    }

    /**
     * Soft deletes the record
     */
    softDelete(): void {
        this.status = RecordStatus.DELETED;
    }
} 