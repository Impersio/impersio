import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const SUPABASE_URL = 'https://ahrjwdgnacbjqlntcwip.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFocmp3ZGduYWNianFsbnRjd2lwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjQ4NzAsImV4cCI6MjA4NDMwMDg3MH0.ia7DNdHU-y-tWndUmc8mQF_jwfWGrQXfB2wVvT02H20';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);