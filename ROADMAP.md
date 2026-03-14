# ROADMAP: 오늘 회사에서 살아남기

> 기준: AI-Native 해커톤 3일 | 방법론: Agile (Sprint 기반) | 원칙: Karpathy
> 업데이트: 2026-03-13

---

## 0. Karpathy 원칙 선언

> 이 프로젝트 전반에 걸쳐 아래 3가지 원칙을 적용한다.

| # | 원칙 | 이 프로젝트에서의 적용 |
|---|---|---|
| ① | **단순하게 시작** | LocalStorage 우선. 백엔드·WebSocket 없이 MVP 완성 후 확장 |
| ② | **직접 눈으로 확인** | 각 기능 완성 즉시 브라우저에서 수동 확인 + Playwright 자동 검증 |
| ③ | **과도한 추상화 경계** | 컴포넌트 분리는 3회 이상 반복 사용 시점에만. 유틸 함수 남발 금지 |

---

## 1. 전체 타임라인

```
Day 1 (기획·기반)     Day 2 (MVP 코어)      Day 3 (확장·QA·배포)
─────────────────     ─────────────────     ───────────────────────
[M1] Foundation   →   [M2] Core MVP     →   [M3] Should Have
 Sprint 1 (AM)         Sprint 2 (전일)        Sprint 3 (AM)
 Sprint 1 (PM)                                [M4] QA & Deploy
                                               Sprint 4 (PM)
```

---

## 2. 기능 우선순위 매트릭스

| 기능 ID | 기능명 | 우선순위 | 스프린트 | 의존성 |
|---|---|---|---|---|
| F-01 | HP 게이지 대시보드 | **Must Have** | Sprint 1 | — |
| F-02 | 이벤트 기록 | **Must Have** | Sprint 1~2 | F-01 |
| F-03 | 업무 날씨 표시 | **Must Have** | Sprint 2 | F-01, F-02 |
| F-04 | 퇴근 결과 판정 | **Must Have** | Sprint 2 | F-01, F-02, F-03 |
| F-05 | 팀 공유 보드 | Should Have | Sprint 3 | F-01, F-04 |
| F-06 | 히스토리 캘린더 | Should Have | Sprint 3 | F-04 |
| F-07 | 이벤트 커스텀 | Could Have | Sprint 4 (여유시) | F-02 |
| F-08 | 알림 기능 | Could Have | Sprint 4 (여유시) | F-02 |

---

## 3. 마일스톤 & 스프린트 상세

---

### M1: Foundation (Day 1)

> **목표:** 프로젝트 뼈대 완성, 핵심 상태 모델 확정, 정적 UI 완성

#### Sprint 1-AM: 프로젝트 세팅 (Day 1 오전, ~4h)

| 태스크 ID | 작업 | 담당 레이어 | 의존성 | 완료 기준 |
|---|---|---|---|---|
| T-001 | Vite + React + TypeScript 프로젝트 생성 | Infra | — | `npm run dev` 브라우저 확인 |
| T-002 | Tailwind CSS + Framer Motion 설치 | Infra | T-001 | `className="text-red-500"` 렌더 확인 |
| T-003 | Zustand 스토어 초안 작성 (`hp`, `events`, `weather`) | State | T-001 | TypeScript 타입 오류 0 |
| T-004 | 디자인 토큰 CSS 변수 등록 (`tailwind.config`) | Design | T-001 | Tailwind에서 `bg-color-sunny-bg` 사용 가능 |
| T-005 | 폴더 구조 확정 (`/components`, `/store`, `/utils`, `/types`) | Infra | T-001 | ③과도한 추상화 금지 — `utils/` 파일 최대 3개 |

> **Karpathy ①:** `components/` 하위 디렉토리 없이 flat 구조로 시작. 파일이 10개 초과 시점에 분리 검토.

#### Sprint 1-PM: 정적 UI 완성 (Day 1 오후, ~4h)

