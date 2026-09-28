# GPS 하드웨어 디바이스 도입 브리핑

> [!IMPORTANT]
> **현재 구조**: 모바일 앱(드라이버 폰)이 `POST /api/location`으로 GPS 데이터를 전송.
> **목표**: 폰 없이 트럭에 부착된 GPS 하드웨어 디바이스가 직접 데이터를 전송.

---

## 1. 왜 GPS 디바이스인가?

| 구분 | 모바일 앱 방식 | GPS 하드웨어 방식 |
|---|---|---|
| 전원 | 폰 배터리 의존 | 차량 OBD/상시전원 연결 |
| 운용 | 드라이버가 앱 실행해야 함 | 시동 걸면 자동 시작 |
| 신뢰성 | 앱 종료/배터리 방전 시 끊김 | 24/7 연속 추적 가능 |
| 데이터 품질 | Doze Mode 등 OS 제약 | 전용 펌웨어, 안정적 주기 |
| 비용 | 무료 (폰 활용) | 디바이스 구매비 + 데이터 SIM |

---

## 2. GPS 디바이스 종류 및 추천

### 옵션 A: OBD-II 포트 연결형 (추천 ⭐)
차량 OBD-II 포트에 꽂기만 하면 됨. 별도 배선 불필요.

- **Teltonika FMB020** — 가장 보편적, 업계 표준, MQTT/HTTP 모두 지원
- **Queclink GV55** — 저가형, HTTP POST 기본 지원
- **CalAmp LMU-3030** — 미국 물류 시장 점유율 높음

### 옵션 B: 유선 하드와이어링형
차량 전원에 직접 배선. OBD 포트가 없는 구형 트럭에 적합.

- **Teltonika FMB130** — 입출력 포트 풍부, 센서 확장 가능

### 옵션 C: 위성 GPS (셀룰러 음영지역용)
미국 남동부 rural area 음영지역 대응.

- **SPOT Gen4** / **Garmin inReach** — 위성 통신, 비용 높음

---

## 3. 현재 백엔드와의 연동 방식

현재 `POST /api/location` 엔드포인트는 이미 HTTP POST를 받는 구조입니다.

```
POST /api/location
Body: { delivery_id, driver_id, lat, lng, speed }
```

GPS 디바이스들은 대부분 **HTTP POST** 또는 **MQTT**로 데이터를 전송합니다.

### 3.1 연동 흐름 (HTTP 방식)

```
[GPS 디바이스]
  → (셀룰러 4G LTE)
  → POST https://your-domain.com/api/location/device
  → [새 Device 전용 API 엔드포인트]
  → Supabase location_logs 테이블
  → 수신자 트래킹 화면
```

### 3.2 연동 흐름 (MQTT 방식 - 고급)

```
[GPS 디바이스]
  → MQTT Broker (AWS IoT Core / EMQX)
  → Lambda / Edge Function 컨슈머
  → Supabase location_logs 테이블
```

> [!NOTE]
> **MVP에서는 HTTP 방식 추천.** MQTT는 수백 대 이상 운용 시 고려.

---

## 4. 필요한 백엔드 변경사항

### 4.1 새 엔드포인트 추가 (Device 전용)

현재 `/api/location`은 **세션 쿠키 인증** 기반입니다.
GPS 디바이스는 쿠키가 없으므로 **별도 엔드포인트**가 필요합니다.

```
POST /api/location/device
인증: API Key (디바이스별 발급, Header: X-Device-Key)
```

```typescript
// 새로 만들 파일: src/app/api/location/device/route.ts

export async function POST(request: Request) {
  const deviceKey = request.headers.get('X-Device-Key');

  // 1. device_key로 등록된 디바이스인지 검증
  // 2. 해당 디바이스에 매핑된 delivery_id, driver_id 조회
  // 3. location_logs에 INSERT
}
```

### 4.2 DB 스키마 추가

