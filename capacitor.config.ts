import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drivergo.app',
  appName: 'DriverGo',
  webDir: 'out',

  // 개발 시: npx cap run android 할 때 로컬 Next.js 서버를 바라보도록 설정
  // 프로덕션 빌드 시 이 블록을 제거하거나 주석 처리
  // server: {
  //   url: 'http://192.168.0.38:3000',
  //   cleartext: true,
  // },

  plugins: {
    BackgroundGeolocation: {
      // 운행 중 위치 수집 설정
      distanceFilter: 10,          // 10m 이상 이동 시에만 업데이트 (배터리 절약)
      stopOnTerminate: false,      // 앱 완전 종료 시에도 계속 추적
      startOnBoot: false,          // 폰 재부팅 시 자동 시작 안 함
      notification: {
        title: 'DriverGo',
        text: '위치 추적 중입니다.',  // Android 상단 알림바에 표시
      },
    },
  },
};

export default config;

