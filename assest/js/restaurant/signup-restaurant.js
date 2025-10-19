// --- API CONFIGURATION ---
const API_BASE_URL = 'http://192.168.1.100:3000'; 
// -------------------------

// DOM Elements
const signupForm = document.getElementById('restaurant-signup-form');
const restaurantNameInput = document.getElementById('restaurantName');
const addressInput = document.getElementById('address');
const ownerNameInput = document.getElementById('ownerName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageEl = document.getElementById('message');

/**
 * Handles the restaurant sign-up form submission.
 * @param {Event} event - The form submission event.
 */
const handleRestaurantSignup = async (event) => {
    event.preventDefault();
    messageEl.textContent = '';
    messageEl.className = 'text-sm text-center'; // Reset class

    const restaurantData = {
        restaurantName: restaurantNameInput.value.trim(),
        address: addressInput.value.trim(),
        ownerName: ownerNameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
    };

    // Obligatory to fill the fields
    if (Object.values(restaurantData).some(field => !field)) {
        messageEl.textContent = 'Please fill in all fields.';
        messageEl.classList.add('text-red-400');
        return;
    }

    try {
        // Must be this '/register-restaurant' Endpoint in beckend
        const response = await fetch(`${API_BASE_URL}/register-restaurant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(restaurantData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP Error! Status: ${response.status}`);
        }
        
        // --- SUCCESS ---
        messageEl.textContent = 'Restaurant registered successfully! Our team will review your application.';
        messageEl.classList.add('text-green-400');
        signupForm.reset(); // Clear the form

    } catch (error) {
        console.error("Restaurant Signup Error:", error);
        messageEl.textContent = error.message;
        messageEl.classList.add('text-red-400');
    }
};

// --- Event Listener ---
signupForm.addEventListener('submit', handleRestaurantSignup);
