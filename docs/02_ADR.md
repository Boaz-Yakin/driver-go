# Architecture Decision Record (ADR)
## 프로젝트명: Driver-Go ETA System (가칭)

### 1. 백엔드 및 데이터베이스 (BaaS)
* **결정:** **Supabase (PostgreSQL)** 사용.
* **배경:** 빠른 MVP 개발을 위해 인증, 데이터베이스, 실시간 웹소켓 구독을 통합 제공하는 BaaS가 필요함.
* **대안 및 기각 이유:** Firebase를 고려했으나, 위치 로그(Location Logs)와 같은 시계열 데이터 및 복잡한 관계형 데이터(드라이버-화물) 조회를 위해 강력한 SQL(PostgreSQL) 및 향후 TimescaleDB 확장이 가능한 Supabase를 최종 선택함.

### 2. 드라이버 앱 프론트엔드 (Mobile)
* **결정:** **React Native (또는 Flutter)** 
* **배경:** iOS와 Android 동시 지원이 필요하며, 백그라운드 Geolocation 및 하드웨어(햅틱/음성) 제어 플러그인 생태계가 잘 갖춰져 있음.
* **제약사항:** 배터리 최적화 정책(Doze mode 등)을 우회하기 위한 Native 모듈(Foreground Service) 통합 필수.

### 3. 수신자 및 관리자 웹 (Web Frontend)
* **결정:** **Next.js (React)** 및 **Tailwind CSS**
* **배경:** 수신자가 접속할 트래킹 링크는 빠른 로딩과 모바일 최적화가 중요. Next.js를 통해 API 라우팅과 SSR/CSR을 유연하게 처리.
* **UI 원칙:** 관리자 및 수신자 UI는 `docs/04_UI_GUIDE.md`를 엄격히 준수하여 일관된 디자인 시스템 적용.

### 4. 지도 및 라우팅 API
* **결정:** **Google Maps Platform** (추후 Mapbox 또는 상용차 전용 API 확장 고려)
* **배경:** 가장 익숙하고 정확도 높은 지도 데이터 제공. 드라이버 앱의 내비게이션 딥링크 연동 시 Google Maps가 표준으로 작용.

### 5. 아키텍처 핵심 원칙 (CRITICAL)
1. **API 은닉화:** 타사 API 키(Google Maps, Twilio 등)는 절대 클라이언트 번들에 하드코딩하지 않으며, 백엔드(Supabase Edge Functions 또는 Next.js API Routes)에서 처리한다.
2. **배터리 최적화:** 실시간 GPS 수집 주기는 배터리 소모를 고려해 기본 15~30초로 제한하며 오프라인 시 로컬 큐에 저장 후 일괄 동기화(Batch Sync)한다.
