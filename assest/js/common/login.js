// --- API CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000';

// --- DOM Elements ---
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageDisplay = document.getElementById('message-display');
const submitButton = loginForm.querySelector('button[type="submit"]');
const isRestaurantCheckbox = document.getElementById('isRestaurant'); // checkbox id

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

  // Default = user, checkbox checked = restaurant
  const isRestaurant = isRestaurantCheckbox?.checked === true;

  const endpoint = isRestaurant ? '/api/restaurants/login' : '/api/users/login';
  const redirectUrl = isRestaurant
    ? '../restaurantfiles/dashboard-restaurant.html'
    : '../userfiles/dashboard-preview.html';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // If your backend expects { email, password } instead, change the next line accordingly.
      body: JSON.stringify({ usernameOrEmail: email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Invalid credentials or server error.');
    }
// --- ONLINE SUCCESS ---
console.log('Login Success:', data);

// 1. En kritik kısım: Backend'den gelen token'ı kaydediyoruz
if (data.token) {
    localStorage.setItem("authToken", data.token); // dashboard-restaurant.js bu ismi bekliyor
}

localStorage.setItem("userId", data.userId || ""); 
localStorage.setItem("userName", data.name || "");

displayMessage('Login successful! Redirecting...', 'success');


    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1200);

  } catch (error) {
    // --- OFFLINE/ERROR HANDLING ---
    console.error('Login Error:', error);

    // Offline admin login (admin sayfası ayrı olsa da senin eski fallback'in dursun)
    if (email === 'admin@menumaster.com' && password === 'admin') {
      displayMessage('Offline admin login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '../adminfiles/admin-dashboard.html';
      }, 1200);
      return;
    }

    // Offline restaurant (sadece checkbox işaretliyse çalışsın)
    if (isRestaurant && email === 'offline@restaurant.com' && password === 'offline') {
      displayMessage('Offline restaurant login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '../restaurantfiles/dashboard-restaurant.html';
      }, 1200);
      return;
    }

    // Offline user (checkbox işaretli değilse çalışsın)
    if (!isRestaurant && email === 'offline@menumaster.com' && password === 'offline') {
      displayMessage('Offline user login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = '../userfiles/dashboard-preview.html';
      }, 1200);
      return;
    }

    // Generic error
    displayMessage('Login failed. Check credentials or network.', 'error');
    submitButton.disabled = false;
  }
};

// --- Event Listener ---
loginForm.addEventListener('submit', handleLogin);
