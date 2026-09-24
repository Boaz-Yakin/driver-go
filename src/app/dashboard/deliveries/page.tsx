'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DeliveryService, DriverService } from '@/services/delivery.service';
import { Delivery, DeliveryStatus, Driver } from '@/types';

const STATUS_STYLES: Record<DeliveryStatus, { bg: string; color: string; label: string }> = {
  PENDING:    { bg: '#1c1c2e', color: '#a78bfa', label: 'Pending' },
  PICKED_UP:  { bg: '#1c2338', color: '#60a5fa', label: 'Picked Up' },
  IN_TRANSIT: { bg: '#1c2338', color: '#38bdf8', label: 'In Transit' },
  DELIVERED:  { bg: '#0f2318', color: '#4ade80', label: 'Delivered' },
  CANCELLED:  { bg: '#2a1515', color: '#f87171', label: 'Cancelled' },
};

export default function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DeliveryStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([DeliveryService.getAll(), DriverService.getAll()])
      .then(([delRes, drvRes]) => {
        setDeliveries(delRes);
        setDrivers(drvRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAssignDriver = async (deliveryId: string, driverId: string) => {
    try {
      const updated = await DeliveryService.assignDriver(deliveryId, driverId || null);
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, driver_id: updated.driver_id, driver: drivers.find(drv => drv.id === driverId) || null } : d));
    } catch (error) {
      console.error('Failed to assign driver', error);
      alert('Failed to assign driver');
    }
  };

  const filtered = deliveries.filter(d => {
    const matchStatus = filter === 'ALL' || d.status === filter;
    if (!matchStatus) return false;
    
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    
    return (
      d.id.toLowerCase().includes(q) ||
      (d.origin_address && d.origin_address.toLowerCase().includes(q)) ||
      (d.destination_address && d.destination_address.toLowerCase().includes(q)) ||
      (d.recipient_phone && d.recipient_phone.toLowerCase().includes(q))
    );
  });

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

      {/* 필터 탭 및 검색 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const).map(s => (
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
              {s === 'ALL' ? 'All' : STATUS_STYLES[s as DeliveryStatus].label}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search ID, address, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-surface border border-subtle rounded-md text-sm text-primary placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all w-full sm:w-64"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-surface border border-subtle rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-subtle">
              {['ID', 'Status', 'Driver', 'Origin', 'Destination', 'Recipient', 'Created'].map(h => (
                <th key={h} className="py-3 px-4 text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-muted">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-muted">No deliveries found.</td></tr>
            ) : filtered.map(d => {
              const style = STATUS_STYLES[d.status];
              return (
                <tr 
                  key={d.id} 
                  className="border-b border-subtle hover:bg-bg-elevated transition-colors cursor-pointer"
                  onClick={(e) => {
                    // 드롭다운 클릭 시 행 라우팅 방지
                    if ((e.target as HTMLElement).tagName !== 'SELECT') {
                      router.push(`/dashboard/deliveries/${d.id}`);
                    }
                  }}
                >
                  <td className="py-3 px-4 text-xs font-mono text-secondary">{d.id.substring(0, 8)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: style.bg, color: style.color }}>
                      {style.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <select
                      value={d.driver_id || ''}
                      onChange={(e) => handleAssignDriver(d.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-bg-elevated border border-default rounded px-2 py-1 text-xs text-primary focus:border-accent outline-none w-32 truncate"
                    >
                      <option value="">Unassigned</option>
                      {drivers.map(drv => (
                        <option key={drv.id} value={drv.id}>
                          {drv.name}
                        </option>
                      ))}
                    </select>
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
