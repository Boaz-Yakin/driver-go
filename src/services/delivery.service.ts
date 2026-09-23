import { Delivery, Driver } from '@/types';

// ─── Delivery API ─────────────────────────────────────────────────

export const DeliveryService = {
  async getAll(): Promise<Delivery[]> {
    const res = await fetch('/api/deliveries');
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to fetch deliveries');
    }
    return res.json();
  },

  async create(delivery: Omit<Delivery, 'id' | 'created_at'>): Promise<Delivery> {
    const res = await fetch('/api/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(delivery),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to create delivery');
    }
    return res.json();
  },

  async updateStatus(id: string, status: Delivery['status']): Promise<Delivery> {
    const res = await fetch(`/api/deliveries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to update delivery');
    }
    return res.json();
  },
};

// ─── Driver API ───────────────────────────────────────────────────

export const DriverService = {
  async getAll(): Promise<Driver[]> {
    const res = await fetch('/api/drivers');
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to fetch drivers');
    }
    return res.json();
  },

  async create(driver: Omit<Driver, 'id' | 'created_at'>): Promise<Driver> {
    const res = await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(driver),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to create driver');
    }
    return res.json();
  },
};
