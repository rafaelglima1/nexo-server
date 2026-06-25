import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Festa Junina Online' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Celebração junina virtual' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-06-24T20:00:00Z' })
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isSeasonal?: boolean;
}
