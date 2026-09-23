// --- IMPORTS ---
import { userService } from '../../api/userService.js';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');
    const polishCities = [
        "Warszawa",
        "Krakow",
        "Poznan",
        "Wroclaw",
        "Gdansk",
        "Lodz",
        "Szczecin",
        "Katowice",
        "Lublin",
        "Bydgoszcz"
    ];

    // --- HELPER: Show Message ---
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
    const phoneInput = document.getElementById('phoneNumber');

if (phoneInput) {
    // 1. default +48 and format
    const setInitialValue = () => {
        if (!phoneInput.value.startsWith('+48 ')) {
            phoneInput.value = '+48 ';
        }
    };

    phoneInput.addEventListener('focus', setInitialValue);

    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value;

        // default +48
        if (!value.startsWith('+48 ')) {
            value = '+48 ' + value.replace(/^\+?48?\s?/, "");
        }

        // clean +48 
        let prefix = "+48 ";
        let digits = value.substring(4).replace(/\D/g, '').substring(0, 9); // Maximum 9 digits
        
        // poland format: (XXX) XXX XXX
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

    phoneInput.addEventListener('keydown', (e) => {
        if (e.target.selectionStart < 4 && (e.key === 'Backspace' || e.key === 'Delete')) {
            if (e.target.selectionStart <= 4) {
                e.preventDefault();
            }
        }
    });

    phoneInput.addEventListener('click', (e) => {
        if (e.target.selectionStart < 4) {
            const len = e.target.value.length;
            e.target.setSelectionRange(len, len);
        }
    });
}

    // --- FORM SUBMIT HANDLER ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const userData = {
                name: document.getElementById('name').value.trim(),
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('email').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.substring(4).replace(/\D/g, ""), // Remove +48 and non-digits
                city: document.getElementById('city').value,
                address: document.getElementById('address').value.trim(),
                password: document.getElementById('password').value.trim()
            };

            // Temel doğrulama
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

                // API Çağrısı
                const response = await userService.register(userData);

                const msg = response.data?.session
                    ? 'Account created! Redirecting to login...'
                    : 'Account created! Check your email if confirmation is enabled, then login.';
                showMsg(msg, 'success');
                signupForm.reset();

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1200);

            } catch (err) {
                console.error("Signup Error:", err);
                const backendMsg = err.response?.data?.message || 'Something went wrong during signup.';
                showMsg(backendMsg, 'error');
            }
        });
    }
});
