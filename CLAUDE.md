CLAUDE.md — 오늘 회사에서 살아남기 (Survive the Office)

이 파일은 AI(Claude)가 본 프로젝트의 맥락을 빠르게 파악하고,
코드 생성 및 기능 구현 시 일관성을 유지하기 위한 컨텍스트 문서입니다.


1. 프로젝트 한 줄 요약
직장인이 하루 업무 이벤트를 버튼으로 기록하면, HP(체력 게이지)가 실시간으로 변동되고 오늘의 "업무 날씨"로 시각화되는 직장인 생존 대시보드 웹 서비스.

2. 프로젝트 맥락

주최: 유비케어 AI-Native 해커톤
팀 역할: UX/UI 디자이너 주도 개발 (AI 코드 생성 활용)
목표: 디자인 시스템 중심의 완성도 높은 프로토타입 구현
기간: 단기 해커톤 (5일 이내)
PRD 위치: /docs/PRD.md


3. 핵심 도메인 개념 (Domain Glossary)
AI가 코드를 생성할 때 반드시 아래 용어를 기준으로 일관되게 사용할 것.
용어설명hp사용자의 현재 체력 수치. 0~100 정수. 초기값 80 (출근 피로도 반영)hpDelta이벤트 발생 시 HP 변동량. 양수(+) = 회복, 음수(-) = 감소eventHP에 영향을 주는 업무 행동 단위. 긍정/부정으로 분류eventType'positive' 또는 'negative'eventLog오늘 하루 기록된 이벤트 배열. 타임스탬프 포함weatherStateHP 범위에 따라 결정되는 날씨 상태 (sunny / cloudy_sunny / cloudy / rainy / stormy / dead)survivalGrade퇴근 시 HP 잔량으로 결정되는 생존 등급 (S/A/B/C/D/F)tooltip이벤트 버튼 클릭 시 나타났다 사라지는 이벤트 설명 텍스트viewDashboard퇴근 후 HP/기록 유지한 채 대시보드 열람 모드로 전환

4. 핵심 인터랙션 명세
AI가 UI 컴포넌트를 구현할 때 반드시 준수해야 하는 인터랙션 규칙.
4.1 이벤트 버튼 클릭 플로우
사용자가 이벤트 버튼 클릭
  → ① 클릭 시각(HH:MM)을 타임스탬프로 자동 생성
  → ② 해당 이벤트의 description 텍스트가 툴팁으로 등장 (fade-in)
  → ③ 툴팁은 약 1.2초 후 자동으로 사라짐 (fade-out)
  → ④ HP 게이지가 hpDelta만큼 애니메이션으로 증가 또는 감소
  → ⑤ eventLog 배열에 { id, name, hpDelta, timestamp, description } 추가
  → ⑥ 타임라인에 새 항목이 상단에 추가되며 슬라이드-인 애니메이션
4.2 툴팁 동작 규칙

툴팁은 버튼 클릭 시 해당 버튼 위 또는 중앙 상단에 나타남
내용: 이벤트의 description 필드 텍스트 (예: "읽씹하고 싶은 마음 😤")
등장: opacity 0 → 1, translateY 8px → 0, duration 200ms
유지: 1200ms
소멸: opacity 1 → 0, translateY 0 → -8px, duration 200ms
동일 버튼 연속 클릭 시: 툴팁 타이머 리셋 후 재등장 (timerRef로 관리)
여러 버튼 동시 클릭 시: 각각 독립적으로 툴팁 동작
날씨 테마 대응: stormy/dead 상태에서 흰 배경 + 어두운 글씨로 자동 전환

4.3 HP 게이지 애니메이션 규칙

HP 변동은 즉각 반영하되 게이지 바는 400ms ease-out 트랜지션
HP가 0 미만으로 내려가지 않음 (최솟값 0 클램프)
HP가 100 초과하지 않음 (최댓값 100 클램프)
HP 변동 시 게이지 색상도 weatherState에 따라 함께 전환
HP가 20 이하로 떨어지면 게이지 바가 pulse 애니메이션 (위기 신호)
HP = 100: "오늘만 같아라 ✨" 고정 메시지
HP = 0: "나 건들이지 마라.... 💀" 고정 메시지


