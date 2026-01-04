// --- CONFIGURATION ---
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    USER_BY_ID: (id) => `/users/${id}`,
    UPDATE_USER: (id) => `/users/update/${id}`,
    FORGOT_PASSWORD: '/users/api/password-reset-request',

    CITIES: '/cities',
    RESTAURANTS_POPULAR: '/restaurants/popular',
    RESTAURANTS_ALL: '/restaurants/all',
    RESERVATIONS: '/reservations',
    REVIEWS: '/reviews',
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
const fetchDataWithAuth = async (endpointPath) => {
  try {
    const url = `${API_CONFIG.BASE_URL}/${endpointPath}`;
    
    // Tarayıcıdan token'ı alıyoruz (Senin projende adı hangisiyse: 'token' veya 'authToken')
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      console.error("Yetkisiz erişim! Login sayfasına yönlendiriliyor...");
      // window.location.href = '../commonfiles/login.html';
      return { error: true, message: "Unauthorized" };
    }

    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    return { error: true, message: "Connection failed" };
  }
};

const cancelReservation = async (id) => {
  if (!confirm('Are you sure you want to cancel this reservation?')) return;

  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/reservations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      // Başarılıysa listeyi yenilemek için görünümü tekrar çağırıyoruz
      renderReservationsView();
    } else {
      const errorData = await response.json();
      alert('Error: ' + (errorData.message || 'Failed to cancel reservation.'));
    }
  } catch (error) {
    console.error("Cancel error:", error);
    alert('Connection error while trying to cancel.');
  }
};
const escapeHtml = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  
  // Eğer tarih geçersizse (Invalid Date)
  if (isNaN(date.getTime())) return 'Member';

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options); 
  // Çıktı örneği: March 11, 2025
};

// --- Core Functions ---
const checkAuth = () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    console.warn('userId not found. Redirecting to login...');
    // window.location.href = '../commonfiles/login.html';
  }
};

const setUserInfo = async () => {
  const localName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');

  if (localName && DOM.userName) {
    DOM.userName.textContent = escapeHtml(localName);
    if (DOM.userInitial) DOM.userInitial.textContent = localName.charAt(0).toUpperCase();
  }

  try {
    if (!userId) throw new Error('No userId');

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(userId)}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const userData = await response.json();

    const displayName = userData.name || userData.username || userData.email || 'Guest User';
    localStorage.setItem('userName', displayName);

    if (DOM.userName) DOM.userName.textContent = escapeHtml(displayName);
    if (DOM.userInitial) DOM.userInitial.textContent = displayName.charAt(0).toUpperCase();
  } catch (error) {
    console.error("User info error:", error);
  }
};

const fetchData = async (endpointPath) => {
  try {
    const url = `${API_CONFIG.BASE_URL}/${endpointPath}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
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
      <a href="../restaurantfiles/restaurant-details.html?id=${r.id}&name=${encodeURIComponent(r.name)}" class="block bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300 group">
        <div class="relative h-48 overflow-hidden">
          <img src="${r.imageUrl || 'https://placehold.co/400x200?text=Restaurant'}" alt="${escapeHtml(r.name)}" class="w-full h-full object-cover group-hover:opacity-75 transition-opacity">
          <div class="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">${badgeText}</div>
        </div>
        <div class="p-4">
          <h3 class="text-lg font-semibold text-indigo-400 truncate">${escapeHtml(r.name)}</h3>
          <p class="text-gray-400 text-sm mt-1 uppercase tracking-wider text-xs">${escapeHtml(r.cuisine || 'Global')}</p>
        </div>
      </a>
    `;
  }).join('');
};

