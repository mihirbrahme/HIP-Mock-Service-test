import { IsString, IsEnum, IsDateString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';
import { Gender } from '@/infrastructure/database/entities/enums/Gender';

export class CreatePatientDto {
    @IsString()
    abhaNumber: string;

    @IsString()
    name: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsDateString()
    dateOfBirth: string;

    @IsPhoneNumber()
    @IsOptional()
    phone?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    address?: string;
} 