import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne
} from 'typeorm';
import { ConsentRequest } from './ConsentRequest.entity';
import { ConsentDetail, DataCategory } from './ConsentDetail.entity';
import { ConsentStatus } from './enums/ConsentStatus';

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

@Entity('consent_artefacts')
export class ConsentArtefact {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    consentRequestId: string;

    @Column('uuid')
    patientId: string;

    @Column('uuid')
    hiuId: string;

    @Column('uuid')
    hipId: string;

    @Column('jsonb')
    careContexts: string[];

    @Column('text')
    purpose: string;

    @Column('jsonb')
    hip: {
        id: string;
        name: string;
    };

    @Column('jsonb')
    hiu: {
        id: string;
        name: string;
    };

    @Column('jsonb')
    requester: {
        id: string;
        name: string;
        type: string;
    };

    @ManyToOne(() => ConsentDetail)
    @JoinColumn({ name: 'consentDetailId' })
    consentDetail: ConsentDetail;

    @Column('text')
    signature: string;

    @Column('timestamp')
    expiryDate: Date;

    @Column({
        type: 'enum',
        enum: ConsentStatus,
        default: ConsentStatus.REQUESTED
    })
    status: ConsentStatus;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    /**
     * Gets the start date of the consent period
     * @returns The start date or null if not set
     */
    get dateRangeFrom(): Date | null {
        return this.consentDetail?.dateRangeFrom ?? null;
    }

    /**
     * Gets the end date of the consent period
     * @returns The end date or null if not set
     */
    get dateRangeTo(): Date | null {
        return this.consentDetail?.dateRangeTo ?? null;
    }

    /**
     * Gets the list of data categories for this consent
     * @returns Array of data categories or empty array if not set
     */
    get dataCategories(): DataCategory[] {
        return this.consentDetail?.dataCategories ?? [];
    }

    /**
     * Gets the frequency configuration for this consent
     * @returns Frequency object or null if not set
     */
    get frequency(): { unit: string; value: number; repeats: number } | null {
        return this.consentDetail?.frequency ?? null;
    }

    /**
     * Checks if the consent artefact is currently valid
     * @returns true if the consent is valid, false otherwise
     */
    isValid(): boolean {
        const now = new Date();
        const from = this.dateRangeFrom;
        const to = this.dateRangeTo;
        
        if (!from || !to) {
            return false;
        }
        
        return now >= from && now <= to;
    }

    /**
     * Checks if the consent artefact allows access for a specific data category
     * @param category The data category to check
     * @returns true if access is allowed, false otherwise
     */
    allowsAccessTo(category: DataCategory): boolean {
        return this.dataCategories.includes(category);
    }

    /**
     * Gets the remaining access frequency count
     * @returns The number of remaining accesses or null if not applicable
     */
    getRemainingAccess(): number | null {
        if (!this.frequency) {
            return null;
        }
        // Implementation would track access counts and compare with frequency.repeats
        return this.frequency.repeats;
    }
} 