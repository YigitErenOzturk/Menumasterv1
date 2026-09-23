// MenuMaster Supabase client
// Replace these two values with:
// Supabase Dashboard -> Project Settings -> API

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://jsixoajajkrijysaxjet.supabase.co/rest/v1/';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaXhvYWphamtyaWp5c2F4amV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxNjgxNDksImV4cCI6MjEwNTc0NDE0OX0.ZrXloAJT74N4r0EfrY9lc_cb-lZqdPmEcp7p_H8Dz1g';

if (SUPABASE_URL.includes('YOUR_') || SUPABASE_ANON_KEY.includes('YOUR_')) {
    console.warn('MenuMaster: Set SUPABASE_URL and SUPABASE_ANON_KEY in src/api/supabaseClient.js');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

export const response = (data, status = 200) => ({ data, status });

export const throwSupabaseError = (error, fallback = 'Something went wrong.') => {
    if (!error) return;
    const err = new Error(error.message || fallback);
    err.response = { data: { message: error.message || fallback } };
    err.code = error.code;
    throw err;
};

export async function getSessionOrThrow() {
    const { data, error } = await supabase.auth.getSession();
    throwSupabaseError(error, 'Could not read the current session.');
    if (!data.session) {
        const err = new Error('Please login first.');
        err.response = { data: { message: 'Please login first.' } };
        throw err;
    }
    return data.session;
}
