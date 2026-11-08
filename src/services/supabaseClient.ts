import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'rishabh_supabase_url';
const STORAGE_ANON_KEY = 'rishabh_supabase_anon_key';
const STORAGE_MODE_KEY = 'rishabh_db_mode';

export const DEFAULT_SUPABASE_URL = 'https://tetqtbhgznhemnzzgifu.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Uu5-IgV0tjv2ZP5ZOSqCRw_0UuUONE9';

export type DbMode = 'local' | 'cloud' | 'hybrid';

let supabaseInstance: SupabaseClient | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  mode: DbMode;
}

/**
 * Normalizes any user-entered Supabase URL, project ref, or dashboard link into
 * a valid API URL: https://<project-ref>.supabase.co
 */
export const normalizeSupabaseUrl = (input: string): string => {
  if (!input) return '';
  let trimmed = input.trim();

  // Handle case where user pastes the dashboard management URL, e.g.:
  // https://supabase.com/dashboard/project/tetqtbhgznhemnzzgifu/settings/api-keys
  const dashboardMatch = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9_-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Handle case where user pastes just the project ref: tetqtbhgznhemnzzgifu
  if (/^[a-z0-9]{20}$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }

  // Handle case where user enters domain without protocol: tetqtbhgznhemnzzgifu.supabase.co
  if (trimmed.includes('.supabase.co') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }

  // Strip trailing slashes
  return trimmed.replace(/\/+$/, '');
};

/**
 * Retrieve active Supabase credentials from localStorage, Vite environment variables, or defaults.
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  const rawLocalUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
  const localUrl = normalizeSupabaseUrl(rawLocalUrl);

  // Auto-heal localStorage if the saved URL was a dashboard URL
  if (rawLocalUrl && localUrl && localUrl !== rawLocalUrl) {
    try {
      localStorage.setItem(STORAGE_URL_KEY, localUrl);
    } catch { /* ignore */ }
  }

  const localKey = localStorage.getItem(STORAGE_ANON_KEY) || '';
  const envUrl = normalizeSupabaseUrl((import.meta.env.VITE_SUPABASE_URL as string) || '');
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const url = localUrl || envUrl || DEFAULT_SUPABASE_URL;
  const anonKey = localKey || envKey || DEFAULT_SUPABASE_ANON_KEY;
  const mode = (localStorage.getItem(STORAGE_MODE_KEY) as DbMode) || 'hybrid';

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http')),
    mode,
  };
};

/**
 * Save custom credentials to localStorage and re-initialize client.
 */
export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  const cleanUrl = normalizeSupabaseUrl(url);
  localStorage.setItem(STORAGE_URL_KEY, cleanUrl);
  localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  supabaseInstance = null; // force re-creation
};

/**
 * Clear custom credentials from localStorage and revert to default.
 */
export const clearSupabaseConfig = (): void => {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_ANON_KEY);
  supabaseInstance = null;
};

/**
 * Set the database operation mode (local, cloud, or hybrid).
 */
export const setDbMode = (mode: DbMode): void => {
  localStorage.setItem(STORAGE_MODE_KEY, mode);
};

/**
 * Get or create the Supabase client singleton.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};

/**
 * Test connectivity with Supabase by performing a lightweight fetch.
 */
export const testSupabaseConnection = async (
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; message: string; details?: any; normalizedUrl?: string }> => {
  const config = getSupabaseConfig();
  const rawUrl = (customUrl ?? config.url).trim();
  const url = normalizeSupabaseUrl(rawUrl);
  const key = (customKey ?? config.anonKey).trim();

  if (!url || !key) {
    return {
      success: false,
      message: 'Missing Supabase URL or Anon Public Key.',
    };
  }

  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    return {
      success: false,
      message: 'Invalid URL. Must begin with https:// (e.g. https://your-project.supabase.co).',
    };
  }

  try {
    const tempClient = createClient(url, key, {
      auth: { persistSession: false },
    });

    // Test query on students table or rest endpoint
    const { data, error } = await tempClient.from('students').select('id, name').limit(1);

    if (error) {
      if (error.code === 'PGRST204' || error.message?.includes('does not exist')) {
        return {
          success: true,
          normalizedUrl: url,
          message: 'Connected to Supabase! (Note: Tables not created yet. Please execute the provided SQL schema in Supabase SQL Editor).',
          details: error,
        };
      }
      return {
        success: false,
        normalizedUrl: url,
        message: `Supabase error (${error.code || 'API'}): ${error.message}`,
        details: error,
      };
    }

    return {
      success: true,
      normalizedUrl: url,
      message: `Successfully connected to free Supabase PostgreSQL server DB (${url})! 🚀`,
      details: data,
    };
  } catch (err: any) {
    return {
      success: false,
      normalizedUrl: url,
      message: `Network or Connection error: ${err.message || 'Unable to reach host'}`,
      details: err,
    };
  }
};
