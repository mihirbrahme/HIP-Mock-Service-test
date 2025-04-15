import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './Patient';

@Entity('care_contexts')
export class CareContext {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    patientId: string;

    @ManyToOne(() => Patient, patient => patient.careContexts)
    @JoinColumn({ name: 'patientId' })
    patient: Patient;

    @Column()
    reference: string;

    @Column()
    display: string;

    @Column('jsonb', { nullable: true })
    metadata?: Record<string, unknown>;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ default: true })
    isActive: boolean;
} 