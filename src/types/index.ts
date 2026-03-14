export type EventType = 'positive' | 'negative';

export type EventItem = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  hpDelta: number;
  eventType: EventType;
};

export type EventLog = {
  id: string;
  eventId: string;
  name: string;
  emoji: string;
  hpDelta: number;
  timestamp: string;
  memo?: string;
};

export type WeatherState =
  | 'sunny'
  | 'cloudy_sunny'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'dead';

export type SurvivalGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export type AppState = {
  hp: number;
  weatherState: WeatherState;
  eventLog: EventLog[];
  isRetired: boolean;
  survivalGrade: SurvivalGrade | null;
  minHp: number;
};

export type DayRecord = {
  date: string;
  hp: number;
  minHp: number;
  eventLog: EventLog[];
  weatherState: WeatherState;
  survivalGrade: SurvivalGrade;
};

export type TabId = 'dashboard' | 'team' | 'history';
