// --- IMPORTS ---
import { restaurantService } from '../../api/restaurantService.js';

// --- DOM Elements ---
const DOM = {
    mainContent: document.getElementById('main-content'),
    sidebarNav: document.getElementById('sidebar-nav'),
    logoutButton: document.getElementById('logout-button'),
    restaurantNameDisplay: document.getElementById('res-name-display'),
    restaurantLogoDisplay: document.getElementById('res-logo-display')
};

// --- INITIAL DATA FETCH ---
const setRestaurantInfo = async () => {
    const localName = localStorage.getItem('userName');
    if (localName && DOM.restaurantNameDisplay) {
        DOM.restaurantNameDisplay.textContent = escapeHtml(localName);
    }

    try {
        const resId = localStorage.getItem('restaurantId');
        if (!resId) return;

        const response = await restaurantService.getInfo(resId);
        const resData = (response.data && !response.data.error) ? (response.data.restaurant || response.data) : null;

        if (resData) {
            if (DOM.restaurantNameDisplay) {
                DOM.restaurantNameDisplay.textContent = escapeHtml(resData.name);
            }
            if (DOM.restaurantLogoDisplay && resData.imageUrl) {
                DOM.restaurantLogoDisplay.src = resData.imageUrl;
                DOM.restaurantLogoDisplay.classList.remove('hidden');
            }
            localStorage.setItem('userName', resData.name);
        }
    } catch (error) {
        console.error("Restaurant info fetch error:", error);
    }
};

// --- HELPER FUNCTIONS ---
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

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Active Member';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

function renderStars(rating) {
    const n = Math.max(0, Math.min(5, Number(rating) || 0));
    const rr = Math.round(n);
    return `<span class="text-yellow-500">${"★".repeat(rr)}</span><span class="text-gray-300">${"☆".repeat(5 - rr)}</span>`;
}

// --- RENDERERS ---

window.renderReservationsView = async (filter = 'pending') => {
    showLoading();
    try {
        const response = await restaurantService.getReservations();
        const data = response.data;
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
                    <button onclick="renderReservationsView('all')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${filter === 'all' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}">All History</button>
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
    } catch (error) {
        console.error("Reservation view error:", error);
    }
};

