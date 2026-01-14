// --- CONFIGURATION ---
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    CATEGORIES: ['Starter', 'Main Course', 'Drinks', 'Desserts', 'Salads'],
    ENDPOINTS: {
        MENU: 'restaurants/menu',
        RESERVATIONS: 'restaurants/reservations',
        REVIEWS: 'restaurants/reviews',
        TICKETS: 'restaurants/tickets',
        GET_INFO: () => `restaurants/${localStorage.getItem("restaurantId")}`,
        UPDATE: (id) => `restaurants/update/${id}`
    }
};

// --- DOM Elements ---
const DOM = {
    mainContent: document.getElementById('main-content'),
    sidebarNav: document.getElementById('sidebar-nav'),
    logoutButton: document.getElementById('logout-button'),
    restaurantNameDisplay: document.getElementById('res-name-display'),
    restaurantLogoDisplay: document.getElementById('res-logo-display')
};
const setRestaurantInfo = async () => {
    // 1. Önce localStorage'daki hızlı veriyi gösterelim (Ekran boş kalmasın)
    const localName = localStorage.getItem('userName');
    if (localName && DOM.restaurantNameDisplay) {
        DOM.restaurantNameDisplay.textContent = escapeHtml(localName);
    }

    try {
        const resId = localStorage.getItem('restaurantId');
        if (!resId) return;

        // 2. API'den en güncel veriyi çek
        const data = await fetchData(API_CONFIG.ENDPOINTS.GET_INFO());
        const resData = (data && !data.error) ? (data.restaurant || data) : null;

        if (resData) {
            // İsmi güncelle
            if (DOM.restaurantNameDisplay) {
                DOM.restaurantNameDisplay.textContent = escapeHtml(resData.name);
            }
            // Logoyu güncelle
            if (DOM.restaurantLogoDisplay && resData.imageUrl) {
                DOM.restaurantLogoDisplay.src = resData.imageUrl;
                DOM.restaurantLogoDisplay.classList.remove('hidden'); // Eğer gizliyse aç
            }
            // LocalStorage'ı da tazeleyelim
            localStorage.setItem('userName', resData.name);
        }
    } catch (error) {
        console.error("Restaurant info fetch error:", error);
    }
};
// --- Helper functions ---
const showLoading = () => {
    DOM.mainContent.innerHTML = `<div class="flex justify-center items-center h-full"><div class="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent"></div></div>`;
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

// --- EKLEDİĞİMİZ TARİH FORMATLAMA FONKSİYONU ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Active Member';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// --- API FUNCTIONS ---
const fetchData = async (endpoint, options = {}) => {
    try {
        const url = `${API_CONFIG.BASE_URL}/${endpoint}`;
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}` }));
            throw new Error(errorData.message || `Server Error (${response.status})`);
        }

        if (response.status === 204) return { success: true };
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { error: true, message: error.message };
    }
};

// --- Renderers (DİĞERLERİNE DOKUNMADIK) ---

window.renderReservationsView = async (filter = 'pending') => {
    showLoading();
    const data = await fetchData('reservations/by-restaurant');
    let reservations = (data && !data.error) ? (data.reservations || []) : [];
    const now = new Date();

    if (filter === 'pending') {
        reservations = reservations.filter(r => r.status === 'Pending');
    } else if (filter === 'confirmed') {
        reservations = reservations.filter(r => r.status === 'Confirmed' && new Date(r.date) >= now);
    } else if (filter === 'declined') {
        reservations = reservations.filter(r => r.status === 'Declined');
    } else if (filter === 'completed') {
        reservations = reservations.filter(r => r.status === 'Confirmed' && new Date(r.date) < now);
    }

    DOM.mainContent.innerHTML = `
        <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 animate-fade-in">
            <h2 class="text-3xl font-extrabold text-gray-900">Reservations</h2>
            <div class="flex bg-white p-1 rounded-xl border border-orange-100 w-full xl:w-auto overflow-x-auto shadow-sm">
                <button onclick="renderReservationsView('pending')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'pending' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-orange-600'}">Pending</button>
                <button onclick="renderReservationsView('confirmed')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'confirmed' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-orange-600'}">Confirmed</button>
                <button onclick="renderReservationsView('completed')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'completed' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-orange-600'}">Completed</button>
                <button onclick="renderReservationsView('declined')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'declined' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-orange-600'}">Declined</button>
                <button onclick="renderReservationsView('all')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'all' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-orange-600'}">All History</button>
            </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-lg border border-orange-50 animate-fade-in">
            <ul class="space-y-4">
                ${reservations.length === 0 ? `<p class="text-gray-500 text-center py-8">No ${filter} reservations found.</p>` : reservations.map(r => {
        const customerName = r.userName || r.UserName || (r.user && r.user.name) || 'Guest';
        const peopleCount = r.peopleCount || r.people || 0;
        const resDate = new Date(r.date);
        const timeString = r.time || resDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let displayStatus = r.status;
        if (r.status === 'Confirmed' && resDate < now) displayStatus = 'Completed';
        const statusStyles = { 'Confirmed': 'bg-green-100 text-green-800 border-green-200', 'Declined': 'bg-red-100 text-red-800 border-red-200', 'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200', 'Completed': 'bg-gray-100 text-gray-500 border-gray-200' };
        return `
                    <li class="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center transition hover:shadow-sm">
                        <div>
                            <p class="font-bold text-lg text-gray-900">${escapeHtml(customerName)}</p>
                            <p class="text-gray-500 text-sm mt-1 flex items-center gap-3">
                                <span class="flex items-center gap-1 font-semibold">👥 ${peopleCount} People</span> 
                                <span class="flex items-center gap-1 font-semibold">📅 ${resDate.toLocaleDateString()} 🕒 ${timeString}</span>
                            </p>
                        </div>
                        <div class="flex items-center space-x-2 mt-4 sm:mt-0">
                            <span class="px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full border ${statusStyles[displayStatus] || 'bg-gray-100'}">${displayStatus}</span>
                            ${displayStatus === 'Pending' ? `
                                <div class="flex space-x-2 ml-2">
                                    <button onclick="updateReservation('${r.id}', 'Confirmed')" class="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">Accept</button>
                                    <button onclick="updateReservation('${r.id}', 'Declined')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">Decline</button>
                                </div>` : ''}
                        </div>
                    </li>`;
    }).join('')}
            </ul>
        </div>`;
};

const renderMenuView = async () => {
    showLoading();
    const data = await fetchData(API_CONFIG.ENDPOINTS.MENU);
    const menuItems = (data && !data.error) ? (data.menu || []) : [];

    // Dinamik kategori listesi (Benzersiz)
    const dynamicCategories = [...new Set([
        ...API_CONFIG.CATEGORIES,
        ...menuItems.map(item => item.category).filter(Boolean)
    ])].sort(); // Alfabetik sıralama

    const groupedMenu = menuItems.reduce((acc, item) => {
        const cat = item.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    DOM.mainContent.innerHTML = `
        <h2 class="text-3xl font-extrabold mb-6 text-gray-900 animate-fade-in uppercase tracking-tight">Menu Manager</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            <div class="lg:col-span-2 space-y-8">
                ${Object.keys(groupedMenu).length === 0 ? '<div class="bg-white p-12 rounded-xl text-center border-2 border-dashed border-orange-100"><p class="text-gray-400 italic">Your menu is currently empty.</p></div>' : 
                    Object.entries(groupedMenu).map(([category, items]) => `
                    <div class="bg-white p-6 rounded-xl shadow-lg border border-orange-50">
                        <h3 class="text-xl font-black mb-4 text-orange-600 border-b border-orange-100 pb-2 uppercase tracking-widest">${category}</h3>
                        <ul class="space-y-3">
                            ${items.map(item => `
                                <li class="p-4 border border-gray-50 rounded-lg flex justify-between items-center hover:bg-orange-50/30 transition group">
                                    <div>
                                        <p class="font-bold text-gray-900 group-hover:text-orange-700">${escapeHtml(item.name)}</p>
                                        <p class="text-sm text-gray-500 font-medium">${escapeHtml(item.description)}</p>
                                    </div>
                                    <div class="flex items-center space-x-6">
                                        <span class="font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-lg shadow-sm">${item.price} PLN</span>
                                        <button onclick="deleteMenuItem('${item.id}')" class="text-gray-300 hover:text-red-600 transition font-bold text-sm">Delete</button>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            <div class="bg-white p-6 rounded-xl shadow-xl border border-orange-100 h-fit sticky top-6">
                <h3 class="text-xl font-black mb-4 text-orange-600 uppercase">Add New Item</h3>
                <form id="add-menu-item-form" class="space-y-4">
                    <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label><input name="name" type="text" class="mt-1 block w-full bg-gray-50 border border-orange-100 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 font-medium" placeholder="e.g. Margherita Pizza" required></div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                        <div class="flex flex-col gap-2 mt-1">
                            <select id="category-select" name="category" class="block w-full bg-gray-50 border border-orange-100 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 font-medium outline-none" onchange="toggleCategoryInput(this.value)">
                                <option value="">Select Category</option>
                                ${API_CONFIG.CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                <option value="NEW_CATEGORY" class="font-bold text-orange-600">+ Add New Category</option>
                            </select>
                            <div id="new-category-container" class="hidden flex gap-2">
                                <input id="new-category-input" type="text" placeholder="Enter Category Name" class="flex-1 border border-orange-300 rounded-lg p-3 bg-orange-50 outline-none font-bold" />
                                <button type="button" class="text-red-500 font-black px-2" onclick="resetCategorySelection()">✕</button>
                            </div>
                        </div>
                    </div>
                    <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Price (PLN)</label><input name="price" type="number" step="0.5" class="mt-1 block w-full bg-gray-50 border border-orange-100 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 font-bold" placeholder="0.00" required></div>
                    <div><label class="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label><textarea name="description" rows="3" class="mt-1 block w-full bg-gray-50 border border-orange-100 rounded-lg p-3 outline-none focus:ring-2 focus:ring-orange-500 resize-none font-medium" placeholder="Describe the dish..." required></textarea></div>
                    <button type="submit" class="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-all uppercase tracking-widest">Add to Menu</button>
                </form>
            </div>
        </div>  
    `;
    const form = document.getElementById('add-menu-item-form');
    if (form) form.addEventListener('submit', handleAddMenuSubmit);
};

// RESTAURANT PROFILE
const renderSettingsView = async () => {
    showLoading();

    const resId = localStorage.getItem("restaurantId");
    const data = await fetchData(API_CONFIG.ENDPOINTS.GET_INFO());
    const resData = (data && !data.error) ? (data.restaurant || data) : null;

    const registrationDate = formatDate(resData.createdDate || resData.createdAt);

    DOM.mainContent.innerHTML = `
        <div class="animate-fade-in max-w-4xl mx-auto">
            <h2 class="text-3xl font-extrabold mb-6 text-gray-900 uppercase tracking-tight">Restaurant Profile</h2>
            <div class="bg-white p-8 rounded-2xl shadow-2xl border border-orange-100">
                <form id="settings-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-black text-gray-500 uppercase mb-2">Restaurant Name</label>
                            <input name="name" type="text" value="${escapeHtml(settings.name || '')}" class="w-full p-3 bg-gray-50 border border-orange-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-800">
                        </div>
                        <div>
                            <label class="block text-xs font-black text-gray-500 uppercase mb-2">Phone Number</label>
                            <input name="phoneNumber" type="text" value="${escapeHtml(settings.phoneNumber || '')}" class="w-full p-3 bg-gray-50 border border-orange-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-800">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-black text-gray-500 uppercase mb-2">Email Address (Managed by System)</label>
                        <input type="email" value="${escapeHtml(settings.email || '')}" disabled class="w-full p-3 bg-orange-50/50 border border-orange-100 rounded-xl text-gray-400 cursor-not-allowed font-medium">
                    </div>
                    <div>
                        <label class="block text-xs font-black text-gray-500 uppercase mb-2">About / Description</label>
                        <textarea name="description" rows="3" class="w-full p-3 bg-gray-50 border border-orange-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 resize-none font-medium text-gray-700">${escapeHtml(settings.description || '')}</textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-black text-gray-500 uppercase mb-2">Full Address</label>
                        <textarea name="address" rows="2" class="w-full p-3 bg-gray-50 border border-orange-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 resize-none font-medium text-gray-700">${escapeHtml(settings.address || '')}</textarea>
                    </div>
                    <button type="submit" class="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-xl hover:bg-orange-700 transition-all uppercase tracking-widest">SAVE CHANGES</button>
                </form>
                <div id="settings-message" class="mt-4 text-center font-bold text-sm"></div>
            </div>
              <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl transition-all shadow-lg">SAVE CHANGES</button>
            </form>
            <div id="settings-message" class="mt-4 text-center font-bold text-sm"></div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white p-8 rounded-2xl border border-orange-100 shadow-lg text-center">
            <h2 class="text-lg font-bold text-gray-800 mb-4 italic">Security</h2>
            <button id="forgot-pass-btn" class="w-full border-2 border-orange-500/20 text-orange-600 hover:bg-orange-600 hover:text-white font-bold py-3 rounded-xl transition-all">Send Reset Link</button>
            <div id="forgot-message" class="mt-4 text-center text-xs font-medium uppercase tracking-widest"></div>
          </div>
        </div>
      </div>
    </div>`;

    // Listener'ı bağla (ID ile)
    attachSettingsListeners(resId, resData.email);
};

let currentBase64Image = "";
// --- LISTENERS (AYARLAR İÇİN) ---
const attachSettingsListeners = (resId, resEmail) => {
    const settingsForm = document.getElementById('settings-form');
    const fileInput = document.getElementById('file-input');
    const imgPreview = document.getElementById('img-preview');
    const dropArea = document.getElementById('drop-area');
    const forgotBtn = document.getElementById('forgot-pass-btn');

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imgPreview.src = e.target.result;
                    imgPreview.classList.remove('hidden');
                    currentBase64Image = e.target.result; // Base64'ü değişkene ata
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('settings-message');

            const payload = {
                name: document.getElementById('set-name').value.trim(),
                phoneNumber: document.getElementById('set-phone').value.trim(),
                description: document.getElementById('set-description').value.trim(),
                address: document.getElementById('set-address').value.trim(),
                imageUrl: currentBase64Image || imgPreview.src
            };

            try {
                msg.textContent = "SAVING...";
                msg.className = "mt-4 text-center text-orange-400 font-bold animate-pulse";

                const res = await fetchData(API_CONFIG.ENDPOINTS.UPDATE(resId), {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });

                if (!res.error) {
                    msg.textContent = "✓ SETTINGS UPDATED SUCCESSFULLY!";
                    msg.className = "mt-4 text-center text-green-600 font-bold";
                    setRestaurantInfo();
                    setTimeout(() => renderSettingsView(), 2000);
                } else { throw new Error(); }
            } catch (err) {
                msg.textContent = "UPDATE FAILED!";
                msg.className = "mt-4 text-center text-red-500 font-bold";
            }
        });
    }

    if (forgotBtn) {
        forgotBtn.onclick = async () => {
            const fMsg = document.getElementById('forgot-message');
            fMsg.textContent = "SENDING...";
            fMsg.className = "mt-4 text-center text-orange-400 animate-pulse";

            const res = await fetchData('Auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email: resEmail })
            });

            if (!res.error) {
                fMsg.textContent = "SUCCESS! CHECK YOUR EMAIL.";
                fMsg.className = "mt-4 text-center text-green-600 font-bold";
            } else {
                fMsg.textContent = "FAILED TO SEND.";
                fMsg.className = "mt-4 text-center text-red-500";
            }
        };
    }
};

// --- KATEGORİ VE AKSİYON YARDIMCILARI ---
window.toggleCategoryInput = (value) => {
    const select = document.getElementById('category-select');
    const container = document.getElementById('new-category-container');
    const input = document.getElementById('new-category-input');
    if (value === "NEW_CATEGORY") {
        select.classList.add('hidden');
        select.name = "";
        container.classList.remove('hidden');
        input.name = "category";
        input.focus();
    }
};

window.resetCategorySelection = () => {
    const select = document.getElementById('category-select');
    const container = document.getElementById('new-category-container');
    const input = document.getElementById('new-category-input');
    select.classList.remove('hidden');
    select.name = "category";
    select.value = "";
    container.classList.add('hidden');
    input.name = "";
};

window.updateReservation = async (id, status) => {
    if (!confirm(`Are you sure you want to ${status.toUpperCase()} this reservation?`)) return;
    const result = await fetchData(`reservations/${id}`, { method: 'PUT', body: JSON.stringify({ status: status }) });
    if (result && !result.error) { renderReservationsView(); }
};

window.deleteMenuItem = async (id) => {
    if(!confirm('Are you sure you want to delete this menu item?')) return;
    const result = await fetchData(`${API_CONFIG.ENDPOINTS.MENU}/${id}`, { method: 'DELETE' });
    if (result && !result.error) renderMenuView();
};

const handleAddMenuSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = Object.fromEntries(formData.entries());
    newItem.price = parseFloat(newItem.price);
    const result = await fetchData(API_CONFIG.ENDPOINTS.MENU, { method: 'POST', body: JSON.stringify(newItem) });
    if (result && !result.error) { e.target.reset(); renderMenuView(); }
};

// --- ROUTER ---
const handleNavigation = (e) => {
    const link = e.target.closest('.sidebar-link');
    if (!link) return;
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    switch (targetId) {
        case 'reservations': renderReservationsView(); break;
        case 'menu': renderMenuView(); break;
        case 'settings': renderSettingsView(); break;
        case 'reviews':
        case 'tickets':
            DOM.mainContent.innerHTML = `<div class="p-12 text-center bg-white rounded-xl border border-orange-100 shadow-sm"><p class="text-orange-400 font-bold uppercase tracking-widest">Feature coming soon!</p></div>`;
            break;
        default: renderReservationsView();
    }
};

const handleLogout = (e) => {
    e.preventDefault();
    if (confirm('Logout?')) { localStorage.clear(); window.location.href = '../commonfiles/main-page.html'; }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    if (DOM.sidebarNav) DOM.sidebarNav.addEventListener('click', handleNavigation);
    if (DOM.logoutButton) DOM.logoutButton.addEventListener('click', handleLogout);
    setRestaurantInfo();
    renderReservationsView('pending');
});