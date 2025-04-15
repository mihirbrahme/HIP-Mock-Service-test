import { IsString, IsEnum, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { HealthRecordType } from '../../infrastructure/database/entities/enums/HealthRecordType';

class HealthRecordMetadataDto {
    @IsString()
    @IsOptional()
    source?: string;

    @IsString()
    @IsOptional()
    facility?: string;

    @IsString()
    @IsOptional()
    department?: string;

    @IsString()
    @IsOptional()
    practitioner?: string;

    @IsString()
    @IsOptional()
    deviceId?: string;

    @IsString({ each: true })
    @IsOptional()
    tags?: string[];
}

export class CreateHealthRecordDto {
    @IsString()
    patientId: string;

    @IsString()
    careContextId: string;

    @IsEnum(HealthRecordType)
    recordType: HealthRecordType;

    @IsObject()
    data: Record<string, any>;

    @IsOptional()
    @ValidateNested()
    @Type(() => HealthRecordMetadataDto)
    metadata?: HealthRecordMetadataDto;
} 