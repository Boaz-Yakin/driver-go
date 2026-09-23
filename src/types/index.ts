export type Role = 'admin' | 'driver';

export interface User {
  id: string;
  email: string;
  role: Role;
  created_at: string;
}

export type DriverStatus = 'OFF_DUTY' | 'AVAILABLE' | 'ON_ROUTE';

export interface Driver {
  id: string;
  name: string;
  phone_number: string;
  status: DriverStatus;
  created_at: string;
}

export type DeliveryStatus = 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface Delivery {
  id: string;
  driver_id: string | null;
  status: DeliveryStatus;
  origin_address: string;
  destination_address: string;
  planned_eta?: string | null;
  actual_arrival_time?: string | null;
  recipient_phone?: string | null;
  tracking_token?: string | null;
  created_at: string;
}

export interface LocationLog {
  id: number;
  delivery_id: string;
  driver_id: string;
  lat: number;
  lng: number;
  speed: number | null;
  timestamp: string;
}