const renderDashboardView = async () => {
  DOM.mainContent.innerHTML = `
    <div class="animate-fade-in">
      <h1 class="text-3xl font-bold text-white mb-6">Discover Restaurants</h1>
      <div class="mb-8">
        <label for="city-select" class="text-sm font-medium text-gray-300">Filter by City:</label>
        <select id="city-select" class="mt-2 w-full max-w-sm p-3 text-gray-100 bg-gray-800 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none">
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
    citySelect.innerHTML += cities.map(city => `<option value="${escapeHtml(city.name)}">${escapeHtml(city.name)}</option>`).join('');
  }

  const loadRestaurants = async (filter = '') => {
    const grid = document.getElementById('restaurant-grid');
    grid.innerHTML = '<div class="col-span-4 flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>';

    const endpointPath = filter ? `restaurants?city=${encodeURIComponent(filter)}` : 'restaurants/all';
    let restaurants = await fetchData(endpointPath);
    if (restaurants.error || !Array.isArray(restaurants)) restaurants = [];
    
    grid.innerHTML = createRestaurantCards(restaurants);
  };

  citySelect.addEventListener('change', (e) => loadRestaurants(e.target.value));
  loadRestaurants();
};

const renderReservationsView = async () => {
  DOM.mainContent.innerHTML = `
    <div class="animate-fade-in">
      <h1 class="text-3xl font-bold text-white mb-6 uppercase tracking-tight">My Reservations</h1>
      <div id="reservations-list" class="grid grid-cols-1 gap-4">
        <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>
      </div>
    </div>`;

  const listEl = document.getElementById('reservations-list');
  
  // ÖNEMLİ: Backend'deki yeni endpoint'i çağırıyoruz
  // Token eklenmiş olan yeni fetchData fonksiyonunu aşağıda tanımladım
  const reservations = await fetchDataWithAuth('reservations/my-reservations');
  
  if (reservations.error || !Array.isArray(reservations) || reservations.length === 0) {
    listEl.innerHTML = `
      <div class="text-center py-16 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700">
        <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <p class="text-gray-400 text-lg">You don't have any reservations yet.</p>
        <button onclick="document.getElementById('nav-dashboard').click()" class="mt-4 text-indigo-400 hover:text-indigo-300 font-bold">Discover Restaurants →</button>
      </div>`;
    return;
  }

  listEl.innerHTML = reservations.map(res => {
    // Statü renkleri
    const statusClass = res.status === 'Confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    
    return `
    <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-500/50 transition-colors shadow-xl">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 4h1m4 0h1m-5 4h1m4 0h1" /></svg>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white">${escapeHtml(res.restaurantName)}</h3>
          <div class="flex items-center gap-3 mt-1">
            <span class="text-gray-400 text-sm flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ${new Date(res.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span class="text-gray-500">•</span>
            <span class="text-gray-400 text-sm">${res.peopleCount} People</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 border-gray-700 pt-4 md:pt-0">
        <span class="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${statusClass}">
          ${res.status || 'Pending'}
        </span>
        <button onclick="cancelReservation(${res.id})" class="ml-auto md:ml-0 text-gray-500 hover:text-red-400 p-2 transition-colors">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
</button>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  `}).join('');
};

const renderReviewsView = async () => {
  DOM.mainContent.innerHTML = `<div class="animate-fade-in"><h1 class="text-3xl font-bold text-white mb-6">My Reviews</h1><div id="reviews-list" class="space-y-4">Loading...</div></div>`;
  const reviews = await fetchData('reviews');
  const listEl = document.getElementById('reviews-list');

  if (reviews.error || !Array.isArray(reviews) || reviews.length === 0) {
    listEl.innerHTML = `<p class="text-center text-gray-400 py-8 text-gray-400">No reviews written yet.</p>`;
    return;
  }

  listEl.innerHTML = reviews.map(rev => `
    <div class="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 class="text-lg font-bold text-indigo-400">${escapeHtml(rev.restaurantName)}</h3>
      <p class="text-gray-300 mt-2">"${escapeHtml(rev.comment)}"</p>
    </div>
  `).join('');
};

// --- SETTINGS VIEW ---
const renderSettingsView = async () => {
  const userId = localStorage.getItem('userId');
  let userData = { name: '', username: '', email: '', phoneNumber: '', address: '', createdDate: null };

  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(userId)}`);
    if (res.ok) {
      userData = await res.json();
      console.log("API Verisi:", userData); // Buradan createdDate'i doğruladık
    }
  } catch (e) { 
    console.error("Fetch error:", e); 
  }

  // Konsol görüntündeki tam anahtar ismi: createdDate
  const registrationDate = formatDate(userData.createdDate);

  DOM.mainContent.innerHTML = `
    <div class="animate-fade-in max-w-4xl mx-auto p-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-700 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-white uppercase tracking-tight">Account Settings</h1>
          <div class="flex items-center gap-2 mt-2 text-indigo-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span class="text-xs font-semibold uppercase tracking-widest">Member Since: ${registrationDate}</span>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl">
            <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span class="w-2 h-6 bg-indigo-500 rounded-full"></span> Profile Information
            </h2>
            <form id="settings-form" class="space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                  <input type="text" id="set-name" value="${escapeHtml(userData.name)}" class="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none">
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Username</label>
                  <input type="text" id="set-username" value="${escapeHtml(userData.username)}" class="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none">
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                <input type="email" id="set-email" value="${escapeHtml(userData.email)}" class="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                <input type="text" id="set-phone" value="${escapeHtml(userData.phoneNumber || '')}" class="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Address</label>
                <textarea id="set-address" rows="3" class="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none resize-none">${escapeHtml(userData.address || '')}</textarea>
              </div>
              <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all">SAVE CHANGES</button>
            </form>
            <div id="settings-message" class="mt-4 text-center font-bold text-sm"></div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl text-center">
            <h2 class="text-lg font-bold text-white mb-4 italic">Security</h2>
            <button id="forgot-pass-btn" class="w-full border-2 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold py-3 rounded-xl transition-all">Send Reset Link</button>
            <div id="forgot-message" class="mt-4 text-center text-xs font-medium uppercase tracking-widest"></div>
          </div>
        </div>
      </div>
    </div>`;

  // Listener fonksiyonunu doğru parametrelerle çağırıyoruz
  attachSettingsListeners(userId, userData.email); 
};

