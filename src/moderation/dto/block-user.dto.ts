import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlockUserDto {
  @ApiProperty({ example: 'uuid-of-user-to-block' })
  @IsUUID()
  blockedUserId: string;
}
