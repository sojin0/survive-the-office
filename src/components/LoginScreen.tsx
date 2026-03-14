import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const PRESET_TEAMS = [
  'IT개발본부 UX유닛 의사랑기획품질팀',
  'IT개발본부 UX유닛 제약기획품질팀',
  'IT개발본부 UX유닛 제약데이터기획팀',
  'IT개발본부 UX유닛 디자인팀',
  'IT개발본부 기반개발유닛 의사랑운영개발팀',
  'IT개발본부 기반개발유닛 유팜개발팀',
  'IT개발본부 기반개발유닛 제약CRM개발팀',
  'IT개발본부 기반개발유닛 UBIST개발팀',
  'IT개발본부 기반개발유닛 의사랑전략개발팀',
  'IT개발본부 부가개발유닛 제약부가개발팀',
  'IT개발본부 부가개발유닛 전략개발팀',
  'IT개발본부 부가개발유닛 병원부가개발팀',
  'IT개발본부 AX개발팀',
];

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [isCustomTeam, setIsCustomTeam] = useState(false);
  const [customTeam, setCustomTeam] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomTeam(true);
      setCustomTeam('');
    } else {
      setIsCustomTeam(false);
      setTeam(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalTeam = isCustomTeam ? customTeam.trim() : team;
    if (!finalTeam) return;
    login(name.trim(), finalTeam);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 weather-sunny">
      <div className="w-full max-w-sm">

        {/* 타이틀 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            오늘 회사에서 살아남기
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            직장인 생존 대시보드
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* 이름 입력 */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              이름
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 rounded-[var(--radius-md)] bg-white transition-all duration-150"
              style={{
                border: focused === 'name'
                  ? '2px solid var(--color-primary)'
                  : '1.5px solid rgba(0,0,0,0.15)',
                outline: 'none',
                boxShadow: focused === 'name'
                  ? '0 0 0 4px rgba(26,26,26,0.08)'
                  : 'var(--shadow-card)',
                color: 'var(--color-text-primary)',
              }}
              required
              autoComplete="name"
            />
          </label>

          {/* 팀 선택 */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              팀
            </span>

            {!isCustomTeam ? (
              <select
                value={team}
                onChange={handleTeamChange}
                onFocus={() => setFocused('team')}
                onBlur={() => setFocused(null)}
                className="w-full px-4 py-3 rounded-[var(--radius-md)] bg-white cursor-pointer transition-all duration-150 appearance-none"
                style={{
                  border: focused === 'team'
                    ? '2px solid var(--color-primary)'
                    : '1.5px solid rgba(0,0,0,0.15)',
                  outline: 'none',
                  boxShadow: focused === 'team'
                    ? '0 0 0 4px rgba(26,26,26,0.08)'
                    : 'var(--shadow-card)',
                  color: 'var(--color-text-primary)',
                  paddingRight: '2.5rem',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
                aria-label="팀 선택"
              >
                <option value="" disabled>팀을 선택하세요</option>
                {PRESET_TEAMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="__custom__">✏️ 직접 입력...</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTeam}
                  onChange={(e) => setCustomTeam(e.target.value)}
                  onFocus={() => setFocused('customTeam')}
                  onBlur={() => setFocused(null)}
                  placeholder="팀 이름을 입력하세요"
                  autoFocus
                  className="flex-1 px-4 py-3 rounded-[var(--radius-md)] bg-white transition-all duration-150"
                  style={{
                    border: focused === 'customTeam'
                      ? '2px solid var(--color-primary)'
                      : '1.5px solid rgba(0,0,0,0.15)',
                    outline: 'none',
                    boxShadow: focused === 'customTeam'
                      ? '0 0 0 4px rgba(26,26,26,0.08)'
                      : 'var(--shadow-card)',
                    color: 'var(--color-text-primary)',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => { setIsCustomTeam(false); setTeam(PRESET_TEAMS[0]); }}
                  className="px-3 py-2 rounded-[var(--radius-md)] text-sm transition-all"
                  style={{ background: 'rgba(0,0,0,0.07)', color: 'var(--color-text-secondary)' }}
                >
                  취소
                </button>
              </div>
            )}
          </div>

          {/* 메인 CTA 버튼 */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-[var(--radius-full)] font-bold text-base transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: 'var(--color-btn-primary-bg)',
              color: 'var(--color-btn-primary-text)',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            오늘도 살아남으러 가기 🚀
          </button>
        </form>

        {/* 구분선 + 팀 초대 링크 */}
        <div className="mt-8 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.12)' }} />
          <button
            type="button"
            className="text-sm transition-colors duration-150 hover:underline shrink-0"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            팀 초대 링크로 입장하기
          </button>
          <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.12)' }} />
        </div>

        {/* 소셜 로그인 */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            className="w-full py-3 rounded-[var(--radius-md)] font-medium transition-opacity"
            style={{ background: '#FEE500', color: '#191919', opacity: 0.6, cursor: 'not-allowed' }}
            disabled
            aria-label="카카오 로그인 (준비 중)"
          >
            카카오로 로그인
          </button>
          <button
            type="button"
            className="w-full py-3 rounded-[var(--radius-md)] font-medium transition-opacity"
            style={{ background: '#fff', color: 'var(--color-text-primary)', border: '1.5px solid rgba(0,0,0,0.15)', opacity: 0.6, cursor: 'not-allowed' }}
            disabled
            aria-label="구글 로그인 (준비 중)"
          >
            구글로 로그인
          </button>
          <p className="text-center text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            소셜 로그인은 준비 중이에요 🔧
          </p>
        </div>

      </div>
    </div>
  );
}