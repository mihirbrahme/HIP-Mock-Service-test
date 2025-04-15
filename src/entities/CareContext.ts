import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './Patient';

@Entity('care_contexts')
export class CareContext {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, patient => patient.careContexts)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column()
  reference: string;

  @Column()
  display: string;

  @Column('jsonb')
  metadata: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 