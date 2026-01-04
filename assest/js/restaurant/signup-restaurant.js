// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api'; // Kendi local portunla değiştirmeyi unutma

// DOM Elements
const signupForm = document.getElementById('restaurant-signup-form');
const nameInput = document.getElementById('restaurantName'); // HTML'deki ID'n aynı kalabilir
const addressInput = document.getElementById('address');
const descriptionInput = document.getElementById('description'); // Yeni alan
const phoneInput = document.getElementById('phoneNumber'); // Yeni alan
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageEl = document.getElementById('message');

/**
 * Handles the restaurant sign-up form submission using the new API Schema.
 */
const handleRestaurantSignup = async (event) => {
    event.preventDefault();
    const msg = document.getElementById('message');

    // Backend JSON şemasına %100 uyumlu obje
    const restaurantData = {
        name: document.getElementById('restaurantName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        description: document.getElementById('description').value.trim(),
        address: document.getElementById('address').value.trim(),
        imageUrl: "" // Backend string beklediği için boş string gönderiyoruz
    };

    try {
        msg.textContent = 'Registering...';
        msg.className = 'text-center text-gray-400 animate-pulse';

        const response = await fetch(`${API_BASE_URL}/restaurants/Register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(restaurantData),
        });

        // Hata detayını görebilmek için önce JSON'ı parse et
        const result = await response.json();

        if (!response.ok) {
            // Backend'den gelen hata detaylarını konsola bas (Neden 400 aldığını buradan göreceğiz)
            console.error("Backend Hata Detayı:", result);
            
            // Eğer backend validation errors dönüyorsa onları yakala
            const errorMessage = result.errors ? JSON.stringify(result.errors) : (result.message || `Error ${response.status}`);
            throw new Error(errorMessage);
        }
        
        msg.textContent = 'Restaurant registered successfully!';
        msg.className = 'text-center text-green-400 font-bold';
        signupForm.reset();

    } catch (error) {
        console.error("Signup Error:", error);
        msg.textContent = "Hata: Bilgileri kontrol edip tekrar deneyin.";
        msg.className = 'text-center text-red-400';
    }
};
signupForm.addEventListener('submit', handleRestaurantSignup);