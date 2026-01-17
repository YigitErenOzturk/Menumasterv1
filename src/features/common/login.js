// --- IMPORTS ---
import { userService } from '../../api/userService.js';
import { restaurantService } from '../../api/restaurantService.js';

// --- DOM Elements ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageDisplay = document.getElementById('message-display');
const submitButton = loginForm.querySelector('button[type="submit"]');
const isRestaurantCheckbox = document.getElementById('isRestaurant');

/**
 * Displays a message in the UI.
 */
const displayMessage = (message, type) => {
    messageDisplay.textContent = message;
    if (type === 'error') {
        messageDisplay.className = 'text-red-400 text-sm text-center h-5';
    } else {
        messageDisplay.className = 'text-green-400 text-sm text-center h-5';
    }
};

/**
 * Handles the login form submission.
 */
const handleLogin = async (event) => {
    event.preventDefault();
    displayMessage('', 'success'); 
    submitButton.disabled = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        displayMessage('Please fill in all fields.', 'error');
        submitButton.disabled = false;
        return;
    }

    const isRestaurant = isRestaurantCheckbox?.checked === true;
    const redirectUrl = isRestaurant
        ? '../restaurantfiles/dashboard-restaurant.html'
        : '../userfiles/dashboard-preview.html';

    try {
        // --- API REFACTOR START ---
        // Backend loglarına göre 'email' anahtarını bekliyor, o yüzden böyle paketledik
        const credentials = { usernameOrEmail: email, password: password };

        const response = isRestaurant 
            ? await restaurantService.login(credentials)
            : await userService.login(credentials);

        const data = response.data; // Axios'ta veri .data içindedir
        
        console.log('Backendden Gelen Ham Veri:', data);

        // 1. Temizlik
        localStorage.removeItem("restaurantId");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");

        // 2. Token Kaydı
        if (data.token) {
            localStorage.setItem("authToken", data.token);
        }

        // 3. Veri Yakalama
        if (isRestaurant) {
            localStorage.setItem("userRole", "restaurant");
            localStorage.setItem("restaurantId", data.restaurantId);
            localStorage.setItem("restaurantName", data.name || "Restaurant"); 
        } else {
            localStorage.setItem("userRole", "user");
            localStorage.setItem("userId", data.userId || data.id);
            localStorage.setItem("userName", data.name || data.unique_name || "User");
        }

        displayMessage('Login successful! Redirecting...', 'success');

        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1200);
        // --- API REFACTOR END ---

    } catch (error) {
        console.error('Login Error:', error);

        // --- OFFLINE/FALLBACK HANDLING (BOZULMADI) ---
        if (email === 'admin@menumaster.com' && password === 'admin') {
            displayMessage('Offline admin login successful! Redirecting...', 'success');
            setTimeout(() => { window.location.href = '../adminfiles/admin-dashboard.html'; }, 1200);
            return;
        }

        if (isRestaurant && email === 'offline@restaurant.com' && password === 'offline') {
            displayMessage('Offline restaurant login successful! Redirecting...', 'success');
            setTimeout(() => { window.location.href = '../restaurantfiles/dashboard-restaurant.html'; }, 1200);
            return;
        }

        if (!isRestaurant && email === 'offline@menumaster.com' && password === 'offline') {
            displayMessage('Offline user login successful! Redirecting...', 'success');
            setTimeout(() => { window.location.href = '../userfiles/dashboard-preview.html'; }, 1200);
            return;
        }

        // Backend'den gelen hata mesajını göster
        const errorMsg = error.response?.data?.message || 'Login failed. Check credentials or network.';
        displayMessage(errorMsg, 'error');
        submitButton.disabled = false;
    }
};

// --- Event Listeners ---
loginForm.addEventListener('submit', handleLogin);

document.addEventListener("DOMContentLoaded", () => {
    // Modal Logic
    const helpLink = document.getElementById("help-link");
    const helpModal = document.getElementById("help-modal");
    const closeHelp = document.getElementById("close-help");

    if (helpLink) {
        helpLink.addEventListener("click", (e) => {
            e.preventDefault();
            helpModal.classList.remove("hidden");
        });
    }

    if (closeHelp) {
        closeHelp.addEventListener("click", () => helpModal.classList.add("hidden"));
    }

    // Chatbot UI Logic
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
            setTimeout(() => { chatIcon.classList.remove('animate-shake-hard'); }, 2000);
        }, 3000);
    }
});