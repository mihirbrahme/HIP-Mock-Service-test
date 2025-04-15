import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CareContext } from './CareContext';

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    UNKNOWN = 'unknown'
}

@Entity('patients')
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    abhaNumber: string;

    @Column()
    name: string;

    @Column({ type: 'date' })
    dateOfBirth: Date;

    @Column({
        type: 'enum',
        enum: Gender,
        default: Gender.UNKNOWN
    })
    gender: Gender;

    @Column('jsonb')
    contact: {
        mobile?: string;
        email?: string;
        address?: {
            line1?: string;
            line2?: string;
            district?: string;
            state?: string;
            pincode?: string;
        };
    };

    @OneToMany(() => CareContext, careContext => careContext.patient)
    careContexts: CareContext[];

    @Column('jsonb', { nullable: true })
    identifiers?: {
        type: string;
        value: string;
    }[];

    @Column({ nullable: true })
    healthId?: string;

    @Column('jsonb', { nullable: true })
    tags?: Record<string, string>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: true })
    isActive: boolean;
} 