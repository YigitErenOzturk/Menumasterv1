document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const messageDiv = document.getElementById('message');

  const API_URL = 'http://localhost:5000/api/users/register';

  const showMsg = (text, type) => {
    messageDiv.textContent = text;
    messageDiv.className =
      type === 'error'
        ? 'text-red-400 text-sm text-center'
        : type === 'success'
        ? 'text-green-400 text-sm text-center'
        : 'text-yellow-400 text-sm text-center';
  };

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const address = document.getElementById('address').value.trim();
    const password = document.getElementById('password').value.trim();

    // Basic validation
    if (!name || !username || !email || !phoneNumber || !address || !password) {
      showMsg('Please fill in all fields.', 'error');
      return;
    }

    // senin örnekte "user" 4 karakter, min'i 4 yaptım
    if (password.length < 4) {
      showMsg('Password must be at least 4 characters.', 'error');
      return;
    }

    const userData = { name, username, email, phoneNumber, address, password };

    try {
      showMsg('Creating account...', 'info');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed.');
      }

      showMsg('Success! Redirecting to login...', 'success');
      signupForm.reset();

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    } catch (err) {
      console.error(err);
      showMsg(err.message || 'Something went wrong.', 'error');
    }
  });
});

// CHATBOT SCRIPTS (aynı mantık, sadece düzenli fonksiyon)
(() => {
  const chatIcon = document.getElementById('chat-icon');
  if (!chatIcon) return;

  // Create Ballon To Ask Do you have a question
  const bubble = document.createElement('div');

  // Tailwind Classes (aynı)
  bubble.className =
    'fixed bottom-24 right-20 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-2xl border border-gray-200 text-sm font-bold z-50 transform scale-0 origin-bottom-right transition-transform duration-500 ease-out';
  bubble.innerHTML = 'Do you need help? 👋';

  const arrow = document.createElement('div');
  arrow.className =
    'absolute -bottom-1 right-4 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45';
  bubble.appendChild(arrow);

  document.body.appendChild(bubble);

  // It will work after 3 Seconds
  setTimeout(() => {
    // show ballon
    bubble.classList.remove('scale-0');

    // shake
    chatIcon.classList.remove('animate-bounce');
    chatIcon.classList.add('animate-shake-hard');

    // It will stop to shake after 2 seconds
    setTimeout(() => {
      chatIcon.classList.remove('animate-shake-hard');
    }, 2000);
  }, 3000);
})();
