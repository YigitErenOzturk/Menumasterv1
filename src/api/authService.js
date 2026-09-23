import { supabase, response, throwSupabaseError } from './supabaseClient.js';

export const authService = {
    forgotPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/commonfiles/password-reset.html`
        });
        throwSupabaseError(error, 'Could not send password reset email.');
        return response({ ok: true });
    },

    resetPassword: async (_code, newPassword, _email) => {
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        throwSupabaseError(error, 'Password could not be changed.');
        return response(data);
    },

    logout: async () => {
        const { error } = await supabase.auth.signOut();
        throwSupabaseError(error, 'Could not logout.');
        return response({ ok: true });
    }
};
