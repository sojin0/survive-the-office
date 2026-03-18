import { useCallback, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWeatherEmoji, getWeatherLabel } from '../data/team';
import type { WeatherState } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { ORG, getUnitList, getTeamList } from '../data/org';
import { fetchReactionsForTeam, sendReaction } from '../utils/reactions';

const REACTION_EMOJIS = [
  { emoji: '👏', tooltip: '응원의 박수!!!', bg: 'rgba(255, 214, 0, 0.15)' },
  { emoji: '☕', tooltip: '커피 한 잔 어때요?', bg: 'rgba(161, 102, 47, 0.12)' },
  { emoji: '🍩', tooltip: '간식 먹어요!', bg: 'rgba(255, 100, 130, 0.12)' },
] as const;

type TeamMember = {
  id: string;
  name: string;
  role?: string;
  weatherState: WeatherState;
  hp: number;
  oneLiner: string;
};

function getTeamAverageWeather(members: { weatherState: WeatherState }[]): WeatherState {
  const order: WeatherState[] = ['sunny', 'cloudy_sunny', 'cloudy', 'rainy', 'stormy', 'dead'];
  const sum = members.reduce((acc, m) => acc + order.indexOf(m.weatherState), 0);
  const avg = Math.round(sum / members.length);
  return order[Math.min(avg, order.length - 1)];
}

const selectStyle = (focused: boolean, disabled = false): React.CSSProperties => ({
  outline: 'none',
  color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
  border: focused ? '2px solid var(--color-primary)' : '1.5px solid rgba(0,0,0,0.15)',
  boxShadow: focused ? '0 0 0 4px rgba(26,26,26,0.08)' : 'var(--shadow-card)',
  paddingRight: '2.5rem',
  opacity: disabled ? 0.4 : 1,
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
});

