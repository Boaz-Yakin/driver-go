'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { TruckMarker } from '@/components/ui/MapView';

// SSR 비활성화 — Leaflet은 브라우저 전용
const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

interface LocationData {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_phone: string;
  status: string;
  lat: number;
  lng: number;
  speed: number | null;
  timestamp: string;
  label: string;
}

export default function MapPage() {
  const [trucks, setTrucks] = useState<TruckMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch('/api/map');
      const data: LocationData[] = await res.json();
      setTrucks(
        data.map(d => ({
          id: d.id,
          lat: d.lat,
          lng: d.lng,
          label: d.label,
          status: d.status,
          driver_name: d.driver_name,
          driver_phone: d.driver_phone,
          speed: d.speed,
        }))
      );
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch truck locations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLocations();
    // 15초마다 자동 갱신
    const interval = setInterval(fetchLocations, 15_000);
    return () => clearInterval(interval);
  }, [fetchLocations]);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Live Map</h1>
          <p className="text-sm text-muted mt-0.5">
            {loading
              ? 'Loading...'
              : `${trucks.length} active trucks · Updated at ${lastUpdated?.toLocaleTimeString()}`}
          </p>
        </div>
        <button
          onClick={fetchLocations}
          className="px-4 py-2 rounded-md text-sm font-medium border border-default text-secondary hover:text-primary hover:bg-bg-elevated transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
        {/* 사이드 패널 */}
        <div className="w-full lg:w-80 flex flex-col bg-surface border border-subtle rounded-xl overflow-hidden shrink-0">
          <div className="p-4 border-b border-subtle bg-bg-elevated flex items-center justify-between">
            <h2 className="font-semibold text-primary">Active Routes</h2>
            <span className="bg-accent/20 text-accent text-xs font-bold px-2 py-0.5 rounded-full">{trucks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] lg:max-h-none">
            {trucks.length === 0 ? (
              <p className="text-center text-sm text-muted py-8">No active trucks.</p>
            ) : (
              trucks.map(t => (
                <div key={t.id} className="p-3 bg-bg-elevated border border-default rounded-lg hover:border-accent transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-primary text-sm">{t.driver_name || 'Unknown'}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400">
                      {t.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-secondary mb-2 truncate">{t.label}</p>
                  {t.speed !== null && t.speed !== undefined && (
                    <p className="text-xs text-muted font-mono">{t.speed.toFixed(1)} km/h</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 지도 */}
        <div className="flex-1 rounded-xl overflow-hidden border border-subtle relative min-h-[400px]">
          {/* 범례 (지도 위 오버레이) */}
          <div className="absolute top-4 right-4 z-[400] bg-surface/90 backdrop-blur border border-subtle p-3 rounded-lg shadow-lg">
            <h3 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Status</h3>
            <div className="flex flex-col gap-2 text-xs text-muted">
              {[
                { color: '#a78bfa', label: 'Picked Up' },
                { color: '#3b82f6', label: 'In Transit' },
                { color: '#22c55e', label: 'Delivered' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {!loading ? (
            <MapView
              markers={trucks}
              zoom={11}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-elevated text-muted text-sm">
              Loading map...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
