// --- API CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api'; 

// --- Helper Functions ---
const escapeHtml = (text) => {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Verilen restoran listesini ekrana basar.
 * HTML yapısı paylaştığınız turuncu temalı tasarıma uygun hale getirilmiştir.
 */
const renderRestaurants = (restaurants) => {
    const listEl = document.getElementById('restaurant-list');
    if (!listEl) return;

    if (!restaurants || restaurants.error || !Array.isArray(restaurants) || restaurants.length === 0) {
        listEl.innerHTML = '<p class="col-span-full text-center text-red-500 font-medium py-10">No restaurants found matching your criteria.</p>';
        return;
    }

    listEl.innerHTML = restaurants.map(r => `
        <a href="../restaurantfiles/restaurant-details.html?id=${r.id}" class="block bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div class="relative h-48 overflow-hidden">
                <img src="${r.imageUrl || 'https://placehold.co/600x400?text=Restaurant'}" alt="${escapeHtml(r.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm">
                    ⭐ ${r.rating ? r.rating.toFixed(1) : 'New'}
                </div>
            </div>
            <div class="p-5">
                <h3 class="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">${escapeHtml(r.name)}</h3>
                <p class="text-gray-500 text-sm mb-4 line-clamp-1">${escapeHtml(r.cuisine || 'Global Cuisine')}</p>
                
                <div class="flex justify-between items-center border-t border-gray-100 pt-4">
                    <span class="text-sm font-medium text-gray-400 flex items-center gap-1">
                        📍 ${escapeHtml(r.city || 'City')}
                    </span>
                    <span class="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-bold group-hover:bg-orange-600 group-hover:text-white transition-all">
                        View Menu
                    </span>
                </div>
            </div>
        </a>
    `).join('');
};
/**
 * Genel veri çekme fonksiyonu
 */
const fetchData = async (endpoint) => {
    try {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}/${endpoint}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("API Data Fetching Error:", error);
        restaurantListEl.innerHTML = '<p class="w-full text-center text-red-400 p-4">API connection error or data could not be loaded. Check the console.</p>';
    }
};

/**
 * Canlı kullanıcı sayacı simülasyonu
 */
const updateLiveCounter = async () => {
    const liveCounter = document.getElementById('live-counter');
    if (!liveCounter) return;

    let current = parseInt(liveCounter.innerText) || 120;
    let change = Math.floor(Math.random() * 11) - 5; // -5 ile +5 arası değişim
    let newVal = current + change;
    if (newVal < 50) newVal = 55;
    
    liveCounter.innerText = newVal;
    liveCounter.parentElement.classList.add('scale-105');
    setTimeout(() => liveCounter.parentElement.classList.remove('scale-105'), 300);
};

// --- Initialization and Event Listeners ---

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Eleman Seçimleri
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const chatIcon = document.getElementById('chat-icon');

    // 2. İlk Veri Yükleme (Restoranlar)
    const restaurants = await fetchData('restaurants/all');
    renderRestaurants(restaurants);

    // 3. Mobil Menü Logiği
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

 const liveCounter = document.getElementById('live-counter');

    async function fetchActiveUsers() {
        if (!liveCounter) return;

        try {
            // --- For api connection (active member number) ---
            /*
            const response = await fetch('https://api.menumaster.com/v1/active-users');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const userCount = data.count; 
            */

            const userCount = await new Promise((resolve) => {
                setTimeout(() => {
                    // real number
                    let current = parseInt(liveCounter.innerText) || 100;
                    // For to make its crowded make it more
                    let change = Math.floor(Math.random() * 15) - 5; 
                    let newVal = current + change;
                    if (newVal < 50) newVal = 50; // Min Limitr
                    resolve(newVal);
                }, 800); 
            });

            liveCounter.innerText = userCount;
            
            // If User Number is growin it will be green otherway red
            liveCounter.parentElement.classList.add('scale-110');
            setTimeout(() => liveCounter.parentElement.classList.remove('scale-110'), 200);

        } catch (error) {
            console.error("Error:", error);
            // If there is an error it will be empty or old number
        }
    }

    // 5. Chat Icon Animasyonu (3 saniye sonra başlar)
    if (chatIcon) {
        setTimeout(() => {
            chatIcon.classList.add('animate-shake-hard');
            // Baloncuğu gösteren kodlar burada tetiklenebilir
        }, 3000);
    }

    // 6. Canlı Sayaç Başlatma
    setInterval(updateLiveCounter, 5000);
    updateLiveCounter();
});

// Arama fonksiyonu (Eğer arama barı HTML'e eklenirse çalışır)
const handleSearch = async () => {
    const locationInput = document.getElementById('location-input');
    const cuisineInput = document.getElementById('cuisine-input');
    
    if(!locationInput || !cuisineInput) return;

    const city = locationInput.value.trim();
    const cuisine = cuisineInput.value.trim();

    const params = new URLSearchParams();
    if (city) {
        params.append('city', city);
    }
    if (cuisine) {
        params.append('cuisine', cuisine);
    }

    const url = `${API_BASE_URL}/search?${params.toString()}`;
    fetchData(url);
};

