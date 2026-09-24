'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DeliveryService, DriverService } from '@/services/delivery.service';
import { Delivery, DeliveryStatus, Driver } from '@/types';
import { Card } from '@/components/ui/Card';

// ─── 상태 스타일 맵 ───────────────────────────────────────────────
const STATUS_STYLES: Record<DeliveryStatus, { bg: string; color: string; label: string }> = {
  PENDING:    { bg: '#1c1c2e', color: '#a78bfa', label: 'Pending' },
  PICKED_UP:  { bg: '#1c2338', color: '#60a5fa', label: 'Picked Up' },
  IN_TRANSIT: { bg: '#1c2338', color: '#38bdf8', label: 'In Transit' },
  DELIVERED:  { bg: '#0f2318', color: '#4ade80', label: 'Delivered' },
  CANCELLED:  { bg: '#2a1515', color: '#f87171', label: 'Cancelled' },
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-subtle last:border-0">
      <span className="text-xs font-medium text-muted uppercase tracking-wider">{label}</span>
      <span className="text-sm text-primary">{value}</span>
    </div>
  );
}

export default function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([DeliveryService.getById(id), DriverService.getAll()])
      .then(([delRes, drvRes]) => {
        setDelivery(delRes);
        setDrivers(drvRes);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load delivery data');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAssignDriver = async (driverId: string) => {
    if (!delivery) return;
    try {
      const updated = await DeliveryService.assignDriver(delivery.id, driverId || null);
      setDelivery({ 
        ...delivery, 
        driver_id: updated.driver_id, 
        driver: drivers.find(drv => drv.id === driverId) || null 
      });
    } catch (error) {
      console.error('Failed to assign driver', error);
      alert('Failed to assign driver');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted">Loading delivery...</p>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm text-status-error">{error ?? 'Delivery not found.'}</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-accent underline hover:opacity-80"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const style = STATUS_STYLES[delivery.status];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-muted hover:text-primary transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-primary">Delivery Detail</h1>
          <p className="text-xs font-mono text-muted mt-0.5">{delivery.id}</p>
        </div>
      </div>

      {/* 상태 배지 */}
      <span
        className="inline-block rounded-full px-3 py-1 text-sm font-medium"
        style={{ background: style.bg, color: style.color }}
      >
        {style.label}
      </span>

      {/* 상세 정보 카드 */}
      <Card>
        <h2 className="text-sm font-semibold text-primary mb-2">Route</h2>
        <DetailRow label="Origin" value={delivery.origin_address} />
        <DetailRow label="Destination" value={delivery.destination_address} />
        {delivery.planned_eta && (
          <DetailRow
            label="Planned ETA"
            value={new Date(delivery.planned_eta).toLocaleString()}
          />
        )}
        {delivery.actual_arrival_time && (
          <DetailRow
            label="Actual Arrival"
            value={new Date(delivery.actual_arrival_time).toLocaleString()}
          />
        )}
        <DetailRow
          label="Created"
          value={new Date(delivery.created_at).toLocaleString()}
        />
      </Card>

      {/* 드라이버 카드 */}
      <Card>
        <h2 className="text-sm font-semibold text-primary mb-2">Driver</h2>
        {delivery.driver ? (
          <>
            <DetailRow label="Name" value={delivery.driver.name} />
            <DetailRow label="Status" value={delivery.driver.status.replace('_', ' ')} />
          </>
        ) : (
          <div className="flex flex-col gap-1 py-3">
            <span className="text-xs font-medium text-muted uppercase tracking-wider">Assign Driver</span>
            <select
              value={delivery.driver_id || ''}
              onChange={(e) => handleAssignDriver(e.target.value)}
              className="bg-bg-elevated border border-default rounded px-3 py-2 text-sm text-primary focus:border-accent outline-none w-full max-w-xs"
            >
              <option value="">Unassigned</option>
              {drivers.map(drv => (
                <option key={drv.id} value={drv.id}>
                  {drv.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </Card>

      {/* 수신자 카드 */}
      <Card>
        <h2 className="text-sm font-semibold text-primary mb-2">Recipient</h2>
        <DetailRow
          label="Phone"
          value={delivery.recipient_phone ?? <span className="text-muted italic">Not provided</span>}
        />
        {delivery.tracking_token && (
          <DetailRow label="Tracking Token" value={
            <span className="font-mono text-xs">{delivery.tracking_token}</span>
          } />
        )}
      </Card>
    </div>
  );
}
