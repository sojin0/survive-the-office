import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ORG, getUnitList, getTeamList } from '../data/org';

const inputBase = { outline: 'none', color: 'var(--color-text-primary)' } as const;

const inputStyle = (focused: boolean) => ({
  ...inputBase,
  border: focused ? '2px solid var(--color-primary)' : '1.5px solid rgba(0,0,0,0.15)',
  boxShadow: focused ? '0 0 0 4px rgba(26,26,26,0.08)' : 'var(--shadow-card)',
});

const selectStyle = (focused: boolean, disabled = false) => ({
  ...inputStyle(focused),
  paddingRight: '2.5rem',
  opacity: disabled ? 0.4 : 1,
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
});

type Mode = 'solo' | 'team';

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);

  // URL 파라미터에서 팀 정보 읽기
  const params = new URLSearchParams(window.location.search);
  const teamFromUrl = params.get('team') ?? '';

  const [mode, setMode] = useState<Mode>(teamFromUrl ? 'team' : 'solo');
  const [name, setName] = useState('');
  const [selectedBH, setSelectedBH] = useState('');
  const [isCustomBH, setIsCustomBH] = useState(() => !!teamFromUrl);
  const [customBH, setCustomBH] = useState(() => teamFromUrl);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const bhData = ORG.find((o) => o.본부 === selectedBH);
  const unitList = getUnitList(selectedBH);
  const showUnitSelect = !!bhData && unitList.length > 0;
  const noUnitTeams = bhData?.유닛.filter((u) => u.유닛명 === null).flatMap((u) => u.팀) ?? [];
  const teamList = getTeamList(selectedBH, selectedUnit);

  const handleBHChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') { setIsCustomBH(true); setSelectedBH(''); }
    else { setIsCustomBH(false); setSelectedBH(val); }
    setSelectedUnit(''); setSelectedTeam('');
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    setSelectedBH(''); setIsCustomBH(false); setCustomBH('');
    setSelectedUnit(''); setSelectedTeam('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (mode === 'solo') {
      login(name.trim(), '');
      return;
    }
    const finalBH = isCustomBH ? customBH.trim() : selectedBH;
    if (!finalBH) return;
    if (!isCustomBH && !selectedTeam) return;
    const parts = [finalBH, selectedUnit, isCustomBH ? '' : selectedTeam].filter(Boolean);
    login(name.trim(), parts.join(' '));
  };

  const finalBH = isCustomBH ? customBH.trim() : selectedBH;
  const canSubmit = name.trim() && (mode === 'solo' || (finalBH && (isCustomBH || selectedTeam)));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 weather-sunny">
      <div className="w-full max-w-sm">

        {/* 타이틀 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text-primary">오늘 회사에서 살아남기</h1>
          <p className="text-sm mt-2 text-text-secondary">직장인 생존 대시보드</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* 이름 */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">이름</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 rounded-md bg-white transition-all duration-150"
              style={inputStyle(focused === 'name')}
              required
              autoComplete="name"
            />
          </label>

          {/* 모드 탭 */}
          <div
            className="flex gap-1 p-1 rounded-[var(--radius-md)]"
            style={{ background: 'rgba(0,0,0,0.08)' }}
          >
            {(['solo', 'team'] as Mode[]).map((m) => {
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleModeChange(m)}
                  className="flex-1 py-2 rounded-[var(--radius-sm)] text-sm font-semibold transition-all duration-200 focus:outline-none"
                  style={{
                    background: isActive ? 'var(--color-btn-primary-bg)' : 'transparent',
                    color: isActive ? 'var(--color-btn-primary-text)' : 'var(--color-text-muted)',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                    transform: isActive ? 'scale(1)' : 'scale(0.97)',
                  }}
                >
                  {m === 'solo' ? '⚔️ 혼자 생존하기' : '👥 팀과 함께'}
                </button>
              );
            })}
          </div>

          {/* 팀 선택 — team 모드일 때만 */}
          {mode === 'team' && (
            <>
              {/* 본부 + 유닛 */}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-primary">본부 · 유닛</span>
                {!isCustomBH ? (
                  <div className="flex gap-2">
                    <select
                      value={selectedBH}
                      onChange={handleBHChange}
                      onFocus={() => setFocused('bh')}
                      onBlur={() => setFocused(null)}
                      className="flex-1 px-3 py-3 rounded-md bg-white transition-all duration-150 appearance-none"
                      style={selectStyle(focused === 'bh')}
                    >
                      <option value="" disabled>본부</option>
                      {ORG.map((o) => (
                        <option key={o.본부} value={o.본부}>{o.본부}</option>
                      ))}
                      <option value="__custom__">✏️ 직접 입력...</option>
                    </select>
                    <select
                      value={selectedUnit}
                      onChange={(e) => { setSelectedUnit(e.target.value); setSelectedTeam(''); }}
                      onFocus={() => setFocused('unit')}
                      onBlur={() => setFocused(null)}
                      disabled={!showUnitSelect}
                      className="flex-1 px-3 py-3 rounded-md bg-white transition-all duration-150 appearance-none"
                      style={selectStyle(focused === 'unit', !showUnitSelect)}
                    >
                      <option value="" disabled>{!selectedBH ? '유닛' : !showUnitSelect ? '해당 없음' : '유닛'}</option>
                      {unitList.map((u) => (
                        <option key={u.유닛명!} value={u.유닛명!}>{u.유닛명}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customBH}
                      onChange={(e) => setCustomBH(e.target.value)}
                      onFocus={() => setFocused('customBH')}
                      onBlur={() => setFocused(null)}
                      placeholder="본부명을 입력하세요"
                      autoFocus
                      className="flex-1 px-4 py-3 rounded-md bg-white transition-all duration-150"
                      style={inputStyle(focused === 'customBH')}
                    />
                    <button
                      type="button"
                      onClick={() => { setIsCustomBH(false); setSelectedBH(''); }}
                      className="px-3 py-2 rounded-md text-sm transition-all text-text-secondary"
                      style={{ background: 'rgba(0,0,0,0.07)' }}
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>

              {/* 팀 */}
              {!isCustomBH && (
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
                    {teamList.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              )}
            </>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3.5 rounded-full font-bold text-base transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] shadow-elevated disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              background: 'var(--color-btn-primary-bg)',
              color: 'var(--color-btn-primary-text)',
            }}
          >
            {mode === 'solo' ? '⚔️ 혼자 생존 시작!' : '👥 팀과 함께 생존 시작!'}
          </button>
        </form>



      </div>
    </div>
  );
}