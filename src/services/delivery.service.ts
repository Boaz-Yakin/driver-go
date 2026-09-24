import { Delivery, Driver, DashboardStats } from '@/types';

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

  async getById(id: string): Promise<Delivery> {
    const res = await fetch(`/api/deliveries/${id}`);
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to fetch delivery');
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

  async assignDriver(id: string, driverId: string | null): Promise<Delivery> {
    const res = await fetch(`/api/deliveries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driver_id: driverId }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to assign driver');
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

  async getById(id: string): Promise<Driver> {
    const res = await fetch(`/api/drivers/${id}`);
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to fetch driver');
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

  async updateStatus(id: string, status: Driver['status']): Promise<Driver> {
    const res = await fetch(`/api/drivers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to update driver status');
    }
    return res.json();
  },

  async update(id: string, data: Partial<Driver>): Promise<Driver> {
    const res = await fetch(`/api/drivers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to update driver');
    }
    return res.json();
  },
};

// ─── Dashboard API ─────────────────────────────────────────────────

export const DashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/dashboard/stats');
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to fetch dashboard stats');
    }
    return res.json();
  },
};
