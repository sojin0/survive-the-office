import { create } from 'zustand';
import type { EventLog, WeatherState, SurvivalGrade } from '../types';
import { getWeatherState, getSurvivalGrade, clampHp } from '../utils/hp';
import { getState, setState, saveDayToHistory, getAuth } from '../utils/storage';
import { supabase } from '../lib/supabase';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

async function syncToSupabase(patch: {
  hp?: number;
  weather_state?: string;
  one_liner?: string;
}) {
  const auth = getAuth();
  if (!auth?.userName) return;
  await supabase
    .from('user_status')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_name', auth.userName)
    .eq('team', auth.team ?? '');
}

type AppStore = {
  hp: number;
  weatherState: WeatherState;
  eventLog: EventLog[];
  isRetired: boolean;
  isViewingDashboard: boolean;
  survivalGrade: SurvivalGrade | null;
  minHp: number;
  oneLiner: string;
  addEvent: (log: Omit<EventLog, 'id'>) => void;
  removeEvent: (id: string) => void;
  setOneLiner: (text: string) => void;
  retire: () => void;
  viewDashboard: () => void;
  resetDay: () => void;
  unretire: () => void;
  hydrate: () => void;
};

const INITIAL_HP = 80;
const INITIAL_ONE_LINER = '오늘도 살아남는 중... 🫡';

export const useAppStore = create<AppStore>((set, get) => ({
  hp: INITIAL_HP,
  weatherState: 'sunny',
  eventLog: [],
  isRetired: false,
  isViewingDashboard: false,
  survivalGrade: null,
  minHp: INITIAL_HP,
  oneLiner: INITIAL_ONE_LINER,

  addEvent(log) {
    const { hp, eventLog, minHp } = get();
    const newHp = clampHp(hp + log.hpDelta);
    const newMin = Math.min(minHp, newHp);
    const newLog: EventLog = { ...log, id: crypto.randomUUID() };
    const nextLog = [newLog, ...eventLog];
    const weatherState = getWeatherState(newHp);
    const autoOneLiner = log.hpDelta >= 0
      ? `${log.emoji} ${log.name} 완료!`
      : `${log.emoji} ${log.name}... 힘들다`;
    set({ hp: newHp, minHp: newMin, eventLog: nextLog, weatherState, oneLiner: autoOneLiner });
    const today = getToday();
    setState({
      hp: newHp, minHp: newMin, eventLog: nextLog,
      isRetired: get().isRetired, survivalGrade: get().survivalGrade, date: today,
    });
    saveDayToHistory({
      date: today, hp: newHp, minHp: newMin,
      eventLog: nextLog, weatherState, survivalGrade: get().survivalGrade ?? '',
    });
    syncToSupabase({ hp: newHp, weather_state: weatherState, one_liner: autoOneLiner });
  },

  removeEvent(id) {
    const { eventLog } = get();
    const target = eventLog.find((l) => l.id === id);
    if (!target) return;
    const nextLog = eventLog.filter((l) => l.id !== id);
    const newHp = clampHp(
      nextLog.reduceRight((acc, l) => acc + l.hpDelta, INITIAL_HP)
    );
    const newMin = nextLog.length === 0
      ? INITIAL_HP
      : Math.min(...nextLog.map((_, i) =>
          clampHp(nextLog.slice(i).reduceRight((acc, l) => acc + l.hpDelta, INITIAL_HP))
        ));
    const weatherState = getWeatherState(newHp);
    const today = getToday();
    set({ hp: newHp, minHp: newMin, eventLog: nextLog, weatherState });
    setState({
      hp: newHp, minHp: newMin, eventLog: nextLog,
      isRetired: get().isRetired, survivalGrade: get().survivalGrade, date: today,
    });
    saveDayToHistory({
      date: today, hp: newHp, minHp: newMin,
      eventLog: nextLog, weatherState, survivalGrade: get().survivalGrade ?? '',
    });
    syncToSupabase({ hp: newHp, weather_state: weatherState });
  },

  setOneLiner(text) {
    set({ oneLiner: text });
    syncToSupabase({ one_liner: text });
  },

  retire() {
    const { hp, minHp, eventLog, weatherState } = get();
    const grade = getSurvivalGrade(hp);
    const today = getToday();
    set({ isRetired: true, isViewingDashboard: false, survivalGrade: grade });
    setState({
      ...getState(), hp, minHp, eventLog,
      isRetired: true, survivalGrade: grade, date: today,
    });
    saveDayToHistory({ date: today, hp, minHp, eventLog, weatherState, survivalGrade: grade });
  },

  viewDashboard() {
    set({ isViewingDashboard: true });
  },

  resetDay() {
    const today = getToday();
    set({
      hp: INITIAL_HP, weatherState: 'sunny',
      eventLog: [], isRetired: false, isViewingDashboard: false,
      survivalGrade: null, minHp: INITIAL_HP, oneLiner: INITIAL_ONE_LINER,
    });
    setState({
      hp: INITIAL_HP, eventLog: [], minHp: INITIAL_HP,
      isRetired: false, survivalGrade: null, date: today,
    });
    saveDayToHistory({
      date: today, hp: INITIAL_HP, minHp: INITIAL_HP,
      eventLog: [], weatherState: 'sunny', survivalGrade: '',
    });
    syncToSupabase({ hp: INITIAL_HP, weather_state: 'sunny', one_liner: INITIAL_ONE_LINER });
  },

  unretire() {
    const today = getToday();
    const saved = getState();
    set({ isRetired: false, survivalGrade: null });
    if (saved) {
      setState({ ...saved, isRetired: false, survivalGrade: null, date: today });
    }
  },

  hydrate() {
    const saved = getState();
    const today = getToday();
    if (!saved || saved.date !== today) {
      get().resetDay();
      return;
    }
    const state = {
      hp: saved.hp,
      minHp: saved.minHp,
      eventLog: saved.eventLog,
      isRetired: saved.isRetired ?? false,
      isViewingDashboard: false,
      survivalGrade: saved.survivalGrade as SurvivalGrade | null,
      weatherState: getWeatherState(saved.hp),
    };
    set(state);
    saveDayToHistory({
      date: today, hp: state.hp, minHp: state.minHp,
      eventLog: state.eventLog, weatherState: state.weatherState,
      survivalGrade: state.survivalGrade ?? '',
    });
  },
}));