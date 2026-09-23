import { supabase } from '../../api/supabaseClient.js';

const emailStep = document.getElementById('stepEmail');
const resetStep = document.getElementById('stepReset');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('p1');
const passwordConfirm = document.getElementById('p2');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');
const emailInfo = document.getElementById('emailInfo');
const resetErr = document.getElementById('resetErr');
const resetOk = document.getElementById('resetOk');
const codeInput = document.getElementById('code');

// Supabase password recovery uses a secure email link rather than a 6-digit code.
if (codeInput) codeInput.closest('div')?.classList.add('hidden');
const infoBox = resetStep?.querySelector('.bg-blue-50');
if (infoBox) infoBox.textContent = 'Open the secure password-reset link sent to your email, then enter your new password here.';

sendBtn?.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) {
        emailInfo.textContent = 'Please enter your email.';
        return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';
    emailInfo.textContent = '';

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/commonfiles/password-reset.html`
        });
        if (error) throw error;
        emailInfo.textContent = 'Reset link sent. Check your email and open the link.';
        emailInfo.className = 'mt-3 text-center text-sm font-medium h-5 text-green-600';
    } catch (error) {
        emailInfo.textContent = error.message || 'Could not send reset email.';
        emailInfo.className = 'mt-3 text-center text-sm font-medium h-5 text-red-500';
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send Reset Link';
    }
});

const showResetForm = () => {
    emailStep?.classList.add('hidden');
    resetStep?.classList.remove('hidden');
};

supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') showResetForm();
});

// The recovery hash is detected automatically by Supabase JS.
(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session && window.location.hash.includes('type=recovery')) showResetForm();
})();

resetBtn?.addEventListener('click', async () => {
    const p1 = passwordInput.value;
    const p2 = passwordConfirm.value;

    resetErr.textContent = '';
    resetOk.textContent = '';

    if (p1.length < 6) {
        resetErr.textContent = 'Password must be at least 6 characters.';
        return;
    }
    if (p1 !== p2) {
        resetErr.textContent = 'Passwords do not match.';
        return;
    }

    resetBtn.disabled = true;
    resetBtn.textContent = 'Updating...';

    try {
        const { error } = await supabase.auth.updateUser({ password: p1 });
        if (error) throw error;
        resetOk.textContent = 'Password updated successfully. Redirecting...';
        await supabase.auth.signOut();
        setTimeout(() => window.location.href = 'login.html', 1500);
    } catch (error) {
        resetErr.textContent = error.message || 'Password could not be changed.';
    } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = 'Save & Reset Password';
    }
})();
