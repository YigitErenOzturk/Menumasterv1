// --- IMPORTS ---
import { userService } from '../../api/userService.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');

    // --- HELPER: Show Message ---
    const showMsg = (text, type) => {
        if (!messageDiv) return;
        messageDiv.textContent = text;
        messageDiv.className =
            type === 'error'
                ? 'text-red-400 text-sm text-center'
                : type === 'success'
                ? 'text-green-400 text-sm text-center'
                : 'text-yellow-400 text-sm text-center';
    };

    // --- FORM SUBMIT HANDLER ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const userData = {
                name: document.getElementById('name').value.trim(),
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.trim(),
                address: document.getElementById('address').value.trim(),
                password: document.getElementById('password').value.trim()
            };

            // Temel doğrulama
            if (Object.values(userData).some(val => !val)) {
                showMsg('Please fill in all fields.', 'error');
                return;
            }

            if (userData.password.length < 4) {
                showMsg('Password must be at least 4 characters.', 'error');
                return;
            }

            try {
                showMsg('Creating account...', 'info');

                // API Çağrısı
                await userService.register(userData);

                showMsg('Success! Redirecting to login...', 'success');
                signupForm.reset();

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1200);

            } catch (err) {
                console.error("Signup Error:", err);
                const backendMsg = err.response?.data?.message || 'Something went wrong during signup.';
                showMsg(backendMsg, 'error');
            }
        });
    }
});