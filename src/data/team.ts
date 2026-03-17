import type { WeatherState } from '../types';

export type TeamMember = {
  id: string;
  name: string;
  role?: string;
  weatherState: WeatherState;
  hp: number;
  oneLiner: string;
};

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: 'member-1', name: '김메디', role: '팀장', weatherState: 'sunny',        hp: 92, oneLiner: '오늘도 파이팅! 🔥' },
  { id: 'member-2', name: '이유비',               weatherState: 'cloudy_sunny', hp: 75, oneLiner: '커피 한 잔 하고 싶다 ☕' },
  { id: 'member-3', name: '박케어',               weatherState: 'cloudy',       hp: 58, oneLiner: '집중 모드 돌입 중...' },
  { id: 'member-4', name: '한사랑',               weatherState: 'rainy',        hp: 40, oneLiner: '회의가 너무 많아요 😮‍💨' },
  { id: 'member-5', name: '하유팜',               weatherState: 'sunny',        hp: 85, oneLiner: '오늘 배포 성공 🚀' },
];

const WEATHER_EMOJI: Record<WeatherState, string> = {
  sunny: '☀️',
  cloudy_sunny: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  dead: '💀',
};

const WEATHER_LABEL: Record<WeatherState, string> = {
  sunny: '맑음',
  cloudy_sunny: '구름 조금',
  cloudy: '흐림',
  rainy: '비',
  stormy: '폭풍',
  dead: '전멸',
};

export function getWeatherEmoji(state: WeatherState): string {
  return WEATHER_EMOJI[state] ?? '☁️';
}

export function getWeatherLabel(state: WeatherState): string {
  return WEATHER_LABEL[state] ?? '흐림';
}