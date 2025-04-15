import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CareContext } from './CareContext.entity';
import { ConsentRequest } from './ConsentRequest.entity';
import { HealthRecord } from './HealthRecord.entity';

export enum Gender {
    MALE = 'M',
    FEMALE = 'F',
    OTHER = 'O'
}

@Entity('patients')
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'abha_number', type: 'varchar', length: 50, unique: true })
    abhaNumber: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ 
        type: 'enum',
        enum: Gender,
        default: Gender.OTHER
    })
    gender: Gender;

    @Column({ name: 'date_of_birth', type: 'date' })
    dateOfBirth: Date;

    @Column({ type: 'jsonb', nullable: true })
    contact: {
        phone?: string;
        email?: string;
        address?: {
            line1?: string;
            line2?: string;
            district?: string;
            state?: string;
            pincode?: string;
        };
    };

    @Column({ type: 'jsonb', nullable: true })
    identifiers?: {
        type: string;
        value: string;
    }[];

    @Column({ name: 'health_id', type: 'varchar', length: 50, nullable: true })
    healthId?: string;

    @Column({ type: 'jsonb', nullable: true })
    tags?: Record<string, string>;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @OneToMany(() => CareContext, careContext => careContext.patient)
    careContexts: CareContext[];

    @OneToMany(() => ConsentRequest, consentRequest => consentRequest.patient)
    consentRequests: ConsentRequest[];

    @OneToMany(() => HealthRecord, healthRecord => healthRecord.patient)
    healthRecords: HealthRecord[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
} 