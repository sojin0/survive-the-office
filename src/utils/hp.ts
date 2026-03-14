import type { WeatherState, SurvivalGrade } from '../types';

export function getWeatherState(hp: number): WeatherState {
  if (hp >= 81) return 'sunny';
  if (hp >= 61) return 'cloudy_sunny';
  if (hp >= 41) return 'cloudy';
  if (hp >= 21) return 'rainy';
  if (hp >= 1) return 'stormy';
  return 'dead';
}

const WEATHER_META: Record<
  WeatherState,
  { label: string; message: string; ariaLabel: string }
> = {
  sunny: {
    label: '맑음',
    message: '오늘 무적 모드! 뭐든 가능해요',
    ariaLabel: '맑음',
  },
  cloudy_sunny: {
    label: '구름 조금',
    message: '순항 중. 이 기세 유지!',
    ariaLabel: '구름 조금',
  },
  cloudy: {
    label: '흐림',
    message: '버티는 중. 커피 한 잔 어때요?',
    ariaLabel: '흐림',
  },
  rainy: {
    label: '비',
    message: '우산 챙기세요. 오늘 좀 빡세네요',
    ariaLabel: '비',
  },
  stormy: {
    label: '폭풍',
    message: '전멸 직전! 간식이 필요한 순간',
    ariaLabel: '폭풍',
  },
  dead: {
    label: '전멸',
    message: '오늘은 여기까지… 수고했어요',
    ariaLabel: '전멸',
  },
};

export function getWeatherMeta(state: WeatherState) {
  return WEATHER_META[state];
}

export function getSurvivalGrade(hp: number): SurvivalGrade {
  if (hp >= 81) return 'S';
  if (hp >= 61) return 'A';
  if (hp >= 41) return 'B';
  if (hp >= 21) return 'C';
  if (hp >= 1) return 'D';
  return 'F';
}

const GRADE_META: Record<
  SurvivalGrade,
  { title: string; comment: string; emoji: string }
> = {
  S: {
    title: '전설의 생존자',
    comment: '오늘 당신은 회사를 이겼습니다',
    emoji: '🏆',
  },
  A: {
    title: '숙련된 생존자',
    comment: '흔들렸지만 끝까지 버텼어요',
    emoji: '😎',
  },
  B: {
    title: '평균 생존자',
    comment: '오늘도 평타. 내일은 더 잘될 거예요',
    emoji: '🙂',
  },
  C: {
    title: '간신히 생존',
    comment: '겨우 살아남았어요. 푹 쉬세요',
    emoji: '😮‍💨',
  },
  D: {
    title: '기적의 생존',
    comment: '어떻게 버틴 건지 신기할 따름',
    emoji: '🥵',
  },
  F: {
    title: '오늘은 전멸',
    comment: '수고했어요. 내일은 다를 거예요',
    emoji: '💀',
  },
};

export function getGradeMeta(grade: SurvivalGrade) {
  return GRADE_META[grade];
}

export function clampHp(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