| 태스크 ID | 작업 | 담당 레이어 | 의존성 | 완료 기준 |
|---|---|---|---|---|
| T-006 | `HPGauge` 컴포넌트 — 정적 (수치 하드코딩 70) | UI | T-004 | 브라우저에서 게이지 바 색상·수치 표시 확인 ② |
| T-007 | `WeatherCard` 컴포넌트 — 정적 (날씨 하드코딩 "흐림") | UI | T-004 | 아이콘 + 메시지 렌더 확인 ② |
| T-008 | `EventCard` 컴포넌트 — 긍정/부정 탭 UI | UI | T-004 | 탭 전환 동작 확인 ② |
| T-009 | 메인 레이아웃 (`App.tsx`) — 3개 컴포넌트 조합 | UI | T-006~008 | 전체 화면 레이아웃 브라우저 확인 ② |
| T-010 | LocalStorage 헬퍼 (`getState`, `setState`) — 단순 래퍼 | Utils | T-003 | 저장·불러오기 콘솔 확인 ② |

**M1 완료 게이트:** 브라우저에서 HP 게이지·날씨 카드·이벤트 탭이 정적으로 표시됨.

---

### M2: Core MVP (Day 2)

> **목표:** F-01~F-04 완전 동작, LocalStorage 데이터 영속, 퇴근 결과까지 흐름 완성

#### Sprint 2-AM: HP 상태 연동 (Day 2 오전, ~4h)

| 태스크 ID | 작업 | 담당 레이어 | 의존성 | 완료 기준 |
|---|---|---|---|---|
| T-011 | Zustand `addEvent` 액션 구현 (HP 계산 로직 포함) | State | T-003, T-010 | 이벤트 클릭 → `hp` 값 변동 콘솔 확인 ② |
| T-012 | `HPGauge` → Zustand `hp` 구독, Framer Motion 애니메이션 | UI+State | T-006, T-011 | HP 변동 시 게이지 부드럽게 증감 ② |
| T-013 | HP ↔ 날씨 매핑 함수 (`getWeatherFromHP`) | Utils | T-011 | HP 0/20/40/60/80/100 각 케이스 콘솔 출력 확인 ② |
| T-014 | `WeatherCard` → Zustand `hp` 구독, 실시간 날씨 전환 | UI+State | T-007, T-013 | HP 변동 시 날씨 아이콘·배경색 자동 전환 ② |
| T-015 | LocalStorage 자동 동기화 (Zustand `subscribe`) | State | T-010, T-011 | 새로고침 후 HP·이벤트 복원 확인 ② |

#### Sprint 2-PM: 이벤트 기록 + 퇴근 판정 (Day 2 오후, ~4h)

| 태스크 ID | 작업 | 담당 레이어 | 의존성 | 완료 기준 |
|---|---|---|---|---|
| T-016 | `EventCard` → 클릭 시 `addEvent` 호출, 타임스탬프 자동 기록 | UI+State | T-008, T-011 | 이벤트 클릭 → 타임라인에 `HH:MM + 이벤트명 + ±HP` 표시 ② |
| T-017 | 툴팁 애니메이션 (클릭 후 "설명 텍스트" 노출 → 자동 소멸) | UI | T-016 | 툴팁 2초 후 자동 사라짐 확인 ② |
| T-018 | 이벤트 타임라인 컴포넌트 (오늘 기록 순서대로 표시) | UI | T-016 | 복수 이벤트 누적 표시 확인 ② |
| T-019 | 생존 등급 계산 함수 (`getSurvivalGrade`) | Utils | T-013 | 등급 S/A/B/C/D/F 각 케이스 확인 ② |
| T-020 | `SurvivalResult` 컴포넌트 (등급 + 코멘트 + TOP3 이벤트) | UI | T-019 | "퇴근하기" 버튼 클릭 → 결과 화면 전환 ② |
| T-021 | HP 최저점 추적 (Zustand `minHp` 필드) | State | T-011 | 퇴근 결과 요약 그래프에 최저점 표시 ② |

