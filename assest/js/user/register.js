// --- API CONFIGURATION ---
const API_BASE_URL = 'http://192.168.1.100:3000'; // Same as main script
// -------------------------

// --- DOM Elements ---
const signupForm = document.getElementById('signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageEl = document.getElementById('message');

// --- UI Helpers ---
const resetMessage = () => {
  if (!messageEl) return;
  messageEl.textContent = '';
  messageEl.className = 'text-sm text-center';
};

const showMessage = (text, type) => {
  if (!messageEl) return;
  resetMessage();
  messageEl.textContent = text;

  if (type === 'error') messageEl.classList.add('text-red-400');
  if (type === 'success') messageEl.classList.add('text-green-400');
};

// --- Core Logic ---
/**
 * Handles the sign-up form submission.
 * @param {Event} event - The form submission event.
 */
const handleSignup = async (event) => {
  event.preventDefault();
  resetMessage();

  const name = nameInput?.value.trim();
  const email = emailInput?.value.trim();
  const password = passwordInput?.value.trim();

  if (!name || !email || !password) {
    showMessage('Please fill in all fields.', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || `HTTP Error! Status: ${response.status}`);
    }

    // --- SUCCESS ---
    showMessage('Account created successfully! You can now log in.', 'success');
    signupForm?.reset();
  } catch (error) {
    console.error('Signup Error:', error);
    showMessage(error.message || 'Signup failed.', 'error');
  }
};

// --- Event Listener ---
if (signupForm) {
  signupForm.addEventListener('submit', handleSignup);
}
