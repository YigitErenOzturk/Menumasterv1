

// --- CONFIGURATION ---
const API_CONFIG = {
    BASE_URL: 'https://api.menumaster.com/v1',
    ENDPOINTS: {
        ME: '/user/me',
        CITIES: '/cities',
        RESTAURANTS: '/restaurants',
        RESERVATIONS: '/reservations',
        REVIEWS: '/reviews' // Geri eklendi
    }
};

// --- DOM Elements ---
const DOM = {
    userName: document.getElementById('user-name'),
    userInitial: document.getElementById('user-initial'),
    mainContent: document.getElementById('main-content'),
    logoutButton: document.getElementById('logout-button'),
    navLinks: {
        dashboard: document.getElementById('nav-dashboard'),
        reservations: document.getElementById('nav-reservations'),
        reviews: document.getElementById('nav-reviews'), 
        settings: document.getElementById('nav-settings'),
    }
};

// --- Helper Functions ---
const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// --- Core Functions ---
const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.warn('Authentication token not found. Redirecting to login...');
        // window.location.href = 'login.html';
    }
};

// --- KULLANICI BİLGİSİ (DİNAMİK) ---
const setUserInfo = async () => {
    const localName = localStorage.getItem('userName');
    
    if (localName && DOM.userName) {
        DOM.userName.textContent = escapeHtml(localName);
        if(DOM.userInitial) DOM.userInitial.textContent = localName.charAt(0).toUpperCase();
    } else {
        if(DOM.userName) DOM.userName.textContent = 'Loading...';
    }
    
    try {
        const token = localStorage.getItem('authToken');
        if(!token) throw new Error("No token");

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ME}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const userData = await response.json();

        const displayName = userData.name || userData.email || 'Guest User';
        
        localStorage.setItem('userName', displayName);

        if(DOM.userName) DOM.userName.textContent = escapeHtml(displayName);
        if(DOM.userInitial) DOM.userInitial.textContent = displayName.charAt(0).toUpperCase();

    } catch (error) {
        console.error("User info error:", error);
        if (!localName && DOM.userName) {
            DOM.userName.textContent = 'Guest User'; 
            if(DOM.userInitial) DOM.userInitial.textContent = '?';
        }
    }
};