**M2 완료 게이트:** 이벤트 기록 → HP 실시간 변동 → 날씨 전환 → 퇴근 결과 판정 전체 흐름 완성. LocalStorage로 새로고침 후 복원 확인.

---

### M3: Should Have 기능 (Day 3 오전)

> **목표:** F-05 팀 공유 보드, F-06 히스토리 캘린더 구현

#### Sprint 3: 팀 기능 + 히스토리 (Day 3 오전, ~4h)

| 태스크 ID | 작업 | 담당 레이어 | 의존성 | 완료 기준 |
|---|---|---|---|---|
| T-022 | 팀원 목 데이터 정의 (`mockTeamMembers`) — ①단순하게 시작, 실데이터 연동 없음 | Data | T-003 | 팀원 3명 이상 목 데이터 정의 |
| T-023 | `TeamBoard` 컴포넌트 — 팀원 카드 그리드 (날씨 + HP + 한마디) | UI | T-022, T-014 | 팀원 카드 렌더 확인 ② |
| T-024 | `ReactionEmoji` — 응원 리액션 이모지 버튼 (LocalStorage 카운트) | UI+State | T-023 | 이모지 클릭 → 카운트 증가·저장 확인 ② |
| T-025 | 팀 전체 평균 날씨 계산 + 표시 | Utils+UI | T-022, T-013 | "오늘 팀 전체 날씨: X" 표시 확인 ② |
| T-026 | 일별 기록 저장 구조 변경 (`records[날짜]`) | State | T-015 | 날짜별 데이터 분리 저장 확인 ② |
| T-027 | `HistoryCalendar` — 날짜 셀에 날씨 아이콘 표시 | UI | T-026 | 이전 날 기록 캘린더에 표시 확인 ② |
| T-028 | 날짜 셀 클릭 → 해당 날 이벤트 상세 슬라이드업 | UI | T-027 | 날짜 클릭 → 상세 확인 ② |

> **Karpathy ①:** F-05 팀 공유는 WebSocket 없이 LocalStorage 기반 목 데이터로 먼저 구현. 실시간 동기화는 해커톤 이후 과제.

---

### M4: QA & 배포 (Day 3 오후)

> **목표:** Playwright 자동 검증 통과, Vercel 배포 완료

#### Sprint 4: 검증 + 배포 (Day 3 오후, ~4h)

| 태스크 ID | 작업 | 담당 레이어 | 의존성 | 완료 기준 |
|---|---|---|---|---|
| T-029 | Playwright MCP 검증 시나리오 실행 (아래 섹션 참조) | QA | M2, M3 | 시나리오 5개 전부 Pass ② |
| T-030 | 모바일(360px) 반응형 레이아웃 확인 | QA | M2 | 단일 컬럼·하단 탭 정상 표시 ② |
| T-031 | 접근성 기본 점검 (aria-label, 포커스 링) | QA | M2 | 이모지/아이콘 aria-label 누락 0 |
| T-032 | Could Have (F-07/F-08) 여유 시간 구현 | Feature | M2 | 시간 여유 시에만 진행 |
| T-033 | Vercel 배포 + 프리뷰 URL 팀 공유 | Infra | T-029~031 | 프리뷰 URL 접속 확인 ② |

---

## 4. Playwright MCP 검증 시나리오

> **원칙 ②(직접 눈으로 확인)** 의 자동화 버전.
> Playwright MCP를 통해 실제 브라우저에서 사용자 흐름을 검증한다.

### 시나리오 1: 이벤트 기록 → HP 변동 확인

