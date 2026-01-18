// --- IMPORTS ---
import { restaurantService } from '../../api/restaurantService.js';

// --- DOM Elements ---
const signupForm = document.getElementById('restaurant-signup-form');
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const imgPreview = document.getElementById('img-preview');
const messageEl = document.getElementById('message');
const polishCities = [
  "Warszawa", "Krakow", "Poznan", "Wroclaw", "Gdansk",
  "Lodz", "Szczecin", "Katowice", "Lublin", "Bydgoszcz",
  "Bialystok", "Gdynia", "Czestochowa", "Radom", "Sosnowiec"
];

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
        phoneNumber: document.getElementById('phoneNumber').value.substring(4).replace(/\D/g, ""), // Remove +48 and non-digits
        description: document.getElementById('description').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value,
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
        setTimeout(() => { window.location.href = '../commonfiles/login.html'; }, 2000);

    } catch (error) {
        // Axios errors are caught here.
        console.error("Signup Error:", error.response?.data || error.message);
        
        const backendMessage = error.response?.data?.message || "Error, Check informations one more time.";
        messageEl.textContent = backendMessage;
        messageEl.className = 'text-center text-red-400';
    }
};
// --- Populate City Select ---
function fillCitySelect() {
  const citySelect = document.getElementById("city");
  citySelect.innerHTML = '<option value="">Select a city</option>';

  polishCities.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  });
}

fillCitySelect();
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
const phoneInput = document.getElementById('phoneNumber');

if (phoneInput) {
    // 1. Sayfa yüklendiğinde veya inputa tıklandığında +48'i koy
    const setInitialValue = () => {
        if (!phoneInput.value.startsWith('+48 ')) {
            phoneInput.value = '+48 ';
        }
    };

    phoneInput.addEventListener('focus', setInitialValue);

    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value;

        // +48 kısmının silinmesini engelle
        if (!value.startsWith('+48 ')) {
            value = '+48 ' + value.replace(/^\+?48?\s?/, "");
        }

        // +48'den sonrasını temizle (sadece rakamlar)
        let prefix = "+48 ";
        let digits = value.substring(4).replace(/\D/g, '').substring(0, 9); // Maximum 9 digits
        
        // Polonya 9 hane kuralına göre formatla: (XXX) XXX XXX
        let formatted = prefix;
        if (digits.length > 0) {
            formatted += "(" + digits.substring(0, 3);
        }
        if (digits.length > 3) {
            formatted += ") " + digits.substring(3, 6);
        }
        if (digits.length > 6) {
            formatted += " " + digits.substring(6, 9);
        }

        e.target.value = formatted;
    });

    // İmlecin +48'in başına gitmesini engelle, hep sonda kalsın
    phoneInput.addEventListener('keydown', (e) => {
        if (e.target.selectionStart < 4 && (e.key === 'Backspace' || e.key === 'Delete')) {
            // İlk 4 karakteri (+48 ) silmeyi engelle
            if (e.target.selectionStart <= 4) {
                e.preventDefault();
            }
        }
    });

    phoneInput.addEventListener('click', (e) => {
        // Tıklandığında imleç en başa giderse en sona at
        if (e.target.selectionStart < 4) {
            const len = e.target.value.length;
            e.target.setSelectionRange(len, len);
        }
    });
}
