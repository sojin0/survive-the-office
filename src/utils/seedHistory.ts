import { getHistory, setHistory } from './storage';
import type { DayRecord } from './storage';
import { getWeatherState } from './hp';

// 실제 events.ts 이벤트와 동일한 내용 사용
const POSITIVE_EVENTS = [
  { name: '커피 한 잔', emoji: '☕', hpDelta: 8 },
  { name: '점심 맛있었음', emoji: '🍱', hpDelta: 12 },
  { name: '간식 등장', emoji: '🍩', hpDelta: 10 },
  { name: '칭찬 받음', emoji: '👏', hpDelta: 15 },
  { name: '업무 완료', emoji: '✅', hpDelta: 10 },
  { name: '웃긴 일 있었음', emoji: '😄', hpDelta: 7 },
  { name: '좋은 피드백', emoji: '💬', hpDelta: 12 },
  { name: '프로젝트 성공', emoji: '🎉', hpDelta: 20 },
];

const NEGATIVE_EVENTS = [
  { name: '메일 폭탄', emoji: '📧', hpDelta: -10 },
  { name: '긴급 회의 소집', emoji: '🗓️', hpDelta: -12 },
  { name: '불필요한 회의', emoji: '😤', hpDelta: -15 },
  { name: '긴급 요청', emoji: '🔥', hpDelta: -15 },
  { name: '시스템 오류', emoji: '💻', hpDelta: -10 },
  { name: '야근 확정', emoji: '🌀', hpDelta: -20 },
  { name: '멀티태스킹', emoji: '🤯', hpDelta: -10 },
];

// 날짜별 시나리오: [이벤트 인덱스(+는 긍정, -는 부정), 시간]
// hp는 80 시작 기준으로 이벤트 합산
const SCENARIOS: { positive: number[]; negative: number[]; times: string[] }[] = [
  { positive: [3, 6], negative: [],        times: ['09:15', '14:30'] },           // day1: +27 → 107→100 (S)
  { positive: [0, 2], negative: [],        times: ['09:05', '15:20'] },           // day2: +18 → 98 (S)
  { positive: [1],    negative: [1],       times: ['12:10', '16:45'] },           // day3: +12-12 → 80 (A)
  { positive: [4, 0], negative: [0],       times: ['10:30', '13:00', '17:00'] },  // day4: +18-10 → 88 (S)
  { positive: [2],    negative: [2, 4],    times: ['10:00', '11:30', '16:00'] },  // day5: +10-25 → 65 (A)
  { positive: [0],    negative: [1, 5],    times: ['09:30', '14:00', '18:30'] },  // day6: +8-22 → 66 (A)
  { positive: [],     negative: [2, 1, 4], times: ['10:15', '13:45', '16:30'] },  // day7: -37 → 43 (B)
  { positive: [0, 2], negative: [0, 2],    times: ['09:00', '11:00', '14:00', '17:30'] }, // day8: +18-25 → 73 (A)
  { positive: [4],    negative: [5, 2],    times: ['11:00', '14:30', '16:00'] },  // day9: +10-25 → 65 (A)
  { positive: [],     negative: [1, 2, 5], times: ['09:45', '13:00', '17:00'] },  // day10: -37 → 43 (B)
  { positive: [],     negative: [2, 5, 6], times: ['10:00', '15:00', '18:00'] },  // day11: -35 → 45 (B)
  { positive: [],     negative: [2, 3, 5], times: ['09:30', '13:30', '17:30'] },  // day12: -40 → 40 (B)
  { positive: [],     negative: [1, 3, 4, 5], times: ['09:00', '11:30', '14:00', '17:00'] }, // day13: -47 → 33 (C)
  { positive: [],     negative: [3, 5, 6, 0], times: ['09:15', '11:00', '14:30', '18:00'] }, // day14: -55 → 25 (C)
];

const SEED_VERSION = 'v2';
const SEED_VERSION_KEY = 'survive-office-seed-version';

export function seedHistory(): void {
  // 같은 버전이면 재실행 안 함
  if (localStorage.getItem(SEED_VERSION_KEY) === SEED_VERSION) return;

  const history = getHistory();
  const today = new Date();

  SCENARIOS.forEach((scenario, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (i + 1));
    const date = d.toISOString().slice(0, 10);

    const events: DayRecord['eventLog'] = [];
    let timeIdx = 0;

    scenario.positive.forEach((eIdx) => {
      const e = POSITIVE_EVENTS[eIdx];
      events.push({
        id: `seed-${date}-p${eIdx}`,
        eventId: `positive-${eIdx}`,
        name: e.name,
        emoji: e.emoji,
        hpDelta: e.hpDelta,
        timestamp: scenario.times[timeIdx++] ?? '10:00',
      });
    });

    scenario.negative.forEach((eIdx) => {
      const e = NEGATIVE_EVENTS[eIdx];
      events.push({
        id: `seed-${date}-n${eIdx}`,
        eventId: `negative-${eIdx}`,
        name: e.name,
        emoji: e.emoji,
        hpDelta: e.hpDelta,
        timestamp: scenario.times[timeIdx++] ?? '15:00',
      });
    });

    // 시간순 정렬
    events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const totalDelta = events.reduce((sum, e) => sum + e.hpDelta, 0);
    const hp = Math.min(100, Math.max(0, 80 + totalDelta));
    const minHp = events.reduce((min, _, idx) => {
      const partial = events.slice(0, idx + 1).reduce((s, e) => s + e.hpDelta, 80);
      return Math.min(min, Math.min(100, Math.max(0, partial)));
    }, 80);

    const weatherState = getWeatherState(hp);
    const survivalGrade = hp >= 81 ? 'S' : hp >= 61 ? 'A' : hp >= 41 ? 'B' : hp >= 21 ? 'C' : hp >= 1 ? 'D' : 'F';

    history[date] = { date, hp, minHp, eventLog: events, weatherState, survivalGrade };
  });

  setHistory(history);
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
}
