import { IsString, IsOptional, IsInt, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'Café da Noite' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Conversa descontraída' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'cafe', enum: ['cafe', 'filmes', 'musica', 'conversas', 'cultura', 'jogos'] })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 8 })
  @IsInt()
  @Min(2)
  @Max(20)
  @IsOptional()
  maxParticipants?: number;

  @ApiPropertyOptional({ example: ['Qual foi seu momento favorito?'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  guidedQuestions?: string[];
}
