import { IsEnum, IsString, IsUUID, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AccessType } from '../../infrastructure/database/entities/HealthRecordAccess.entity';

class AccessMetadataDto {
    @IsString()
    @IsOptional()
    ipAddress?: string;

    @IsString()
    @IsOptional()
    userAgent?: string;

    @IsString()
    @IsOptional()
    deviceId?: string;
}

export class LogHealthRecordAccessDto {
    @IsUUID()
    healthRecordId: string;

    @IsUUID()
    consentArtefactId: string;

    @IsString()
    accessedBy: string;

    @IsEnum(AccessType)
    accessType: AccessType;

    @IsString()
    purpose: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => AccessMetadataDto)
    metadata?: AccessMetadataDto;
} 