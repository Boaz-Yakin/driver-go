'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';

export interface TruckMarker {
  id: string;       // delivery_id or driver_id
  lat: number;
  lng: number;
  label?: string;
  status?: string;
}

interface MapViewProps {
  markers: TruckMarker[];
  center?: [number, number];
  zoom?: number;
  style?: React.CSSProperties;
}

const STATUS_COLORS: Record<string, string> = {
  IN_TRANSIT: '#3b82f6',
  PICKED_UP:  '#a78bfa',
  PENDING:    '#f59e0b',
  DELIVERED:  '#22c55e',
};

export default function MapView({
  markers,
  center = [39.8283, -98.5795], // Center of US
  zoom = 4, // Adjusted zoom for US view
  style = { width: '100%', height: '100%', minHeight: '400px' },
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Leaflet을 동적으로 import (SSR 방지)
    import('leaflet').then((L) => {
      // 기본 아이콘 경로 수정 (Next.js 빌드 이슈 해결)
      // @ts-expect-error - Leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!).setView(center, zoom);
      mapRef.current = map;

      // OpenStreetMap 타일 레이어
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // 초기 마커 렌더링
      renderMarkers(L, map, markers);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 마커 변경 시 업데이트
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then((L) => {
      renderMarkers(L, mapRef.current!, markers);
    });
  }, [markers]);

  function renderMarkers(L: typeof import('leaflet'), map: LeafletMap, data: TruckMarker[]) {
    const existing = markersRef.current;

    // 새 마커 추가 / 기존 마커 위치 업데이트
    data.forEach((m) => {
      const color = STATUS_COLORS[m.status ?? ''] ?? '#3b82f6';
      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            width:36px;height:36px;border-radius:50%;
            background:${color};border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
            display:flex;align-items:center;justify-content:center;
            font-size:16px;
          ">🚚</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (existing.has(m.id)) {
        existing.get(m.id)!.setLatLng([m.lat, m.lng]);
      } else {
        const marker = L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${m.label ?? m.id.substring(0, 8)}</b><br/>${m.status ?? ''}`);
        existing.set(m.id, marker);
      }
    });

    // 삭제된 마커 제거
    existing.forEach((marker, id) => {
      if (!data.find(m => m.id === id)) {
        marker.remove();
        existing.delete(id);
      }
    });
  }

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={containerRef} style={style} />
    </>
  );
}
