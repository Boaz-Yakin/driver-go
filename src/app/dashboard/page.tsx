'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { DeliveryService, DashboardService } from '@/services/delivery.service';
import { Delivery, DashboardStats, DeliveryStatus } from '@/types';

// ─── 상태 스타일 맵 ───────────────────────────────────────────────
const STATUS_STYLES: Record<DeliveryStatus, { bg: string; color: string; label: string }> = {
  PENDING:    { bg: '#1c1c2e', color: '#a78bfa', label: 'Pending' },
  PICKED_UP:  { bg: '#1c2338', color: '#60a5fa', label: 'Picked Up' },
  IN_TRANSIT: { bg: '#1c2338', color: '#38bdf8', label: 'In Transit' },
  DELIVERED:  { bg: '#0f2318', color: '#4ade80', label: 'Delivered' },
  CANCELLED:  { bg: '#2a1515', color: '#f87171', label: 'Cancelled' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [deliveriesData, statsData] = await Promise.all([
        DeliveryService.getAll(),
        DashboardService.getStats(),
      ]);
      setDeliveries(deliveriesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const activeCount = deliveries.filter(
    (d) => d.status === 'PENDING' || d.status === 'IN_TRANSIT' || d.status === 'PICKED_UP'
  ).length;

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/deliveries/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* KPI 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-muted mb-1">Active Deliveries</p>
          <h3 className="text-2xl font-bold text-primary">
            {loading ? '...' : activeCount}
          </h3>
        </Card>

        <Card>
          <p className="text-sm font-medium text-muted mb-1">Drivers Online</p>
          <h3 className="text-2xl font-bold text-primary">
            {statsLoading ? '...' : (stats?.driversOnline ?? 0)}
          </h3>
        </Card>

        <Card className="border-status-warning/50">
          <p className="text-sm font-medium text-status-warning mb-1">Delayed</p>
          <h3 className="text-2xl font-bold text-status-warning">
            {statsLoading ? '...' : (stats?.delayedCount ?? 0)}
          </h3>
        </Card>
      </div>

      {/* 배송 목록 */}
      <div>
        <h2 className="text-xl font-medium text-primary mb-4">Recent Deliveries</h2>
        <div className="bg-surface border border-subtle rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                {['ID', 'Status', 'Driver', 'Destination', 'Origin', 'Recipient'].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-xs font-medium text-muted uppercase tracking-wider border-b border-subtle"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted">
                    Loading deliveries...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted">
                    No recent deliveries found.
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => {
                  const style = STATUS_STYLES[delivery.status];
                  return (
                    <tr
                      key={delivery.id}
                      onClick={() => handleRowClick(delivery.id)}
                      className="border-b border-subtle hover:bg-bg-elevated transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-sm font-mono text-secondary">
                        {delivery.id.substring(0, 8)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ background: style.bg, color: style.color }}
                        >
                          {style.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-primary">
                        {delivery.driver?.name ?? (
                          <span className="text-muted italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-primary max-w-xs truncate">
                        {delivery.destination_address}
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary max-w-xs truncate">
                        {delivery.origin_address}
                      </td>
                      <td className="py-3 px-4 text-sm text-secondary">
                        {delivery.recipient_phone ?? (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
