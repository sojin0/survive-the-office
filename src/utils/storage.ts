const STORAGE_KEY = 'survive-office-log';
const HISTORY_KEY = 'survive-office-history';
const REACTIONS_KEY = 'survive-office-reactions';
const AUTH_KEY = 'survive-office-auth';

export type PersistedState = {
  hp: number;
  eventLog: { id: string; eventId: string; name: string; emoji: string; hpDelta: number; timestamp: string; memo?: string }[];
  minHp: number;
  isRetired: boolean;
  survivalGrade: string | null;
  date: string;
};

export type DayRecord = {
  date: string;
  hp: number;
  minHp: number;
  eventLog: PersistedState['eventLog'];
  weatherState: string;
  survivalGrade: string;
  reactions?: { emoji: string; count: number }[];
  missions?: { text: string; done: boolean }[];
};

export type HistoryState = Record<string, DayRecord>;

export type ReactionCounts = Record<string, number>;

export function getState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function setState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function getHistory(): HistoryState {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as HistoryState;
  } catch {
    return {};
  }
}

export function setHistory(history: HistoryState): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function getReactions(): Record<string, ReactionCounts> {
  try {
    const raw = localStorage.getItem(REACTIONS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ReactionCounts>;
  } catch {
    return {};
  }
}

export function setReactions(reactions: Record<string, ReactionCounts>): void {
  try {
    localStorage.setItem(REACTIONS_KEY, JSON.stringify(reactions));
  } catch {
    // ignore
  }
}

export function saveDayToHistory(record: DayRecord): void {
  const history = getHistory();
  history[record.date] = record;
  setHistory(history);
}

export type AuthState = {
  userName: string;
  team: string;
};

export function getAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function setAuth(auth: AuthState): void {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch {
    // ignore
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // ignore
  }
}