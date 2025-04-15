import { IsString, IsOptional, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export interface SearchPatientDto {
  name?: string;
  abhaId?: string;
  gender?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  email?: string;
  address?: string;
  limit?: number;
  offset?: number;
} 