// --- API CONFIGURATION ---
const API_BASE_URL = 'http://192.168.1.100:3000'; // Same as main script
// -------------------------

// DOM Elements
const signupForm = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageEl = document.getElementById('message');

/**
 * Handles the sign-up form submission.
 * @param {Event} event - The form submission event.
 */
const handleSignup = async (event) => {
    event.preventDefault();
    messageEl.textContent = '';
    messageEl.className = 'text-sm text-center'; // Reset class

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !email || !password) {
        messageEl.textContent = 'Please fill in all fields.';
        messageEl.classList.add('text-red-400');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP Error! Status: ${response.status}`);
        }
        
        // --- SUCCESS ---
        messageEl.textContent = 'Account created successfully! You can now log in.';
        messageEl.classList.add('text-green-400');
        signupForm.reset(); // Clear the form

    } catch (error) {
        console.error("Signup Error:", error);
        messageEl.textContent = error.message;
        messageEl.classList.add('text-red-400');
    }
};

// --- Event Listener ---
signupForm.addEventListener('submit', handleSignup);