const renderMenuView = async () => {
    showLoading();
    try {
        const response = await restaurantService.getMenu();
        const data = response.data;
        const menuItems = (data && !data.error) ? (data.menu || []) : [];

        const categories = ['Starter', 'Main Course', 'Drinks', 'Desserts', 'Salads'];
        const dynamicCategories = [...new Set([...categories, ...menuItems.map(item => item.category).filter(Boolean)])].sort();

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
                            <div class="relative mt-1">
                                <select id="category-select" name="category" class="block w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-800 focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer" onchange="toggleCategoryInput(this.value)" required>
                                    <option value="" disabled selected>Select Category</option>
                                    ${dynamicCategories.map((cat, index) => `<option value="${cat}">${cat}</option>`).join('')}
                                    <option value="NEW_CATEGORY">+ Add New Category</option>
                                </select>
                            </div>
                            <div id="new-category-container" class="hidden mt-2 flex gap-2">
                                <input id="new-category-input" type="text" placeholder="Enter Category Name" class="flex-1 border border-orange-300 rounded-lg p-2.5 bg-orange-50 outline-none" />
                                <button type="button" class="bg-red-50 text-red-500 font-bold px-3 rounded-lg" onclick="resetCategorySelection()">✕</button>
                            </div>
                        </div>
                        <div><label class="block text-sm font-medium">Price (PLN)</label><input name="price" type="number" step="0.5" class="mt-1 block w-full border rounded-lg p-2.5 outline-none" required></div>
                        <div><label class="block text-sm font-medium">Description</label><textarea name="description" rows="3" class="mt-1 block w-full border rounded-lg p-2.5 outline-none resize-none"></textarea></div>
                        <button type="submit" class="w-full bg-orange-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:bg-orange-700 transition">Add to Menu</button>
                    </form>
                </div>
            </div>`;
        const form = document.getElementById('add-menu-item-form');
        if (form) form.addEventListener('submit', handleAddMenuSubmit);
    } catch (error) {
        console.error("Menu view error:", error);
    }
};

const renderSettingsView = async () => {
    showLoading();
    try {
        const resId = localStorage.getItem("restaurantId");
        const response = await restaurantService.getInfo(resId);
        const resData = (response.data && !response.data.error) ? (response.data.restaurant || response.data) : null;
        const registrationDate = formatDate(resData.createdDate || resData.createdAt);

        DOM.mainContent.innerHTML = `
            <div class="animate-fade-in max-w-4xl mx-auto p-4">
                <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-orange-200 pb-6">
                    <h1 class="text-3xl font-bold text-gray-800 uppercase">Restaurant Settings</h1>
                    <span class="text-xs font-semibold uppercase text-orange-600">Partner Since: ${registrationDate}</span>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2">
                        <div class="bg-white p-8 rounded-2xl border shadow-xl">
                            <form id="settings-form" class="space-y-5">
                                <div><label class="block text-xs font-bold text-gray-500 uppercase">Restaurant Name</label><input type="text" id="set-name" value="${escapeHtml(resData.name)}" class="w-full p-3 bg-gray-50 border rounded-xl outline-none"></div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div><label class="block text-xs font-bold text-gray-500 uppercase">Email</label><input type="email" value="${escapeHtml(resData.email)}" disabled class="w-full p-3 bg-gray-100 border rounded-xl cursor-not-allowed"></div>
                                    <div><label class="block text-xs font-bold text-gray-500 uppercase">Phone</label><input type="text" id="set-phone" value="${escapeHtml(resData.phoneNumber || '')}" class="w-full p-3 bg-gray-50 border rounded-xl"></div>
                                </div>
                                <div><label class="block text-xs font-bold text-gray-500 uppercase">Description</label><textarea id="set-description" rows="3" class="w-full p-3 bg-gray-50 border rounded-xl">${escapeHtml(resData.description || '')}</textarea></div>
                                <div><label class="block text-xs font-bold text-gray-500 uppercase">Address</label><textarea id="set-address" rows="2" class="w-full p-3 bg-gray-50 border rounded-xl">${escapeHtml(resData.address || '')}</textarea></div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 uppercase">Image</label>
                                    <div id="drop-area" class="relative border-4 border-dashed rounded-2xl h-64 flex items-center justify-center overflow-hidden cursor-pointer">
                                        <input type="file" id="file-input" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 z-50">
                                        <img id="img-preview" src="${resData.imageUrl || ''}" class="absolute inset-0 w-full h-full object-cover ${resData.imageUrl ? '' : 'hidden'} z-30">
                                        <p class="text-xs font-bold text-gray-400 uppercase z-10">Click to Upload</p>
                                    </div>
                                </div>
                                <button type="submit" class="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg">SAVE CHANGES</button>
                            </form>
                            <div id="settings-message" class="mt-4 text-center font-bold text-sm"></div>
                        </div>
                    </div>
                    <div class="bg-white p-8 rounded-2xl border shadow-lg text-center h-fit">
                        <h2 class="text-lg font-bold text-gray-800 mb-4">Security</h2>
                        <button id="forgot-pass-btn" class="w-full border-2 border-orange-500/20 text-orange-600 font-bold py-3 rounded-xl">Send Reset Link</button>
                        <div id="forgot-message" class="mt-4 text-xs font-medium uppercase"></div>
                    </div>
                </div>
            </div>`;
        attachSettingsListeners(resId, resData.email);
    } catch (error) {
        console.error("Settings view error:", error);
    }
};

// --- LISTENERS ---
let currentBase64Image = "";
const attachSettingsListeners = (resId, resEmail) => {
    const settingsForm = document.getElementById('settings-form');
    const fileInput = document.getElementById('file-input');
    const imgPreview = document.getElementById('img-preview');
    const forgotBtn = document.getElementById('forgot-pass-btn');

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imgPreview.src = e.target.result;
                    imgPreview.classList.remove('hidden');
                    currentBase64Image = e.target.result;
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
                const res = await restaurantService.update(resId, payload);
                if (!res.data.error) {
                    msg.textContent = "✓ SETTINGS UPDATED!";
                    msg.className = "mt-4 text-center text-green-600 font-bold";
                    setRestaurantInfo();
                    setTimeout(() => renderSettingsView(), 2000);
                }
            } catch (err) {
                msg.textContent = "UPDATE FAILED!";
                msg.className = "mt-4 text-center text-red-500 font-bold";
            }
        });
    }

    if (forgotBtn) {
        forgotBtn.onclick = async () => {
            const fMsg = document.getElementById('forgot-message');
            try {
                fMsg.textContent = "SENDING...";
                await restaurantService.forgotPassword(resEmail);
                fMsg.textContent = "SUCCESS! CHECK EMAIL.";
                fMsg.className = "mt-4 text-center text-green-600 font-bold";
            } catch (err) {
                fMsg.textContent = "FAILED TO SEND.";
                fMsg.className = "mt-4 text-center text-red-500";
            }
        };
    }
};

// --- ACTIONS & UTILS ---
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
    if (!confirm(`Sure to ${status}?`)) return;
    try {
        await restaurantService.updateReservation(id, status);
        renderReservationsView();
    } catch (err) { console.error(err); }
};

window.deleteMenuItem = async (id) => {
    if (!confirm('Delete?')) return;
    try {
        await restaurantService.deleteMenuItem(id);
        renderMenuView();
    } catch (err) { console.error(err); }
};

const handleAddMenuSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = Object.fromEntries(formData.entries());
    newItem.price = parseFloat(newItem.price);
    try {
        await restaurantService.addMenuItem(newItem);
        e.target.reset();
        renderMenuView();
    } catch (err) { console.error(err); }
};

async function renderReviewsView() {
    DOM.mainContent.innerHTML = `<div class="p-6"><h2 class="text-3xl font-bold mb-4">Customer Reviews</h2><div id="reviewsList">Loading...</div></div>`;
    const listEl = document.getElementById("reviewsList");
    try {
        const resId = localStorage.getItem("restaurantId");
        const response = await restaurantService.getReviews(resId);
        const reviews = response.data.reviews || response.data || [];

        if (!reviews.length) {
            listEl.innerHTML = `No reviews yet.`;
            return;
        }

        listEl.innerHTML = `<div class="space-y-4">${reviews.map(r => `
            <div class="border rounded-lg p-4 bg-white">
                <div class="flex justify-between font-semibold">
                    <span>${escapeHtml(r.userName || "Anonymous")}</span>
                    <span class="text-sm text-gray-500">${formatDate(r.createdAt)}</span>
                </div>
                <div class="mt-2">Rating: ${renderStars(r.rating)}</div>
                <p class="mt-2 text-gray-700">${escapeHtml(r.comment || "")}</p>
            </div>`).join("")}</div>`;
    } catch (err) { listEl.innerHTML = "Error loading reviews."; }
}

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
        case 'reviews': renderReviewsView(); break;
        default: renderReservationsView();
    }
};

const handleLogout = (e) => {
    if (confirm('Logout?')) {
        localStorage.clear();
        window.location.href = '../commonfiles/main-page.html';
    }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    if (DOM.sidebarNav) DOM.sidebarNav.addEventListener('click', handleNavigation);
    if (DOM.logoutButton) DOM.logoutButton.addEventListener('click', handleLogout);
    setRestaurantInfo();
    renderReservationsView('pending');
});