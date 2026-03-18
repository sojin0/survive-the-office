import { create } from 'zustand';
import { getAuth, setAuth, clearAuth } from '../utils/storage';
import { supabase } from '../lib/supabase';
import { useAppStore } from './useAppStore';

type AuthStore = {
  userName: string;
  team: string;
  login: (userName: string, team?: string) => void;
  logout: () => void;
  hydrate: () => void;
};

function getInitialAuth() {
  const saved = getAuth();
  if (saved?.userName) return { userName: saved.userName, team: saved.team ?? '' };
  return { userName: '', team: '' };
}

async function upsertUserStatus(userName: string, team: string) {
  if (!userName) return;
  await supabase.from('user_status').upsert(
    { user_name: userName, team, updated_at: new Date().toISOString() },
    { onConflict: 'user_name,team' }
  );
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...getInitialAuth(),

  async login(userName, team) {
    const name = userName.trim();
    if (!name) return;
    const teamName = team ?? '';
    set({ userName: name, team: teamName });
    setAuth({ userName: name, team: teamName });
    await upsertUserStatus(name, teamName);
    await useAppStore.getState().hydrate();
  },

  logout() {
    set({ userName: '', team: '' });
    clearAuth();
  },

  async hydrate() {
    const initial = getInitialAuth();
    set(initial);
    // auth가 있으면 appStore hydrate 실행
    if (initial.userName) {
      await useAppStore.getState().hydrate();
    }
  },
}));