```typescript
// scenario-01: 커피 이벤트 기록 → HP 증가
test('커피 이벤트 클릭 시 HP가 8 증가한다', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 초기 HP 확인 (100)
  const initialHP = await page.locator('[data-testid="hp-value"]').textContent();
  expect(Number(initialHP)).toBe(100);

  // 긍정 탭 클릭
  await page.click('[data-testid="tab-positive"]');

  // 커피 이벤트 버튼 클릭
  await page.click('[data-testid="event-coffee"]');

  // HP가 108이 아닌 108 (초과 불가 — 100 cap 확인)
  // 또는 초기 HP가 80이면 88로 증가
  const updatedHP = await page.locator('[data-testid="hp-value"]').textContent();
  expect(Number(updatedHP)).toBeGreaterThan(Number(initialHP) - 1); // 증가 확인

  // 타임라인에 이벤트 기록 확인
  await expect(page.locator('[data-testid="timeline"]')).toContainText('커피 한 잔');
  await expect(page.locator('[data-testid="timeline"]')).toContainText('+8');
});
```

### 시나리오 2: 날씨 상태 자동 전환 확인

```typescript
// scenario-02: HP 감소 → 날씨 아이콘 변경
test('HP가 40 이하로 떨어지면 날씨가 비/폭풍으로 바뀐다', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 부정 이벤트 연속 클릭으로 HP 40 이하로 낮춤
  await page.click('[data-testid="tab-negative"]');
  for (let i = 0; i < 5; i++) {
    await page.click('[data-testid="event-overtime"]'); // 야근 확정 -20
  }

  // 날씨 카드가 비/폭풍 상태인지 확인
  const weatherIcon = await page.locator('[data-testid="weather-icon"]').getAttribute('aria-label');
  expect(['비', '폭풍']).toContain(weatherIcon);

  // 배경 그라데이션 클래스 확인
  await expect(page.locator('[data-testid="weather-card"]')).toHaveClass(/rain|storm/);
});
```

### 시나리오 3: 퇴근 결과 판정 흐름

```typescript
// scenario-03: 퇴근하기 버튼 → 생존 등급 표시
test('퇴근하기 클릭 시 HP 잔량에 맞는 등급이 표시된다', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // HP를 65로 조정 (A등급 구간)
  // ... 이벤트 조합으로 HP 65 근방 도달

  // 퇴근하기 버튼 클릭
  await page.click('[data-testid="btn-checkout"]');

  // 결과 화면으로 전환 확인
  await expect(page.locator('[data-testid="survival-result"]')).toBeVisible();

  // 등급 텍스트 확인 (S/A/B/C/D/F 중 하나)
  const grade = await page.locator('[data-testid="survival-grade"]').textContent();
  expect(['S', 'A', 'B', 'C', 'D', 'F']).toContain(grade);

  // TOP3 이벤트 표시 확인
  const top3Items = page.locator('[data-testid="top3-event"]');
  await expect(top3Items).toHaveCount(3);
});
```

### 시나리오 4: LocalStorage 데이터 영속성

```typescript
// scenario-04: 새로고침 후 데이터 복원
test('새로고침 후 HP와 이벤트 기록이 복원된다', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // 이벤트 기록
  await page.click('[data-testid="tab-positive"]');
  await page.click('[data-testid="event-coffee"]');

  const hpBefore = await page.locator('[data-testid="hp-value"]').textContent();

  // 새로고침
  await page.reload();

  // HP 복원 확인
  const hpAfter = await page.locator('[data-testid="hp-value"]').textContent();
  expect(hpAfter).toBe(hpBefore);

  // 타임라인 복원 확인
  await expect(page.locator('[data-testid="timeline"]')).toContainText('커피 한 잔');
});
```

### 시나리오 5: 반응형 모바일 레이아웃

```typescript
// scenario-05: 모바일 뷰포트(360px)에서 레이아웃 확인
test('모바일(360px) 뷰포트에서 주요 UI가 정상 표시된다', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 812 });
  await page.goto('http://localhost:5173');

  // HP 게이지 표시 확인
  await expect(page.locator('[data-testid="hp-gauge"]')).toBeVisible();

  // 날씨 카드 표시 확인
  await expect(page.locator('[data-testid="weather-card"]')).toBeVisible();

  // 이벤트 입력 버튼 접근 가능 확인
  await expect(page.locator('[data-testid="tab-positive"]')).toBeVisible();

  // 가로 스크롤 없음 확인 (레이아웃 깨짐 방지)
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const clientWidth = await page.evaluate(() => document.body.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
});
```

