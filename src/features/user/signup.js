import { userService } from '../../api/userService.js';

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const messageDiv = document.getElementById('message');

  const polishCities = [
    "Warszawa","Krakow","Poznan","Wroclaw","Gdansk",
    "Lodz","Szczecin","Katowice","Lublin","Bydgoszcz"
  ];

  const showMsg = (text, type) => {
    if (!messageDiv) return;
    messageDiv.textContent = text;
    messageDiv.className =
      type === 'error'
        ? 'text-red-400 text-sm text-center'
        : type === 'success'
          ? 'text-green-400 text-sm text-center'
          : 'text-yellow-400 text-sm text-center';
  };

  function fillCitySelect() {
    const citySelect = document.getElementById("city");
    if (!citySelect) return;
    citySelect.innerHTML = '<option value="">Select a city</option>';

    polishCities.forEach(city => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  }
  fillCitySelect();

  if (!signupForm) return;

  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const userData = {
      name: document.getElementById('name').value.trim(),
      username: document.getElementById('username').value.trim(),
      email: document.getElementById('email').value.trim(),
      phoneNumber: document.getElementById('phoneNumber').value.trim(),
      city: document.getElementById('city').value,
      address: document.getElementById('address').value.trim(),
      password: document.getElementById('password').value.trim()
    };

    if (Object.values(userData).some(val => !val)) {
      showMsg('Please fill in all fields.', 'error');
      return;
    }

    if (userData.password.length < 4) {
      showMsg('Password must be at least 4 characters.', 'error');
      return;
    }

    try {
      showMsg('Creating account...', 'info');
      await userService.register(userData);

      showMsg('Success! Redirecting to login...', 'success');
      signupForm.reset();

      setTimeout(() => {
        window.location.replace("/commonfiles/login.html");
      }, 1200);

    } catch (err) {
      console.error("Signup Error:", err);
      const backendMsg = err.response?.data?.message || 'Something went wrong during signup.';
      showMsg(backendMsg, 'error');
    }
  });
});
