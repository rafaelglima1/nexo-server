import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'Café da Noite' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Começa em 30 minutos!' })
  @IsString()
  body: string;

  @ApiProperty({ example: 'event', enum: ['event', 'friend', 'recommendation', 'social', 'seasonal'] })
  @IsString()
  type: string;
}
