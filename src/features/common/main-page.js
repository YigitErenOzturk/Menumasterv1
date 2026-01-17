// --- IMPORTS ---
import { restaurantService } from '../../api/restaurantService.js';

// --- STATE ---
let allRestaurants = [];
let visibleCount = 6;

// --- DOM ELEMENTS ---
const listEl = document.getElementById('restaurant-list');
const locationInput = document.getElementById('location-input');
const cuisineInput = document.getElementById('cuisine-input');
const searchBtn = document.getElementById('search-btn');
const liveCounter = document.getElementById('live-counter');
const scrollTopBtn = document.getElementById('scrollTopBtn');

/**
 * XSS Koruması için escape fonksiyonu
 */
const localEscapeHtml = (str) => {
    if (!str) return "";
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Restoranları Ekrana Basar
 */
const renderRestaurants = (restaurants, isShowingMore = false) => {
    if (!listEl) return;

    if (!isShowingMore) {
        allRestaurants = restaurants || [];
        visibleCount = 6;
    }

    if (!allRestaurants || allRestaurants.length === 0) {
        listEl.innerHTML = '<p class="col-span-full text-center text-red-500 font-medium py-10">No restaurants found.</p>';
        updateButtonVisibility();
        return;
    }

    const displayList = allRestaurants.slice(0, visibleCount);

    listEl.innerHTML = displayList.map(r => `
        <a href="../userfiles/restaurant-details.html?id=${r.id}" class="block bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
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

/**
 * "Daha Fazla Göster" Butonu Mantığı
 */
const updateButtonVisibility = () => {
    let btnContainer = document.getElementById('show-more-container');
    if (!btnContainer && listEl) {
        btnContainer = document.createElement('div');
        btnContainer.id = 'show-more-container';
        btnContainer.className = 'col-span-full flex justify-center mt-10 mb-10';
        listEl.after(btnContainer);
    }

    if (visibleCount < allRestaurants.length) {
        btnContainer.innerHTML = `
            <button id="load-more-btn" class="px-8 py-3 bg-white border-2 border-orange-600 text-orange-600 font-bold rounded-xl hover:bg-orange-600 hover:text-white transition-all duration-300">
                Show More Restaurants
            </button>
        `;
        document.getElementById('load-more-btn').onclick = () => {
            visibleCount += 4;
            renderRestaurants(allRestaurants, true);
        };
    } else if (btnContainer) {
        btnContainer.innerHTML = '';
    }
};

/**
 * API'den Veri Çekme (Refactored to Service)
 */
const fetchAllRestaurants = async () => {
    if (listEl) listEl.innerHTML = '<p class="col-span-full text-center text-gray-500 py-10 animate-pulse">Loading...</p>';
    try {
        const response = await restaurantService.getAll();
        renderRestaurants(response.data);
    } catch (error) {
        console.error("Fetch Error:", error);
        if (listEl) listEl.innerHTML = '<p class="col-span-full text-center text-red-500 py-10">Failed to load restaurants.</p>';
    }
};

/**
 * Canlı Sayaç
 */
const updateLiveCounter = () => {
    if (!liveCounter) return;
    let current = parseInt(liveCounter.innerText) || 120;
    let newVal = current + (Math.floor(Math.random() * 11) - 5);
    liveCounter.innerText = newVal < 50 ? 55 : newVal;
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAllRestaurants();
    setInterval(updateLiveCounter, 3000);

    // Scroll To Top
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) scrollTopBtn?.classList.remove('opacity-0');
        else scrollTopBtn?.classList.add('opacity-0');
    });

    // Arama Butonu
    searchBtn?.addEventListener('click', async () => {
        const city = locationInput?.value.trim();
        const cuisine = cuisineInput?.value.trim();
        // Arama servisini buraya ekleyebilirsin
        console.log("Searching for:", city, cuisine);
    });
});