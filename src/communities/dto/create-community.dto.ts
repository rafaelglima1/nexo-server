import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommunityDto {
  @ApiProperty({ example: 'Cinefilos Unidos' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Comunidade para amantes de cinema' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: ['cinema', 'series'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interestIds?: string[];
}
