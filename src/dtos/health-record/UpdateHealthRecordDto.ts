import { IsEnum, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { HealthRecordType } from '../../infrastructure/database/entities/enums/HealthRecordType';
import { RecordStatus } from '../../infrastructure/database/entities/enums/RecordStatus';

export class UpdateHealthRecordMetadataDto {
    @IsOptional()
    source?: string;

    @IsOptional()
    facility?: string;

    @IsOptional()
    department?: string;

    @IsOptional()
    practitioner?: string;

    @IsOptional()
    deviceId?: string;

    @IsOptional()
    tags?: string[];
}

export class UpdateHealthRecordDto {
    @IsOptional()
    @IsEnum(HealthRecordType)
    recordType?: HealthRecordType;

    @IsOptional()
    @IsObject()
    data?: Record<string, any>;

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateHealthRecordMetadataDto)
    metadata?: UpdateHealthRecordMetadataDto;

    @IsOptional()
    @IsEnum(RecordStatus)
    status?: RecordStatus;
} 