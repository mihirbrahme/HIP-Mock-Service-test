import { 
    IsString, 
    IsNotEmpty, 
    IsEnum, 
    IsArray, 
    IsDateString, 
    ValidateNested,
    IsNumber,
    IsOptional,
    Min,
    ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccessMode } from '../../infrastructure/database/entities/ConsentArtefact.entity';

export class FrequencyDto {
    @IsEnum(['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'])
    unit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

    @IsNumber()
    @Min(1)
    value: number;

    @IsNumber()
    @Min(1)
    repeats: number;
}

export class HiTypeDto {
    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    version: string;
}

export class DataCategoryDto {
    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HiTypeDto)
    @ArrayMinSize(1)
    hiTypes: HiTypeDto[];
}

export class CreateConsentArtefactDto {
    @IsString()
    @IsNotEmpty()
    consentRequestId: string;

    @IsString()
    @IsNotEmpty()
    signature: string;

    @IsEnum(AccessMode)
    accessMode: AccessMode;

    @IsDateString()
    @IsNotEmpty()
    dateRangeFrom: string;

    @IsDateString()
    @IsNotEmpty()
    dateRangeTo: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => FrequencyDto)
    frequency?: FrequencyDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DataCategoryDto)
    @ArrayMinSize(1)
    dataCategories: DataCategoryDto[];
}

export class ConsentArtefactResponseDto extends CreateConsentArtefactDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsDateString()
    createdAt: string;

    @IsDateString()
    updatedAt: string;
}

export class ConsentArtefactSummaryDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    consentRequestId: string;

    @IsEnum(AccessMode)
    accessMode: AccessMode;

    @IsDateString()
    dateRangeFrom: string;

    @IsDateString()
    dateRangeTo: string;

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    categories: string[];
} 