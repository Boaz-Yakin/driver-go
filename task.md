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