const fetchData = async (endpointKey, params = '') => {
    try {
        const url = `${API_CONFIG.BASE_URL}/${endpointKey}${params}`;
        
        const response = await fetch(url, {
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if(response.status === 401) {
                console.warn("Session expired");
            }
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        return { error: true, message: "Connection failed" };
    }
};

// --- View Rendering Functions ---

const createRestaurantCards = (restaurants) => {
    if (!Array.isArray(restaurants) || restaurants.length === 0) {
        return '<p class="col-span-4 text-center text-gray-400">No restaurants found.</p>';
    }
    
    return restaurants.map(r => {
        const badgeText = r.rating ? `⭐ ${r.rating}` : 'New';
        return `
        <a href="../restaurantfiles/restaurant-details.html?name=${encodeURIComponent(r.name)}" class="block bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300 group">
            <div class="relative h-48 overflow-hidden">
                <img src="${r.imageUrl || 'https://placehold.co/400x200?text=Restaurant'}" alt="${escapeHtml(r.name)}" class="w-full h-full object-cover group-hover:opacity-75 transition-opacity">
                <div class="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">${badgeText}</div>
            </div>
            <div class="p-4">
                <h3 class="text-lg font-semibold text-indigo-400 truncate">${escapeHtml(r.name)}</h3>
                <p class="text-gray-400 text-sm flex items-center mt-1">
                    <svg class="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    ${escapeHtml(r.cuisine)}
                </p>
            </div>
        </a>
    `}).join('');
};

const renderApiError = (viewName) => {
    DOM.mainContent.innerHTML = `
    <div class="flex flex-col items-center justify-center h-64 text-center text-red-400 bg-gray-800/50 rounded-xl border border-red-500/20 p-8">
        <svg class="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        <h2 class="text-xl font-bold mb-2">Could Not Load ${viewName}</h2>
        <p class="text-sm text-gray-400">Please check your connection and try again.</p>
    </div>`;
};

// 1. DASHBOARD VIEW (DISCOVER)
const renderDashboardView = async () => {
    DOM.mainContent.innerHTML = `
        <div class="animate-fade-in">
            <h1 class="text-3xl font-bold text-white mb-6">Discover Restaurants</h1>
            <div class="mb-8">
                <label for="city-select" class="text-sm font-medium text-gray-300">Filter by City:</label>
                <select id="city-select" class="mt-2 w-full max-w-sm p-3 text-gray-100 bg-gray-800 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                    <option value="">All Cities (Popular)</option>
                </select>
            </div>
            <div id="restaurant-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div class="col-span-4 flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>
            </div>
        </div>`;

    const citySelect = document.getElementById('city-select');
    const cities = await fetchData('cities');
    
    if (!cities.error && Array.isArray(cities)) {
        const cityOptions = cities.map(city => `<option value="${city.name}">${city.name}</option>`).join('');
        citySelect.innerHTML += cityOptions;
    }

    const loadRestaurants = async (filter = '') => {
        const grid = document.getElementById('restaurant-grid');
        grid.innerHTML = '<div class="col-span-4 flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>';
        
        const endpoint = filter ? `restaurants?city=${encodeURIComponent(filter)}` : 'restaurants/popular';
        let restaurants = await fetchData(endpoint);
        
        if(restaurants.error) {
            restaurants = [];
        }

        // --- DEMO RESTAURANT INJECTION ---
        const fakeRestaurant = {
            name: "MenuMaster Grill (Demo)",
            cuisine: "Steakhouse & Grill",
            imageUrl: "https://i.hizliresim.com/mib7a8z.jpg",
            rating: 5.0
        };
        
        if(!Array.isArray(restaurants)) restaurants = [];
        restaurants.unshift(fakeRestaurant);
        // ---------------------------------

        grid.innerHTML = createRestaurantCards(restaurants);
    };

    citySelect.addEventListener('change', (e) => loadRestaurants(e.target.value));
    loadRestaurants();
};

// 2. RESERVATIONS VIEW
const renderReservationsView = async () => {
    DOM.mainContent.innerHTML = `
        <div class="animate-fade-in">
            <h1 class="text-3xl font-bold text-white mb-6">My Reservations</h1>
            <div id="reservations-list" class="space-y-4">
                <p class="text-center text-gray-400 mt-8">Loading reservations...</p>
            </div>
        </div>`;
    
    const reservations = await fetchData('reservations');
    
    if (reservations.error) {
        renderApiError('Reservations');
        return;
    }
    
    const listEl = document.getElementById('reservations-list');
    
    if (!Array.isArray(reservations) || reservations.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-12 bg-gray-800 rounded-lg">
                <p class="text-gray-400 mb-4">You have no upcoming reservations.</p>
                <button onclick="document.getElementById('nav-dashboard').click()" class="text-indigo-400 hover:text-indigo-300 font-semibold">Browse Restaurants &rarr;</button>
            </div>`;
        return;
    }

    listEl.innerHTML = reservations.map(res => {
        const statusColors = {
            'Confirmed': 'bg-green-500/20 text-green-400 border-green-500/30',
            'Pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        const statusLabels = {
            'Confirmed': 'CONFIRMED',
            'Pending': 'PENDING',
            'Cancelled': 'CANCELLED'
        };

        const statusClass = statusColors[res.status] || 'bg-gray-600';
        const displayStatus = statusLabels[res.status] || res.status;

        return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-indigo-500/30 transition-colors">
            <div>
                <h3 class="text-xl font-bold text-indigo-400">${escapeHtml(res.restaurantName)}</h3>
                <div class="flex items-center mt-2 text-gray-300">
                    <svg class="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    ${new Date(res.date).toLocaleDateString()} at ${res.time}
                </div>
                <div class="flex items-center mt-1 text-gray-400 text-sm">
                    <svg class="w-4 h-4 mr-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    ${res.people} Guests
                </div>
            </div>
            <div class="mt-4 sm:mt-0 flex flex-col sm:items-end space-y-3">
                <span class="text-xs font-bold px-3 py-1 rounded-full border ${statusClass}">
                    ${displayStatus}
                </span>
                ${res.status !== 'Cancelled' ? `<button class="text-red-400 hover:text-red-300 text-sm font-medium transition">Cancel Reservation</button>` : ''}
            </div>
        </div>`;
    }).join('');
};

// 3. REVIEWS VIEW 
const renderReviewsView = async () => {
    DOM.mainContent.innerHTML = `
        <div class="animate-fade-in">
            <h1 class="text-3xl font-bold text-white mb-6">My Reviews</h1>
            <div id="reviews-list" class="space-y-4"><p class="text-center text-gray-400">Loading reviews...</p></div>
        </div>`;
    
    const reviews = await fetchData('reviews');

    if (reviews.error) {
        renderApiError('Reviews');
        return;
    }

    const listEl = document.getElementById('reviews-list');
    
    if (!Array.isArray(reviews) || reviews.length === 0) {
        listEl.innerHTML = '<p class="text-center text-gray-400 py-8">You have not written any reviews yet.</p>';
        return;
    }

    listEl.innerHTML = reviews.map(review => {
        let stars = '';
        const rating = review.rating || 0;
        for (let i = 0; i < 5; i++) {
            stars += `<svg class="w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
        }
        return `
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-indigo-400">${escapeHtml(review.restaurantName)}</h3>
                <div class="flex bg-gray-900 p-1 rounded-lg">${stars}</div>
            </div>
            <div class="relative">
                <svg class="absolute top-0 left-0 transform -translate-x-2 -translate-y-2 h-8 w-8 text-gray-700 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9C9.00001 15 9.00001 14 9.00001 13C9.00001 12 9.00001 11 9.00001 10C9.00001 9 9.00001 8 9.00001 7C9.00001 5.89543 9.89544 5 11.00001 5H19C20.1046 5 21 5.89543 21 7V19C21 20.1046 20.1046 21 19 21H14.017ZM7 21H5C3.89543 21 3 20.1046 3 19V7C3 5.89543 3.89543 5 5 5H7C7.55228 5 8 5.44772 8 6V20C8 20.5523 7.55228 21 7 21Z"></path></svg>
                <p class="text-gray-300 italic pl-6 border-l-2 border-indigo-500/30">"${escapeHtml(review.comment)}"</p>
            </div>
        </div>`;
    }).join('');
};

// 4. SETTINGS VIEW
const renderSettingsView = async () => {
    let currentName = localStorage.getItem('userName') || 'User';
    
    fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ME}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    })
    .then(res => res.json())
    .then(data => {
        if(data.name) {
            currentName = data.name;
            const input = document.getElementById('full-name');
            if(input) input.value = currentName;
        }
    })
    .catch(e => console.error(e));

    DOM.mainContent.innerHTML = `
        <div class="animate-fade-in">
            <h1 class="text-3xl font-bold text-white mb-6">Settings</h1>
            <div class="bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg mx-auto border border-gray-700">
                <form id="settings-form">
                    <div class="mb-4">
                        <label for="full-name" class="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input type="text" id="full-name" value="${escapeHtml(currentName)}" class="w-full p-3 text-gray-100 bg-gray-900 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                    </div>
                    <div class="mb-4">
                        <label for="new-password" class="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                        <input type="password" id="new-password" placeholder="Leave blank to keep current password" class="w-full p-3 text-gray-100 bg-gray-900 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                    </div>
                    <div class="mb-6">
                        <label for="confirm-password" class="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                        <input type="password" id="confirm-password" placeholder="Confirm new password" class="w-full p-3 text-gray-100 bg-gray-900 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors">
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition transform active:scale-95">Save Changes</button>
                </form>
                <div id="settings-message" class="mt-4 text-center min-h-[1.5rem] transition-all duration-300"></div>
            </div>
        </div>`;

    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('full-name').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const messageEl = document.getElementById('settings-message');

        if (newPassword && newPassword !== confirmPassword) {
            messageEl.textContent = 'Passwords do not match.';
            messageEl.className = 'mt-4 text-center text-red-400 font-medium';
            return;
        }

        messageEl.textContent = 'Saving...';
        messageEl.className = 'mt-4 text-center text-gray-400';

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ME}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    name: newName, 
                    ...(newPassword ? { password: newPassword } : {}) 
                })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            setUserInfo(); 

            messageEl.textContent = 'Settings saved successfully!';
            messageEl.className = 'mt-4 text-center text-green-400 font-medium';
            
            setTimeout(() => {
                if(messageEl) messageEl.textContent = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            }, 3000);

        } catch (error) {
            console.error(error);
            messageEl.textContent = 'Error during updating settings , Please try again.';
            messageEl.className = 'mt-4 text-center text-red-400 font-medium';
        }
    });
};



// --- Event Handlers ---
const handleNavigation = (e) => {
    e.preventDefault();
    Object.values(DOM.navLinks).forEach(l => {
        if(l) l.classList.remove('bg-indigo-600', 'text-white', 'font-semibold');
    });
    e.currentTarget.classList.add('bg-indigo-600', 'text-white', 'font-semibold');

    const viewMap = {
        'nav-dashboard': renderDashboardView,
        'nav-reservations': renderReservationsView,
        'nav-reviews': renderReviewsView, 
        'nav-settings': renderSettingsView,
    };
    
    if (viewMap[e.currentTarget.id]) {
        viewMap[e.currentTarget.id]();
    }
};

const handleLogout = (e) => {
    e.preventDefault();
    if(confirm('Are you sure you want to log out?')) {
        localStorage.clear();
        window.location.href = '../commonfiles/main-page.html';
    }
};

// --- Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setUserInfo();
    renderDashboardView(); 
    
    if(DOM.logoutButton) DOM.logoutButton.addEventListener('click', handleLogout);
    
    Object.values(DOM.navLinks).forEach(link => {
        if(link) link.addEventListener('click', handleNavigation);
    });
});