
import { createClient } from '@supabase/supabase-js';

// URL y Clave Anónima de tu proyecto Supabase
const supabaseUrl = 'https://xlzlxucxpycgfnpdpcqg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsemx4dWN4cHljZ2ZucGRwY3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODM0MTAsImV4cCI6MjA3ODk1OTQxMH0.QfdP8OzQDbQpAaGnor7DTWXK2Jgvw2ihIUZg7agc-d8';

export const supabase = createClient(supabaseUrl, supabaseKey);
