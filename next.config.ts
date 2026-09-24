import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 모바일 테스트를 위해 로컬 네트워크 접근 허용
  // @ts-expect-error - Next.js 15 experimental type issue
  allowedDevOrigins: ["192.168.0.38"],
};

export default nextConfig;
