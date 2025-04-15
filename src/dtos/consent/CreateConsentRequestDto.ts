import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConsentRequestDto {
    @IsUUID()
    @IsNotEmpty()
    patientId: string;

    @IsString()
    @IsNotEmpty()
    requesterNid: string;

    @IsString()
    @IsNotEmpty()
    purpose: string;

    @IsString()
    @IsNotEmpty()
    hipId: string;

    @IsString()
    @IsNotEmpty()
    hiuId: string;

    @IsDateString()
    @IsNotEmpty()
    expiryDate: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ConsentRequestMetadata)
    metadata?: ConsentRequestMetadata;
}

export class ConsentRequestMetadata {
    @IsString()
    @IsOptional()
    department?: string;

    @IsString()
    @IsOptional()
    doctorId?: string;

    @IsString()
    @IsOptional()
    speciality?: string;

    @IsString()
    @IsOptional()
    careContextReference?: string;
} 