```sql
-- GPS 디바이스 등록 테이블
CREATE TABLE gps_devices (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_key  VARCHAR(64) UNIQUE NOT NULL,  -- 디바이스 인증 키
  imei        VARCHAR(20) UNIQUE,           -- 디바이스 고유 번호
  label       VARCHAR(100),                 -- 트럭 번호/별칭 (예: "Truck-07")
  driver_id   UUID REFERENCES drivers(id) ON DELETE SET NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.3 delivery_id 매핑 전략

GPS 디바이스는 `delivery_id`를 모릅니다. 두 가지 방법:

| 전략 | 방법 | 장단점 |
|---|---|---|
| **A) 드라이버 기반** | `driver_id`로 현재 `IN_TRANSIT` 배송 자동 조회 | 단순, 다중 배송 시 주의 |
| **B) 운행 시작 트리거** | 관리자가 배송 시작 시 디바이스에 `delivery_id` 전송 | 정확, 구현 복잡 |

> MVP에서는 **A 방식** (driver_id → active delivery 자동 매핑) 권장.

---

## 5. 디바이스 설정 (Teltonika 예시)

Teltonika FMB020 기준 펌웨어 설정:

```
서버 주소: https://your-domain.com/api/location/device
프로토콜: HTTP POST
Content-Type: application/json
헤더: X-Device-Key: [발급된 키]
전송 주기: 30초 (운행중) / 5분 (정차중)
페이로드:
  - GNSS lat/lng/speed
  - 타임스탬프 (UTC)
  - IMEI
```

---

## 6. 단계별 구현 로드맵

```
Phase 1 (MVP - 현재)
└── 모바일 앱 → /api/location (유지)

Phase 2 (GPS 디바이스 도입)
├── gps_devices 테이블 생성
├── /api/location/device 엔드포인트 구현
├── 디바이스 1~2대 파일럿 테스트
└── 관리자 대시보드: 디바이스 관리 화면 추가

Phase 3 (하이브리드 운용)
├── 디바이스 있는 트럭: 자동 추적
├── 디바이스 없는 트럭: 기존 앱 방식 유지
└── 두 소스 모두 동일 location_logs 테이블에 기록
```

---

## 7. 비용 추산 (트럭 1대 기준)

| 항목 | 비용 |
|---|---|
| Teltonika FMB020 디바이스 | $50 ~ $80 |
| 셀룰러 데이터 SIM (월) | $2.50 ~ $15/월 |
| 설치비 (OBD 타입 자가설치) | $0 |
| **합계** | **초기 ~$80 + 월 ~$15** |

**SIM 플랜 비교 (미국)**

| 플랜 | 월 요금 | 특징 |
|---|---|---|
| Twilio Super SIM | $2 + $0.10/MB | 멀티캐리어 로밍, GPS 데이터량(~5MB/월)에 최저가 |
| T-Mobile IoT | $5~10 | 미국 남동부 커버리지 양호 |
| Verizon ThingSpace | $8~15 | Rural area 커버리지 최강 (I-75, I-85 루트) |
| Hologram | $0.60/MB | 선불형, 소규모 파일럿에 적합 |

> [!TIP]
> GPS 위치를 30초마다 전송 시 패킷 크기 ~200 bytes → 하루 10시간 운행 기준 **약 5MB/월**.
> **Twilio Super SIM** 기준 월 **~$2.50** 수준으로 매우 저렴.

---

## 8. 핵심 결론

> [!IMPORTANT]
> **현재 백엔드는 이미 GPS 디바이스와 호환 가능한 구조입니다.**
> 추가로 필요한 것은:
> 1. `gps_devices` 테이블 (디바이스 등록/인증)
> 2. `/api/location/device` 엔드포인트 (쿠키 없는 API Key 인증)
> 3. `location_logs`에 `source` 컬럼 추가 (`'app'` vs `'device'`) — 선택사항
>
> DB 구조(`location_logs`)는 **변경 없이** 재사용 가능.
