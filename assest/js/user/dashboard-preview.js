// --- API CONFIGURATION ---
const API_BASE_URL = 'http://192.168.1.100:3000';
// -------------------------

// --- DOM Elements ---
const userNameEl = document.getElementById('user-name');
const userInitialEl = document.getElementById('user-initial');
const mainContentEl = document.getElementById('main-content');
const logoutButton = document.getElementById('logout-button');
const navLinks = {
    dashboard: document.getElementById('nav-dashboard'),
    reservations: document.getElementById('nav-reservations'),
    reviews: document.getElementById('nav-reviews'),
    settings: document.getElementById('nav-settings'),
};

// --- Core Functions ---
const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn('Authentication token not found. Running in demo mode.');
        // For real app: redirect to login
        // window.location.href = 'login.html';
    }
};

const setUserInfo = () => {
    // Öncelikle e-posta varsa göster, yoksa Guest
    const userEmail = localStorage.getItem('userEmail'); // login sırasında kaydedilen email
    const userName = localStorage.getItem('userName'); // opsiyonel isim
    if (userEmail) {
        userNameEl.textContent = userEmail;
        userInitialEl.textContent = userEmail.charAt(0).toUpperCase();
    } else if (userName) {
        userNameEl.textContent = userName;
        userInitialEl.textContent = userName.charAt(0).toUpperCase();
    } else {
        userNameEl.textContent = 'Guest';
        userInitialEl.textContent = 'G';
    }
};

const fetchData = async (endpoint) => {
    if (endpoint === 'cities') {
        return Promise.resolve([
            { name: 'Warszawa' }, { name: 'Kraków' }, { name: 'Łódź' },
            { name: 'Wrocław' }, { name: 'Poznań' }, { name: 'Gdańsk' }
        ]);
    }
    if (endpoint.startsWith('restaurants')) {
        const mockRestaurants = [
            { name: 'Turecki Szama', cuisine: 'Turkish Kebab', imageUrl: 'https://i.hizliresim.com/e1xcc89.jpeg' }
        ];
        return Promise.resolve(mockRestaurants);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        return { error: true, message: `Failed to connect to the API at ${API_BASE_URL}` };
    }
};

// --- View Rendering Functions ---
const renderRestaurants = (restaurants) => {
    const grid = mainContentEl.querySelector('#restaurant-grid');
    if (!grid) return;
    grid.innerHTML = restaurants.length === 0 ? '<p class="col-span-4 text-center text-gray-400">No restaurants found.</p>' : '';
    restaurants.forEach(restaurant => {
        grid.innerHTML += `
            <a href="../restaurantfiles/restaurant-details.html?name=${encodeURIComponent(restaurant.name)}" class="block bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300">
                <img src="${restaurant.imageUrl || 'https://placehold.co/400x200/4f46e5/ffffff?text=Restaurant'}" alt="${restaurant.name}" class="w-full h-32 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-indigo-400">${restaurant.name}</h3>
                    <p class="text-gray-400 text-sm">${restaurant.cuisine}</p>
                </div>
            </a>`;
    });
};

const renderApiError = (viewName) => {
    mainContentEl.innerHTML = `<div class="text-center text-red-400 p-8 bg-gray-800 rounded-lg">
        <h2 class="text-xl font-bold mb-2">Could Not Load ${viewName}</h2>
        <p>Failed to connect to the API. Please ensure the backend server is running and accessible.</p>
    </div>`;
};

const renderDashboardView = async () => {
    mainContentEl.innerHTML = `
        <h1 class="text-3xl font-bold text-white mb-6">Explore Restaurants</h1>
        <div class="mb-8">
            <label for="city-select" class="text-sm font-medium text-gray-300">Filter by City:</label>
            <select id="city-select" class="mt-2 w-full max-w-sm p-3 text-gray-100 bg-gray-800 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">All Cities (Popular)</option>
            </select>
        </div>
        <div id="restaurant-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <p class="col-span-4 text-center text-gray-400">Loading...</p>
        </div>`;

    const citySelect = document.getElementById('city-select');
    const cities = await fetchData('cities');
    if (cities.error) { renderApiError('Cities'); return; }
    cities.forEach(city => citySelect.innerHTML += `<option value="${city.name}">${city.name}</option>`);

    citySelect.addEventListener('change', async (e) => {
        const endpoint = e.target.value ? `restaurants?city=${encodeURIComponent(e.target.value)}` : 'restaurants/popular';
        const restaurants = await fetchData(endpoint);
        restaurants.error ? renderApiError('Restaurants') : renderRestaurants(restaurants);
    });

    const initialRestaurants = await fetchData('restaurants/popular');
    initialRestaurants.error ? renderApiError('Popular Restaurants') : renderRestaurants(initialRestaurants);
};

