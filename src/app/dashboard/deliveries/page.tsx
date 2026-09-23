'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DeliveryService } from '@/services/delivery.service';
import { Delivery, DeliveryStatus } from '@/types';

const STATUS_STYLES: Record<DeliveryStatus, { bg: string; color: string; label: string }> = {
  PENDING:    { bg: '#1c1c2e', color: '#a78bfa', label: 'Pending' },
  PICKED_UP:  { bg: '#1c2338', color: '#60a5fa', label: 'Picked Up' },
  IN_TRANSIT: { bg: '#1c2338', color: '#38bdf8', label: 'In Transit' },
  DELIVERED:  { bg: '#0f2318', color: '#4ade80', label: 'Delivered' },
  CANCELLED:  { bg: '#2a1515', color: '#f87171', label: 'Cancelled' },
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DeliveryStatus | 'ALL'>('ALL');

  useEffect(() => {
    DeliveryService.getAll()
      .then(setDeliveries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? deliveries : deliveries.filter(d => d.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">Deliveries</h1>
        <Link
          href="/dashboard/deliveries/new"
          className="px-4 py-2 rounded-md text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
        >
          + New Delivery
        </Link>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
            style={{
              background: filter === s ? '#3b82f6' : 'transparent',
              color: filter === s ? '#fff' : '#888',
              borderColor: filter === s ? '#3b82f6' : '#333',
            }}
          >
            {s === 'ALL' ? 'All' : STATUS_STYLES[s].label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-surface border border-subtle rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-subtle">
              {['ID', 'Status', 'Origin', 'Destination', 'Recipient', 'Created'].map(h => (
                <th key={h} className="py-3 px-4 text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-muted">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-muted">No deliveries found.</td></tr>
            ) : filtered.map(d => {
              const style = STATUS_STYLES[d.status];
              return (
                <tr key={d.id} className="border-b border-subtle hover:bg-bg-elevated transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-secondary">{d.id.substring(0, 8)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-primary max-w-xs truncate">{d.origin_address}</td>
                  <td className="py-3 px-4 text-sm text-primary max-w-xs truncate">{d.destination_address}</td>
                  <td className="py-3 px-4 text-sm text-secondary">{d.recipient_phone ?? '-'}</td>
                  <td className="py-3 px-4 text-xs text-muted">
                    {new Date(d.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
