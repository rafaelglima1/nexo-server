import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseService) {}

  async getDashboard() {
    const [users, communities, rooms, events, reports] = await Promise.all([
      this.supabase.client.from('users').select('id', { count: 'exact', head: true }),
      this.supabase.client.from('communities').select('id', { count: 'exact', head: true }),
      this.supabase.client.from('rooms').select('id', { count: 'exact', head: true }),
      this.supabase.client.from('events').select('id', { count: 'exact', head: true }),
      this.supabase.client.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    return {
      totalUsers: users.count || 0,
      totalCommunities: communities.count || 0,
      totalRooms: rooms.count || 0,
      totalEvents: events.count || 0,
      pendingReports: reports.count || 0,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const offset = (page - 1) * limit;

    let query = this.supabase.client
      .from('users')
      .select('id, email, name, role, is_banned, is_verified, created_at', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      users: data,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async getUser(id: string) {
    const { data, error } = await this.supabase.client
      .from('users')
      .select('*, user_interests(*, interests(*))')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Usuário não encontrado');
    return data;
  }

  async banUser(id: string, reason?: string) {
    const { error } = await this.supabase.client
      .from('users')
      .update({ is_banned: true, ban_reason: reason || 'Violação dos termos de uso' })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Usuário banido com sucesso' };
  }

  async unbanUser(id: string) {
    const { error } = await this.supabase.client
      .from('users')
      .update({ is_banned: false, ban_reason: null })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Usuário desbanido com sucesso' };
  }

  async setRole(id: string, role: string) {
    if (!['user', 'moderator', 'admin'].includes(role)) {
      throw new BadRequestException('Role inválida');
    }

    const { error } = await this.supabase.client
      .from('users')
      .update({ role })
      .eq('id', id);

    if (error) throw error;
    return { message: `Role atualizada para ${role}` };
  }

  async getReports(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;

    let query = this.supabase.client
      .from('reports')
      .select('*, users!reporter_id(name, email)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      reports: data,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async updateReportStatus(id: string, status: string) {
    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      throw new BadRequestException('Status inválido');
    }

    const { error } = await this.supabase.client
      .from('reports')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Reporte atualizado com sucesso' };
  }

  async getCommunities(page = 1, limit = 20, search?: string) {
    const offset = (page - 1) * limit;

    let query = this.supabase.client
      .from('communities')
      .select('*, community_members(id)', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const communities = (data || []).map((c: any) => ({
      ...c,
      member_count: c.community_members?.length || 0,
      community_members: undefined,
    }));

    return {
      communities,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async deleteCommunity(id: string) {
    const { error } = await this.supabase.client.from('communities').delete().eq('id', id);
    if (error) throw error;
    return { message: 'Comunidade removida com sucesso' };
  }

  async getRooms(page = 1, limit = 20, live?: boolean) {
    const offset = (page - 1) * limit;

    let query = this.supabase.client
      .from('rooms')
      .select('*, users!host_id(name, email), room_participants(id)', { count: 'exact' });

    if (live !== undefined) {
      query = query.eq('is_live', live);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const rooms = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      is_live: r.is_live,
      host_name: r.users?.name || r.users?.email || 'Desconhecido',
      participant_count: r.room_participants?.length || 0,
      max_participants: r.max_participants,
      created_at: r.created_at,
    }));

    return {
      rooms,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async endRoom(id: string) {
    const { error } = await this.supabase.client
      .from('rooms')
      .update({ is_live: false })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Sala encerrada com sucesso' };
  }

  async getEvents(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { data, count, error } = await this.supabase.client
      .from('events')
      .select('*, event_participants(id)', { count: 'exact' })
      .order('event_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const events = (data || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      event_date: e.event_date,
      is_seasonal: e.is_seasonal,
      participant_count: e.event_participants?.length || 0,
      created_at: e.created_at,
    }));

    return {
      events,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async deleteEvent(id: string) {
    const { error } = await this.supabase.client.from('events').delete().eq('id', id);
    if (error) throw error;
    return { message: 'Evento removido com sucesso' };
  }
}
