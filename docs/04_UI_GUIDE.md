# UI/UX 디자인 가이드
<!-- 컴포넌트 작성 전 반드시 읽어라. 디자인 일관성은 이 문서에서 시작된다 -->
<!-- 상세 UX 설계(플로우, 인터랙션)는 docs/03_TRD.md의 각 기능별 섹션을 참고한다 -->

## 디자인 원칙

1. **{원칙 1}**: {예: "도구처럼 보여야 한다. 매일 쓰는 대시보드이지, 마케팅 랜딩 페이지가 아니다."}
2. **{원칙 2}**: {예: "정보 밀도를 높인다. 스크롤 없이 핵심 데이터를 파악할 수 있어야 한다."}
3. **{원칙 3}**: {예: "모든 액션의 결과는 즉시, 명확하게 피드백되어야 한다."}

---

## AI 슬롭 안티패턴 — 절대 사용 금지

> [!CAUTION]
> 아래 패턴은 "AI가 만든 티가 나는" 요소들이다. 절대 사용하지 않는다.

| 금지 패턴 | 금지 이유 | 대안 |
|----------|---------|------|
| `backdrop-filter: blur()` / Glassmorphism | AI 템플릿의 1번 징후 | 불투명 배경 사용 |
| 텍스트에 그라데이션 적용 | AI SaaS 랜딩의 클리셰 | 단색 텍스트 사용 |
| Box-shadow 글로우 애니메이션 | 네온 글로우 = AI 슬롭 | 테두리 또는 배경 변화로 강조 |
| 보라/인디고 브랜드 색상 | "AI = 보라" 클리셰 | 프로젝트만의 고유 색상 정의 |
| 모든 카드에 동일한 `rounded-2xl` | 균일한 둥근 모서리 = 템플릿 느낌 | 맥락에 따라 `rounded-sm` ~ `rounded-lg` 조절 |
| 배경 gradient orb (blur-3xl 원형) | 모든 AI 랜딩에 있는 장식 | 제거. 배경은 단색으로 |
| "Powered by AI" 배지 | 기능이 아닌 장식. 가치 없음 | 제거 |
| 무의미한 애니메이션 | UX 방해, 로딩 느린 것처럼 보임 | 상태 변화를 알리는 데 필요한 경우만 |

---

## 색상 시스템

### 배경 (Background)
| 토큰 | 값 | 사용처 |
|------|-----|--------|
| `bg-page` | {예: `#0a0a0a`} | 전체 페이지 배경 |
| `bg-surface` | {예: `#141414`} | 카드, 패널 배경 |
| `bg-elevated` | {예: `#1a1a1a`} | 드롭다운, 팝오버 배경 |
| `bg-hover` | {예: `#222222`} | hover 상태 |

### 텍스트 (Text)
| 토큰 | 값 | 사용처 |
|------|-----|--------|
| `text-primary` | {예: `#ffffff`} | 제목, 핵심 정보 |
| `text-secondary` | {예: `#d4d4d4`} | 본문 텍스트 |
| `text-muted` | {예: `#737373`} | 보조 설명, 레이블 |
| `text-disabled` | {예: `#404040`} | 비활성 상태 |

### 브랜드 & 시맨틱 색상
| 토큰 | 값 | 사용처 |
|------|-----|--------|
| `brand-primary` | {예: `#3b82f6`} | 주요 CTA 버튼, 링크 |
| `status-success` | {예: `#22c55e`} | 성공, 긍정적 상태 |
| `status-error` | {예: `#ef4444`} | 오류, 위험 상태 |
| `status-warning` | {예: `#f59e0b`} | 경고, 주의 상태 |
| `status-info` | {예: `#3b82f6`} | 정보, 안내 상태 |

### 테두리 (Border)
| 토큰 | 값 | 사용처 |
|------|-----|--------|
| `border-subtle` | {예: `#262626`} | 카드 기본 테두리 |
| `border-default` | {예: `#404040`} | 입력 필드 테두리 |
| `border-focus` | {예: `#3b82f6`} | 포커스 상태 |

---

## 타이포그래피

