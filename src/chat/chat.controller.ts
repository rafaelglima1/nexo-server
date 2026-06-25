import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'List user conversations' })
  getConversations(@CurrentUser() user: { id: string }) {
    return this.chatService.getConversations(user.id);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Create conversation' })
  createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.chatService.createConversation(dto, user.id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in conversation' })
  getMessages(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(id, user.id, limit ? parseInt(limit) : 50);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send message' })
  sendMessage(@Body() dto: SendMessageDto, @CurrentUser() user: { id: string }) {
    return this.chatService.sendMessage(dto, user.id);
  }
}
