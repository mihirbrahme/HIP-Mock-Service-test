import { IsEnum, IsOptional, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { HealthRecordType } from '../../infrastructure/database/entities/enums/HealthRecordType';
import { RecordStatus } from '../../infrastructure/database/entities/enums/RecordStatus';

export class QueryHealthRecordDto {
    @IsUUID()
    @IsOptional()
    patientId?: string;

    @IsUUID()
    @IsOptional()
    careContextId?: string;

    @IsEnum(HealthRecordType)
    @IsOptional()
    recordType?: HealthRecordType;

    @IsEnum(RecordStatus)
    @IsOptional()
    status?: RecordStatus;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    fromDate?: Date;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    toDate?: Date;
} 