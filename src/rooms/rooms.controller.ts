import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'List all rooms' })
  @ApiQuery({ name: 'live', required: false, type: Boolean })
  findAll(@Query('live') live?: string) {
    return this.roomsService.findAll(live === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create room' })
  create(@Body() dto: CreateRoomDto, @CurrentUser() user: { id: string }) {
    return this.roomsService.create(dto, user.id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join room' })
  join(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.roomsService.join(id, user.id);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave room' })
  leave(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.roomsService.leave(id, user.id);
  }

  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End room (host only)' })
  endRoom(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.roomsService.endRoom(id, user.id);
  }

  @Post(':id/token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate Agora token for room' })
  generateToken(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.roomsService.generateAgoraToken(id, user.id);
  }
}
