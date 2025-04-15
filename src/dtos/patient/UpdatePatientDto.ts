import { IsString, IsEnum, IsDate, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsOptional()
  line1?: string;

  @IsString()
  @IsOptional()
  line2?: string;

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

class ContactDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;
}

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @IsEnum(['M', 'F', 'O'])
  @IsOptional()
  gender?: 'M' | 'F' | 'O';

  @ValidateNested()
  @Type(() => ContactDto)
  @IsOptional()
  contact?: ContactDto;
} 