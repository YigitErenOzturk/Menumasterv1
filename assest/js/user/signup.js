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

    if (password.length < 4) { // senin örnekte "user" 4 karakter, min'i 4 yaptım
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
