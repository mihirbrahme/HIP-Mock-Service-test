import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
} from 'typeorm';
import { ConsentRequest } from './ConsentRequest.entity';

export enum AccessMode {
    VIEW = 'VIEW',
    STORE = 'STORE',
    QUERY = 'QUERY',
    STREAM = 'STREAM'
}

export interface Frequency {
    unit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    value: number;
    repeats: number;
}

export interface HiType {
    type: string;
    version: string;
}

export interface DataCategory {
    category: string;
    description: string;
    hiTypes: HiType[];
}

@Entity('consent_artefacts')
export class ConsentArtefact {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'consent_request_id', type: 'uuid' })
    consentRequestId: string;

    @OneToOne(() => ConsentRequest, request => request.consentArtefact)
    @JoinColumn({ name: 'consent_request_id' })
    consentRequest: ConsentRequest;

    @Column()
    signature: string;

    @Column({
        name: 'access_mode',
        type: 'enum',
        enum: AccessMode
    })
    accessMode: AccessMode;

    @Column({ name: 'date_range_from', type: 'timestamp' })
    dateRangeFrom: Date;

    @Column({ name: 'date_range_to', type: 'timestamp' })
    dateRangeTo: Date;

    @Column({
        type: 'jsonb',
        nullable: true
    })
    frequency: Frequency;

    @Column({
        name: 'data_categories',
        type: 'jsonb'
    })
    dataCategories: DataCategory[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    /**
     * Checks if the consent artefact is currently valid
     */
    isValid(): boolean {
        const now = new Date();
        return now >= this.dateRangeFrom && now <= this.dateRangeTo;
    }

    /**
     * Checks if the consent artefact allows access for a specific data category
     */
    allowsAccessTo(category: string): boolean {
        return this.dataCategories.some(dc => dc.category === category);
    }

    /**
     * Gets the remaining access frequency count
     */
    getRemainingAccess(): number | null {
        if (!this.frequency) return null;
        // Implementation would track access counts and compare with frequency.repeats
        return this.frequency.repeats;
    }
} 