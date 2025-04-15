import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn
} from 'typeorm';
import { HealthRecord } from './HealthRecord.entity';
import { ConsentArtefact } from './ConsentArtefact.entity';

export enum AccessType {
    VIEW = 'VIEW',
    DOWNLOAD = 'DOWNLOAD'
}

@Entity('health_record_access')
export class HealthRecordAccess {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => HealthRecord, healthRecord => healthRecord.accessLogs)
    @JoinColumn({ name: 'health_record_id' })
    healthRecord: HealthRecord;

    @Column({ name: 'health_record_id' })
    healthRecordId: string;

    @ManyToOne(() => ConsentArtefact)
    @JoinColumn({ name: 'consent_artefact_id' })
    consentArtefact: ConsentArtefact;

    @Column({ name: 'consent_artefact_id' })
    consentArtefactId: string;

    @Column({ name: 'accessed_by' })
    accessedBy: string;

    @Column({
        type: 'enum',
        enum: AccessType,
        name: 'access_type'
    })
    accessType: AccessType;

    @Column({ type: 'text' })
    purpose: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: {
        ipAddress?: string;
        userAgent?: string;
        deviceId?: string;
    };

    @CreateDateColumn({ name: 'accessed_at' })
    accessedAt: Date;
} 