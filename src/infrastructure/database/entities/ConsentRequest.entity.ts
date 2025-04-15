import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
} from 'typeorm';
import { Patient } from './Patient.entity';
import { ConsentArtefact } from './ConsentArtefact.entity';
import { ConsentStatus } from './enums/ConsentStatus';

@Entity('consent_requests')
export class ConsentRequest {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'patient_id', type: 'uuid' })
    patientId: string;

    @ManyToOne(() => Patient, patient => patient.consentRequests)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ name: 'requester_nid' })
    requesterNid: string;

    @Column()
    purpose: string;

    @Column({ name: 'hip_id' })
    hipId: string;

    @Column({ name: 'hiu_id' })
    hiuId: string;

    @Column({ name: 'request_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    requestDate: Date;

    @Column({ name: 'expiry_date', type: 'timestamp' })
    expiryDate: Date;

    @Column({
        type: 'enum',
        enum: ConsentStatus,
        default: ConsentStatus.REQUESTED
    })
    status: ConsentStatus;

    @Column({ type: 'jsonb', nullable: true })
    metadata?: {
        department?: string;
        doctorId?: string;
        speciality?: string;
        careContextReference?: string;
    };

    @OneToOne(() => ConsentArtefact, (artefact: ConsentArtefact) => artefact.consentRequest)
    consentArtefact: ConsentArtefact;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    /**
     * Checks if the consent request has expired
     */
    isExpired(): boolean {
        return this.expiryDate < new Date();
    }

    /**
     * Checks if the consent request can be granted
     */
    canBeGranted(): boolean {
        return this.status === ConsentStatus.REQUESTED && !this.isExpired();
    }

    /**
     * Checks if the consent request can be revoked
     */
    canBeRevoked(): boolean {
        return this.status === ConsentStatus.GRANTED && !this.isExpired();
    }
} 