const renderReservationsView = async () => {
    mainContentEl.innerHTML = `
        <h1 class="text-3xl font-bold text-white mb-6">My Reservations</h1>
        <div id="reservations-list" class="space-y-4"><p class="text-center text-gray-400">Loading reservations...</p></div>`;

    const reservations = await fetchData('reservations');
    if (reservations.error) { renderApiError('Reservations'); return; }

    const listEl = document.getElementById('reservations-list');
    listEl.innerHTML = reservations.length === 0 ? '<p class="text-center text-gray-400">You have no upcoming reservations.</p>' : '';
    reservations.forEach(res => {
        let statusColor = res.status === 'Confirmed' ? 'bg-green-500' : res.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500';
        listEl.innerHTML += `
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h3 class="text-xl font-bold text-indigo-400">${res.restaurantName}</h3>
                    <p class="text-gray-300 mt-1">Date: ${new Date(res.date).toLocaleDateString()} at ${res.time}</p>
                    <p class="text-gray-400 text-sm">Guests: ${res.people}</p>
                </div>
                <div class="mt-4 sm:mt-0 flex items-center space-x-4">
                    <span class="text-sm font-medium px-3 py-1 rounded-full ${statusColor} text-white">${res.status}</span>
                    <button class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition">Cancel</button>
                </div>
            </div>`;
    });
};

const renderReviewsView = async () => {
    mainContentEl.innerHTML = `
        <h1 class="text-3xl font-bold text-white mb-6">My Reviews</h1>
        <div id="reviews-list" class="space-y-4"><p class="text-center text-gray-400">Loading reviews...</p></div>`;

    const reviews = await fetchData('reviews');
    if (reviews.error) { renderApiError('Reviews'); return; }

    const listEl = document.getElementById('reviews-list');
    listEl.innerHTML = reviews.length === 0 ? '<p class="text-center text-gray-400">You have not written any reviews yet.</p>' : '';
    reviews.forEach(review => {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += `<svg class="w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
        }
        listEl.innerHTML += `
            <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xl font-bold text-indigo-400">${review.restaurantName}</h3>
                    <div class="flex">${stars}</div>
                </div>
                <p class="text-gray-300 italic">"${review.comment}"</p>
            </div>`;
    });
};

const renderSettingsView = () => {
    const currentName = localStorage.getItem('userName') || '';
    mainContentEl.innerHTML = `
        <h1 class="text-3xl font-bold text-white mb-6">Settings</h1>
        <div class="bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg mx-auto">
            <form id="settings-form">
                <div class="mb-4">
                    <label for="full-name" class="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input type="text" id="full-name" value="${currentName}" class="w-full p-3 text-gray-100 bg-gray-900 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div class="mb-4">
                    <label for="new-password" class="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                    <input type="password" id="new-password" placeholder="Leave blank to keep current password" class="w-full p-3 text-gray-100 bg-gray-900 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div class="mb-6">
                    <label for="confirm-password" class="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                    <input type="password" id="confirm-password" placeholder="Confirm new password" class="w-full p-3 text-gray-100 bg-gray-900 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition">Save Changes</button>
            </form>
            <div id="settings-message" class="mt-4 text-center"></div>
        </div>`;

    document.getElementById('settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('full-name').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const messageEl = document.getElementById('settings-message');

        if (newPassword !== confirmPassword) {
            messageEl.textContent = 'Passwords do not match.';
            messageEl.className = 'mt-4 text-center text-red-400';
            return;
        }

        // Update in localStorage (replace with API call in production)
        localStorage.setItem('userName', newName);
        setUserInfo();

        messageEl.textContent = 'Settings saved successfully!';
        messageEl.className = 'mt-4 text-center text-green-400';
        setTimeout(() => {
            messageEl.textContent = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        }, 3000);
    });
};

// --- Event Handlers ---
const handleNavigation = (e) => {
    e.preventDefault();
    Object.values(navLinks).forEach(l => l.classList.remove('bg-indigo-600', 'text-white', 'font-semibold'));
    e.currentTarget.classList.add('bg-indigo-600', 'text-white', 'font-semibold');

    const viewMap = {
        'nav-dashboard': renderDashboardView,
        'nav-reservations': renderReservationsView,
        'nav-reviews': renderReviewsView,
        'nav-settings': renderSettingsView,
    };
    viewMap[e.currentTarget.id]();
};

const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '../commonfiles/main-page.html';
};

// --- Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setUserInfo();
    renderDashboardView();
    logoutButton.addEventListener('click', handleLogout);
    Object.values(navLinks).forEach(link => link.addEventListener('click', handleNavigation));
});
