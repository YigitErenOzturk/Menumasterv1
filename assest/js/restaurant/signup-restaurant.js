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
        imageUrl: base64Image // sending the base64 image string
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
            console.error("Backend Error:", result);
            
            // Eğer backend validation errors dönüyorsa onları yakala
            const errorMessage = result.errors ? JSON.stringify(result.errors) : (result.message || `Error ${response.status}`);
            throw new Error(errorMessage);
        }
        
        msg.textContent = 'Restaurant registered successfully!';
        msg.className = 'text-center text-green-400 font-bold';
        signupForm.reset();

    } catch (error) {
        console.error("Signup Error:", error);
        msg.textContent = "Error, Check informations one more time.";
        msg.className = 'text-center text-red-400';
    }
};
signupForm.addEventListener('submit', handleRestaurantSignup);


  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');
  const imgPreview = document.getElementById('img-preview');

  // upload
  fileInput.addEventListener('change', function() {
    const file = this.files[0];
    showPreview(file);
  });

  // Drag & Drop 
  
  // When you hover over the file
  dropArea.addEventListener('dragover', (event) => {
    event.preventDefault(); // Block default behavior
    dropArea.classList.add('drag-active');
  });

  // on file
  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('drag-active');
  });

  // drop file
  dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('drag-active');
    
    const file = event.dataTransfer.files[0];
    //  assign the file to the input field so it's sent when the form is submitted.
    fileInput.files = event.dataTransfer.files; 
    
    showPreview(file);
  });
  let base64Image = "";

  // 3. review
  function showPreview(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imgPreview.src = e.target.result;
            dropArea.classList.add('has-image');
            
            // BURASI KRİTİK: Resmi uzun bir string'e (Base64) çevirdik
            base64Image = e.target.result; 
        }
        
        reader.readAsDataURL(file);
    } else {
        alert("Choose a picture!");
    }
}
