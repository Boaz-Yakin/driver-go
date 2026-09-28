'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface UseGpsTrackerOptions {
  deliveryId: string;
  driverId: string;
  isActive: boolean;
  serverBaseUrl?: string;          // Capacitor 앱에서 절대 URL 필요
  movingIntervalMs?: number;       // 웹 폴백 전용: 이동 중 수집 간격 (기본 15초)
  stationaryIntervalMs?: number;   // 웹 폴백 전용: 정차 중 수집 간격 (기본 60초)
  speedThresholdKph?: number;      // 웹 폴백 전용: 이동/정차 판단 속도 (기본 5km/h)
}

function msToKph(ms: number) {
  return ms * 3.6;
}

import { registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export function useGpsTracker({
  deliveryId,
  driverId,
  isActive,
  serverBaseUrl = '',
  movingIntervalMs = 15_000,
  stationaryIntervalMs = 60_000,
  speedThresholdKph = 5,
}: UseGpsTrackerOptions) {
  const watcherIdRef = useRef<string | null>(null);   // Capacitor watcher ID
  const intervalRef  = useRef<ReturnType<typeof setTimeout> | null>(null); // 웹 폴백 timer
  const lastSpeedRef = useRef<number>(0);

  // ─── 위치 → 서버 전송 ────────────────────────────────────────
  const postLocation = useCallback(async (lat: number, lng: number, speed: number) => {
    try {
      const url = `${serverBaseUrl}/api/location`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_id: deliveryId, driver_id: driverId, lat, lng, speed }),
      });
    } catch (err) {
      console.error('[GPS] Failed to send location:', err);
    }
  }, [deliveryId, driverId, serverBaseUrl]);

  // ─── Capacitor 백그라운드 GPS ────────────────────────────────
  const startNativeTracking = useCallback(async () => {
    try {
      const id = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: '운행 중 위치 추적',
          backgroundTitle:   'DriverGo',
          requestPermissions: true,
          stale: false,
          distanceFilter: 10,        // 10m 이동마다 콜백
        },
        async (location, error) => {
          if (error) {
            console.error('[GPS Native] Error:', error);
            return;
          }
          if (!location) return;

          const speedKph = location.speed != null ? msToKph(location.speed) : 0;
          lastSpeedRef.current = speedKph;
          await postLocation(location.latitude, location.longitude, speedKph);
        }
      );

      watcherIdRef.current = id;
      console.log('[GPS Native] Background tracking started, watcher id:', id);
    } catch (err) {
      console.error('[GPS Native] Failed to start BackgroundGeolocation:', err);
    }
  }, [postLocation]);

  const stopNativeTracking = useCallback(async () => {
    if (!watcherIdRef.current) return;
    try {
      await BackgroundGeolocation.removeWatcher({ id: watcherIdRef.current });
      watcherIdRef.current = null;
      console.log('[GPS Native] Background tracking stopped');
    } catch (err) {
      console.error('[GPS Native] Failed to stop BackgroundGeolocation:', err);
    }
  }, []);

  // ─── 웹 브라우저 폴백 GPS ────────────────────────────────────
  const sendWebLocation = useCallback(async () => {
    if (!isActive) return;

    const handlePosition = async (lat: number, lng: number, speed: number) => {
      lastSpeedRef.current = speed;
      await postLocation(lat, lng, speed);
    };

    if (!navigator.geolocation) {
      // 개발 환경 mock
      if (process.env.NODE_ENV === 'development') {
        const mockLat = 33.7490 + (Math.random() - 0.5) * 0.05;
        const mockLng = -84.3880 + (Math.random() - 0.5) * 0.05;
        await handlePosition(mockLat, mockLng, 0);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const speedKph = pos.coords.speed != null ? msToKph(pos.coords.speed) : 0;
        await handlePosition(pos.coords.latitude, pos.coords.longitude, speedKph);
      },
      (err) => console.error('[GPS Web] getCurrentPosition error:', err),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 }
    );
  }, [isActive, postLocation]);

  const startWebTracking = useCallback(() => {
    sendWebLocation();
    const schedule = () => {
      const interval = lastSpeedRef.current >= speedThresholdKph
        ? movingIntervalMs
        : stationaryIntervalMs;
      intervalRef.current = setTimeout(async () => {
        await sendWebLocation();
        if (isActive) schedule();
      }, interval);
    };
    schedule();
  }, [sendWebLocation, isActive, movingIntervalMs, stationaryIntervalMs, speedThresholdKph]);

  const stopWebTracking = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ─── 메인 Effect: 환경에 따라 네이티브 or 웹 분기 ───────────
  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();

    if (isActive) {
      if (isNative) {
        startNativeTracking();
      } else {
        startWebTracking();
      }
    } else {
      if (isNative) {
        stopNativeTracking();
      } else {
        stopWebTracking();
      }
    }

    return () => {
      if (isNative) {
        stopNativeTracking();
      } else {
        stopWebTracking();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);
}

