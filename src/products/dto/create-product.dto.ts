import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop Dell XPS' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Laptop de alto rendimiento' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'Electrónica' })
  @IsString()
  @IsOptional()
  category?: string;
}