function InviteModal({ onClose }: { onClose: () => void }) {
  const login = useAuthStore((s) => s.login);
  const userName = useAuthStore((s) => s.userName);

  const [selectedBH, setSelectedBH] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState(false);

  const unitList = getUnitList(selectedBH);
  const showUnitSelect = unitList.length > 0;
  const teamList = getTeamList(selectedBH, selectedUnit);

  const getTeamString = () =>
    [selectedBH, selectedUnit, selectedTeam].filter(Boolean).join(' ');

  const handleBHChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBH(e.target.value);
    setSelectedUnit('');
    setSelectedTeam('');
  };

  const handleCopy = () => {
    if (!selectedTeam) return;
    const url = `${window.location.origin}?team=${encodeURIComponent(getTeamString())}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
  };

  const handleJoin = () => {
    login(userName, getTeamString());
    setJoined(true);
    setTimeout(() => onClose(), 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.2 }}
      className="w-[360px] glass-card p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-text-primary">팀 초대 링크 만들기</h3>
        <button type="button" onClick={onClose} className="text-text-muted hover:opacity-70 text-lg">×</button>
      </div>
      <p className="text-sm text-text-secondary">어느 팀으로 초대할까요?</p>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary">본부 · 유닛</span>
        <div className="flex gap-2 min-w-0">
          <select
            value={selectedBH}
            onChange={handleBHChange}
            onFocus={() => setFocused('bh')}
            onBlur={() => setFocused(null)}
            className="flex-1 min-w-0 px-3 py-3 rounded-md bg-white transition-all duration-150 appearance-none truncate"
            style={selectStyle(focused === 'bh')}
          >
            <option value="" disabled>본부</option>
            {ORG.map((o) => <option key={o.본부} value={o.본부}>{o.본부}</option>)}
          </select>
          <select
            value={selectedUnit}
            onChange={(e) => { setSelectedUnit(e.target.value); setSelectedTeam(''); }}
            onFocus={() => setFocused('unit')}
            onBlur={() => setFocused(null)}
            disabled={!showUnitSelect || !selectedBH}
            className="flex-1 min-w-0 px-3 py-3 rounded-md bg-white transition-all duration-150 appearance-none truncate"
            style={selectStyle(focused === 'unit', !showUnitSelect || !selectedBH)}
          >
            <option value="" disabled>{!selectedBH ? '유닛' : !showUnitSelect ? '해당 없음' : '유닛'}</option>
            {unitList.map((u) => <option key={u.유닛명!} value={u.유닛명!}>{u.유닛명}</option>)}
          </select>
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary" style={{ opacity: teamList.length > 0 ? 1 : 0.4 }}>팀</span>
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          onFocus={() => setFocused('team')}
          onBlur={() => setFocused(null)}
          disabled={teamList.length === 0}
          className="w-full px-4 py-3 rounded-md bg-white transition-all duration-150 appearance-none"
          style={selectStyle(focused === 'team', teamList.length === 0)}
        >
          <option value="" disabled>
            {!selectedBH ? '본부를 먼저 선택하세요' : showUnitSelect && !selectedUnit ? '유닛을 먼저 선택하세요' : '팀을 선택하세요'}
          </option>
          {teamList.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>

      <button
        type="button"
        onClick={handleCopy}
        disabled={!selectedTeam}
        className="w-full py-3 rounded-full font-bold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' }}
      >
        {copied ? '✅ 링크 복사됨!' : '🔗 초대 링크 복사하기'}
      </button>

      <AnimatePresence>
        {copied && !joined && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            className="flex flex-col gap-2"
          >
            <p className="text-xs text-center text-text-muted">나도 이 팀으로 합류할까요?</p>
            <div className="flex gap-2">
              <button type="button" onClick={handleJoin}
                className="flex-1 py-2.5 rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' }}>
                👥 합류하기
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-full text-sm transition-all active:scale-[0.98] text-text-secondary"
                style={{ background: 'rgba(0,0,0,0.06)' }}>
                나중에
              </button>
            </div>
          </motion.div>
        )}
        {joined && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm text-center font-medium text-text-primary"
          >
            🎉 팀에 합류했어요!
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SoloEmptyState() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6"
      style={{ minHeight: 'calc(100vh - var(--header-height) - var(--bottomnav-height) - 48px)' }}>
      <div className="text-6xl">🏝️</div>
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-xl font-bold text-text-primary">혼자 생존 중이에요</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          팀원을 초대하면 서로의 생존 현황을 공유하고<br />응원을 주고받을 수 있어요!
        </p>
      </div>
      <button type="button" onClick={() => setShowModal(true)}
        className="px-6 py-3 rounded-full text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] shadow-elevated"
        style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' }}>
        팀원 초대하기 🔗
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <InviteModal onClose={() => setShowModal(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TeamBoard({ onWeatherChange }: { onWeatherChange?: (w: WeatherState) => void }) {
  const [reactions, setReactionsState] = useState<Record<string, Record<string, number>>>({});
  const [showToast, setShowToast] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const myOneLiner = useAppStore((s) => s.oneLiner);
  const myHp = useAppStore((s) => s.hp);
  const myWeather = useAppStore((s) => s.weatherState);
  const userName = useAuthStore((s) => s.userName);
  const userTeam = useAuthStore((s) => s.team);

  // 팀원 + 응원 불러오기
  useEffect(() => {
    if (!userTeam) return;

    const fetchAll = async () => {
      const [{ data }, reactionData] = await Promise.all([
        supabase.from('user_status').select('*').eq('team', userTeam).order('updated_at', { ascending: false }),
        fetchReactionsForTeam(userTeam),
      ]);

      if (!data) return;

      const members = data.map((row) => ({
        id: row.id,
        name: row.user_name,
        role: row.user_name === userName ? '나' : undefined,
        weatherState: (row.weather_state as WeatherState) ?? 'sunny',
        hp: row.hp ?? 80,
        oneLiner: row.one_liner ?? '오늘도 살아남는 중...',
      }));
      setTeamMembers(members);

      // reactionData는 { [user_name]: { [emoji]: count } }
      // TeamMemberCard는 member.id 기준으로 조회하므로 id로 키 변환
      const reactionsById: Record<string, Record<string, number>> = {};
      for (const member of members) {
        if (reactionData[member.name]) {
          reactionsById[member.id] = reactionData[member.name];
        }
      }
      setReactionsState(reactionsById);
    };

    fetchAll();

    // 팀원 상태 실시간 구독
    const statusChannel = supabase
      .channel('team_status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_status', filter: `team=eq.${userTeam}` },
        () => fetchAll())
      .subscribe();

    // 응원 실시간 구독
    const reactionChannel = supabase
      .channel('team_reactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reactions', filter: `team=eq.${userTeam}` },
        () => fetchReactionsForTeam(userTeam).then(setReactionsState))
      .subscribe();

    return () => {
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(reactionChannel);
    };
  }, [userTeam, userName]);

  const mergedMembers = useMemo(() =>
    teamMembers.map((m) =>
      m.name === userName
        ? { ...m, hp: myHp, weatherState: myWeather, oneLiner: myOneLiner }
        : m
    ), [teamMembers, userName, myHp, myWeather, myOneLiner]);

  const teamWeather = useMemo(() =>
    mergedMembers.length > 0 ? getTeamAverageWeather(mergedMembers) : 'sunny',
    [mergedMembers]
  );

  useEffect(() => {
    onWeatherChange?.(teamWeather);
  }, [teamWeather, onWeatherChange]);
  
  const setReaction = useCallback(async (toUserId: string, emoji: string) => {
    // toUserId는 Supabase row id — user_name으로 변환
    const toUserName = teamMembers.find((m) => m.id === toUserId)?.name;
    if (!toUserName) return;
    await sendReaction(userName, toUserName, userTeam, emoji);
    // 낙관적 업데이트
    setReactionsState((prev) => ({
      ...prev,
      [toUserId]: {
        ...(prev[toUserId] ?? {}),
        [emoji]: (prev[toUserId]?.[emoji] ?? 0) + 1,
      },
    }));
  }, [userName, userTeam, teamMembers]);

  const handleInviteClick = useCallback(() => {
    const url = `${window.location.origin}?team=${encodeURIComponent(userTeam)}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, [userTeam]);

  if (!userTeam) return <SoloEmptyState />;

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 relative">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-text-primary">팀 공유 보드</h2>
          <p className="text-sm mt-0.5 text-text-secondary">
            오늘 팀 전체 날씨: {getWeatherEmoji(teamWeather)} {getWeatherLabel(teamWeather)}
          </p>
        </div>
        <button type="button" onClick={handleInviteClick}
          className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 focus:outline-none shadow-card"
          style={{ background: 'var(--color-btn-primary-bg)', color: 'var(--color-btn-primary-text)' }}>
          팀원 초대하기 🔗
        </button>
      </header>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm py-3 px-4 rounded-md text-center text-sm shadow-elevated"
            style={{ background: '#1A1A1A', color: '#fff' }}
            role="status" aria-live="polite">
            초대 링크가 복사됐어요! 팀원에게 공유해보세요 🔗
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {mergedMembers.length === 0 ? (
          <p className="text-sm text-text-muted col-span-full text-center py-8">팀원 데이터를 불러오는 중... 👀</p>
        ) : (
          mergedMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              reactionCounts={reactions[member.id] ?? {}}
              onReaction={(emoji) => setReaction(member.id, emoji)}
            />
          ))
        )}
      </div>
    </div>
  );
}

