import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHistory } from '../utils/storage';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { fetchReactionsForUser } from '../utils/reactions';
import { supabase } from '../lib/supabase';

function getTodayKey() { return new Date().toISOString().slice(0, 10); }

const WEATHER_EMOJI: Record<string, string> = {
  sunny: '☀️', cloudy_sunny: '⛅', cloudy: '☁️',
  rainy: '🌧️', stormy: '⛈️', dead: '💀',
};
const WEATHER_LABEL: Record<string, string> = {
  sunny: '맑음', cloudy_sunny: '구름조금', cloudy: '흐림',
  rainy: '비', stormy: '폭풍', dead: '전멸',
};

function getWeatherEmoji(s: string) { return WEATHER_EMOJI[s] ?? '☁️'; }
function getWeatherLabel(s: string) { return WEATHER_LABEL[s] ?? '흐림'; }
function fmtKey(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const result: { date: string; day: number; isCurrentMonth: boolean }[] = [];
  const pm = month === 1 ? 12 : month - 1;
  const py = month === 1 ? year - 1 : year;
  const prevLast = new Date(py, pm, 0).getDate();
  for (let i = startPad - 1; i >= 0; i--)
    result.push({ date: fmtKey(py, pm, prevLast - i), day: prevLast - i, isCurrentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    result.push({ date: fmtKey(year, month, d), day: d, isCurrentMonth: true });
  const nm = month === 12 ? 1 : month + 1;
  const ny = month === 12 ? year + 1 : year;
  for (let d = 1; d <= 42 - result.length; d++)
    result.push({ date: fmtKey(ny, nm, d), day: d, isCurrentMonth: false });
  return result;
}

function getMonthStats(year: number, month: number, history: Record<string, any>, todayKey: string, todayData: any) {
  const prefix = fmtKey(year, month, 1).slice(0, 7);
  const records = Object.entries(history)
    .filter(([k]) => k.startsWith(prefix))
    .map(([, v]) => v);
  if (todayKey.startsWith(prefix) && todayData) records.unshift(todayData);
  if (records.length === 0) return null;
  const hpValues = records.map((r: any) => r.hp).filter(Boolean);
  const maxHp = Math.max(...hpValues);
  const minHp = Math.min(...hpValues);
  const avgHp = Math.round(hpValues.reduce((a, b) => a + b, 0) / hpValues.length);
  const weatherCounts: Record<string, number> = {};
  records.forEach((r: any) => {
    if (r.weatherState) weatherCounts[r.weatherState] = (weatherCounts[r.weatherState] ?? 0) + 1;
  });
  const dominantWeather = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'cloudy';
  const totalEvents = records.reduce((a: number, r: any) => a + (r.eventLog?.length ?? 0), 0);
  return { maxHp, minHp, avgHp, dominantWeather, totalEvents, recordCount: records.length };
}

export function HistoryCalendar() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayKey());
  const [todayReactions, setTodayReactions] = useState<{ emoji: string; count: number }[]>([]);

  const history = getHistory();
  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);
  const todayKey = getTodayKey();

  const hp = useAppStore((s) => s.hp);
  const minHp = useAppStore((s) => s.minHp);
  const eventLog = useAppStore((s) => s.eventLog);
  const weatherState = useAppStore((s) => s.weatherState);
  const survivalGrade = useAppStore((s) => s.survivalGrade);
  const userName = useAuthStore((s) => s.userName);
  const team = useAuthStore((s) => s.team);

  // 오늘 응원 실시간 로드
  useEffect(() => {
    if (!userName || !team) return;

    fetchReactionsForUser(userName, team).then((reactions) => {
      setTodayReactions(
        Object.entries(reactions)
          .filter(([, count]) => count > 0)
          .map(([emoji, count]) => ({ emoji, count }))
      );
    });

    const channel = supabase
      .channel('history_reactions')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'reactions',
        filter: `to_user=eq.${userName}`,
      }, () => {
        fetchReactionsForUser(userName, team).then((reactions) => {
          setTodayReactions(
            Object.entries(reactions)
              .filter(([, count]) => count > 0)
              .map(([emoji, count]) => ({ emoji, count }))
          );
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userName, team]);

  const checklistItems = (() => {
    try {
      const savedDate = localStorage.getItem('checklist_date_v1');
      const today = new Date().toISOString().slice(0, 10);
      if (savedDate !== today) return [];
      return JSON.parse(localStorage.getItem('checklist_v1') ?? '[]');
    } catch { return []; }
  })();

  const todayData = {
    date: todayKey, hp, minHp, eventLog, weatherState,
    survivalGrade: survivalGrade ?? '',
    missions: checklistItems,
    reactions: todayReactions,
  };

  const selectedRecord = selectedDate === null ? null
    : selectedDate === todayKey ? todayData
    : history[selectedDate] ?? null;

  const stats = useMemo(
    () => getMonthStats(year, month, history, todayKey, todayData),
    [year, month]
  );

  const goPrev = () => month === 1 ? (setYear(y => y - 1), setMonth(12)) : setMonth(m => m - 1);
  const goNext = () => month === 12 ? (setYear(y => y + 1), setMonth(1)) : setMonth(m => m + 1);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const DetailPanel = () => (
    <AnimatePresence mode="wait">
      {!selectedDate ? null : !selectedRecord ? (
        <motion.div key="no-record"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="glass-card flex flex-col items-center justify-center p-8 min-h-[160px]"
        >
          <p className="text-3xl mb-3">🌱</p>
          <p className="text-sm font-medium text-text-primary">{selectedDate}</p>
          <p className="text-sm mt-1 text-text-muted">이 날은 기록이 없어요</p>
        </motion.div>
      ) : (
        <motion.div key={selectedDate}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="glass-card flex flex-col gap-4 p-5"
        >
          {/* 헤더 */}
          <div>
            <p className="font-bold text-base text-text-primary">{selectedDate}</p>
            <p className="text-sm mt-0.5 text-text-secondary">
              {getWeatherEmoji(selectedRecord.weatherState)}&nbsp;
              HP 최종 <strong>{selectedRecord.hp}</strong> · 최저 <strong>{selectedRecord.minHp}</strong>
              {selectedRecord.survivalGrade && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-text-primary"
                  style={{ background: 'rgba(0,0,0,0.07)' }}>
                  {selectedRecord.survivalGrade}등급
                </span>
              )}
            </p>
          </div>

          {/* HP 바 */}
          <div className="h-2 rounded-full overflow-hidden bg-hp-bg">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${selectedRecord.hp}%`,
                background: selectedRecord.hp >= 60 ? 'var(--color-text-primary)'
                  : selectedRecord.hp >= 30 ? 'var(--color-text-muted)' : 'var(--color-faint)',
              }} />
          </div>

          {/* 이벤트 기록 */}
          <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="text-xs font-semibold mb-3 text-text-muted">
              오늘의 기록 ({selectedRecord.eventLog.length}건)
            </p>
            {selectedRecord.eventLog.length === 0 ? (
              <p className="text-sm text-text-muted">기록된 이벤트가 없어요</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {selectedRecord.eventLog.map((log: any) => (
                  <li key={log.id} className="flex items-center gap-2 text-sm">
                    <span className="tabular-nums shrink-0 text-text-muted text-[10px] w-9">{log.timestamp}</span>
                    <span className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: log.hpDelta >= 0 ? 'var(--color-text-primary)' : 'var(--color-faint)' }} aria-hidden />
                    <span aria-hidden>{log.emoji}</span>
                    <span className="flex-1 truncate text-text-primary">{log.name}</span>
                    <span className="font-semibold tabular-nums shrink-0"
                      style={{ color: log.hpDelta >= 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                      {log.hpDelta >= 0 ? '+' : ''}{log.hpDelta}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 오늘의 미션 */}
          {selectedRecord.missions && selectedRecord.missions.length > 0 && (
            <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-xs font-semibold mb-3 text-text-muted">
                오늘의 미션 ({selectedRecord.missions.filter((m: any) => m.done).length}/{selectedRecord.missions.length})
              </p>
              <ul className="flex flex-col gap-1.5">
                {selectedRecord.missions.map((mission: any, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 shrink-0 rounded flex items-center justify-center"
                      style={{ background: mission.done ? 'var(--color-btn-primary-bg)' : 'transparent', border: mission.done ? 'none' : '1.5px solid rgba(0,0,0,0.25)' }}>
                      {mission.done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </span>
                    <span className="text-text-primary" style={{ textDecoration: mission.done ? 'line-through' : 'none', opacity: mission.done ? 0.5 : 1 }}>
                      {mission.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 팀원 응원 */}
          {selectedRecord.reactions && selectedRecord.reactions.length > 0 && (
            <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
              <p className="text-xs font-semibold mb-3 text-text-muted">팀원 응원 🎉</p>
              <div className="flex flex-wrap gap-2">
                {selectedRecord.reactions.map(({ emoji, count }: { emoji: string; count: number }) => (
                  <div key={emoji} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-text-secondary"
                    style={{ background: 'rgba(0,0,0,0.06)' }}>
                    <span>{emoji}</span>
                    <span className="text-xs font-medium tabular-nums">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 pb-24 md:pb-4 min-h-[calc(100vh-var(--header-height)-var(--bottomnav-height))]">

      {/* 왼쪽 */}
      <div className="w-full md:w-[320px] md:shrink-0 flex flex-col gap-3">

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between shrink-0">
          <button type="button" onClick={goPrev}
            className="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all focus:outline-none"
            style={{ background: 'rgba(0,0,0,0.06)' }} aria-label="이전 달">←
          </button>
          <span className="font-semibold text-sm text-text-primary">{year}년 {month}월</span>
          <button type="button" onClick={goNext}
            className="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all focus:outline-none"
            style={{ background: 'rgba(0,0,0,0.06)' }} aria-label="다음 달">→
          </button>
        </div>

        {/* 캘린더 */}
        <div className="glass-card overflow-hidden shrink-0">
          <div className="grid grid-cols-7 text-center" style={{ borderBottom: '1px solid var(--color-border)' }}>
            {weekdays.map((w, i) => (
              <div key={w} className="py-2 text-xs font-medium"
                style={{ color: i === 0 ? '#E53935' : i === 6 ? '#1565C0' : 'var(--color-text-muted)' }}>
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map(({ date, day, isCurrentMonth }) => {
              const isToday = date === todayKey;
              const record = isToday ? { weatherState } : history[date];
              const isSelected = selectedDate === date;
              return (
                <button key={date} type="button"
                  onClick={() => setSelectedDate(isSelected ? null : date)}
                  className="flex flex-col items-center justify-center py-1 gap-0.5 transition-all focus:outline-none rounded-[6px]"
                  style={{ minHeight: 40, background: isSelected ? 'rgba(0,0,0,0.08)' : 'transparent', opacity: isCurrentMonth ? 1 : 0.3 }}
                  aria-pressed={isSelected}
                >
                  <span className="text-xs w-5 h-5 flex items-center justify-center rounded-full"
                    style={{
                      background: isToday ? 'var(--color-primary)' : 'transparent',
                      color: isToday ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                      fontWeight: isToday || isSelected ? 700 : 400,
                    }}>
                    {day}
                  </span>
                  {record && <span className="text-xs leading-none" aria-hidden>{getWeatherEmoji(record.weatherState)}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 모바일 상세 */}
        {selectedDate && (
          <div className="md:hidden">
            <DetailPanel />
          </div>
        )}

        {/* 이달의 분석 */}
        <div className="glass-card shrink-0 p-4">
          <p className="text-xs font-semibold mb-3 text-text-muted">{month}월 분석</p>
          {!stats ? (
            <p className="text-xs text-text-muted">기록이 없어요 🌱</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-text-muted">평균 HP</span>
                <span className="text-lg font-bold text-text-primary">{stats.avgHp}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-text-muted">이달의 날씨</span>
                <span className="text-lg">{getWeatherEmoji(stats.dominantWeather)}</span>
                <span className="text-xs text-text-secondary">{getWeatherLabel(stats.dominantWeather)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-text-muted">최고 HP</span>
                <span className="text-base font-semibold text-text-primary">🏆 {stats.maxHp}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-text-muted">최저 HP</span>
                <span className="text-base font-semibold text-text-muted">💀 {stats.minHp}</span>
              </div>
              <div className="col-span-2 flex items-center justify-between pt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
                <span className="text-xs text-text-muted">총 기록 이벤트</span>
                <span className="text-xs font-semibold text-text-primary">{stats.totalEvents}건 ({stats.recordCount}일)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 — 데스크탑만 */}
      <div className="hidden md:block flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {!selectedDate ? (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card flex flex-col items-center justify-center min-h-[200px] p-10"
            >
              <p className="text-3xl mb-3">📅</p>
              <p className="text-sm text-text-muted">날짜를 선택하면 기록이 표시돼요</p>
            </motion.div>
          ) : (
            <DetailPanel />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}