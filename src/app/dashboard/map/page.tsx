'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { TruckMarker } from '@/components/ui/MapView';

// SSR 비활성화 — Leaflet은 브라우저 전용
const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

interface LocationData {
  id: string;
  driver_id: string;
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

      {/* 범례 */}
      <div className="flex gap-4 text-xs text-muted flex-shrink-0">
        {[
          { color: '#a78bfa', label: 'Picked Up' },
          { color: '#3b82f6', label: 'In Transit' },
          { color: '#22c55e', label: 'Delivered' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {label}
          </div>
        ))}
      </div>

      {/* 지도 */}
      <div className="flex-1 rounded-xl overflow-hidden border border-subtle min-h-96">
        {!loading && (
          <MapView
            markers={trucks}
            zoom={11}
            style={{ width: '100%', height: '100%', minHeight: '500px' }}
          />
        )}
        {loading && (
          <div className="w-full h-96 flex items-center justify-center bg-bg-elevated text-muted text-sm">
            Loading map...
          </div>
        )}
      </div>

      {trucks.length === 0 && !loading && (
        <p className="text-center text-muted text-sm py-4">
          No trucks are currently in transit. They will appear here when drivers start their routes.
        </p>
      )}
    </div>
  );
}