type TeamMemberCardProps = {
  member: TeamMember;
  reactionCounts: Record<string, number>;
  onReaction: (emoji: string) => void;
};

function TeamMemberCard({ member, reactionCounts, onReaction }: TeamMemberCardProps) {
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const emoji = getWeatherEmoji(member.weatherState);
  const label = getWeatherLabel(member.weatherState);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-bold text-text-primary">{member.name}</p>
          {member.role && (
            <span className="text-xs px-2 py-0.5 rounded-full text-text-secondary" style={{ background: 'rgba(0,0,0,0.07)' }}>
              {member.role}
            </span>
          )}
        </div>
        <span className="text-2xl shrink-0" role="img" aria-label={label}>{emoji}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs shrink-0 text-text-muted">HP</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <motion.div className="h-full rounded-full"
            animate={{ width: `${member.hp}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ background: member.hp >= 60 ? 'var(--color-text-primary)' : member.hp >= 30 ? '#888888' : '#BBBBBB' }} />
        </div>
        <span className="text-xs font-semibold tabular-nums shrink-0 text-text-primary">{member.hp}</span>
      </div>

      <p className="text-sm text-text-secondary">"{member.oneLiner}"</p>

      <div className="flex gap-2">
        {REACTION_EMOJIS.map(({ emoji: e, tooltip, bg }) => (
          <div key={e} className="relative flex-1">
            <AnimatePresence>
              {hoveredEmoji === e && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-1 rounded-sm pointer-events-none z-10 shadow-card"
                  style={{ background: '#1A1A1A', color: '#fff' }}>
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2"
                    style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #1A1A1A' }} />
                </motion.div>
              )}
            </AnimatePresence>
            <button type="button" onClick={() => onReaction(e)}
              onMouseEnter={() => setHoveredEmoji(e)}
              onMouseLeave={() => setHoveredEmoji(null)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-sm transition-all duration-150 hover:scale-105 focus:outline-none shadow-card"
              style={{ background: bg }} aria-label={tooltip}>
              <span aria-hidden>{e}</span>
              {(reactionCounts[e] ?? 0) > 0 && (
                <span className="text-xs font-medium tabular-nums text-text-secondary">{reactionCounts[e]}</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </motion.article>
  );
}