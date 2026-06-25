import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiPropertyOptional({ example: 'Grupo do Filme' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isGroup?: boolean;

  @ApiProperty({ example: ['uuid1', 'uuid2'] })
  @IsArray()
  @IsString({ each: true })
  participantIds: string[];
}
