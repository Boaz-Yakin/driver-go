import { createClient } from './supabase/client';
import { Delivery } from '@/types';

export const DeliveryService = {
  async getAll(): Promise<Delivery[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Delivery[];
  },

  async create(delivery: Omit<Delivery, 'id' | 'created_at'>): Promise<Delivery> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('deliveries')
      .insert([delivery])
      .select()
      .single();

    if (error) throw error;
    return data as Delivery;
  }
};
