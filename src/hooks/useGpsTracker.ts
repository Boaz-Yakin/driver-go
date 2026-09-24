'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseGpsTrackerOptions {
  deliveryId: string;
  driverId: string;
  isActive: boolean;           // 운행 중일 때만 true
  movingIntervalMs?: number;   // 이동 중 수집 간격 (기본 15초)
  stationaryIntervalMs?: number; // 정차 중 수집 간격 (기본 60초)
  speedThresholdKph?: number;  // 이동/정차 판단 속도 기준 (기본 5km/h)
}

// 속도 m/s → km/h 변환
function msToKph(ms: number) {
  return ms * 3.6;
}

export function useGpsTracker({
  deliveryId,
  driverId,
  isActive,
  movingIntervalMs = 15_000,
  stationaryIntervalMs = 60_000,
  speedThresholdKph = 5,
}: UseGpsTrackerOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSpeedRef = useRef<number>(0);

  const sendLocation = useCallback(async () => {
    if (!isActive) return;

    const postLocation = async (lat: number, lng: number, speed: number) => {
      try {
        await fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            delivery_id: deliveryId,
            driver_id: driverId,
            lat,
            lng,
            speed,
          }),
        });
      } catch (err) {
        console.error('[GPS] Failed to send location:', err);
      }
    };

    if (!navigator.geolocation) {
      console.warn('[GPS] Geolocation API not supported or not secure context.');
      
      // 개발 환경일 때만 임시 위치 전송
      if (process.env.NODE_ENV === 'development') {
        console.log('[GPS] Using mock location for local development.');
        const mockLat = 33.7490 + (Math.random() - 0.5) * 0.05;
        const mockLng = -84.3880 + (Math.random() - 0.5) * 0.05;
        await postLocation(mockLat, mockLng, 0);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        const speedKph = speed != null ? msToKph(speed) : 0;
        lastSpeedRef.current = speedKph;
        await postLocation(latitude, longitude, speedKph);
      },
      async (err) => {
        console.error('[GPS] getCurrentPosition error:', err);
        if (process.env.NODE_ENV === 'development') {
          console.warn('[GPS] Using mock location due to error.');
          const mockLat = 33.7490 + (Math.random() - 0.5) * 0.05;
          const mockLng = -84.3880 + (Math.random() - 0.5) * 0.05;
          await postLocation(mockLat, mockLng, 0);
        }
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 }
    );
  }, [deliveryId, driverId, isActive]);

  const startTracking = useCallback(() => {
    // 즉시 1회 전송
    sendLocation();

    // 배터리 최적화: 속도에 따라 인터벌 동적 조정
    const schedule = () => {
      const interval = lastSpeedRef.current >= speedThresholdKph
        ? movingIntervalMs
        : stationaryIntervalMs;

      intervalRef.current = setTimeout(async () => {
        await sendLocation();
        if (isActive) schedule(); // 재귀적으로 다음 스케줄
      }, interval);
    };

    schedule();
  }, [sendLocation, isActive, movingIntervalMs, stationaryIntervalMs, speedThresholdKph]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      startTracking();
    } else {
      stopTracking();
    }
    return stopTracking;
  }, [isActive, startTracking, stopTracking]);
}
