'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { use } from 'react';
import type { TruckMarker } from '@/components/ui/MapView';

const MapView = dynamic(() => import('@/components/ui/MapView'), { ssr: false });

interface TrackData {
  id: string;
  status: string;
  origin_address: string;
  destination_address: string;
  planned_eta?: string;
  location: { lat: number; lng: number; speed: number | null; timestamp: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:    '배송 준비 중',
  PICKED_UP:  '픽업 완료 — 출발 예정',
  IN_TRANSIT: '🚚 운행 중',
  DELIVERED:  '✅ 배달 완료',
  CANCELLED:  '❌ 취소됨',
};

export default function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/track/${token}`);
      if (res.status === 404) { setNotFound(true); return; }
      const json: TrackData = await res.json();
      setData(json);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const marker: TruckMarker | null = data?.location
    ? { id: data.id, lat: data.location.lat, lng: data.location.lng, status: data.status, label: '트럭 위치' }
    : null;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#aaa' }}>
      배송 정보를 불러오는 중...
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff', textAlign: 'center', padding: 24 }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>📦</p>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>배송 정보를 찾을 수 없습니다</h1>
      <p style={{ color: '#666', fontSize: 14 }}>추적 링크가 올바른지 확인해 주세요.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#3b82f6', marginBottom: 4 }}>Driver-Go 배송 추적</h1>
        <p style={{ color: '#888', fontSize: 13 }}>이 페이지는 자동으로 갱신됩니다</p>
      </div>

      {/* 상태 배지 */}
      <div style={{ margin: '16px 20px', background: '#141414', borderRadius: 12, padding: 16, border: '1px solid #222' }}>
        <p style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>배송 현황</p>
        <p style={{ fontSize: 18, fontWeight: 'bold' }}>{STATUS_LABEL[data!.status] ?? data!.status}</p>
        {data!.location && (
          <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            마지막 업데이트: {new Date(data!.location.timestamp).toLocaleTimeString()}
            {data!.location.speed != null && ` · ${Math.round(data!.location.speed)} km/h`}
          </p>
        )}
      </div>

      {/* 경로 */}
      <div style={{ margin: '0 20px 16px', background: '#141414', borderRadius: 12, padding: 16, border: '1px solid #222' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>A</div>
          <div>
            <p style={{ fontSize: 11, color: '#666' }}>출발지</p>
            <p style={{ fontSize: 14 }}>{data!.origin_address}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1a1a1a', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#3b82f6' }}>B</div>
          <div>
            <p style={{ fontSize: 11, color: '#666' }}>도착지</p>
            <p style={{ fontSize: 14 }}>{data!.destination_address}</p>
          </div>
        </div>
      </div>

      {/* 지도 */}
      <div style={{ margin: '0 20px', borderRadius: 12, overflow: 'hidden', border: '1px solid #222', height: 320 }}>
        {marker ? (
          <MapView markers={[marker]} center={[marker.lat, marker.lng]} zoom={14} style={{ width: '100%', height: '100%' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 14 }}>
            위치 정보 없음 — 트럭이 출발하면 여기에 표시됩니다
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', color: '#444', fontSize: 12, padding: '20px 0' }}>
        Driver-Go © {new Date().getFullYear()}
      </p>
    </div>
  );
}
