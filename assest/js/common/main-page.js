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
        console.error("API Error:", error);
        return { error: true, message: error.message };
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