---

## 5. 의존성 그래프

```
T-001 (Vite 세팅)
  └── T-002 (Tailwind)
  └── T-003 (Zustand 스토어)
       └── T-010 (LocalStorage 헬퍼)
            └── T-015 (자동 동기화)
       └── T-011 (addEvent 액션)
            └── T-013 (HP↔날씨 매핑)
                 └── T-014 (WeatherCard 구독)
                 └── T-019 (생존 등급 계산)
                      └── T-020 (SurvivalResult)
            └── T-016 (EventCard 클릭 연동)
                 └── T-017 (툴팁 애니메이션)
                 └── T-018 (타임라인)
            └── T-021 (minHp 추적)
  └── T-004 (디자인 토큰)
       └── T-006 (HPGauge 정적)
            └── T-012 (HPGauge Zustand 구독)
       └── T-007 (WeatherCard 정적)
       └── T-008 (EventCard 정적)
  └── T-005 (폴더 구조)

T-026 (날짜별 기록 구조)
  └── T-027 (HistoryCalendar)
       └── T-028 (날짜 상세)

T-022 (목 팀 데이터)
  └── T-023 (TeamBoard)
       └── T-024 (ReactionEmoji)
  └── T-025 (팀 평균 날씨)

M2 완료 → T-029 (Playwright 검증)
         → T-030 (반응형 확인)
              → T-033 (Vercel 배포)
```

---

## 6. 리스크 & 대응

| 리스크 | 발생 시점 | 대응 전략 |
|---|---|---|
| Framer Motion 애니메이션 성능 이슈 | Sprint 2 | `useReducedMotion` 적용 또는 CSS transition으로 대체 |
| LocalStorage 용량 초과 (5MB 한계) | Sprint 3 | 30일 초과 기록 자동 삭제 or 압축 저장 |
| 팀 공유 실시간 동기화 요구 | Sprint 3 | 해커톤 내에서는 목 데이터 고정, 폴링 방식 PoC로 제한 |
| Playwright 테스트 flaky (타이밍 이슈) | Sprint 4 | `waitForSelector` 대신 `waitForFunction`으로 상태 대기 |
| 배포 후 환경변수 누락 | Sprint 4 | `.env.example` 미리 작성, Vercel 환경변수 사전 등록 |

---

## 7. Could Have 백로그 (해커톤 이후)

> Sprint 4에서 시간 여유가 있을 때만 진행. 없으면 다음 이터레이션으로 이월.

| 기능 ID | 기능명 | 예상 공수 | 선행 조건 |
|---|---|---|---|
| F-07 | 이벤트 커스텀 (사용자 직접 추가) | ~2h | F-02 완성 |
| F-08 | 넛지 알림 (Browser Push Notification) | ~3h | 브라우저 권한 동의 UX 설계 필요 |
| — | 팀 공유 실시간 동기화 (WebSocket) | ~1일 | 백엔드 스택 결정 후 |
| — | 히스토리 트렌드 차트 (Recharts) | ~2h | F-06 완성 |

---

## 8. 완료 정의 (Definition of Done)

각 태스크는 아래 기준을 **모두** 충족해야 완료로 간주한다.

- [ ] 브라우저에서 직접 눈으로 동작 확인 (**Karpathy ②**)
- [ ] TypeScript 타입 오류 0
- [ ] `npm run build` 통과 (빌드 에러 없음)
- [ ] 관련 Playwright 시나리오가 있다면 Pass
- [ ] 의도하지 않은 추상화 레이어 없음 (**Karpathy ③**)

---

*본 ROADMAP은 PRD v1.0 기반으로 작성되었습니다.*
*Playwright MCP 시나리오는 `data-testid` 속성이 각 컴포넌트에 사전 지정되어 있어야 합니다.*
