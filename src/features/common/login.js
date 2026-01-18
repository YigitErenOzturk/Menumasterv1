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
 * Dunction Of The Show Messad
 */
const displayMessage = (message, type) => {
    messageDisplay.textContent = message;
    messageDisplay.className = type === 'error'
        ? 'text-red-400 text-sm text-center h-5'
        : 'text-green-400 text-sm text-center h-5';
};

/**
 *Login form handler
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
        const credentials = { usernameOrEmail: email, password: password };

        // API Call
        const response = isRestaurant 
            ? await restaurantService.login(credentials)
            : await userService.login(credentials);

        const data = response.data;
        console.log('Login Success Data:', data);

        // Storage Cleaning and New Registration
        localStorage.removeItem("restaurantId");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");

        if (data.token) {
            localStorage.setItem("authToken", data.token);
        }

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

    } catch (error) {
        console.error('Login Error:', error);

        // --- OFFLINE/FALLBACK HANDLING ---
        if (email === 'admin@menumaster.com' && password === 'admin') {
            displayMessage('Offline admin login successful!', 'success');
            setTimeout(() => { window.location.href = '../adminfiles/admin-dashboard.html'; }, 1200);
            return;
        }

        if (isRestaurant && email === 'offline@restaurant.com' && password === 'offline') {
            displayMessage('Offline restaurant login!', 'success');
            setTimeout(() => { window.location.href = '../restaurantfiles/dashboard-restaurant.html'; }, 1200);
            return;
        }

        if (!isRestaurant && email === 'offline@menumaster.com' && password === 'offline') {
            displayMessage('Offline user login!', 'success');
            setTimeout(() => { window.location.href = '../userfiles/dashboard-preview.html'; }, 1200);
            return;
        }

        const errorMsg = error.response?.data?.message || 'Login failed. Check credentials.';
        displayMessage(errorMsg, 'error');
        submitButton.disabled = false;
    }
};

// Event Listener
loginForm.addEventListener('submit', handleLogin);