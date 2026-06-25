import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ChatService {
  constructor(private supabase: SupabaseService) {}

  async getConversations(userId: string) {
    const { data, error } = await this.supabase.client
      .from('conversation_participants')
      .select('*, conversations(*, conversation_participants(*, users(id, name, avatar_url)), messages(created_at, content, sender_id) )')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  async getMessages(conversationId: string, userId: string, limit = 50) {
    const { data: participant } = await this.supabase.client
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!participant) throw new ForbiddenException('Not a participant');

    const { data, error } = await this.supabase.client
      .from('messages')
      .select('*, users!sender_id(id, name, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async createConversation(dto: CreateConversationDto, userId: string) {
    const { data: conversation, error } = await this.supabase.client
      .from('conversations')
      .insert({ name: dto.name, is_group: dto.isGroup || false })
      .select()
      .single();

    if (error) throw error;

    const participants = [
      { conversation_id: conversation.id, user_id: userId },
      ...dto.participantIds.map((id) => ({ conversation_id: conversation.id, user_id: id })),
    ];

    await this.supabase.client.from('conversation_participants').insert(participants);

    return conversation;
  }

  async sendMessage(dto: SendMessageDto, userId: string) {
    const { data: participant } = await this.supabase.client
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', dto.conversationId)
      .eq('user_id', userId)
      .single();

    if (!participant) throw new ForbiddenException('Not a participant');

    const { data, error } = await this.supabase.client
      .from('messages')
      .insert({
        conversation_id: dto.conversationId,
        sender_id: userId,
        content: dto.content,
      })
      .select('*, users!sender_id(id, name, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  }
}
