import { IsString, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConsentStatus } from '../../infrastructure/database/entities/enums/ConsentStatus';
import { ConsentRequestMetadata } from './CreateConsentRequestDto';

export class UpdateConsentRequestDto {
    @IsEnum(ConsentStatus)
    @IsOptional()
    status?: ConsentStatus;

    @IsString()
    @IsOptional()
    purpose?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ConsentRequestMetadata)
    metadata?: ConsentRequestMetadata;

    @IsString()
    @IsOptional()
    rejectionReason?: string;
} 