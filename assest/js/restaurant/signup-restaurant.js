// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api'; // Kendi local portunla değiştirmeyi unutma

// --- DOM Elements ---
const signupForm = document.getElementById('restaurant-signup-form');
const nameInput = document.getElementById('restaurantName');
const addressInput = document.getElementById('address');
const descriptionInput = document.getElementById('description');
const phoneInput = document.getElementById('phoneNumber');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageEl = document.getElementById('message');

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const imgPreview = document.getElementById('img-preview');

// --- State ---
let base64Image = "";

// --- Helpers ---
const setMessage = (text, className) => {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className = className;
};

// 3. review
function showPreview(file) {
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();

    reader.onload = function (e) {
      imgPreview.src = e.target.result;
      dropArea.classList.add('has-image');

      // BURASI KRİTİK: Resmi uzun bir string'e (Base64) çevirdik
      base64Image = e.target.result;
    };

    reader.readAsDataURL(file);
  } else {
    alert("Choose a picture!");
  }
}

/**
 * Handles the restaurant sign-up form submission using the new API Schema.
 */
const handleRestaurantSignup = async (event) => {
  event.preventDefault();

  // Backend JSON şemasına %100 uyumlu obje
  const restaurantData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value.trim(),
    phoneNumber: phoneInput.value.trim(),
    description: descriptionInput.value.trim(),
    address: addressInput.value.trim(),
    imageUrl: base64Image // sending the base64 image string
  };

  try {
    setMessage('Registering...', 'text-center text-gray-400 animate-pulse');

    const response = await fetch(`${API_BASE_URL}/restaurants/Register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(restaurantData),
    });

    // Hata detayını görebilmek için önce JSON'ı parse et
    const result = await response.json();

    if (!response.ok) {
      // Backend'den gelen hata detaylarını konsola bas (Neden 400 aldığını buradan göreceğiz)
      console.error("Backend Error:", result);

      // Eğer backend validation errors dönüyorsa onları yakala
      const errorMessage = result.errors
        ? JSON.stringify(result.errors)
        : (result.message || `Error ${response.status}`);

      throw new Error(errorMessage);
    }

    setMessage('Restaurant registered successfully!', 'text-center text-green-400 font-bold');

    signupForm.reset();
    base64Image = "";
    if (dropArea) dropArea.classList.remove('has-image');
    if (imgPreview) imgPreview.src = "";

  } catch (error) {
    console.error("Signup Error:", error);
    setMessage("Error, Check informations one more time.", 'text-center text-red-400');
  }
};

// --- Event Listeners ---
if (signupForm) {
  signupForm.addEventListener('submit', handleRestaurantSignup);
}

if (fileInput) {
  // upload
  fileInput.addEventListener('change', function () {
    const file = this.files[0];
    showPreview(file);
  });
}

if (dropArea && fileInput) {
  // Drag & Drop
  // When you hover over the file
  dropArea.addEventListener('dragover', (event) => {
    event.preventDefault(); // Block default behavior
    dropArea.classList.add('drag-active');
  });

  // on file leave
  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('drag-active');
  });

  // drop file
  dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('drag-active');

    const file = event.dataTransfer.files[0];

    // assign the file to the input field so it's sent when the form is submitted.
    fileInput.files = event.dataTransfer.files;

    showPreview(file);
  });
}
