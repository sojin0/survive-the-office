import { create } from 'zustand';
import type { EventLog, WeatherState, SurvivalGrade } from '../types';
import { getWeatherState, getSurvivalGrade, clampHp, getLocalToday } from '../utils/hp';
import { getState as getLocalState, saveDayToHistory, getHistory, getAuth, type DayRecord } from '../utils/storage';
import { supabase } from '../lib/supabase';

function getToday(): string {
  return getLocalToday();
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
  missions?: unknown[];
}) {
  const auth = getAuth();
  if (!auth?.userName) return;
  await supabase
    .from('user_status')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_name', auth.userName)
    .eq('team', auth.team ?? '');
}

async function syncHistoryDay(record: DayRecord) {
  const auth = getAuth();
  if (!auth?.userName) return;
  await supabase
    .from('user_history')
    .upsert({
      user_name: auth.userName,
      team: auth.team ?? '',
      date: record.date,
      hp: record.hp,
      min_hp: record.minHp,
      weather_state: record.weatherState,
      survival_grade: record.survivalGrade,
      event_log: record.eventLog,
      ...(record.reactions !== undefined && { reactions: record.reactions }),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_name,team,date' });
}

function saveAndSync(record: DayRecord) {
  saveDayToHistory(record);
  syncHistoryDay(record);
}

const HISTORY_MIGRATED_KEY = 'history-migrated-v1';
const REACTIONS_MIGRATED_KEY = 'reactions-migrated-v1';

async function migrateLocalHistoryToSupabase() {
  if (localStorage.getItem(HISTORY_MIGRATED_KEY)) return;
  const auth = getAuth();
  if (!auth?.userName) return;
  const history = getHistory();
  const records = Object.values(history);
  if (records.length > 0) {
    const rows = records.map((r) => ({
      user_name: auth.userName,
      team: auth.team ?? '',
      date: r.date,
      hp: r.hp,
      min_hp: r.minHp,
      weather_state: r.weatherState,
      survival_grade: r.survivalGrade,
      event_log: r.eventLog,
      ...(r.missions && r.missions.length > 0 && { missions: r.missions }),
      ...(r.reactions && r.reactions.length > 0 && { reactions: r.reactions }),
      updated_at: new Date().toISOString(),
    }));
    await supabase
      .from('user_history')
      .upsert(rows, { onConflict: 'user_name,team,date' });
  }
  localStorage.setItem(HISTORY_MIGRATED_KEY, '1');
}

// reactions 테이블의 과거 데이터를 날짜별로 집계해 user_history에 소급 적용
async function migrateReactionsToHistory() {
  if (localStorage.getItem(REACTIONS_MIGRATED_KEY)) return;
  const auth = getAuth();
  if (!auth?.userName) return;

  const { data } = await supabase
    .from('reactions')
    .select('emoji, created_at')
    .eq('to_user', auth.userName)
    .eq('team', auth.team ?? '');

  if (!data || data.length === 0) {
    localStorage.setItem(REACTIONS_MIGRATED_KEY, '1');
    return;
  }

  // created_at 기준으로 로컬 날짜별 집계
  const byDate: Record<string, Record<string, number>> = {};
  data.forEach(({ emoji, created_at }) => {
    const d = new Date(created_at);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!byDate[dateKey]) byDate[dateKey] = {};
    byDate[dateKey][emoji] = (byDate[dateKey][emoji] ?? 0) + 1;
  });

  const rows = Object.entries(byDate).map(([date, counts]) => ({
    user_name: auth.userName,
    team: auth.team ?? '',
    date,
    reactions: Object.entries(counts).map(([emoji, count]) => ({ emoji, count })),
    updated_at: new Date().toISOString(),
  }));

  await supabase
    .from('user_history')
    .upsert(rows, { onConflict: 'user_name,team,date' });

  localStorage.setItem(REACTIONS_MIGRATED_KEY, '1');
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
  retire: () => Promise<void>;
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
    saveAndSync({ date: today, hp: newHp, minHp: newMin, eventLog: nextLog, weatherState, survivalGrade: get().survivalGrade ?? '' });
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
    saveAndSync({ date: today, hp: newHp, minHp: newMin, eventLog: nextLog, weatherState, survivalGrade: get().survivalGrade ?? '' });
    syncToSupabase({ hp: newHp, min_hp: newMin, weather_state: weatherState, event_log: nextLog, last_active_date: today });
  },

  setOneLiner(text) {
    set({ oneLiner: text });
    syncToSupabase({ one_liner: text });
  },

  async retire() {
    const { hp, minHp, eventLog, weatherState } = get();
    const grade = getSurvivalGrade(hp);
    const today = getToday();
    const auth = getAuth();
    set({ isRetired: true, isViewingDashboard: false, survivalGrade: grade });

    // 퇴근 시 오늘 팀원 응원 스냅샷 조회 후 history에 함께 저장
    let reactions: { emoji: string; count: number }[] = [];
    if (auth?.userName) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from('reactions')
        .select('emoji')
        .eq('to_user', auth.userName)
        .eq('team', auth.team ?? '')
        .gte('created_at', startOfDay.toISOString());
      if (data) {
        const counts = data.reduce<Record<string, number>>((acc, r) => {
          acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
          return acc;
        }, {});
        reactions = Object.entries(counts).map(([emoji, count]) => ({ emoji, count }));
      }
    }

    saveAndSync({ date: today, hp, minHp, eventLog, weatherState, survivalGrade: grade, reactions });
    syncToSupabase({ is_retired: true, survival_grade: grade, last_active_date: today });
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
    saveAndSync({ date: today, hp: INITIAL_HP, minHp: INITIAL_HP, eventLog: [], weatherState: 'sunny', survivalGrade: '' });
    syncToSupabase({ hp: INITIAL_HP, min_hp: INITIAL_HP, weather_state: 'sunny', one_liner: INITIAL_ONE_LINER, is_retired: false, survival_grade: '', event_log: [], missions: [], last_active_date: today });
  },

  unretire() {
    set({ isRetired: false, survivalGrade: null });
    syncToSupabase({ is_retired: false, survival_grade: '' });
  },

  async hydrate() {
    await migrateLocalHistoryToSupabase();
    await migrateReactionsToHistory();
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
      saveAndSync({
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
        saveAndSync({
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