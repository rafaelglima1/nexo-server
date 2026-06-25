import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateReportDto } from './dto/create-report.dto';
import { BlockUserDto } from './dto/block-user.dto';

@Injectable()
export class ModerationService {
  constructor(private supabase: SupabaseService) {}

  async createReport(dto: CreateReportDto, reporterId: string) {
    const { data, error } = await this.supabase.client
      .from('reports')
      .insert({
        reporter_id: reporterId,
        target_id: dto.targetId,
        target_type: dto.targetType,
        type: dto.type,
        description: dto.description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMyReports(userId: string) {
    const { data, error } = await this.supabase.client
      .from('reports')
      .select('*')
      .eq('reporter_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async blockUser(dto: BlockUserDto, userId: string) {
    const { data, error } = await this.supabase.client
      .from('blocked_users')
      .insert({ user_id: userId, blocked_user_id: dto.blockedUserId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async unblockUser(blockedUserId: string, userId: string) {
    const { error } = await this.supabase.client
      .from('blocked_users')
      .delete()
      .eq('user_id', userId)
      .eq('blocked_user_id', blockedUserId);

    if (error) throw error;
  }

  async getBlockedUsers(userId: string) {
    const { data, error } = await this.supabase.client
      .from('blocked_users')
      .select('*, users!blocked_user_id(id, name, avatar_url)')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }
}
