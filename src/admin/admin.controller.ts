import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getUsers(
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page ? parseInt(page) : 1, 20, search);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban user' })
  banUser(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.adminService.banUser(id, body.reason);
  }

  @Post('users/:id/unban')
  @ApiOperation({ summary: 'Unban user' })
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Set user role' })
  setRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.adminService.setRole(id, body.role);
  }

  @Get('reports')
  @ApiOperation({ summary: 'List all reports' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  getReports(
    @Query('page') page?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getReports(page ? parseInt(page) : 1, 20, status);
  }

  @Patch('reports/:id')
  @ApiOperation({ summary: 'Update report status' })
  updateReportStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updateReportStatus(id, body.status);
  }

  @Get('communities')
  @ApiOperation({ summary: 'List all communities' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getCommunities(
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getCommunities(page ? parseInt(page) : 1, 20, search);
  }

  @Delete('communities/:id')
  @ApiOperation({ summary: 'Delete community' })
  deleteCommunity(@Param('id') id: string) {
    return this.adminService.deleteCommunity(id);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'List all rooms' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'live', required: false, type: Boolean })
  getRooms(
    @Query('page') page?: string,
    @Query('live') live?: string,
  ) {
    return this.adminService.getRooms(
      page ? parseInt(page) : 1,
      20,
      live === 'true' ? true : live === 'false' ? false : undefined,
    );
  }

  @Post('rooms/:id/end')
  @ApiOperation({ summary: 'End room' })
  endRoom(@Param('id') id: string) {
    return this.adminService.endRoom(id);
  }

  @Get('events')
  @ApiOperation({ summary: 'List all events' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getEvents(@Query('page') page?: string) {
    return this.adminService.getEvents(page ? parseInt(page) : 1, 20);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete event' })
  deleteEvent(@Param('id') id: string) {
    return this.adminService.deleteEvent(id);
  }
}
