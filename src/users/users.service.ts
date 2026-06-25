import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  async create(dto: CreateUserDto) {
    const { data, error } = await this.supabase.client
      .from('users')
      .insert({ email: dto.email, password_hash: dto.passwordHash, name: dto.name })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('User not found');
    return data;
  }

  async findByEmail(email: string) {
    const { data } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    return data;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);
    const { data, error } = await this.supabase.client
      .from('users')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProfile(id: string) {
    const { data, error } = await this.supabase.client
      .from('users')
      .select('*, user_interests(*, interests(*))')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('User not found');
    return data;
  }

  async setInterests(userId: string, interestIds: string[]) {
    await this.supabase.client
      .from('user_interests')
      .delete()
      .eq('user_id', userId);

    if (!interestIds || interestIds.length === 0) return [];

    const rows = interestIds.map((id) => ({ user_id: userId, interest_id: id }));
    const { data, error } = await this.supabase.client
      .from('user_interests')
      .insert(rows)
      .select();

    if (error) throw error;
    return data;
  }
}
