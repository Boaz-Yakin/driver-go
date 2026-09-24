# Driver-Go ETA System — 종합 개발 보고서 및 매뉴얼

**작성일**: 2026-09-23
**프로젝트명**: Driver-Go ETA System
**문서 목적**: 프로젝트의 기획/요구사항부터 기술 스택, DB 구조, 배포 인프라, 사용자 매뉴얼 및 향후 발전 방향까지 아우르는 종합 레퍼런스 문서.

---

## 1. 프로젝트 개요 (Overview)

물류/배송 업계에서 장거리 트럭 운전사의 위치와 예상 도착 시간(ETA)을 수동으로 보고받는 과정은 비효율적이며 지연을 유발합니다. **Driver-Go ETA System**은 드라이버의 수동 개입을 최소화하면서 실시간 GPS 기반으로 정확한 ETA를 자동 산출하고, 수신자와 관리자에게 배송 현황을 투명하게 제공하는 것을 목표로 합니다.

---

## 2. 제품 요구사항 (Product Requirements)

- **드라이버 (Driver)**: 운전 중 복잡한 화면 조작 없이 직관적인 스와이프 UI로 상태를 변경하고, 실시간 위치 데이터를 서버에 백그라운드로 전송.
- **관리자 (Admin)**: 수십 대의 트럭 운행 상태를 한 화면(Live Map)에서 모니터링하고, 배송 지연 및 예외 상황 발생 시 즉각적으로 파악 가능.
- **수신자 (Recipient)**: 앱 설치 없이 문자 메시지(SMS)로 전송된 URL 링크를 통해 자신의 화물이 어디쯤 오고 있는지 실시간으로 트래킹.

---

## 3. 기술 스택 및 요구사항 (Technical Requirements)

빠른 MVP 개발과 강력한 성능 유지를 위해 최신 모던 웹 기반 아키텍처를 도입했습니다.

- **Frontend & API**: Next.js 15 (App Router), React, Tailwind CSS
  - **제약사항 (CRITICAL)**: 보안을 위해 브라우저(클라이언트 컴포넌트)에서 직접 DB나 외부 API에 접근하는 것을 원천 차단하고, 반드시 `src/app/api/` 경로의 라우트 핸들러를 거치도록 설계.
- **Backend & Database**: Supabase (PostgreSQL, Auth, RLS)
  - 위치 로그 같은 시계열 데이터와 관계형 데이터(드라이버-화물)의 조인 검색을 위해 RDBMS 채택.
- **Map Rendering**: Leaflet.js (클라이언트 마커 렌더링 최적화)
- **Deployment**: Vercel (CI/CD, Serverless Functions 기반 배포)

---

## 4. 데이터베이스 구조 (Database Structure)

Supabase(PostgreSQL) 기반으로 설계된 핵심 테이블 구조입니다.

### `drivers` 테이블 (기사 정보)
- `id` (UUID, Primary Key)
- `name` (String): 기사 이름
- `phone_number` (String): 기사 연락처
- `status` (Enum): `OFF_DUTY`, `AVAILABLE`, `ON_ROUTE`
- `created_at` (Timestamp)

