# 05 — 대시보드 탭별 보완 백로그

> **작성일**: 2026-09-23
> **대상**: Driver-Go 관리자 대시보드 4개 탭
> **목적**: Phase 9 완료 이후 UX/기능 보완 사항 정리

---

## 우선순위 기준

| 레벨 | 기준 |
|------|------|
| 🔴 High | 운영 중 실제 사용에 지장이 있는 항목 |
| 🟡 Mid  | UX 개선 및 데이터 가시성 향상 항목 |
| 🟢 Low  | Nice-to-have, 장기 개선 항목 |

---

## 1️⃣ Overview (`/dashboard`)

**현재 상태**
- Active Deliveries 수 — 실제 DB 연동 ✅
- Drivers Online — **항상 `0` 하드코딩** ⚠️
- Delayed — **항상 `0` 하드코딩** ⚠️
- 최근 배송 테이블 (ID, Status, Destination, Origin)

**보완 항목**

| 우선순위 | 항목 | 설명 |
|----------|------|------|
| 🔴 | `Drivers Online` 실제 연동 | `drivers` 테이블에서 `status IN ('ON_ROUTE', 'AVAILABLE')` 카운트 |
| 🔴 | `Delayed` 실제 연동 | ETA 초과 배송 감지 로직 (DB에 `scheduled_at` 컬럼 필요 여부 PRD 확인) |
| 🟡 | 테이블 컬럼 보강 | `Driver`, `Recipient` 컬럼 추가 |
| 🟡 | 행 클릭 → 배송 상세 | 클릭 시 `/dashboard/deliveries/[id]` 이동 |
| 🟢 | 자동 갱신 폴링 | 일정 주기(30초)로 KPI 카드 자동 새로고침 |

---

## 2️⃣ Deliveries (`/dashboard/deliveries`)

**현재 상태**
- 상태 필터 탭 (ALL / PENDING / IN_TRANSIT / DELIVERED / CANCELLED) ✅
- 배송 테이블 (ID, Status, Origin, Destination, Recipient phone, Created) ✅
- `+ New Delivery` → `/dashboard/deliveries/new` ✅

**보완 항목**

| 우선순위 | 항목 | 설명 |
|----------|------|------|
| 🔴 | 드라이버 배정 UI | 테이블 인라인 또는 상세 페이지에서 드라이버 선택 배정 |
| 🔴 | 드라이버 컬럼 | 현재 배정된 드라이버 이름 컬럼 누락 |
| 🟡 | 행 클릭 → 상세/수정 | 배송 상세 페이지 (`/dashboard/deliveries/[id]`) 없음 |
| 🟡 | `PICKED_UP` 필터 | 상태 필터에서 `PICKED_UP` 탭 누락 |
| 🟡 | 검색 | 주소 / 수신자 키워드 검색 기능 없음 |
| 🟢 | 페이지네이션 | 배송 건수 증가 시 전체 로드 부담 해소 |

---

## 3️⃣ Drivers (`/dashboard/drivers`)

**현재 상태**
- 드라이버 카드 그리드 (이름 이니셜 아바타, 상태 뱃지, 전화번호) ✅
- 인라인 등록 폼 (이름 + 전화번호) ✅

**보완 항목**

| 우선순위 | 항목 | 설명 |
|----------|------|------|
| 🔴 | 상태 수동 변경 | 관리자가 AVAILABLE ↔ OFF_DUTY 직접 변경 불가 |
| 🔴 | 현재 배송 정보 | 카드에서 담당 중인 배송 정보 표시 없음 |
| 🟡 | 드라이버 삭제 | 삭제 기능 없음 |
| 🟡 | 지도 연결 | 카드에서 "View on Map" 클릭 시 `/dashboard/map`으로 이동 |
| 🟡 | 드라이버 상세 페이지 | `/dashboard/drivers/[id]` — 배송 이력, 실시간 위치 등 |
| 🟢 | 등록 폼 확장 | 차량 번호, 차량 종류 등 추가 필드 |

---

## 4️⃣ Live Map (`/dashboard/map`)

**현재 상태**
- Leaflet 기반 지도 ✅
- 15초 자동 폴링 ✅
- 상태별 컬러 마커 + 팝업 (ID, Status) ✅
- 수동 Refresh 버튼 ✅

**보완 항목**

| 우선순위 | 항목 | 설명 |
|----------|------|------|
| 🔴 | 지도 다크 테마 타일 | OpenStreetMap 밝은 타일 → CartoDB Dark Matter 등으로 교체 |
| 🟡 | 마커 팝업 정보 보강 | 드라이버명, 배송지, 전화번호, 속도 등 |
| 🟡 | 사이드 패널 | 지도 옆에 IN_TRANSIT 배송 목록 패널 |
| 🟡 | 드라이버 필터 | 특정 드라이버만 마커 표시 |
| 🟢 | 마커 이동 애니메이션 | 위치 갱신 시 텔레포트 → smooth transition |

---

## 전체 우선순위 요약

```
🔴 High (즉시)
  - Overview: Drivers Online / Delayed KPI 실제 연동
  - Deliveries: 드라이버 배정 UI + 드라이버 컬럼
  - Drivers: 상태 수동 변경 + 현재 배송 카드 표시
  - Live Map: 다크 테마 타일 교체

🟡 Mid (다음 스프린트)
  - 배송/드라이버 상세 페이지
  - Map 사이드 패널 + 팝업 보강
  - Deliveries 검색 + PICKED_UP 필터

🟢 Low (장기)
  - 페이지네이션
  - 드라이버 등록 폼 확장
  - 마커 이동 애니메이션
```
