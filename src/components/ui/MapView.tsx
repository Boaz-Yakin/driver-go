'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';

export interface TruckMarker {
  id: string;       // delivery_id or driver_id
  lat: number;
  lng: number;
  label?: string;
  status?: string;
  driver_name?: string;
  driver_phone?: string;
  speed?: number | null;
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
  center = [33.7490, -84.3880], // Atlanta, Georgia
  zoom = 8, // Adjusted zoom for state-level view
  style = { width: '100%', height: '100%', minHeight: '400px' },
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());

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

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 150px;">
          <h4 style="margin: 0 0 4px; font-size: 14px; font-weight: bold; color: #333;">${m.driver_name || 'Driver'}</h4>
          <p style="margin: 0 0 8px; font-size: 11px; color: #666;">📞 ${m.driver_phone || 'No phone'}</p>
          <div style="margin-bottom: 8px; font-size: 12px; font-weight: bold; color: ${color};">
            ● ${m.status?.replace('_', ' ') || 'Unknown'}
          </div>
          <p style="margin: 0 0 4px; font-size: 12px; color: #444; line-height: 1.4;">
            ${m.label ?? m.id.substring(0, 8)}
          </p>
          ${m.speed !== undefined && m.speed !== null ? `<p style="margin: 0; font-size: 11px; color: #888;">Speed: ${m.speed.toFixed(1)} km/h</p>` : ''}
        </div>
      `;

      if (existing.has(m.id)) {
        const marker = existing.get(m.id)!;
        marker.setLatLng([m.lat, m.lng]);
        marker.setPopupContent(popupHtml);
      } else {
        const marker = L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml);
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

    // 마커가 하나 이상 있으면 지도 중심과 줌을 마커들에 맞게 자동 조정
    if (data.length > 0) {
      const bounds = L.latLngBounds(data.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }

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

      // Esri Dark Gray Canvas 타일 레이어 (무료, API 키 불필요)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 마커 변경 시 업데이트
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then((L) => {
      renderMarkers(L, mapRef.current!, markers);
    });
  }, [markers]);

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
