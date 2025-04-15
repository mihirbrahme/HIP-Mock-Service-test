import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum AccessMode {
  VIEW = 'VIEW',
  STORE = 'STORE',
  QUERY = 'QUERY',
  STREAM = 'STREAM'
}

export enum DataCategory {
  OBSERVATION = 'OBSERVATION',
  CONDITION = 'CONDITION',
  PROCEDURE = 'PROCEDURE',
  MEDICATION = 'MEDICATION',
  ALLERGY = 'ALLERGY',
  DOCUMENT = 'DOCUMENT'
}

export interface Frequency {
  unit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  value: number;
  repeats: number;
}

@Entity('consent_details')
export class ConsentDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AccessMode
  })
  accessMode: AccessMode;

  @Column('timestamp')
  dateRangeFrom: Date;

  @Column('timestamp')
  dateRangeTo: Date;

  @Column('jsonb', { nullable: true })
  frequency: Frequency;

  @Column('jsonb')
  dataCategories: DataCategory[];
} 