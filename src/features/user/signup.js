// --- IMPORTS ---
import { userService } from '../../api/userService.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');

    // --- HELPER: Show Message ---
    const showMsg = (text, type) => {
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

            // Basic validation
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

                // NEW SERVICE CALL: Using userService instead of fetch
                const response = await userService.register(userData);

                // Axios uses 'data' property for the response body
                showMsg('Success! Redirecting to login...', 'success');
                signupForm.reset();

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1200);

            } catch (err) {
                console.error("Signup Error:", err);
                // Axios errors store the backend message in err.response.data
                const backendMsg = err.response?.data?.message || 'Something went wrong.';
                showMsg(backendMsg, 'error');
            }
        });
    }

    // --- UI: Chat Icon Animation Logic ---
    const chatIcon = document.getElementById('chat-icon');
    if (chatIcon) {
        const bubble = document.createElement('div');
        bubble.className = "fixed bottom-24 right-20 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-2xl border border-gray-200 text-sm font-bold z-50 transform scale-0 origin-bottom-right transition-transform duration-500 ease-out";
        bubble.innerHTML = "Do you need help? 👋";

        const arrow = document.createElement('div');
        arrow.className = "absolute -bottom-1 right-4 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45";
        bubble.appendChild(arrow);
        document.body.appendChild(bubble);

        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes shake-hard {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(15deg); }
                50% { transform: rotate(0deg); }
                75% { transform: rotate(-15deg); }
                100% { transform: rotate(0deg); }
            }
            .animate-shake-hard { animation: shake-hard 0.4s ease-in-out infinite; }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            bubble.classList.remove('scale-0');
            chatIcon.classList.remove('animate-bounce');
            chatIcon.classList.add('animate-shake-hard');
            setTimeout(() => {
                chatIcon.classList.remove('animate-shake-hard');
            }, 2000);
        }, 3000);
    }
});