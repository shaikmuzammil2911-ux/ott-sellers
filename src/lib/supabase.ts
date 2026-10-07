import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://akupmiajdyojhfhdtwft.supabase.co';

const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdXBtaWFqZHlvamhmaGR0d2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNDg2MzAsImV4cCI6MjEwNjkyNDYzMH0.5FkFbP8A8fdQFf_XLTv5xJigWVjni7VGdFyB1djyotg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Helper to check if Supabase connection is healthy
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
    return !error || error.code !== 'PGRST301';
  } catch {
    return false;
  }
};