5. 데이터 구조
5.1 Event 타입 정의
typescripttype EventItem = {
  id: string;               // uuid
  name: string;             // 이벤트명 (예: "메일 폭탄")
  emoji: string;            // 대표 이모지 (예: "📧")
  description: string;      // 툴팁에 표시될 설명 (예: "읽씹하고 싶은 마음")
  hpDelta: number;          // HP 변동값 (양수: 회복, 음수: 감소)
  eventType: 'positive' | 'negative';
};

type EventLog = {
  id: string;               // uuid
  eventId: string;          // EventItem의 id 참조
  name: string;
  emoji: string;
  hpDelta: number;
  timestamp: string;        // "HH:MM" 형식
  memo?: string;            // 선택적 메모
};
5.2 앱 전역 상태 구조
typescripttype AppState = {
  hp: number;                         // 현재 HP (0~100), 초기값 80
  weatherState: WeatherState;         // 현재 날씨 상태
  eventLog: EventLog[];               // 오늘의 이벤트 기록 배열 (최신순)
  isRetired: boolean;                 // 퇴근 여부
  survivalGrade: SurvivalGrade | null; // 퇴근 후 생존 등급
  minHp: number;                      // 오늘 최저 HP 기록
  oneLiner: string;                   // 오늘의 한마디
};

type WeatherState = 'sunny' | 'cloudy_sunny' | 'cloudy' | 'rainy' | 'stormy' | 'dead';
type SurvivalGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
5.3 HP → WeatherState 매핑 함수 시그니처
typescriptfunction getWeatherState(hp: number): WeatherState {
  if (hp >= 81) return 'sunny';
  if (hp >= 61) return 'cloudy_sunny';
  if (hp >= 41) return 'cloudy';
  if (hp >= 21) return 'rainy';
  if (hp >= 1)  return 'stormy';
  return 'dead';
}

6. 디자인 토큰 요약
CSS 변수명을 코드 전반에서 일관되게 사용할 것. 하드코딩 금지.
css/* 날씨 테마 (클래스 기반 — .weather-sunny 등) */
--color-sunny-bg: #FFF9E6;
--color-cloudy-bg: #ECEFF1;
--color-rain-bg: #E8EAF6;
--color-storm-bg: #546E7A;

/* HP 상태 */
--color-hp-high: #4CAF50;
--color-hp-mid: #FF9800;
--color-hp-low: #F44336;

/* 이벤트 타입 */
--color-positive: #43A047;
--color-negative: #E53935;
--color-positive-text: #1A1A1A;
--color-positive-bg: rgba(255, 255, 255, 0.65);
--color-negative-text: #555555;
--color-negative-bg: rgba(0, 0, 0, 0.05);

/* 텍스트 */
--color-text-primary: #1A1A1A;
--color-text-secondary: #555555;
--color-text-muted: #999999;
--color-text-disabled: #CCCCCC;

/* 간격 */
--spacing-xs: 4px; --spacing-sm: 8px;
--spacing-md: 16px; --spacing-lg: 24px;
--spacing-xl: 32px; --spacing-2xl: 48px;

/* 반경 */
--radius-sm: 8px; --radius-md: 12px;
--radius-lg: 20px; --radius-xl: 28px; --radius-full: 9999px;

