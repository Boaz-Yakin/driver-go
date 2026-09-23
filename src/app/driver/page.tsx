'use client';

import React, { useState, useEffect } from 'react';
import { DeliveryService } from '@/services/delivery.service';
import { Delivery, DeliveryStatus } from '@/types';
import { useGpsTracker } from '@/hooks/useGpsTracker';

// 상태 머신 — 드라이버가 순서대로 진행
const NEXT_STATUS: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  PENDING:   'PICKED_UP',
  PICKED_UP: 'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
};

const ACTION_LABEL: Partial<Record<DeliveryStatus, string>> = {
  PENDING:    '▶ Start (Pickup Complete)',
  PICKED_UP:  '🚚 Start Route',
  IN_TRANSIT: '✅ Delivery Complete',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING:    '#a78bfa',
  PICKED_UP:  '#60a5fa',
  IN_TRANSIT: '#38bdf8',
  DELIVERED:  '#4ade80',
  CANCELLED:  '#f87171',
};

export default function DriverPage() {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GPS 운행 중 여부: IN_TRANSIT 상태일 때만 활성화
  const isOnRoute = delivery?.status === 'IN_TRANSIT';

  // GPS 훅 — 배달 ID가 있을 때만 동작 (driver_id가 없어도 테스트 가능하도록)
  useGpsTracker({
    deliveryId: delivery?.id ?? '',
    driverId: delivery?.driver_id ?? 'unassigned-driver',
    isActive: isOnRoute,
  });

  useEffect(() => {
    DeliveryService.getAll()
      .then(all => {
        const active = all.find(
          d => d.status === 'PENDING' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT'
        );
        setDelivery(active ?? null);
      })
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async () => {
    if (!delivery) return;
    const next = NEXT_STATUS[delivery.status];
    if (!next) return;

    setUpdating(true);
    setError(null);
    try {
      const updated = await DeliveryService.updateStatus(delivery.id, next);
      setDelivery(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────
  if (loading) {
    return <div style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ background: '#7f1d1d', borderRadius: 8, padding: 16, color: '#fca5a5' }}>
        <strong>Error</strong><br />{error}
      </div>
    );
  }

  if (!delivery || delivery.status === 'DELIVERED') {
    return (
      <div style={{ textAlign: 'center', marginTop: 60, color: '#fff' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#0f2318', border: '1px solid #166534',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 28,
        }}>✓</div>
        <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
          {delivery?.status === 'DELIVERED' ? 'Delivery Completed!' : 'No Active Deliveries'}
        </h2>
        <p style={{ color: '#888', fontSize: 14 }}>Please contact your dispatcher.</p>
      </div>
    );
  }

  const statusColor = STATUS_COLOR[delivery.status] ?? '#aaa';
  const actionLabel = ACTION_LABEL[delivery.status];
  const canAct = !!actionLabel;

  return (
    <div style={{ color: '#fff', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* GPS 상태 표시 */}
      {isOnRoute && (
        <div style={{
          background: '#0f2318', border: '1px solid #166534',
          borderRadius: 8, padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#4ade80' }}>Live GPS tracking active</span>
        </div>
      )}

      {/* 배송 정보 카드 */}
      <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 16, padding: 20 }}>
        <span style={{
          fontSize: 11, fontWeight: 'bold', letterSpacing: '0.05em',
          color: statusColor, background: `${statusColor}22`,
          padding: '4px 10px', borderRadius: 6,
        }}>
          {delivery.status.replace('_', ' ')}
        </span>

        <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: '12px 0 4px' }}>
          Delivery #{delivery.id.substring(0, 8)}
        </h2>

        {delivery.recipient_phone && (
          <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
            수신자: {delivery.recipient_phone}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 출발지 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#1a1a1a', border: '1px solid #333',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, color: '#ddd' }}>A</span>
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Origin</p>
              <p style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{delivery.origin_address}</p>
            </div>
          </div>

          <div style={{ width: 1, height: 20, background: '#2a2a2a', marginLeft: 16 }} />

          {/* 도착지 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#1a1a1a', border: '1px solid #3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, color: '#3b82f6' }}>B</span>
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Destination</p>
              <p style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>{delivery.destination_address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      {canAct && (
        <button
          onClick={handleAction}
          disabled={updating}
          style={{
            width: '100%', height: 64, borderRadius: 999,
            background: updating ? '#333' : '#3b82f6',
            border: 'none', color: '#fff',
            fontSize: 16, fontWeight: 'bold',
            cursor: updating ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {updating ? 'Processing...' : actionLabel}
        </button>
      )}
    </div>
  );
}
