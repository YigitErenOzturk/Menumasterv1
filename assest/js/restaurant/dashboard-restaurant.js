// --- API CONFIGURATION ---
const API_BASE_URL = 'http://192.168.1.100:3000/api/restaurant';
// This would be dynamic, based on the logged-in restaurant user.
// For now, it's hardcoded for demonstration.
const RESTAURANT_ID = 'rest123'; 

// --- DOM Elements ---
const mainContentEl = document.getElementById('main-content');
const sidebarNav = document.getElementById('sidebar-nav');

// --- UTILITY & API FUNCTIONS ---

/** Shows a loading spinner in the main content area */
const showLoading = () => {
    mainContentEl.innerHTML = `<div class="flex justify-center items-center h-full"><div class="spinner"></div></div>`;
};

/** Shows an error message in the main content area */
const showError = (message) => {
    mainContentEl.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><strong class="font-bold">Hata!</strong><span class="block sm:inline"> ${message}</span></div>`;
};

/** Generic data fetching function */
const fetchData = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${RESTAURANT_ID}/${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP Hatası! Durum: ${response.status}` }));
            throw new Error(errorData.message);
        }
        // For DELETE requests, there might not be a JSON body
        if (response.status === 204) return { success: true }; 
        return await response.json();
    } catch (error) {
        console.error('API Yakalama Hatası:', error);
        showError(error.message || 'Sunucuya bağlanılamadı. Lütfen ağ bağlantınızı kontrol edin.');
        return null;
    }
};

// --- VIEW RENDERING FUNCTIONS ---

/** Renders the Reservations View */
const renderReservationsView = async () => {
    showLoading();
    const data = await fetchData('reservations');
    if (!data) return; // Stop if there was an error
    
    const content = `
        <h2 class="text-3xl font-bold mb-6">Gelen Rezervasyonlar</h2>
        <div class="bg-white p-6 rounded-lg shadow-md">
            <ul class="space-y-4">
                ${data.reservations.length === 0 ? '<p class="text-gray-500">Bekleyen rezervasyon bulunmuyor.</p>' : data.reservations.map(r => `
                    <li class="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center ${r.status === 'Confirmed' ? 'bg-green-50' : r.status === 'Declined' ? 'bg-red-50' : ''}">
                        <div>
                            <p class="font-bold text-lg">${r.user.name}</p>
                            <p class="text-gray-600">${r.people} kişi, ${new Date(r.date).toLocaleDateString()} tarihinde, saat ${r.time}</p>
                        </div>
                        <div class="flex items-center space-x-2 mt-3 sm:mt-0">
                            <span class="px-3 py-1 text-sm font-semibold rounded-full ${
                                r.status === 'Confirmed' ? 'bg-green-200 text-green-800' :
                                r.status === 'Declined' ? 'bg-red-200 text-red-800' :
                                'bg-yellow-200 text-yellow-800'
                            }">${r.status}</span>
                            ${r.status === 'Pending' ? `
                            <button data-id="${r.id}" data-action="confirm" class="reservation-action bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded">Onayla</button>
                            <button data-id="${r.id}" data-action="decline" class="reservation-action bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded">Reddet</button>
                            ` : ''}
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    mainContentEl.innerHTML = content;
};

/** Renders the Menu Management View */
const renderMenuView = async () => {
    showLoading();
    const data = await fetchData('menu');
    if (!data) return;

    const content = `
        <h2 class="text-3xl font-bold mb-6">Menü Yönetimi</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4">Mevcut Menü</h3>
                <ul id="menu-list" class="space-y-3">
                ${data.menu.length === 0 ? '<p class="text-gray-500">Menünüz boş.</p>' : data.menu.map(item => `
                    <li class="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                            <p class="font-bold">${item.name}</p>
                            <p class="text-sm text-gray-500">${item.description}</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <span class="font-semibold text-indigo-600">${item.price} PLN</span>
                            <button data-id="${item.id}" class="delete-item-btn text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
                        </div>
                    </li>
                `).join('')}
                </ul>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-4">Yeni Ürün Ekle</h3>
                <form id="add-menu-item-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Ürün Adı</label>
                        <input name="name" type="text" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                    </div>
                     <div>
                        <label class="block text-sm font-medium text-gray-700">Fiyat (PLN)</label>
                        <input name="price" type="number" step="0.01" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Açıklama</label>
                        <textarea name="description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500" required></textarea>
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Menüye Ekle</button>
                </form>
            </div>
        </div>
    `;
    mainContentEl.innerHTML = content;
};

