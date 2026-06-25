import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCommunityDto } from './dto/create-community.dto';

@Injectable()
export class CommunitiesService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('communities')
      .select('*, community_members(count)');

    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.client
      .from('communities')
      .select('*, community_members(*, users(id, name, avatar_url))')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Community not found');
    return data;
  }

  async create(dto: CreateCommunityDto, userId: string) {
    const { data, error } = await this.supabase.client
      .from('communities')
      .insert({ name: dto.name, description: dto.description, image_url: dto.imageUrl })
      .select()
      .single();

    if (error) throw error;

    await this.supabase.client
      .from('community_members')
      .insert({ community_id: data.id, user_id: userId, role: 'admin' });

    return data;
  }

  async join(communityId: string, userId: string) {
    const { data, error } = await this.supabase.client
      .from('community_members')
      .insert({ community_id: communityId, user_id: userId, role: 'member' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async leave(communityId: string, userId: string) {
    const { data: member } = await this.supabase.client
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single();

    if (member?.role === 'admin') {
      throw new ForbiddenException('Admin cannot leave community');
    }

    const { error } = await this.supabase.client
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
