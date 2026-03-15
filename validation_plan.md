## 3. 디자인 검토 체크리스트

> 검토 수행일: 2026-03-14 | 검토자: UX/UI Designer | 환경: Chrome 최신 + Safari (iPhone 13)

### 3.1 시각적 일관성

| 항목 | 확인 기준 | 통과 여부 | 확인 방법 |
|---|---|---|---|
| 색상 토큰 | 모든 색상이 CSS 변수 사용, 하드코딩 없음 | ✅ | VSCode 전체 검색으로 하드코딩 색상값 없음 확인 |
| 날씨별 테마 | HP 범위에 따라 배경색/아이콘 정확히 전환됨 | ✅ | 브라우저에서 이벤트 클릭하며 6단계 전환 직접 확인 |
| HP 게이지 색상 | weatherState별 그라데이션 정확히 적용 | ✅ | HPGauge 코드 및 브라우저 실시간 확인 |
| 긍정/부정 이벤트 색상 | positive-bg / negative-bg 토큰 일관 적용 | ✅ | EventButton 렌더링 결과 육안 확인 |
| 폰트 패밀리 | Pretendard 전체 일관 적용 | ✅ | Chrome DevTools > Computed > font-family 확인 |
| 폰트 사이즈 | display/title/body/caption 토큰 정의 완료 | ✅ | tailwind.config.js + tokens.css 코드 확인 |
| 폰트 웨이트 | bold/medium/regular 토큰 정의 완료 | ✅ | tailwind.config.js + tokens.css 코드 확인 |
| 간격 | spacing 토큰(xs~2xl) 정의 및 적용 | ✅ | tokens.css 및 컴포넌트 className 코드 확인 |
| 보더 반경 | radius 토큰(sm~xl~full) 정의 및 적용 | ✅ | tokens.css 및 컴포넌트 className 코드 확인 |
| 그림자 | card/elevated/glass 토큰 정의 및 적용 | ✅ | tokens.css 및 브라우저 육안 확인 |

### 3.2 컴포넌트 검토

| 컴포넌트 | 확인 항목 | 통과 여부 | 확인 방법 |
|---|---|---|---|
| HPGauge | 0~100 클램프 / 색상 전환 / pulse 애니메이션(HP≤20) | ✅ | HP 0·20·100 경계값 직접 테스트 |
| WeatherCard | 6가지 날씨 상태 / stormy·dead 텍스트 흰색 전환 | ✅ | 이벤트 반복 클릭으로 6단계 전환 확인 |
| EventButton | 툴팁 등장(200ms) / 유지(1200ms) / 소멸(200ms) / timerRef 리셋 | ✅ | 브라우저에서 클릭 타이밍 육안 확인 |
| Tooltip | 버튼 위 위치 / 날씨 테마 색상 대응 | ✅ | stormy·dead 상태에서 툴팁 색상 전환 확인 |
| EventTimeline | 타임스탬프(HH:MM) / 최신순 정렬 / 슬라이드-인 | ✅ | 이벤트 기록 후 타임라인 순서 및 애니메이션 확인 |
| SurvivalResult | 6개 등급(S~F) / 등급별 애니메이션 | ✅ | 다양한 HP로 퇴근하여 S·A·B·C·D·F 등급 모두 확인 |
| TeamBoard | 팀원 카드 / 리액션 / HP 실시간 반영 | ✅ | 이벤트 기록 후 팀보드 탭 전환하여 HP 동기화 확인 |
| HistoryCalendar | 날짜별 아이콘 / 상세 조회 / 모바일 세로 스택 | ✅ | 모바일(360px) + 데스크탑에서 레이아웃 확인 |
| TimelinePanel | 일괄 삭제 / 팀원 응원 / 퇴근 후 읽기 전용 | ✅ | 퇴근 후 열람 모드에서 삭제 버튼 비활성화 확인 |
| LoginScreen | 팀 선택 드롭다운 / 직접 입력 플로우 | ✅ | "직접 입력..." 선택 후 입력 필드 전환 확인 |

### 3.3 접근성 검토

| 항목 | 확인 기준 | 통과 여부 | 확인 방법 |
|---|---|---|---|
| 색상 대비 | WCAG 2.1 AA 기준 (텍스트 4.5:1 이상) 충족 | ✅ | Chrome DevTools > Accessibility 패널 확인 |
| HP 게이지 | 색상 외 수치 텍스트 병행 표시 (색맹 고려) | ✅ | HPGauge 코드에서 수치 텍스트 병행 표시 확인 |
| 이모지 aria-label | 주요 이모지/아이콘에 aria-label 또는 aria-hidden 부여 | ✅ | 컴포넌트 코드 전체 검색으로 aria 속성 확인 |
| 포커스 링 | 인터랙티브 요소에 focus:ring 적용 | ✅ | Tab 키 이동으로 포커스 링 육안 확인 |
| 키보드 네비게이션 | Tab 순서 논리적 구성 확인 | ✅ | Tab 키로 전체 플로우 이동 테스트 |
| 버튼 터치 영역 | 모바일 기준 최소 44×44px | ⚠️ | 일부 소형 버튼(캘린더 날짜 40px) 미달 가능성 — 기능상 문제 없음 확인 |

### 3.4 반응형 검토

| 브레이크포인트 | 레이아웃 | 확인 항목 | 통과 여부 | 확인 방법 |
|---|---|---|---|---|
| 모바일 (360px~) | 단일 컬럼 | 하단 탭 / 이벤트 버튼 2열 | ✅ | Chrome DevTools 360px 시뮬레이션 |
| 태블릿 (768px~) | 2컬럼 | HPGauge + EventPanel 좌우 | ✅ | Chrome DevTools 768px 시뮬레이션 |
| 데스크탑 (1280px~) | 2컬럼 | 대시보드 + 타임라인 | ✅ | 실제 데스크탑 브라우저 확인 |

### 3.5 크로스 브라우저 검토

| 브라우저 | 버전 | 통과 여부 | 확인 방법 | 이슈 메모 |
|---|---|---|---|---|
| Chrome | 최신 | ✅ | 직접 실행 확인 | 이슈 없음 |
| Safari | 최신 | ✅ | iPhone 13 Safari 직접 확인 | -webkit-backdrop-filter 적용 확인 |
| Firefox | 최신 | ⚠️ | Firefox 설치 후 확인 | backdrop-filter 미지원 — glass-card 폴백 필요 |
| Edge | 최신 | ✅ | Edge 브라우저 직접 확인 | 이슈 없음 |