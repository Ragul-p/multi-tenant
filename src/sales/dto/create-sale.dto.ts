import { ArrayMinSize, IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
export class SaleLineDto { @IsUUID() productId: string; @IsInt() @Min(1) quantity: number; }
export class CreateSaleDto { @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => SaleLineDto) items: SaleLineDto[]; }
