'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { DeliveryService } from '@/services/delivery.service';
import { Delivery } from '@/types';

export default function DashboardPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await DeliveryService.getAll();
        setDeliveries(data);
      } catch (err) {
        console.error('Failed to load deliveries:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeCount = deliveries.filter(d => d.status === 'PENDING' || d.status === 'IN_TRANSIT' || d.status === 'PICKED_UP').length;
  
  // 추후 구현 예정
  const driversOnline = 0; 
  const delayedCount = 0;

  return (
    <div className="space-y-6">
      {/* KPI 뷰 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-muted mb-1">Active Deliveries</p>
          <h3 className="text-2xl font-bold text-primary">
            {loading ? '...' : activeCount}
          </h3>
        </Card>
        <Card>
          <p className="text-sm font-medium text-muted mb-1">Drivers Online</p>
          <h3 className="text-2xl font-bold text-primary">{driversOnline}</h3>
        </Card>
        <Card className="border-status-warning/50">
          <p className="text-sm font-medium text-status-warning mb-1">Delayed</p>
          <h3 className="text-2xl font-bold text-status-warning">{delayedCount}</h3>
        </Card>
      </div>

      {/* 배송 목록 뷰 */}
      <div>
        <h2 className="text-xl font-medium text-primary mb-4">Recent Deliveries</h2>
        <div className="bg-surface border border-subtle rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-4 text-xs font-medium text-muted uppercase tracking-wider border-b border-subtle">ID</th>
                <th className="py-3 px-4 text-xs font-medium text-muted uppercase tracking-wider border-b border-subtle">Status</th>
                <th className="py-3 px-4 text-xs font-medium text-muted uppercase tracking-wider border-b border-subtle">Destination</th>
                <th className="py-3 px-4 text-xs font-medium text-muted uppercase tracking-wider border-b border-subtle">Origin</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-muted">
                    Loading deliveries...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-muted">
                    No recent deliveries found.
                  </td>
                </tr>
              ) : (
                deliveries.map((delivery) => (
                  <tr key={delivery.id} className="border-b border-subtle hover:bg-bg-elevated transition-colors">
                    <td className="py-3 px-4 text-sm font-mono text-secondary">{delivery.id.substring(0,8)}</td>
                    <td className="py-3 px-4 text-sm">
                      {delivery.status === 'IN_TRANSIT' ? (
                        <span className="bg-status-info/10 text-status-info rounded-full px-2 py-0.5 text-xs font-medium">In Transit</span>
                      ) : (
                        <span className="bg-bg-elevated text-muted rounded-full px-2 py-0.5 text-xs font-medium capitalize">
                          {delivery.status.replace('_', ' ').toLowerCase()}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-primary">{delivery.destination_address}</td>
                    <td className="py-3 px-4 text-sm text-secondary">{delivery.origin_address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