### 폰트 패밀리
```css
/* 예시: Google Fonts */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 타입 스케일
| 역할 | 클래스 (Tailwind) | 사용처 |
|------|------------------|--------|
| Page Title | `text-3xl font-semibold tracking-tight` | 페이지 h1 |
| Section Title | `text-xl font-medium` | 섹션 제목 |
| Card Title | `text-sm font-medium text-muted` | 카드 헤더 |
| Body | `text-sm leading-relaxed` | 일반 본문 |
| Caption | `text-xs text-muted` | 날짜, 부연 설명 |
| Code | `font-mono text-sm` | 코드, 값 |

---

## 드라이버 앱 특화 UI 컴포넌트 (Driver-App Specific)
> [!IMPORTANT]
> 운전 중 안전과 시인성을 위해 드라이버 앱에서는 아래의 특화된 UI 컴포넌트와 원칙을 최우선으로 적용한다.

- **다크 모드 기본(Dark Mode Default):** 야간 운전 시 눈부심 방지를 위해 전체 앱은 다크 모드를 기본(Default) 테마로 적용한다.
- **거대한 터치 타겟 (Large Touch Targets):** 운행 중 조작성을 위해 모든 인터랙션 요소(버튼, 탭)의 최소 크기는 `64x64px` (Tailwind `min-h-16 min-w-16`) 이상으로 강제한다.
- **스와이프 액션 (Swipe-to-Action):** "운행 시작", "도착 완료" 등 치명적 상태 변경은 단순 클릭(Tap)을 금지하고, 밀어서 잠금해제하는 스와이프 슬라이더 컴포넌트를 사용해 오터치를 방지한다.
- **고대비 피드백:** 상태 변경이나 경고 발생 시 화면의 30% 이상을 차지하는 풀스크린(또는 거대한 하단 시트) 카드와 형광 컬러를 사용해 곁눈질로도 상태 파악이 가능하게 한다.
- **음성/햅틱 피드백:** 고객 메모 업데이트나 경로 이탈 경고 시, 시각적 UI 외에도 디바이스 햅틱 진동과 TTS(음성 읽어주기)를 동반해야 한다.

---

## 일반 컴포넌트 패턴

### 카드 (Card)
```
배경: bg-surface
테두리: border border-subtle rounded-lg
패딩: p-4 또는 p-6
hover: hover:border-default transition-colors
```

### 버튼 (Button)
```
Primary:   bg-brand-primary text-white rounded-md px-4 py-2 hover:opacity-90
Secondary: bg-bg-elevated text-secondary border border-subtle rounded-md px-4 py-2 hover:border-default
Danger:    bg-status-error/10 text-status-error border border-status-error/20 rounded-md
Ghost:     text-muted hover:text-secondary hover:bg-bg-elevated rounded-md
```

### 입력 필드 (Input)
```
배경: bg-bg-elevated
테두리: border border-default rounded-md
패딩: px-3 py-2
포커스: focus:border-border-focus focus:ring-1 focus:ring-border-focus outline-none
```

### 배지/태그 (Badge)
```
Success: bg-status-success/10 text-status-success rounded-full px-2 py-0.5 text-xs font-medium
Error:   bg-status-error/10 text-status-error rounded-full px-2 py-0.5 text-xs font-medium
Neutral: bg-bg-elevated text-muted rounded-full px-2 py-0.5 text-xs
```

### 테이블 (Table)
```
헤더: text-xs font-medium text-muted uppercase tracking-wider border-b border-subtle
행:   border-b border-subtle hover:bg-bg-elevated
셀:   py-3 px-4 text-sm
```

---

## 레이아웃

| 항목 | 값 | 설명 |
|------|-----|------|
| 최대 너비 | {예: `max-w-6xl`} | 콘텐츠 최대 너비 |
| 기본 정렬 | {예: 좌측 정렬} | 중앙 정렬 금지 (단, 모달/다이얼로그 제외) |
| 그리드 갭 | {예: `gap-4`} | 카드 그리드 기본 간격 |
| 섹션 간격 | {예: `space-y-8`} | 페이지 내 섹션 구분 |
| 사이드바 너비 | {예: `w-64`} | 네비게이션 사이드바 |

---

## 애니메이션 & 트랜지션

**허용 애니메이션**:
- **색상/테두리 변환**: `transition-colors duration-150` — hover 상태 변화
- **투명도 전환**: `transition-opacity duration-200` — 모달 등장
- **높이 변환**: `transition-all duration-300` — 아코디언 펼침
- **토스트/알림**: `animate-slide-in-right` (0.3s) — 알림 등장

**금지 애니메이션**:
- 무한 반복 글로우/펄스 (로딩 스피너 제외)
- 배경 그라데이션 애니메이션
- 3D transform 효과
- 1초 이상 걸리는 모든 트랜지션

---

## 아이콘

- **라이브러리**: {예: Lucide Icons (SVG 기반, tree-shakeable)}
- **크기**: 기본 `16px` (w-4 h-4), 중요 `20px` (w-5 h-5), 큰 `24px` (w-6 h-6)
- **두께**: `strokeWidth={1.5}` 통일
- **규칙**: 아이콘을 둥근 배경 박스로 감싸지 않는다 (AI 슬롭 패턴). 텍스트와 나란히 배치한다.

---

## 반응형 브레이크포인트

| 브레이크포인트 | 값 | 대상 |
|--------------|-----|------|
| `sm` | 640px | 모바일 가로 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 데스크톱 기본 |
| `xl` | 1280px | 와이드 |

**우선순위**: {예: 데스크톱 우선 (desktop-first). 모바일은 최소한의 반응형만 지원}

---

## 피그마/디자인 레퍼런스

| 항목 | 링크 |
|------|------|
| 피그마 파일 | {링크 추가 예정} |
| 디자인 시스템 | {링크 추가 예정} |
| 참고 서비스 | {예: Linear, Vercel Dashboard, Railway} |
