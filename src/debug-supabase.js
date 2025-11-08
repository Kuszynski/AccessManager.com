// Debug Supabase connection
console.log('=== SUPABASE DEBUG ===');
console.log('URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Key:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

import { supabase } from './utils/supabase';

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('companies').select('count');
    console.log('Connection test:', error ? 'FAILED' : 'SUCCESS');
    if (error) console.error('Error:', error);
  } catch (err) {
    console.error('Connection error:', err);
  }
};

testConnection();