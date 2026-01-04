// --- CONFIGURASYON ---
const API_CONFIG = {
    // API.
    BASE_URL: 'https://api.menumaster.com/v1/restaurant', 
    RESTAURANT_ID: 'rest_12345' 
};

// --- DOM Elements ---
const DOM = {
    mainContent: document.getElementById('main-content'),
    sidebarNav: document.getElementById('sidebar-nav'),
    logoutButton: document.getElementById('logout-button')
};

// --- Helper fuctions ---

const showLoading = () => {
    DOM.mainContent.innerHTML = `<div class="flex justify-center items-center h-full"><div class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div></div>`;
};

const showError = (message) => {
    DOM.mainContent.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center p-8">
            <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Could not download</h2>
            <p class="text-gray-600 mb-6">${message}</p>
            <button onclick="location.reload()" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">Try Again</button>
        </div>
    `;
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

        // Timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(url, { ...options, headers, signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn("The session has expired.");
                    // window.location.href = '../login.html';
                }
                const errorData = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}` }));
                throw new Error(errorData.message || `Server Error (${response.status})`);
            }
            
            if (response.status === 204) return { success: true };
            return await response.json();

        } catch (fetchError) {
             if (fetchError.name === 'AbortError') {
                 throw new Error("The request has expired.");
             }
             throw fetchError;
        }

    } catch (error) {
        console.error('API Error:', error);
        // We return null in case of an error so that the render functions can catch it. 
        // // We are not returning mock data, we are handling the actual error.
        return { error: true, message: error.message };
    }
};

// --- Renderers ---

