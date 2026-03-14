import { create } from 'zustand';
import { getAuth, setAuth, clearAuth } from '../utils/storage';

const DEFAULT_TEAM = 'IT개발본부 UX유닛 디자인팀';

type AuthStore = {
  userName: string;
  team: string;
  login: (userName: string, team?: string) => void;
  logout: () => void;
  hydrate: () => void;
};

function getInitialAuth() {
  const saved = getAuth();
  if (saved?.userName) return { userName: saved.userName, team: saved.team ?? DEFAULT_TEAM };
  return { userName: '', team: DEFAULT_TEAM };
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...getInitialAuth(),

  login(userName, team) {
    const name = userName.trim();
    if (!name) return;
    const teamName = team ?? DEFAULT_TEAM;
    set({ userName: name, team: teamName });
    setAuth({ userName: name, team: teamName });
  },

  logout() {
    set({ userName: '', team: DEFAULT_TEAM });
    clearAuth();
  },

  hydrate() {
    set(getInitialAuth());
  },
}));
