import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CareContext } from './CareContext';

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
    enum: ['M', 'F', 'O'],
    comment: 'M: Male, F: Female, O: Other'
  })
  gender: 'M' | 'F' | 'O';

  @Column('jsonb')
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

  @OneToMany(() => CareContext, careContext => careContext.patient)
  careContexts: CareContext[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 