/** Renders the Reviews View */
const renderReviewsView = async () => {
     showLoading();
     const data = await fetchData('reviews');
     if (!data) return;
     
     const content = `
        <h2 class="text-3xl font-bold mb-6">Müşteri Yorumları</h2>
        <div class="bg-white p-6 rounded-lg shadow-md">
            <ul class="space-y-5">
                ${data.reviews.length === 0 ? '<p class="text-gray-500">Henüz yorum yapılmamış.</p>' : data.reviews.map(r => `
                     <li class="p-4 border-b">
                        <div class="flex justify-between items-center">
                            <p class="font-bold">${r.user.name}</p>
                            <div class="flex items-center">
                            ${[...Array(5)].map((_, i) => `<svg class="w-5 h-5 ${i < r.rating ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`).join('')}
                            </div>
                        </div>
                        <p class="text-gray-600 mt-2 italic">"${r.comment}"</p>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    mainContentEl.innerHTML = content;
};

/** Renders the Settings View */
const renderSettingsView = async () => {
    showLoading();
    const data = await fetchData('settings');
    if (!data) return;

    const content = `
        <h2 class="text-3xl font-bold mb-6">Restoran Ayarları</h2>
        <div class="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
            <form id="settings-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Restoran Adı</label>
                    <input name="name" type="text" value="${data.settings.name}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Adres</label>
                    <input name="address" type="text" value="${data.settings.address}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Mutfak Türü</label>
                    <input name="cuisine" type="text" value="${data.settings.cuisine}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Telefon Numarası</label>
                    <input name="phone" type="text" value="${data.settings.phone}" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                </div>
                <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Değişiklikleri Kaydet</button>
            </form>
        </div>
    `;
    mainContentEl.innerHTML = content;
};

// --- EVENT HANDLERS ---

const handleMainContentClick = async (e) => {
    if (e.target.matches('.reservation-action')) {
        const button = e.target;
        const reservationId = button.dataset.id;
        const action = button.dataset.action;
        
        button.disabled = true;
        button.textContent = '...';

        const result = await fetchData(`reservations/${reservationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action === 'confirm' ? 'Confirmed' : 'Declined' })
        });
        if (result) renderReservationsView();
    }
    
    if (e.target.matches('.delete-item-btn')) {
        const button = e.target;
        const itemId = button.dataset.id;
        if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
             const result = await fetchData(`menu/${itemId}`, { method: 'DELETE' });
             if (result) renderMenuView();
        }
    }
};

const handleMainContentSubmit = async (e) => {
     e.preventDefault();

     if (e.target.id === 'add-menu-item-form') {
         const form = e.target;
         const formData = new FormData(form);
         const newItem = Object.fromEntries(formData.entries());
         
         const result = await fetchData('menu', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(newItem)
         });
         if (result) renderMenuView();
     }
     
     if (e.target.id === 'settings-form') {
         const form = e.target;
         const formData = new FormData(form);
         const updatedSettings = Object.fromEntries(formData.entries());

         const result = await fetchData('settings', {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(updatedSettings)
         });
         if (result) {
            alert('Ayarlar kaydedildi!');
            renderSettingsView();
         }
     }
};

// --- Router & Navigation ---
const handleNavigation = (e) => {
    if (!e.target.closest('.sidebar-link')) return;
    e.preventDefault();

    const link = e.target.closest('.sidebar-link');
    const targetId = link.getAttribute('href').substring(1);

    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    switch (targetId) {
        case 'reservations': renderReservationsView(); break;
        case 'menu': renderMenuView(); break;
        case 'reviews': renderReviewsView(); break;
        case 'settings': renderSettingsView(); break;
    }
};

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    sidebarNav.addEventListener('click', handleNavigation);
    mainContentEl.addEventListener('click', handleMainContentClick);
    mainContentEl.addEventListener('submit', handleMainContentSubmit);
    
    renderReservationsView();
});
