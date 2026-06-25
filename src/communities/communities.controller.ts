import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private communitiesService: CommunitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all communities' })
  findAll() {
    return this.communitiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get community by ID' })
  findOne(@Param('id') id: string) {
    return this.communitiesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create community' })
  create(@Body() dto: CreateCommunityDto, @CurrentUser() user: { id: string }) {
    return this.communitiesService.create(dto, user.id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join community' })
  join(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.communitiesService.join(id, user.id);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave community' })
  leave(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.communitiesService.leave(id, user.id);
  }
}
