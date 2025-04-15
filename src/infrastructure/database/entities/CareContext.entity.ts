import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Patient } from './Patient.entity';
import { HealthRecord } from './HealthRecord.entity';

@Entity('care_contexts')
export class CareContext {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Patient, patient => patient.careContexts)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ name: 'patient_id' })
    patientId: string;

    @Column({ name: 'care_context_reference', type: 'varchar', length: 100 })
    reference: string;

    @Column({ type: 'varchar', length: 100 })
    display: string;

    @OneToMany(() => HealthRecord, healthRecord => healthRecord.careContext)
    healthRecords: HealthRecord[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 