// --- LISTENERS ---
const attachSettingsListeners = (userId, userEmail) => {
  const settingsForm = document.getElementById('settings-form');
  const forgotBtn = document.getElementById('forgot-pass-btn');

  // Profil Güncelleme
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('settings-message');
      
      const payload = {
        name: document.getElementById('set-name').value,
        username: document.getElementById('set-username').value,
        email: document.getElementById('set-email').value,
        phoneNumber: document.getElementById('set-phone').value,
        address: document.getElementById('set-address').value
      };

      try {
        msg.textContent = "SAVING...";
        msg.className = "mt-4 text-center text-gray-400 font-bold";
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER(userId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          localStorage.setItem('userName', payload.name);
          setUserInfo();
          msg.textContent = "SUCCESSFULLY UPDATED!";
          msg.className = "mt-4 text-center text-green-400 font-bold";
        } else { throw new Error(); }
      } catch (err) {
        msg.textContent = "UPDATE FAILED!";
        msg.className = "mt-4 text-center text-red-400 font-bold";
      }
    });
  }

  // Tek Tıkla Şifre Sıfırlama
  if (forgotBtn) {
    forgotBtn.onclick = async () => {
      console.log("Sıfırlama isteği gönderiliyor email için:", userEmail);
      const fMsg = document.getElementById('forgot-message');
      
      fMsg.textContent = "SENDING...";
      fMsg.className = "mt-4 text-center text-gray-400 animate-pulse";

      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }) 
        });

        if (res.ok) {
          fMsg.textContent = "SUCCESS! CHECK YOUR EMAIL.";
          fMsg.className = "mt-4 text-center text-green-400 font-bold";
        } else {
          fMsg.textContent = `FAILED (${res.status})`;
          fMsg.className = "mt-4 text-center text-red-400";
        }
      } catch (err) {
        console.error("Link gönderme hatası:", err);
        fMsg.textContent = "CONNECTION ERROR.";
        fMsg.className = "mt-4 text-center text-red-400";
      }
    };
  }
};

// --- Navigation & Event Handlers ---
const handleNavigation = (e) => {
  e.preventDefault();
  Object.values(DOM.navLinks).forEach(l => {
    if (l) l.classList.remove('bg-indigo-600', 'text-white', 'font-semibold');
  });
  e.currentTarget.classList.add('bg-indigo-600', 'text-white', 'font-semibold');

  const viewMap = {
    'nav-dashboard': renderDashboardView,
    'nav-reservations': renderReservationsView,
    'nav-reviews': renderReviewsView,
    'nav-settings': renderSettingsView,
  };

  if (viewMap[e.currentTarget.id]) viewMap[e.currentTarget.id]();
};

const handleLogout = (e) => {
  e.preventDefault();
  if (confirm('Logout from your account?')) {
    localStorage.clear();
    window.location.href = '../commonfiles/main-page.html';
  }
};

// --- Initializer ---
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setUserInfo();
  renderDashboardView();

  if (DOM.logoutButton) DOM.logoutButton.addEventListener('click', handleLogout);
  
  Object.values(DOM.navLinks).forEach(link => {
    if (link) link.addEventListener('click', handleNavigation);
  });

  // --- BURAYI EKLE: Yönlendirme Kontrolü ---
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section');

  if (section === 'reservations' && DOM.navLinks.reservations) {
    // Küçük bir gecikme ekliyoruz ki renderDashboardView işlemini bitirsin
    setTimeout(() => {
        // handleNavigation fonksiyonunu tetiklemek için sahte bir event objesiyle çağırıyoruz
        // veya direkt butona tıklatıyoruz:
        DOM.navLinks.reservations.click();
    }, 100);
  }
});