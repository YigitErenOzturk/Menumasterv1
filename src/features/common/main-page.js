// --- API CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api'; 

// --- Helper Functions ---
const escapeHtml = (text) => {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

(function() {
    // 1. Private State
    let visibleCount = 6;
    let allRestaurants = [];
    const API_URL = 'http://localhost:5000/api/restaurants/all'; // REPLACE THIS WITH YOUR URL

    // 2. Private Utility
    const localEscapeHtml = (str) => {
        if (!str) return "";
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return str.replace(/[&<>"']/g, (m) => map[m]);
    };

    // 3. Load More Logic
    const loadMore = () => {
        visibleCount += 4;
        renderRestaurants(allRestaurants, true);
    };

    const updateButtonVisibility = () => {
        const listEl = document.getElementById('restaurant-list');
        let btnContainer = document.getElementById('show-more-container');
        
        if (!btnContainer && listEl) {
            btnContainer = document.createElement('div');
            btnContainer.id = 'show-more-container';
            btnContainer.className = 'col-span-full flex justify-center mt-10 mb-10';
            listEl.after(btnContainer);
        }

        if (visibleCount < allRestaurants.length) {
            btnContainer.innerHTML = `
                <button id="load-more-btn" class="px-8 py-3 bg-white border-2 border-orange-600 text-orange-600 font-bold rounded-xl hover:bg-orange-600 hover:text-white transition-all duration-300 shadow-sm focus:outline-none">
                    Show More Restaurants
                </button>
            `;
            document.getElementById('load-more-btn').onclick = loadMore;
        } else if (btnContainer) {
            btnContainer.innerHTML = '';
        }
    };

    // 4. Core Render Function
    const renderRestaurants = (restaurants, isShowingMore = false) => {
        const listEl = document.getElementById('restaurant-list');
        if (!listEl) return;

        if (!isShowingMore) {
            allRestaurants = restaurants || [];
            visibleCount = 4;
        }

        if (!allRestaurants || allRestaurants.length === 0) {
            listEl.innerHTML = '<p class="col-span-full text-center text-red-500 font-medium py-10">No restaurants found matching your criteria.</p>';
            updateButtonVisibility();
            return;
        }

        const displayList = allRestaurants.slice(0, visibleCount);

        listEl.innerHTML = displayList.map(r => `
            <a href="../restaurantfiles/restaurant-details.html?id=${r.id}" class="block bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div class="relative h-48 overflow-hidden">
                    <img src="${r.imageUrl || 'https://placehold.co/600x400?text=Restaurant'}" alt="${localEscapeHtml(r.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm">
                        ⭐ ${r.rating ? Number(r.rating).toFixed(1) : 'New'}
                    </div>
                </div>
                <div class="p-5">
                    <h3 class="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">${localEscapeHtml(r.name)}</h3>
                    <div class="flex justify-between items-center border-t border-gray-100 pt-4">
                        <span class="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-bold group-hover:bg-orange-600 group-hover:text-white transition-all">View Menu</span>
                    </div>
                </div>
            </a>
        `).join('');

        updateButtonVisibility();
    };

    // 5. Real API Fetch Function
    const fetchRestaurants = async () => {
        const listEl = document.getElementById('restaurant-list');
        if (listEl) {
            listEl.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10 animate-pulse">Loading Restaurants...</p>';
        }

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            // Note: If your API returns an object like { restaurants: [...] }, 
            // use data.restaurants instead of just data.
            renderRestaurants(Array.isArray(data) ? data : data.restaurants);

        } catch (error) {
            console.error('Fetch error:', error);
            if (listEl) {
                listEl.innerHTML = '<p class="col-span-full text-center text-red-500 py-10">Failed to load restaurants. Please try again later.</p>';
            }
        }
    };

    // 6. Initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fetchRestaurants);
    } else {
        fetchRestaurants();
    }
})();
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
        console.error("API Error:", error);
        return { error: true, message: error.message };
    }
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

    // 4. Scroll To Top Logiği
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn?.classList.replace('opacity-0', 'opacity-100');
        } else {
            scrollTopBtn?.classList.replace('opacity-100', 'opacity-0');
        }
    });

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
    if (city) params.append('city', city);
    if (cuisine) params.append('cuisine', cuisine);

    const data = await fetchData(`search?${params.toString()}`);
    renderRestaurants(data);
};

// 4. CANLI KULLANICI SAYACI (DÜZELTİLDİ)
    const updateLiveCounter = () => {
        const liveCounter = document.getElementById('live-counter');
        if (!liveCounter) return;

        let current = parseInt(liveCounter.innerText) || 120;
        let change = Math.floor(Math.random() * 11) - 5; 
        let newVal = current + change;
        if (newVal < 50) newVal = 55;
        
        liveCounter.innerText = newVal;

        // Animasyon için parent elemente class ekle/çıkar
        const parent = liveCounter.parentElement;
        parent.classList.add('duration-300', 'transition-transform', 'scale-110', 'text-orange-600');
        setTimeout(() => {
            parent.classList.remove('scale-110', 'text-orange-600');
        }, 300);
    };

// 6. INITIALIZATION (BAŞLATMA)
    document.addEventListener('DOMContentLoaded', () => {
        // Canlı sayacı her 3 saniyede bir çalıştır
        updateLiveCounter();
        setInterval(updateLiveCounter, 3000);

        // Arama butonu varsa event ekle
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) searchBtn.addEventListener('click', handleSearch);

        // İlk veriyi çek (Opsiyonel)
        // handleSearch(); 
    });