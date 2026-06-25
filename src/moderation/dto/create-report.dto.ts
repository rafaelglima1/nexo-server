import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ example: 'uuid-of-target' })
  @IsUUID()
  targetId: string;

  @ApiProperty({ example: 'user', enum: ['user', 'message', 'room', 'community'] })
  @IsString()
  targetType: string;

  @ApiProperty({ example: 'harassment', enum: ['harassment', 'spam', 'nudity', 'violence', 'other'] })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'Mensagem ofensiva' })
  @IsString()
  @IsOptional()
  description?: string;
}
