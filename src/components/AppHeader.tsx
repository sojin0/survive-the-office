import { useAuthStore } from '../store/useAuthStore';

export function AppHeader() {
  const userName = useAuthStore((s) => s.userName);
  const team = useAuthStore((s) => s.team);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 bg-[var(--color-surface)] backdrop-blur-md border-b border-[var(--color-border)] h-[var(--header-height)] text-[var(--color-text-primary)]"
    >
      <h1 className="text-base font-bold text-text-primary truncate">
        오늘 회사에서 살아남기
      </h1>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-text-primary leading-tight">{userName}</p>
          <p className="text-xs text-text-muted leading-tight">{team}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="px-3 py-1.5 text-xs font-medium rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-text-secondary hover:bg-[var(--color-btn-primary-bg)] hover:text-[var(--color-btn-primary-text)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}