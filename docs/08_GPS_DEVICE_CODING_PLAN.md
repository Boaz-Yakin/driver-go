# GPS 디바이스 도입: 필요한 코딩 목록

> [!NOTE]
> 현재 `location_logs` 테이블과 위치 조회 로직은 **그대로 재사용**됩니다.
> 추가해야 할 코드는 크게 **4개 영역**입니다.

---

## 전체 파일 변경 맵

```
추가 (신규)
├── supabase/migrations/0002_gps_devices.sql       ← DB 테이블
├── src/app/api/location/device/route.ts           ← 디바이스 전용 수신 API
├── src/app/api/devices/route.ts                   ← 디바이스 목록 CRUD
├── src/app/api/devices/[id]/route.ts              ← 디바이스 개별 관리
└── src/app/dashboard/devices/page.tsx             ← 관리자 UI

수정 (기존 파일)
├── src/types/index.ts                             ← GpsDevice 타입 추가
└── src/app/api/location/route.ts                  ← source 필드 추가 (선택)
```

---

## 1. DB 마이그레이션 (신규)

**파일**: `supabase/migrations/0002_gps_devices.sql`

```sql
-- GPS 디바이스 등록 테이블
CREATE TABLE gps_devices (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_key  VARCHAR(64) UNIQUE NOT NULL,   -- API 인증 키 (랜덤 생성)
  imei        VARCHAR(20) UNIQUE,            -- 디바이스 고유 번호 (IMEI)
  label       VARCHAR(100),                  -- 트럭 번호/별칭 (예: "Truck-07")
  driver_id   UUID REFERENCES drivers(id) ON DELETE SET NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- location_logs에 source 컬럼 추가 (어디서 온 데이터인지 구분)
ALTER TABLE location_logs
  ADD COLUMN source VARCHAR(10) DEFAULT 'app'
  CHECK (source IN ('app', 'device'));
```

> [!NOTE]
> `location_logs` 테이블 자체는 건드리지 않습니다. 컬럼 1개만 추가.

---

## 2. 디바이스 전용 위치 수신 API (핵심 신규)

**파일**: `src/app/api/location/device/route.ts`

현재 `/api/location/route.ts`는 **세션 쿠키 인증** 기반.
GPS 디바이스는 쿠키가 없으므로 **별도 엔드포인트** 필요.

```typescript
// POST /api/location/device
// 인증: Header "X-Device-Key: <발급된 키>"
// 호출 주체: GPS 하드웨어 디바이스 (Teltonika 등)

export async function POST(request: Request) {
  // 1. X-Device-Key 헤더 추출
  const deviceKey = request.headers.get('X-Device-Key');
  if (!deviceKey) → 401 반환

  // 2. gps_devices 테이블에서 디바이스 조회 + 인증
  const device = await supabase
    .from('gps_devices')
    .select('id, driver_id, is_active')
    .eq('device_key', deviceKey)
    .single();

  if (!device || !device.is_active) → 403 반환

  // 3. 해당 driver_id의 현재 IN_TRANSIT 배송 자동 조회
  //    (디바이스는 delivery_id를 모르기 때문에 자동 매핑)
  const delivery = await supabase
    .from('deliveries')
    .select('id')
    .eq('driver_id', device.driver_id)
    .in('status', ['IN_TRANSIT', 'PICKED_UP'])
    .maybeSingle();

  if (!delivery) → 204 반환 (운행중 배송 없음, 조용히 무시)

  // 4. Body에서 좌표 추출
  const { lat, lng, speed, timestamp } = await request.json();

  // 5. location_logs에 INSERT (source: 'device')
  await supabase.from('location_logs').insert([{
    delivery_id: delivery.id,
    driver_id: device.driver_id,
    lat, lng, speed,
    timestamp: timestamp ?? new Date().toISOString(),
    source: 'device',
  }]);

  return 201
}
```

**이 파일이 GPS 디바이스 연동의 핵심**입니다. 나머지는 관리 편의를 위한 부가 기능.

