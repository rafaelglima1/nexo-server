import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {}

  async findAll(liveOnly = false) {
    let query = this.supabase.client
      .from('rooms')
      .select('*, users!host_id(id, name, avatar_url), room_participants(count)');

    if (liveOnly) query = query.eq('is_live', true);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.client
      .from('rooms')
      .select('*, users!host_id(id, name, avatar_url), room_participants(*, users(id, name, avatar_url))')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Room not found');
    return data;
  }

  async create(dto: CreateRoomDto, userId: string) {
    const { data, error } = await this.supabase.client
      .from('rooms')
      .insert({
        title: dto.title,
        description: dto.description,
        category: dto.category,
        host_id: userId,
        max_participants: dto.maxParticipants || 8,
        guided_questions: dto.guidedQuestions || [],
        is_live: true,
      })
      .select()
      .single();

    if (error) throw error;

    await this.supabase.client
      .from('room_participants')
      .insert({ room_id: data.id, user_id: userId });

    return data;
  }

  async join(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    if (room.room_participants.length >= room.max_participants) {
      throw new ForbiddenException('Room is full');
    }

    const { data, error } = await this.supabase.client
      .from('room_participants')
      .insert({ room_id: roomId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async leave(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    if (room.host_id === userId) {
      throw new ForbiddenException('Host cannot leave room');
    }

    const { error } = await this.supabase.client
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async endRoom(roomId: string, userId: string) {
    const room = await this.findById(roomId);

    if (room.host_id !== userId) {
      throw new ForbiddenException('Only host can end room');
    }

    const { data, error } = await this.supabase.client
      .from('rooms')
      .update({ is_live: false })
      .eq('id', roomId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async generateAgoraToken(roomId: string, userId: string) {
    const appId = this.config.get<string>('AGORA_APP_ID');
    const certificate = this.config.get<string>('AGORA_CERTIFICATE');

    if (!appId) {
      return { token: '', appId: '', channelName: roomId };
    }

    return {
      token: '',
      appId,
      channelName: roomId,
    };
  }
}
