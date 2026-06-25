import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string) {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }

  async findUnread(userId: string) {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async create(dto: CreateNotificationDto) {
    const { data, error } = await this.supabase.client
      .from('notifications')
      .insert({ user_id: dto.userId, title: dto.title, body: dto.body, type: dto.type })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async markAsRead(id: string, userId: string) {
    const { error } = await this.supabase.client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async markAllAsRead(userId: string) {
    const { error } = await this.supabase.client
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  async registerToken(userId: string, token: string) {
    const { error } = await this.supabase.client
      .from('device_tokens')
      .upsert({ user_id: userId, token, platform: 'android' }, { onConflict: 'token' });

    if (error) throw error;
    return { message: 'Token registrado' };
  }
}