---

## 3. 디바이스 관리 API (신규)

관리자가 디바이스를 등록/조회/비활성화하기 위한 CRUD.

### `src/app/api/devices/route.ts`

```
GET  /api/devices     → 전체 디바이스 목록 (드라이버 정보 JOIN)
POST /api/devices     → 새 디바이스 등록 (device_key 자동 생성)
```

```typescript
// POST 시 device_key 자동 생성 로직
const deviceKey = crypto.randomUUID().replace(/-/g, ''); // 32자 랜덤 키
```

### `src/app/api/devices/[id]/route.ts`

```
PATCH  /api/devices/[id]  → 드라이버 재배정, is_active 토글
DELETE /api/devices/[id]  → 디바이스 삭제
```

---

## 4. 타입 정의 추가

**파일**: `src/types/index.ts`

```typescript
// 기존 LocationLog에 source 추가
export interface LocationLog {
  id: number;
  delivery_id: string;
  driver_id: string;
  lat: number;
  lng: number;
  speed: number | null;
  timestamp: string;
  source?: 'app' | 'device';   // ← 추가
}

// 신규 타입
export interface GpsDevice {
  id: string;
  device_key: string;
  imei: string | null;
  label: string | null;
  driver_id: string | null;
  is_active: boolean;
  created_at: string;
  // JOIN
  driver?: { id: string; name: string } | null;
}
```

---

## 5. 관리자 대시보드 UI (신규)

**파일**: `src/app/dashboard/devices/page.tsx`

기존 `/dashboard/drivers`와 유사한 구조로 작성.

```
화면 구성:
┌─────────────────────────────────────────┐
│ GPS 디바이스 관리              [+ 등록] │
├──────────┬──────────┬─────────┬─────────┤
│ 라벨     │ IMEI     │ 배정 기사│ 상태   │
├──────────┼──────────┼─────────┼─────────┤
│ Truck-01 │ 35892... │ John D. │ 🟢 활성│
│ Truck-02 │ 35892... │ 미배정  │ 🔴 비활│
└──────────┴──────────┴─────────┴─────────┘

디바이스 등록 모달:
  - 라벨 (트럭 번호)
  - IMEI (선택)
  - 배정할 드라이버 선택
  → device_key 자동 생성 후 화면에 표시
     (디바이스 펌웨어 설정에 복사)
```

> [!IMPORTANT]
> **device_key는 등록 시 딱 한 번만 보여줍니다.** 이후 재조회 불가로 보안 강화.
> (GitHub의 Personal Access Token 방식과 동일)

---

## 6. Sidebar 메뉴 추가 (선택)

**파일**: `src/components/layout/Sidebar.tsx`

```typescript
// 기존 메뉴 항목에 추가
{ href: '/dashboard/devices', label: 'GPS 디바이스', icon: SignalIcon }
```

---

## 구현 순서 (우선순위)

```
Step 1  supabase/migrations/0002_gps_devices.sql    ← 30분
Step 2  src/app/api/location/device/route.ts        ← 1시간  ★ 핵심
Step 3  src/types/index.ts                          ← 15분
Step 4  src/app/api/devices/route.ts                ← 1시간
        src/app/api/devices/[id]/route.ts
Step 5  src/app/dashboard/devices/page.tsx          ← 2시간
Step 6  Sidebar.tsx 메뉴 추가                       ← 15분
```

**총 예상 작업 시간: 약 5시간**

---

## 변경 없는 파일들 ✅

| 파일 | 이유 |
|---|---|
| `location_logs` 테이블 (핵심 컬럼) | 구조 동일, source 컬럼만 추가 |
| `src/app/api/track/[token]/route.ts` | 수신자 트래킹은 그대로 |
| `src/app/api/map/route.ts` | 지도 조회 로직 그대로 |
| `src/app/api/location/route.ts` | 기존 모바일 앱 경로 유지 |
| 드라이버 앱 전체 | 병행 운용 가능 |