7. 컴포넌트 구조 (Component Tree)
App
├── LoginScreen             ← 로그인 화면
├── AppHeader               ← 상단 헤더
├── MainLayout              ← 탭 네비게이션 + 날씨 클래스 적용
│   ├── Dashboard           ← 메인 대시보드 (내부 스크롤)
│   │   ├── WeatherCard     ← 현재 날씨 + 상태 메시지
│   │   ├── HPGauge         ← HP 게이지 바 + 수치 + 상태 텍스트
│   │   ├── OneLinerInput   ← 오늘의 한마디 + 팀원 응원 뱃지
│   │   ├── EventPanel      ← 이벤트 버튼 그리드 (긍정/부정 탭)
│   │   │   └── EventButton ← 개별 이벤트 버튼 + Tooltip
│   │   └── TimelinePanel   ← 오늘의 기록 + 팀원 응원 섹션
│   ├── TeamBoard           ← 팀 공유 보드 (실시간 HP 반영)
│   └── HistoryCalendar     ← 과거 기록 캘린더 (반응형)
└── SurvivalResult          ← 퇴근 결과 화면 (등급별 애니메이션)

8. 기술 스택 및 주요 라이브러리
역할라이브러리비고UI 프레임워크React 18 + TypeScript스타일링Tailwind CSS디자인 토큰은 CSS 변수 병용전역 상태ZustanduseAppStore 단일 스토어애니메이션Framer Motion툴팁, HP 게이지, 화면 전환아이콘lucide-react데이터 저장localStorage (MVP)키: survive-office-log배포Vercel

9. 파일 구조 컨벤션
src/
├── components/           # UI 컴포넌트
├── store/
│   └── useAppStore.ts    # Zustand 전역 상태
├── data/
│   └── events.ts         # 이벤트 목록 상수 데이터
│   └── team.ts           # 팀원 MOCK 데이터
├── utils/
│   ├── hp.ts             # getWeatherState, getSurvivalGrade 등 순수 함수
│   ├── storage.ts        # localStorage 유틸
│   └── seedHistory.ts    # 개발용 히스토리 시드 데이터
├── styles/
│   └── tokens.css        # CSS 디자인 토큰 변수 정의
└── types/
    └── index.ts          # 전역 타입 정의

10. 코드 작성 원칙

디자인 토큰 우선: 색상, 간격, 반경은 반드시 CSS 변수 사용. 하드코딩 금지.
타입 안전성: any 타입 사용 금지. 모든 props에 타입 정의 필수.
단일 책임: 컴포넌트 하나는 하나의 역할만 수행.
접근성: 이모지 요소에 aria-label 부여. 인터랙티브 요소에 포커스 스타일 필수.
애니메이션 일관성: 모든 트랜지션은 Framer Motion 사용. CSS transition 혼용 금지.
HP 값 처리: HP 변동 시 반드시 clampHp() 함수 사용 (0~100 클램프).
날씨 테마 대응: stormy/dead 상태에서 텍스트·버튼·툴팁 색상 자동 전환 필수.


11. 현재 구현 상태 (Implementation Status)
기능상태PRD 작성✅ 완료CLAUDE.md 작성✅ 완료디자인 시스템 정의✅ 완료UI 컴포넌트 구현✅ 완료이벤트 기록 기능✅ 완료HP 게이지 + 애니메이션✅ 완료퇴근 결과 화면✅ 완료 (등급별 애니메이션 포함)팀 공유 보드✅ 완료 (MOCK 데이터, 실시간 HP 반영)히스토리 캘린더✅ 완료 (반응형 대응)날씨 테마 전파✅ 완료 (MainLayout 기반 CSS 변수 전파)팀원 응원 연동✅ 완료 (대시보드 뱃지 + 타임라인 섹션)사용성 테스트✅ 완료 (내부 3명, validation_plan.md 참고)Vercel 배포✅ 완료소셜 로그인⏸️ MVP 범위 외 (추후 개선 예정)

12. AI 활용 내역 (AI-Native 개발 기록)
단계AI 활용 내용설계Claude와 PRD·CLAUDE.md·디자인 토큰 구조 설계구현Claude Code로 전체 컴포넌트 scaffolding 및 구현디버깅Claude와 타입 오류·CSS 변수 불일치·레이아웃 문제 해결검수Claude와 validation_plan 체크리스트 항목별 코드 검수개선사용성 테스트 결과 기반 Claude와 반복 개선

이 파일은 개발 진행에 따라 지속적으로 업데이트됩니다.
Last updated: 2026-03-14