### `deliveries` 테이블 (배송/화물 정보)
- `id` (UUID, Primary Key)
- `driver_id` (UUID, Foreign Key → `drivers.id`)
- `origin_address` (String): 출발지 주소
- `destination_address` (String): 도착지 주소
- `recipient_phone` (String): 수신자 연락처 (SMS 전송용)
- `status` (Enum): `PENDING`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`
- `created_at` (Timestamp)

### `location_logs` 테이블 (실시간 GPS 시계열 로그)
- `id` (UUID, Primary Key)
- `delivery_id` (UUID, Foreign Key → `deliveries.id`)
- `driver_id` (UUID, Foreign Key → `drivers.id`)
- `lat` (Float): 위도
- `lng` (Float): 경도
- `speed` (Float): 주행 속도(km/h)
- `timestamp` (Timestamp): 위치 수집 시각

---

## 5. 인프라 배포 가이드 (Vercel & Supabase)

현재 GitHub에 코드가 연동되어 있으며, 다음 과정으로 실제 서비스 구동이 이루어집니다.

1. **Supabase 설정**:
   - Supabase 대시보드에서 위 세 가지 테이블을 생성하고, 보안(RLS) 규칙을 설정합니다.
   - Project Settings > API에서 `URL`과 `anon public key`를 복사합니다.
2. **Vercel 연동 및 배포**:
   - Vercel 대시보드에서 해당 GitHub 저장소(`driver-go`)를 Import 합니다.
   - **Environment Variables**에 다음 키를 등록합니다.
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy 버튼을 클릭하여 Vercel의 Serverless 인프라 위에 빌드/배포합니다. HTTPS 암호화 통신이 자동으로 지원됩니다.

---

## 6. 사용자 매뉴얼 (User Manual)

### 6.1 관리자 대시보드 (Admin Dashboard)
- **접속 경로**: `https://[도메인]/dashboard`
- **주요 기능**:
  - **Overview**: 전체 진행 중인 배송 통계 및 지연 알림 확인.
  - **Deliveries**: 신규 배송 화물을 등록하고 기사를 배정. 검색창에서 수신자 번호나 ID로 빠르게 화물을 필터링 가능.
  - **Drivers**: 드라이버 신규 등록 및 수정(Edit 기능 내장), 과거 주행/배송 이력 조회.
  - **Live Map**: 활성화된 트럭(IN_TRANSIT)의 실시간 위치와 속도를 확인. 우측 사이드 패널에서 현재 운행 중인 차량 목록(Active Routes) 리스트 제공.

### 6.2 기사 모바일 앱 (Driver App)
- **접속 경로**: `https://[도메인]/driver`
- **주요 기능**:
  - 관리자가 배송을 할당하면 앱 화면에 픽업 정보가 표시됩니다.
  - 직관적인 버튼 액션으로 상태를 변경(`PICKED_UP` → `IN_TRANSIT`).
  - **GPS 트래킹**: `PICKED_UP` 상태가 되는 즉시(권한 허용 필수) 백그라운드에서 실시간 좌표를 서버로 15초 단위 전송.
  - Vercel 배포 후 안전한 HTTPS 환경에서만 브라우저의 실제 GPS 권한이 동작합니다.

---

## 7. 차후 개선 방안 (Future Next Steps)

본 시스템은 현재 MVP(Phase 1.5) 단계이며, 다음과 같이 시스템을 확장할 수 있습니다.

1. **고객 알림 자동화 (SMS Automation - Twilio 연동)**
   - 기사가 `PICKED_UP` 처리 시 수신자의 `recipient_phone` 번호로 `/track/[token]` 트래킹 URL을 포함한 문자가 자동 전송되도록 백엔드 이벤트 후크 구축.
2. **머신러닝(AI) 기반 정확한 ETA 산출 (Phase 3)**
   - 초기 버전은 지도상 위치와 속도만 표시하지만, 추후 데이터가 축적되면 교통체증(Traffic API) 및 과거 기사별 주행 패턴을 학습한 AI 알고리즘을 도입하여 정확한 분 단위 ETA를 고객과 관리자에게 제공.
3. **대규모 데이터 처리 최적화**
   - 배송 데이터가 1만 건 이상 넘어갈 경우를 대비해, 대시보드에 서버사이드 페이지네이션(Pagination) 적용 및 과거 `location_logs` 데이터의 장기 아카이빙 배치 프로세스(Batch Process) 구축.
4. **드라이버 앱 네이티브 고도화**
   - 현재 PWA(웹앱) 기반이므로 백그라운드 구동에 한계가 있을 수 있음. 장기적으로 React Native로 래핑(Wrapping)하여 모바일 OS의 완전한 Background Geolocation 권한을 획득함으로써 수집 안정성을 99% 이상으로 인상.
