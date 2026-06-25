import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModerationService } from './moderation.service';
import { CreateReportDto } from './dto/create-report.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Moderation')
@Controller('moderation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Post('reports')
  @ApiOperation({ summary: 'Create report' })
  createReport(@Body() dto: CreateReportDto, @CurrentUser() user: { id: string }) {
    return this.moderationService.createReport(dto, user.id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get my reports' })
  getMyReports(@CurrentUser() user: { id: string }) {
    return this.moderationService.getMyReports(user.id);
  }

  @Post('block')
  @ApiOperation({ summary: 'Block user' })
  blockUser(@Body() dto: BlockUserDto, @CurrentUser() user: { id: string }) {
    return this.moderationService.blockUser(dto, user.id);
  }

  @Delete('block/:blockedUserId')
  @ApiOperation({ summary: 'Unblock user' })
  unblockUser(
    @Param('blockedUserId') blockedUserId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.moderationService.unblockUser(blockedUserId, user.id);
  }

  @Get('blocked')
  @ApiOperation({ summary: 'Get blocked users' })
  getBlockedUsers(@CurrentUser() user: { id: string }) {
    return this.moderationService.getBlockedUsers(user.id);
  }
}