const renderReservationsView = async () => {
    showLoading();
    const data = await fetchData('reservations');
    
    // Show the interface even if there's an API error, embed the error message inside.
    const reservations = (data && !data.error) ? (data.reservations || []) : [];
    
   // If there's an error and the list is empty, we can show an empty list instead of a general error and notify the user. 
   //  Or we can fill the entire screen with showError. I'm showing the list because you want to access the interface.

    DOM.mainContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-gray-800"> Reservations</h2>
        
        ${data && data.error ? `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong class="font-bold">Error!</strong> <span class="block sm:inline">${data.message}</span></div>` : ''}

        <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <ul class="space-y-4">
                ${reservations.length === 0 ? '<p class="text-gray-500 text-center py-8">No Any Reservation.</p>' : reservations.map(r => `
                    <li class="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center transition hover:shadow-sm">
                        <div>
                            <p class="font-bold text-lg text-gray-800">${escapeHtml(r.user?.name || 'Guest')}</p>
                            <p class="text-gray-600 text-sm flex items-center mt-1">
                                <span class="mr-3">👥 ${r.people} Person</span>
                                <span>📅 ${new Date(r.date).toLocaleDateString()} 🕒 ${r.time}</span>
                            </p>
                        </div>
                        <div class="flex items-center space-x-2 mt-3 sm:mt-0">
                            <span class="px-3 py-1 text-xs font-bold uppercase rounded-full bg-gray-100 text-gray-800">${r.status}</span>
                            ${r.status === 'Pending' ? `
                            <div class="flex space-x-1 ml-2">
                                <button onclick="updateReservation('${r.id}', 'Confirmed')" class="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition">Accept</button>
                                <button onclick="updateReservation('${r.id}', 'Declined')" class="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition">Decline</button>
                            </div>
                            ` : ''}
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
};

const renderMenuView = async () => {
    showLoading();
    const data = await fetchData('menu');
    const menuItems = (data && !data.error) ? (data.menu || []) : [];

    DOM.mainContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-gray-800">Menu Manager</h2>
        
        ${data && data.error ? `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">${data.message}</div>` : ''}

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h3 class="text-xl font-semibold mb-4 border-b pb-2">Foods</h3>
                <ul id="menu-list" class="space-y-3">
                ${menuItems.length === 0 ? '<p class="text-gray-500 italic text-center py-4">Menu Is Empty Or Couldnt Download.</p>' : menuItems.map(item => `
                    <li class="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition">
                        <div>
                            <p class="font-bold text-gray-800">${escapeHtml(item.name)}</p>
                            <p class="text-sm text-gray-500">${escapeHtml(item.description)}</p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">${item.price} PLN</span>
                            <button onclick="deleteMenuItem('${item.id}')" class="text-gray-400 hover:text-red-500 transition">Sil</button>
                        </div>
                    </li>
                `).join('')}
                </ul>
            </div>
            
            <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit sticky top-6">
                <h3 class="text-xl font-semibold mb-4 text-indigo-600">Add New</h3>
                <form id="add-menu-item-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Name</label>
                        <input name="name" type="text" class="mt-1 block w-full border border-gray-300 rounded-lg p-2.5" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Price (PLN)</label>
                        <input name="price" type="number" step="0.5" class="mt-1 block w-full border border-gray-300 rounded-lg p-2.5" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Decription</label>
                        <textarea name="description" rows="3" class="mt-1 block w-full border border-gray-300 rounded-lg p-2.5" required></textarea>
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md">Add</button>
                </form>
            </div>
        </div>
    `;
    
    const form = document.getElementById('add-menu-item-form');
    if(form) form.addEventListener('submit', handleAddMenuSubmit);
};

const renderReviewsView = async () => {
    showLoading();
    const data = await fetchData('reviews');
    const reviews = (data && !data.error) ? (data.reviews || []) : [];
    
    DOM.mainContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-gray-800">Customer Comments</h2>
        
        ${data && data.error ? `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">${data.message}</div>` : ''}

        <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div class="space-y-6">
                ${reviews.length === 0 ? '<p class="text-gray-500 text-center py-4">No Comments Yet.</p>' : reviews.map(r => `
                    <div class="p-4 border-b last:border-0 hover:bg-gray-50 transition rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-gray-800">${escapeHtml(r.userName || 'Anonim')}</span>
                            <div class="flex text-yellow-400">Rating: ${r.rating}/5</div>
                        </div>
                        <p class="text-gray-600 italic">"${escapeHtml(r.comment)}"</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

const renderTicketsView = async () => {
    showLoading();
    const data = await fetchData('tickets');
    const tickets = (data && !data.error) ? (data.tickets || []) : [];

    DOM.mainContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-gray-800">Support Tickets</h2>
        
        ${data && data.error ? `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">${data.message}</div>` : ''}

        <div class="bg-white p-6 rounded-lg shadow-lg">
            <table class="w-full text-left">
                 <thead>
                    <tr class="border-b border-gray-700">
                        <th class="p-3">ID</th>
                        <th class="p-3">Subject</th>
                        <th class="p-3">Status</th>
                        <th class="p-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${tickets.length === 0 ? '<tr><td colspan="4" class="p-3 text-center text-gray-500">Couldnt Find.</td></tr>' : tickets.map(t => `
                        <tr class="border-b border-gray-200 hover:bg-gray-50">
                            <td class="p-3 font-mono text-xs text-gray-600">${t.id}</td>
                            <td class="p-3 font-medium">${escapeHtml(t.subject)}</td>
                            <td class="p-3">${t.status}</td>
                            <td class="p-3">${new Date(t.createdAt).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

const renderSettingsView = async () => {
    showLoading();
    const data = await fetchData(API_CONFIG.ENDPOINTS.ME);
    const settings = (data && !data.error) ? (data.restaurant || data) : {};

    DOM.mainContent.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-gray-800">Restoran Settings</h2>
        
        ${data && data.error ? `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">${data.message}</div>` : ''}

        <div class="bg-white p-8 rounded-xl shadow-md border border-gray-200 max-w-2xl mx-auto">
            <form id="settings-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Restoran Name</label>
                        <input name="name" type="text" value="${escapeHtml(settings.name || '')}" class="mt-1 block w-full border border-gray-300 rounded-lg p-2.5">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Telefon</label>
                        <input name="phone" type="text" value="${escapeHtml(settings.phone || '')}" class="mt-1 block w-full border border-gray-300 rounded-lg p-2.5">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Adress</label>
                    <input name="address" type="text" value="${escapeHtml(settings.address || '')}" class="mt-1 block w-full border border-gray-300 rounded-lg p-2.5">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Type</label>
                    <input name="cuisine" type="text" value="${escapeHtml(settings.cuisine || '')}" class="mt-1 block w-full border border-gray-300 rounded-lg p-2.5">
                </div>
                <div class="pt-4">
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-md">Save</button>
                </div>
            </form>
        </div>
    `;
    
    const form = document.getElementById('settings-form');
    if(form) form.addEventListener('submit', handleSettingsSubmit);
};

// --- ACTION HANDLERS ---

window.updateReservation = async (id, status) => {
    if(!confirm(`Are you sure to do (${status}) that?`)) return;
    
    const result = await fetchData(`${API_CONFIG.ENDPOINTS.RESERVATIONS}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: status })
    });
    
    if (result && !result.error) {
        alert('Completed!');
        renderReservationsView();
    } else {
        alert('Unsuccessful: ' + (result?.message || 'error'));
    }
};

window.deleteMenuItem = async (id) => {
    if(confirm('Are you sure to delete?')) {
        const result = await fetchData(`${API_CONFIG.ENDPOINTS.MENU}/${id}`, { method: 'DELETE' });
        if (result && !result.error) {
            alert('Deleted!');
            renderMenuView();
        } else {
             alert('Deleted: ' + (result?.message || 'Error'));
        }
    }
};

const handleAddMenuSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = Object.fromEntries(formData.entries());
    
    const result = await fetchData('menu', {
        method: 'POST',
        body: JSON.stringify(newItem)
    });
    
    if (result && !result.error) {
        alert('Added!');
        renderMenuView();
    } else {
        alert('Unsuccesfull: ' + (result?.message || 'Error'));
    }
};

const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedSettings = Object.fromEntries(formData.entries());
    
    const result = await fetchData(API_CONFIG.ENDPOINTS.ME, {
        method: 'PUT',
        body: JSON.stringify(updatedSettings)
    });
    
    if (result && !result.error) {
        alert('Updatd!');
        renderSettingsView(); 
    } else {
        alert('Update Unsuccesfull: ' + (result?.message || 'Error'));
    }
};

// --- ROUTER ---
const handleNavigation = (e) => {
    const link = e.target.closest('.sidebar-link');
    if (!link) return;
    e.preventDefault();

    const targetId = link.getAttribute('href').substring(1);

    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active', 'bg-indigo-50', 'text-indigo-600'));
    link.classList.add('active', 'bg-indigo-50', 'text-indigo-600');
    
    switch (targetId) {
        case 'reservations': renderReservationsView(); break;
        case 'menu': renderMenuView(); break;
        case 'reviews': renderReviewsView(); break;
        case 'tickets': renderTicketsView(); break;
        case 'settings': renderSettingsView(); break;
        default: renderReservationsView();
    }
};

const handleLogout = (e) => {
    e.preventDefault();
    if(confirm('Are you sure to exit?')) {
        localStorage.clear();
        window.location.href = '../commonfiles/main-page.html';
    }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    if(DOM.sidebarNav) DOM.sidebarNav.addEventListener('click', handleNavigation);
    
    if(DOM.logoutButton) {
        DOM.logoutButton.addEventListener('click', handleLogout);
    }
    
    //Load reservations by default.
    renderReservationsView();
});