// --- Event Listeners and Initial Load ---

// Bind click event to the search button
if(searchButton) {
    searchButton.addEventListener('click', handleSearch);
}

// Standard JS logic for scroll button and mobile menu
const scrollTopBtn = document.getElementById('scrollTopBtn');
const mobileMenuBtn = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if(mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

function checkScroll() {
    if(!scrollTopBtn) return;
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        scrollTopBtn.classList.add('opacity-100');
        scrollTopBtn.classList.remove('opacity-0');
    } else {
        scrollTopBtn.classList.remove('opacity-100');
        scrollTopBtn.classList.add('opacity-0');
    }
}
window.addEventListener('scroll', checkScroll);

// Start fetching data when the page loads
initAndLoadData();

// --- DASHBOARD VIEW LOGIC (SWIPE ENABLED - NO MOCK) ---

const createRestaurantCards = (restaurants) => {
  if (!Array.isArray(restaurants) || restaurants.length === 0) {
    return '<p class="w-full text-center text-gray-400">No restaurants found.</p>';
  }

  return restaurants.map(r => {
    const badgeText = r.rating ? `⭐ ${r.rating}` : 'New';
    // Swipe specific classes: min-w-[280px], snap-start
    return `
      <a href="../restaurantfiles/restaurant-details.html?id=${r.id}&name=${encodeURIComponent(r.name)}" 
         class="block min-w-[280px] w-[280px] md:min-w-[320px] md:w-[320px] flex-shrink-0 snap-start bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300 group border border-gray-700">
        <div class="relative h-48 overflow-hidden">
          <img src="${r.imageUrl || 'https://placehold.co/400x200?text=Restaurant'}" alt="${r.name}" class="w-full h-full object-cover group-hover:opacity-75 transition-opacity">
          <div class="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">${badgeText}</div>
        </div>
        <div class="p-4">
          <h3 class="text-lg font-semibold text-indigo-400 truncate">${r.name}</h3>
          <p class="text-gray-400 text-sm mt-1 uppercase tracking-wider text-xs">${r.cuisine || 'Global'}</p>
        </div>
      </a>
    `;
  }).join('');
};

const renderDashboardView = async () => {
  // Setup Main Layout
  const mainContent = document.getElementById('main-content') || document.body;
  
  // SWIPE ENABLED: Using flex and overflow-x-auto instead of grid
  mainContent.innerHTML = `
    <div class="animate-fade-in p-4 md:p-8">
      <h1 class="text-3xl font-bold text-white mb-6">Discover Restaurants</h1>
      <div class="mb-8">
        <label for="city-select" class="text-sm font-medium text-gray-300">Filter by City:</label>
        <select id="city-select" class="mt-2 w-full max-w-sm p-3 text-gray-100 bg-gray-800 border border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none">
          <option value="">All Cities (Popular)</option>
        </select>
      </div>
      
      <!-- HORIZONTAL SWIPE CONTAINER -->
      <div class="relative group">
          <!-- Scrollable Area -->
          <div id="restaurant-grid" class="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-800">
            <div class="w-full flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>
          </div>
          
          <!-- Optional Fade Effect on edges -->
          <div class="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
      </div>
    </div>`;

  // for filter 
  const citySelect = document.getElementById('city-select');
  try {
      // Mocking fetch for cities removed as requested - assuming API call exists if needed
      // const cities = await fetchData('cities'); 
      // if (Array.isArray(cities)) ...
  } catch(e) { console.log('City fetch skipped'); }

  // --- Restaurants ---
  const loadRestaurants = async (filter = '') => {
    const grid = document.getElementById('restaurant-grid');
    // Loading animation
    grid.innerHTML = '<div class="w-full flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div></div>';

    // If filtered it will show only selected city otherway all
    const endpointPath = filter ? `${API_BASE_URL}/restaurants?city=${encodeURIComponent(filter)}` : `${API_BASE_URL}/restaurants`;
    
    // API
    let restaurants = [];
    try {
        const response = await fetch(endpointPath);
        if(response.ok) {
            restaurants = await response.json();
        } else {
            console.warn("API response not ok");
           
        }
    } catch (e) {
        console.error("Fetch failed (Network)");
        
    }
    
    // Turns to html and show to screen
    grid.innerHTML = createRestaurantCards(restaurants);
  };

  // when city seelcted it will reniew again the screen
  if(citySelect) {
      citySelect.addEventListener('change', (e) => loadRestaurants(e.target.value));
  }
  
  // it will download page when open screen
  loadRestaurants();
};

// Check if we are on the dashboard page to init the view
if(document.getElementById('main-content')) {
    renderDashboardView();
}
