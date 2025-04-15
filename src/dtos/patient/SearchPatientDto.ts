import { IsString, IsOptional, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchPatientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  abhaNumber?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @IsEnum(['M', 'F', 'O'])
  @IsOptional()
  gender?: 'M' | 'F' | 'O';

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  pincode?: string;
} 