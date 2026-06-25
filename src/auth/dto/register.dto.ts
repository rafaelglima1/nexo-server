import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'ana@nexo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ana Silva' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  password: string;
}
