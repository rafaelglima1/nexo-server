import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('events')
      .select('*, event_participants(count)')
      .order('event_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.client
      .from('events')
      .select('*, event_participants(*, users(id, name, avatar_url))')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Event not found');
    return data;
  }

  async create(dto: CreateEventDto) {
    const { data, error } = await this.supabase.client
      .from('events')
      .insert({
        title: dto.title,
        description: dto.description,
        event_date: dto.eventDate,
        image_url: dto.imageUrl,
        is_seasonal: dto.isSeasonal || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async join(eventId: string, userId: string) {
    const { data, error } = await this.supabase.client
      .from('event_participants')
      .insert({ event_id: eventId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async leave(eventId: string, userId: string) {
    const { error } = await this.supabase.client
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
