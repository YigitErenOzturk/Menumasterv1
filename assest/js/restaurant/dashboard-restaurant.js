// --- CONFIGURASYON ---
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api', 
    CATEGORIES: ['Starter', 'Main Course', 'Drinks', 'Desserts', 'Salads'],
    ENDPOINTS: {
        MENU: 'restaurants/menu',
        RESERVATIONS: 'restaurants/reservations',
        REVIEWS: 'restaurants/reviews',
        TICKETS: 'restaurants/tickets',
        ME: 'restaurants/me'
    }
};

// --- DOM Elements ---
const DOM = {
    mainContent: document.getElementById('main-content'),
    sidebarNav: document.getElementById('sidebar-nav'),
    logoutButton: document.getElementById('logout-button')
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

// --- API FUNCTIONS ---
const fetchData = async (endpoint, options = {}) => {
    try {
        const url = `${API_CONFIG.BASE_URL}/${endpoint}`;
        const token = localStorage.getItem('authToken');
        
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
}

// --- Renderers ---

// REZERVASYON GÖRÜNÜMÜ
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
            <h2 class="text-3xl font-bold text-gray-800">Reservations</h2>
            <div class="flex bg-gray-100 p-1 rounded-xl border border-gray-200 w-full xl:w-auto overflow-x-auto">
                <button onclick="renderReservationsView('pending')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'pending' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">Pending</button>
                <button onclick="renderReservationsView('confirmed')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'confirmed' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">Confirmed</button>
                <button onclick="renderReservationsView('completed')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'completed' ? 'bg-white text-gray-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">Completed</button>
                <button onclick="renderReservationsView('declined')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'declined' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">Declined</button>
                <button onclick="renderReservationsView('all')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">All History</button>
            </div>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-fade-in">
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
                            <p class="font-bold text-lg text-gray-800">${escapeHtml(customerName)}</p>
                            <p class="text-gray-600 text-sm mt-1"><span>👥 ${peopleCount} Person</span> <span class="ml-3">📅 ${resDate.toLocaleDateString()} 🕒 ${timeString}</span></p>
                        </div>
                        <div class="flex items-center space-x-2 mt-3 sm:mt-0">
                            <span class="px-3 py-1 text-xs font-bold uppercase rounded-full border ${statusStyles[displayStatus] || 'bg-gray-100'}">${displayStatus}</span>
                            ${displayStatus === 'Pending' ? `<div class="flex space-x-1 ml-2"><button onclick="updateReservation('${r.id}', 'Confirmed')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition">Accept</button><button onclick="updateReservation('${r.id}', 'Declined')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition">Decline</button></div>` : ''}
                        </div>
                    </li>`;
                }).join('')}
            </ul>
        </div>`;
};

// MENÜ GÖRÜNÜMÜ
const renderMenuView = async () => {
    showLoading();
    const data = await fetchData(API_CONFIG.ENDPOINTS.MENU);
    const menuItems = (data && !data.error) ? (data.menu || []) : [];
    const groupedMenu = menuItems.reduce((acc, item) => {
        const cat = item.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    DOM.mainContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-gray-800 animate-fade-in">Menu Manager</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
            <div class="lg:col-span-2 space-y-8">
                ${Object.keys(groupedMenu).length === 0 ? '<p class="text-gray-500 italic">Menu is empty.</p>' : 
                    Object.entries(groupedMenu).map(([category, items]) => `
                    <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                        <h3 class="text-xl font-bold mb-4 text-orange-600 border-b pb-2 uppercase tracking-wide">${category}</h3>
                        <ul class="space-y-3">
                            ${items.map(item => `
                                <li class="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition">
                                    <div>
                                        <p class="font-bold text-gray-800">${escapeHtml(item.name)}</p>
                                        <p class="text-sm text-gray-500">${escapeHtml(item.description)}</p>
                                    </div>
                                    <div class="flex items-center space-x-4">
                                        <span class="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">${item.price} PLN</span>
                                        <button onclick="deleteMenuItem('${item.id}')" class="text-gray-400 hover:text-red-500 transition">Delete</button>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit sticky top-6">
                <h3 class="text-xl font-semibold mb-4 text-orange-600">Add New Item</h3>
                <form id="add-menu-item-form" class="space-y-4">
                    <div><label class="block text-sm font-medium">Name</label><input name="name" type="text" class="mt-1 block w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" required></div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Category</label>
                        <div class="flex flex-col gap-2 mt-1">
                            <select id="category-select" name="category" class="block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-orange-500" onchange="toggleCategoryInput(this.value)">
                                <option value="">Select Category</option>
                                ${API_CONFIG.CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                <option value="NEW_CATEGORY" class="font-bold text-orange-600">+ Add New Category</option>
                            </select>
                            <div id="new-category-container" class="hidden flex gap-2">
                                <input id="new-category-input" type="text" placeholder="Enter Category Name" class="flex-1 border border-orange-300 rounded-lg p-2.5 bg-orange-50 outline-none" />
                                <button type="button" class="text-red-500 font-bold px-2" onclick="resetCategorySelection()">✕</button>
                            </div>
                        </div>
                    </div>
                    <div><label class="block text-sm font-medium">Price (PLN)</label><input name="price" type="number" step="0.5" class="mt-1 block w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" required></div>
                    <div><label class="block text-sm font-medium">Description</label><textarea name="description" rows="3" class="mt-1 block w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500 resize-none" required></textarea></div>
                    <button type="submit" class="w-full bg-orange-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:bg-orange-700 transition">Add to Menu</button>
                </form>
            </div>
        </div>
    `;
    const form = document.getElementById('add-menu-item-form');
    if(form) form.addEventListener('submit', handleAddMenuSubmit);
};

// RESTORAN AYARLARI (JSON YAPISINA UYGUN)
const renderSettingsView = async () => {
    showLoading();
    const data = await fetchData(API_CONFIG.ENDPOINTS.ME);
    const settings = (data && !data.error) ? (data.restaurant || data) : {};

    DOM.mainContent.innerHTML = `
        <div class="animate-fade-in max-w-4xl mx-auto">
            <h2 class="text-3xl font-bold mb-6 text-gray-800">Restaurant Profile</h2>
            <div class="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
                <form id="settings-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Restaurant Name</label>
                            <input name="name" type="text" value="${escapeHtml(settings.name || '')}" class="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                            <input name="phoneNumber" type="text" value="${escapeHtml(settings.phoneNumber || '')}" class="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-500">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Email (Read Only)</label>
                        <input type="email" value="${escapeHtml(settings.email || '')}" disabled class="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-2">About / Description</label>
                        <textarea name="description" rows="3" class="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 resize-none">${escapeHtml(settings.description || '')}</textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Address</label>
                        <textarea name="address" rows="2" class="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 resize-none">${escapeHtml(settings.address || '')}</textarea>
                    </div>
                    <button type="submit" class="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-all">SAVE CHANGES</button>
                </form>
                <div id="settings-message" class="mt-4 text-center font-bold text-sm"></div>
            </div>
        </div>
    `;
    const form = document.getElementById('settings-form');
    if(form) form.addEventListener('submit', handleSettingsSubmit);
};

// --- CATEGORY HELPERS ---
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

// --- ACTION HANDLERS ---
window.updateReservation = async (id, status) => {
    if(!confirm(`Are you sure you want to ${status.toUpperCase()} this reservation?`)) return;
    const result = await fetchData(`reservations/${id}`, { method: 'PUT', body: JSON.stringify({ status: status }) });
    if (result && !result.error) { renderReservationsView(); }
};

window.deleteMenuItem = async (id) => {
    if(!confirm('Delete this item?')) return;
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

const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const msg = document.getElementById('settings-message');
    const formData = new FormData(e.target);
    const updated = Object.fromEntries(formData.entries());
    msg.textContent = "SAVING CHANGES...";
    msg.className = "mt-4 text-center text-gray-400 font-bold animate-pulse";
    
    const result = await fetchData(API_CONFIG.ENDPOINTS.ME, { method: 'PUT', body: JSON.stringify(updated) });
    if (result && !result.error) {
        msg.textContent = "✓ PROFILE UPDATED SUCCESSFULLY!";
        msg.className = "mt-4 text-center text-green-600 font-bold";
        setTimeout(() => msg.textContent = "", 3000);
    } else {
        msg.textContent = "❌ ERROR UPDATING PROFILE.";
        msg.className = "mt-4 text-center text-red-600 font-bold";
    }
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
            DOM.mainContent.innerHTML = `<div class="p-8 text-center text-gray-500">Feature coming soon!</div>`;
            break;
        default: renderReservationsView();
    }
};

const handleLogout = (e) => {
    e.preventDefault();
    if(confirm('Logout?')) { localStorage.clear(); window.location.href = '../commonfiles/main-page.html'; }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    if(DOM.sidebarNav) DOM.sidebarNav.addEventListener('click', handleNavigation);
    if(DOM.logoutButton) DOM.logoutButton.addEventListener('click', handleLogout);
    renderReservationsView('pending');
});