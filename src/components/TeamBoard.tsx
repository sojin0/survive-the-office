import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_TEAM_MEMBERS, getWeatherEmoji, getWeatherLabel } from '../data/team';
import type { WeatherState } from '../types';
import { getReactions, setReactions } from '../utils/storage';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

const REACTION_EMOJIS = [
  { emoji: '👏', tooltip: '응원의 박수!!!', bg: 'rgba(255, 214, 0, 0.15)' },
  { emoji: '☕', tooltip: '커피 한 잔 어때요?', bg: 'rgba(161, 102, 47, 0.12)' },
  { emoji: '🍩', tooltip: '간식 먹어요!', bg: 'rgba(255, 100, 130, 0.12)' },
] as const;

function getTeamAverageWeather(members: { weatherState: WeatherState }[]): WeatherState {
  const order: WeatherState[] = ['sunny', 'cloudy_sunny', 'cloudy', 'rainy', 'stormy', 'dead'];
  const sum = members.reduce((acc, m) => acc + order.indexOf(m.weatherState), 0);
  const avg = Math.round(sum / members.length);
  return order[Math.min(avg, order.length - 1)];
}

type TeamMember = {
  id: string;
  name: string;
  role?: string;
  weatherState: WeatherState;
  hp: number;
  oneLiner: string;
};

export function TeamBoard() {
  const [reactions, setReactionsState] = useState(getReactions);
  const [showToast, setShowToast] = useState(false);
  const myOneLiner = useAppStore((s) => s.oneLiner);
  const myHp = useAppStore((s) => s.hp);
  const myWeather = useAppStore((s) => s.weatherState);
  const userName = useAuthStore((s) => s.userName);

  const setReaction = useCallback((memberId: string, emoji: string) => {
    const next = { ...getReactions() };
    if (!next[memberId]) next[memberId] = {};
    next[memberId][emoji] = (next[memberId][emoji] ?? 0) + 1;
    setReactions(next);
    setReactionsState(next);
  }, []);

  // ✅ myWeather 반영해서 팀 평균 날씨 실시간 계산
  const mergedMembers: TeamMember[] = useMemo(() =>
    MOCK_TEAM_MEMBERS.map((member) => {
      const isMe = member.name === userName;
      return {
        ...member,
        oneLiner: isMe ? myOneLiner : member.oneLiner,
        hp: isMe ? myHp : member.hp,
        weatherState: isMe ? myWeather : member.weatherState,
      };
    }),
    [userName, myOneLiner, myHp, myWeather]
  );

  const teamWeather = useMemo(() => getTeamAverageWeather(mergedMembers), [mergedMembers]);

  const handleInviteClick = useCallback(() => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 relative">

      {/* 헤더 */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            팀 공유 보드
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            오늘 팀 전체 날씨: {getWeatherEmoji(teamWeather)} {getWeatherLabel(teamWeather)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleInviteClick}
          className="shrink-0 px-4 py-2 rounded-[var(--radius-full)] text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 focus:outline-none"
          style={{
            background: 'var(--color-btn-primary-bg)',
            color: 'var(--color-btn-primary-text)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          팀원 초대하기 🔗
        </button>
      </header>

      {/* 토스트 */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-sm py-3 px-4 rounded-[var(--radius-md)] text-center text-sm"
            style={{ background: '#1A1A1A', color: '#fff', boxShadow: 'var(--shadow-elevated)' }}
            role="status"
            aria-live="polite"
          >
            초대 링크가 복사되었습니다! 🔗
          </motion.div>
        )}
      </AnimatePresence>

      {/* 팀원 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {mergedMembers.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            reactionCounts={reactions[member.id] ?? {}}
            onReaction={(emoji) => setReaction(member.id, emoji)}
          />
        ))}
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col gap-3"
      style={{ padding: '16px 20px' }}
    >
      {/* 이름 + 날씨 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {member.name}
          </p>
          {member.role && (
            <span
              className="text-xs px-2 py-0.5 rounded-[var(--radius-full)]"
              style={{ background: 'rgba(0,0,0,0.07)', color: 'var(--color-text-secondary)' }}
            >
              {member.role}
            </span>
          )}
        </div>
        <span className="text-2xl shrink-0" role="img" aria-label={label}>{emoji}</span>
      </div>

      {/* HP 바 + 수치 */}
      <div className="flex items-center gap-3">
        <span className="text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>HP</span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${member.hp}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              background: member.hp >= 60 ? '#1A1A1A' : member.hp >= 30 ? '#888888' : '#BBBBBB',
            }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: 'var(--color-text-primary)' }}>
          {member.hp}
        </span>
      </div>

      {/* 한줄 상태 */}
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        "{member.oneLiner}"
      </p>

      {/* 응원 버튼 */}
      <div className="flex gap-2">
        {REACTION_EMOJIS.map(({ emoji: e, tooltip, bg }) => (
          <div key={e} className="relative flex-1">
            <AnimatePresence>
              {hoveredEmoji === e && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-2 py-1 rounded-[var(--radius-sm)] pointer-events-none z-10"
                  style={{ background: '#1A1A1A', color: '#fff', boxShadow: 'var(--shadow-card)' }}
                >
                  {tooltip}
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2"
                    style={{
                      width: 0, height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: '4px solid #1A1A1A',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => onReaction(e)}
              onMouseEnter={() => setHoveredEmoji(e)}
              onMouseLeave={() => setHoveredEmoji(null)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[var(--radius-md)] text-sm transition-all duration-150 hover:scale-105 focus:outline-none"
              style={{ background: bg, boxShadow: 'var(--shadow-card)' }}
              aria-label={tooltip}
            >
              <span aria-hidden>{e}</span>
              {(reactionCounts[e] ?? 0) > 0 && (
                <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                  {reactionCounts[e]}
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    </motion.article>
  );
}