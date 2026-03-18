import { create } from 'zustand';
import type { EventLog, WeatherState, SurvivalGrade } from '../types';
import { getWeatherState, getSurvivalGrade, clampHp } from '../utils/hp';
import { getState as getLocalState, saveDayToHistory, getAuth } from '../utils/storage';
import { supabase } from '../lib/supabase';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

async function syncToSupabase(patch: {
  hp?: number;
  min_hp?: number;
  weather_state?: string;
  one_liner?: string;
  is_retired?: boolean;
  survival_grade?: string;
  event_log?: EventLog[];
  last_active_date?: string;
}) {
  const auth = getAuth();
  if (!auth?.userName) return;
  await supabase
    .from('user_status')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_name', auth.userName)
    .eq('team', auth.team ?? '');
}

async function fetchFromSupabase() {
  const auth = getAuth();
  if (!auth?.userName) return null;
  const { data } = await supabase
    .from('user_status')
    .select('hp, min_hp, weather_state, one_liner, is_retired, survival_grade, event_log, last_active_date')
    .eq('user_name', auth.userName)
    .eq('team', auth.team ?? '')
    .single();
  return data ?? null;
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
    const today = getToday();
    set({ hp: newHp, minHp: newMin, eventLog: nextLog, weatherState, oneLiner: autoOneLiner });
    saveDayToHistory({ date: today, hp: newHp, minHp: newMin, eventLog: nextLog, weatherState, survivalGrade: get().survivalGrade ?? '' });
    syncToSupabase({ hp: newHp, min_hp: newMin, weather_state: weatherState, one_liner: autoOneLiner, event_log: nextLog, last_active_date: today });
  },

  removeEvent(id) {
    const { eventLog } = get();
    const target = eventLog.find((l) => l.id === id);
    if (!target) return;
    const nextLog = eventLog.filter((l) => l.id !== id);
    const newHp = clampHp(nextLog.reduceRight((acc, l) => acc + l.hpDelta, INITIAL_HP));
    const newMin = nextLog.length === 0
      ? INITIAL_HP
      : Math.min(...nextLog.map((_, i) =>
          clampHp(nextLog.slice(i).reduceRight((acc, l) => acc + l.hpDelta, INITIAL_HP))
        ));
    const weatherState = getWeatherState(newHp);
    const today = getToday();
    set({ hp: newHp, minHp: newMin, eventLog: nextLog, weatherState });
    saveDayToHistory({ date: today, hp: newHp, minHp: newMin, eventLog: nextLog, weatherState, survivalGrade: get().survivalGrade ?? '' });
    syncToSupabase({ hp: newHp, min_hp: newMin, weather_state: weatherState, event_log: nextLog, last_active_date: today });
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
    saveDayToHistory({ date: today, hp, minHp, eventLog, weatherState, survivalGrade: grade });
    syncToSupabase({ is_retired: true, survival_grade: grade });
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
    saveDayToHistory({ date: today, hp: INITIAL_HP, minHp: INITIAL_HP, eventLog: [], weatherState: 'sunny', survivalGrade: '' });
    syncToSupabase({ hp: INITIAL_HP, min_hp: INITIAL_HP, weather_state: 'sunny', one_liner: INITIAL_ONE_LINER, is_retired: false, survival_grade: '', event_log: [], last_active_date: today });
  },

  unretire() {
    set({ isRetired: false, survivalGrade: null });
    syncToSupabase({ is_retired: false, survival_grade: '' });
  },

  async hydrate() {
    const today = getToday();
    const data = await fetchFromSupabase();

    // Supabase에 오늘 데이터가 있으면 그걸 사용
    if (data && data.last_active_date === today) {
      const state = {
        hp: data.hp ?? INITIAL_HP,
        minHp: data.min_hp ?? INITIAL_HP,
        eventLog: (data.event_log as EventLog[]) ?? [],
        isRetired: data.is_retired ?? false,
        isViewingDashboard: false,
        survivalGrade: (data.survival_grade as SurvivalGrade) || null,
        weatherState: getWeatherState(data.hp ?? INITIAL_HP),
        oneLiner: data.one_liner ?? INITIAL_ONE_LINER,
      };
      set(state);
      saveDayToHistory({
        date: today, hp: state.hp, minHp: state.minHp,
        eventLog: state.eventLog, weatherState: state.weatherState,
        survivalGrade: state.survivalGrade ?? '',
      });
      return;
    }

    // Supabase가 비어있으면 localStorage에서 마이그레이션
    try {
      const saved = getLocalState();
      if (saved && saved.date === today) {
        const state = {
          hp: saved.hp ?? INITIAL_HP,
          minHp: saved.minHp ?? INITIAL_HP,
          eventLog: saved.eventLog ?? [],
          isRetired: saved.isRetired ?? false,
          isViewingDashboard: false,
          survivalGrade: (saved.survivalGrade as SurvivalGrade) || null,
          weatherState: getWeatherState(saved.hp ?? INITIAL_HP),
          oneLiner: INITIAL_ONE_LINER,
        };
        set(state);
        await syncToSupabase({
          hp: state.hp,
          min_hp: state.minHp,
          weather_state: state.weatherState,
          one_liner: state.oneLiner,
          is_retired: state.isRetired,
          survival_grade: state.survivalGrade ?? '',
          event_log: state.eventLog,
          last_active_date: today,
        });
        saveDayToHistory({
          date: today, hp: state.hp, minHp: state.minHp,
          eventLog: state.eventLog, weatherState: state.weatherState,
          survivalGrade: state.survivalGrade ?? '',
        });
        return;
      }
    } catch { /* localStorage 파싱 실패시 무시 */ }

    // 둘 다 없으면 새로 시작
    get().resetDay();
  },
}));