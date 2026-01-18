// --- IMPORTS ---
import { restaurantService } from '../../api/restaurantService.js';

// --- DOM Elements ---
const signupForm = document.getElementById('restaurant-signup-form');
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const imgPreview = document.getElementById('img-preview');
const messageEl = document.getElementById('message');

let base64Image = "";

/**
 * Handles the restaurant sign-up form submission using the Service Layer.
 */
const handleRestaurantSignup = async (event) => {
    event.preventDefault();
    
    //We collect form data
    const restaurantData = {
        name: document.getElementById('restaurantName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        description: document.getElementById('description').value.trim(),
        address: document.getElementById('address').value.trim(),
        imageUrl: base64Image // FileReader ile doldurulan base64 string
    };

    try {
        messageEl.textContent = 'Registering...';
        messageEl.className = 'text-center text-gray-400 animate-pulse';

        // Instead of fetch, we use our axios-based service.
        const response = await restaurantService.register(restaurantData);

        // When axios is successful (2xx status), it goes directly here.
        messageEl.textContent = 'Restaurant registered successfully!';
        messageEl.className = 'text-center text-green-400 font-bold';
        
        if (signupForm) signupForm.reset();
        imgPreview.src = ""; // Clear preview
        dropArea.classList.remove('has-image');
        base64Image = "";

        // sEND THEM TO LOGIN PAGE
        setTimeout(() => { window.location.href = '../common/login.html'; }, 2000);

    } catch (error) {
        // Axios errors are caught here.
        console.error("Signup Error:", error.response?.data || error.message);
        
        const backendMessage = error.response?.data?.message || "Error, Check informations one more time.";
        messageEl.textContent = backendMessage;
        messageEl.className = 'text-center text-red-400';
    }
};

// --- Image Upload & Preview Logic ---

function showPreview(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imgPreview.src = e.target.result;
            if (dropArea) dropArea.classList.add('has-image');
            base64Image = e.target.result; 
        }
        reader.readAsDataURL(file);
    } else {
        alert("Choose a picture!");
    }
}

// Event Listeners
if (signupForm) {
    signupForm.addEventListener('submit', handleRestaurantSignup);
}

if (fileInput) {
    fileInput.addEventListener('change', function() {
        showPreview(this.files[0]);
    });
}

// Drag & Drop Listeners
if (dropArea) {
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('drag-active');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('drag-active');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-active');
        const file = e.dataTransfer.files[0];
        if (fileInput) fileInput.files = e.dataTransfer.files; 
        showPreview(file);
    });
}