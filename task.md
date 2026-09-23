# 프로젝트 작업 목록 (Task Tracker)

> [!NOTE]
> AI 에이전트는 작업 착수 시 `[/]`(진행중)로 표시하고, 완료 시 `[x]`(완료)로 업데이트합니다.

---

## 📌 Phase 0: 기획 & 설계 (Design-First)
- [x] 0.1 제품 기획서 확정 (`docs/01_PRD.md`)
- [x] 0.2 아키텍처 및 기술 스택 결정 (`docs/02_ADR.md`)
- [x] 0.3 초기 핵심 기능 TRD 작성 (`docs/03_TRD.md`)
- [x] 0.4 UI/UX 디자인 시스템 확인 (`docs/04_UI_GUIDE.md`)

---

## 🏗️ Phase 1: 기반 아키텍처 & 초기 셋업
- [x] 1.1 프로젝트 디렉토리 뼈대 생성 (`src/components`, `src/services`, `src/types` 등)
- [x] 1.2 공통 타입 및 인터페이스 정의 (`src/types/`)
- [x] 1.3 DB 클라이언트 및 기본 서비스 레이어 셋업 (`src/services/`)
- [x] 1.4 공통 UI 원자 컴포넌트 셋업 (`src/components/ui/`)

---

## ⚡ Phase 2: 핵심 기능 구현 (MVP)
- [x] 2.1 [F-001] 사용자 인증/세션 관리 (`services/auth.service.ts`, `app/api/auth/`)
- [x] 2.2 [F-002] 메인 대시보드 및 데이터 조회 레이어
- [x] 2.3 [F-003] 핵심 비즈니스 로직 및 등록/수정 플로우

---

## 🛡️ Phase 3: QA 및 아키텍처 검증
- [x] 3.1 아키텍처 규칙 검증 통과 (`scripts/validate-arch.ps1` 또는 `scripts/validate-arch.sh`)
- [x] 3.2 문서 동기화 및 완성도 확인 (`scripts/sync-docs.ps1` 또는 `scripts/sync-docs.sh`)
- [x] 3.3 린트 및 타입 체크 통과 (`npm run lint`, `npm run type-check`)
- [x] 3.4 단위 및 E2E 테스트 통과 (`npm test`, `npm run test:e2e`)

---

## 📱 Phase 4: 모바일 뷰 고도화 및 DB 연동
- [x] 4.1 원격 Supabase DB 스키마 적용 및 `.env` 셋업
- [x] 4.2 DB 스키마와 일치하도록 타입 모델 및 `delivery.service.ts` 리팩토링
- [x] 4.3 드라이버 모바일 전용 뷰(`/driver`) 및 스와이프 액션 UI 구현
- [x] 4.4 관리자 대시보드(`/dashboard`) 실제 데이터 연동 리팩토링

---

## 🔒 Phase 5: 보안 강화 (API Routes + RLS)
- [x] 5.1 Supabase RLS(Row Level Security) 정책 적용
- [x] 5.2 Next.js API Routes 구현 (`/api/deliveries`, `/api/drivers`)
- [x] 5.3 클라이언트 서비스를 API Routes 호출로 리팩토링

---

## 📊 Phase 6: 대시보드 페이지 고도화
- [x] 6.1 `/dashboard/deliveries` - 배송 목록 (상태 필터 + 실제 DB 연동)
- [x] 6.2 `/dashboard/drivers` - 드라이버 목록 + 인라인 등록 폼

---

> [!CAUTION]
> Phase 7~9는 PRD MVP 스코프 내 기능이나 현재 **미구현** 상태입니다. 아래 항목들이 완료되어야 실질적인 MVP가 완성됩니다.

## 🗺️ Phase 7: 실시간 GPS 수집 및 상태 관리 (핵심)
> PRD 근거: "드라이버 앱: GPS 백그라운드 수집, 스와이프 상태 변경"
- [x] 7.1 드라이버 스와이프 → 배송 상태 DB PATCH 실제 연동 (`PATCH /api/deliveries/[id]`)
- [x] 7.2 드라이버 앱 GPS 수집 로직 (`Geolocation API` → `POST /api/location`)
- [x] 7.3 `POST /api/location` API Route 구현 → `location_logs` 테이블에 저장
- [x] 7.4 배터리 최적화: 주행 중일 때만 GPS 수집, 정차 시 인터벌 증가

---

## 🗺️ Phase 8: 실시간 지도 및 수신자 추적 페이지
> PRD 근거: "관리자: 전체 트럭 위치를 지도 한 화면에서 확인", "수신자: 임시 URL로 트럭 위치 추적"
- [x] 8.1 지도 라이브러리 선택 및 연동 (Google Maps API)
- [x] 8.2 관리자 대시보드에 실시간 트럭 마커 지도 추가 (`/dashboard/map`)
- [x] 8.3 15초 자동 갱신 폴링으로 위치 업데이트
- [x] 8.4 수신자 추적 공개 페이지 (`/track/[token]`) — 로그인 불필요, 읽기 전용

---

## 📲 Phase 9: 알림 시스템
> PRD 근거: "출발/도착 SMS 알림", "도착 30분 전 문자 발송"
- [x] 9.1 SMS 발송 서비스 선택 및 연동 (Twilio SDK 설치)
- [x] 9.2 배송 상태 변경 시 SMS 트리거 API Route 구현 (`/api/sms`)
- [x] 9.3 PATCH `/api/deliveries/[id]` 에서 수신자 전화번호로 자동 발송 훅 연결

> [!IMPORTANT]
> 
> SMS 실제 발송을 위해서는 `.env.local`에 아래 환경변수를 추가해야 합니다:
> ```
> TWILIO_ACCOUNT_SID=ACxxxxxxxx
> TWILIO_AUTH_TOKEN=xxxxxxxx
> TWILIO_FROM_NUMBER=+1xxxxxxxxxx
> ```
> Twilio 회원가입 후 https://console.twilio.com 에서 확인하세요.
