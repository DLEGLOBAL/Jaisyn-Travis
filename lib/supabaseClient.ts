
import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION:
// Replace these with your actual Supabase Project URL and Anon Key
// You can find these in your Supabase Dashboard -> Project Settings -> API
// ------------------------------------------------------------------
const SUPABASE_URL = 'https://iepmdfvilmhuasszfyrs.supabase.co'; // Your project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllcG1kZnZpbG1odWFzc3pmeXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2OTY0NzIsImV4cCI6MjA4MDI3MjQ3Mn0.U394AqLXdXlpChojXMRoHZcBJ0UB9C2ut9fKVvI5OWU'
// NOTE: Since I cannot see your actual .env or keys, you MUST replace the 
// SUPABASE_ANON_KEY string above with your real key from the Supabase Dashboard.

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
