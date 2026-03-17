import type { EventItem } from '../types';

export const POSITIVE_EVENTS: EventItem[] = [
  { id: 'coffee', name: '커피 한 잔', emoji: '☕', description: '아메리카노의 기적', hpDelta: 8, eventType: 'positive' },
  { id: 'lunch', name: '점심 맛있었음', emoji: '🍱', description: '오늘의 하이라이트', hpDelta: 12, eventType: 'positive' },
  { id: 'snack', name: '간식 등장', emoji: '🍩', description: '팀 간식은 팀워크', hpDelta: 10, eventType: 'positive' },
  { id: 'praise', name: '칭찬 받음', emoji: '👏', description: '인정욕구 충족', hpDelta: 15, eventType: 'positive' },
  { id: 'task-done', name: '업무 완료', emoji: '✅', description: '해냈다!', hpDelta: 10, eventType: 'positive' },
  { id: 'funny', name: '웃긴 일 있었음', emoji: '😄', description: '소소한 즐거움', hpDelta: 7, eventType: 'positive' },
  { id: 'walk', name: '산책/스트레칭', emoji: '🏃', description: '몸도 마음도 리셋', hpDelta: 8, eventType: 'positive' },
  { id: 'feedback', name: '좋은 피드백', emoji: '💬', description: '성장하는 느낌', hpDelta: 12, eventType: 'positive' },
  { id: 'project-success', name: '프로젝트 성공', emoji: '🎉', description: '대형 이벤트!', hpDelta: 20, eventType: 'positive' },
  { id: 'early-leave', name: '일찍 퇴근 예정', emoji: '🏠', description: '오늘 이긴 거 맞음', hpDelta: 15, eventType: 'positive' },
  { id: 'good-meeting', name: '기분 좋은 회의!', emoji: '🙌', description: '이런 회의라면 환영', hpDelta: 12, eventType: 'positive' },
];

export const NEGATIVE_EVENTS: EventItem[] = [
  { id: 'mail-bomb', name: '메일 폭탄', emoji: '📧', description: '읽씹하고 싶은 마음', hpDelta: -10, eventType: 'negative' },
  { id: 'urgent-meeting', name: '긴급 회의 소집', emoji: '🗓️', description: '갑툭튀 회의', hpDelta: -12, eventType: 'negative' },
  { id: 'unnecessary-meeting', name: '예상보다 긴 회의', emoji: '😤', description: '이건 메일로 해도 됐는데', hpDelta: -15, eventType: 'negative' },
  { id: 'urgent-request', name: '긴급 요청', emoji: '🔥', description: '퇴근 30분 전 단골 손님', hpDelta: -15, eventType: 'negative' },
  { id: 'system-error', name: '시스템 오류', emoji: '💻', description: '컴퓨터와의 전쟁', hpDelta: -10, eventType: 'negative' },
  { id: 'no-feedback', name: '피드백 없음', emoji: '😶', description: '내 보고서 읽긴 한 건가요', hpDelta: -8, eventType: 'negative' },
  { id: 'overtime', name: '야근 확정', emoji: '🌀', description: 'HP 대규모 손실', hpDelta: -20, eventType: 'negative' },
  { id: 'multitasking', name: '멀티태스킹', emoji: '🤯', description: '뇌가 과부하 중', hpDelta: -10, eventType: 'negative' },
  { id: 'storm-work', name: '폭풍 업무', emoji: '🌪️', description: '정신줄 어디갔죠', hpDelta: -12, eventType: 'negative' },
  { id: 'too-many-tasks', name: '할일이 너무 많음', emoji: '📋', description: '언제 하지...', hpDelta: -10, eventType: 'negative' },
];

export const ALL_EVENTS: EventItem[] = [...POSITIVE_EVENTS, ...NEGATIVE_EVENTS];