const STORAGE_KEYS = {
  TICKETS: 'coldchain_tickets',
  VERSIONS: 'coldchain_versions',
} as const;

const isBrowser = typeof window !== 'undefined';

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (!isBrowser) return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length === 0) return defaultValue;
    return parsed;
  } catch (err) {
    console.warn(`Failed to load ${key} from localStorage:`, err);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
};

export const clearStorage = (key: string): void => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`Failed to clear ${key} from localStorage:`, err);
  }
};

export const loadTickets = () => loadFromStorage(STORAGE_KEYS.TICKETS, null);
export const saveTickets = (tickets: unknown[]) => saveToStorage(STORAGE_KEYS.TICKETS, tickets);
export const clearTickets = () => clearStorage(STORAGE_KEYS.TICKETS);

export const loadVersions = () => loadFromStorage(STORAGE_KEYS.VERSIONS, null);
export const saveVersions = (versions: unknown[]) => saveToStorage(STORAGE_KEYS.VERSIONS, versions);
export const clearVersions = () => clearStorage(STORAGE_KEYS.VERSIONS);
