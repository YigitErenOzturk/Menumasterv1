// --- API CONFIGURATION ---
const API_BASE_URL = 'http://192.168.1.100:3000';

// --- DOM Elements ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageDisplay = document.getElementById('message-display');
const submitButton = loginForm.querySelector('button[type="submit"]');

/**
 * Displays a message in the UI.
 * @param {string} message - The message to display.
 * @param {'error' | 'success'} type - The type of message.
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
    displayMessage('', 'success'); // Clear previous messages
    submitButton.disabled = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        displayMessage('Please fill in all fields.', 'error');
        submitButton.disabled = false;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({ message: 'Invalid credentials or server error.' }));
            throw new Error(result.message);
        }

        const result = await response.json();

        // --- ONLINE SUCCESS ---
        displayMessage('Login successful! Redirecting...', 'success');
        
        // In a real app, you would save a token, e.g., localStorage.setItem('authToken', result.token);

        setTimeout(() => {
            // Redirect based on the user's role returned from the API
            if (result.role === 'admin') {
                window.location.href = '../adminfiles/admin-dashboard.html';
            } else if (result.role === 'restaurant') {
                window.location.href = '../restaurantfiles/dashboard-restaurant.html';
            } else { // 'user' or default
                window.location.href = '../userfiles/dashboard-preview.html';
            }
        }, 1500);

    } catch (error) {
        // --- OFFLINE/ERROR HANDLING ---
        console.error("Login Error:", error);

        // Check for special offline credentials if the API fails.
        if (email === 'admin@menumaster.com' && password === 'admin') {
            displayMessage('Offline admin login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '../adminfiles/admin-dashboard.html';
            }, 1500);
        } else if (email === 'offline@restaurant.com' && password === 'offline') {
            displayMessage('Offline restaurant login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '../restaurantfiles/dashboard-restaurant.html';
            }, 1500);
        } else if (email === 'offline@menumaster.com' && password === 'offline') {
            displayMessage('Offline user login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '../userfiles/dashboard-preview.html';
            }, 1500);
        } else {
            // Generic error for online failures or incorrect offline credentials
            displayMessage('Login failed. Check credentials or network.', 'error');
            submitButton.disabled = false;
        }
    }
};

// --- Event Listener ---
loginForm.addEventListener('submit', handleLogin);

