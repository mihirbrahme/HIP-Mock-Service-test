export enum ConsentStatus {
    REQUESTED = 'REQUESTED',
    GRANTED = 'GRANTED',
    DENIED = 'DENIED',
    EXPIRED = 'EXPIRED',
    REVOKED = 'REVOKED'
}

export interface ConsentMetadata {
    purpose: string;
    dateRange?: {
        from: Date;
        to: Date;
    };
    dataCategories?: string[];
    departments?: string[];
    additionalNotes?: string;
} 