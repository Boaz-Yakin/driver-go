import type { NextConfig } from "next";

// CAPACITOR_BUILD=true 환경변수가 설정된 경우에만 static export 모드 활성화
// 일반 next dev / next build (Vercel 배포)는 기존 서버 모드 유지
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  // 모바일 테스트를 위해 로컬 네트워크 접근 허용
  allowedDevOrigins: ["192.168.0.38"],

  // Capacitor 빌드 시에만 static export 활성화
  ...(isCapacitorBuild && {
    output: 'export',
    // Capacitor WebView에서 이미지 최적화 서버가 없으므로 비활성화
    images: { unoptimized: true },
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
  }),
};

export default nextConfig;

