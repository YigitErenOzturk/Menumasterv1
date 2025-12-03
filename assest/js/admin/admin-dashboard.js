// --- API CONFIGURATION ---
const API_BASE_URL = 'http://192.168.1.100:3000/api/admin';

// --- DOM Elements ---
const mainContentEl = document.getElementById('main-content');
const sidebarNav = document.getElementById('sidebar-nav');

// --- UTILITY & API FUNCTIONS ---

const showLoading = () => {
    mainContentEl.innerHTML = `<div class="flex justify-center items-center h-full"><div class="spinner"></div></div>`;
};

const showError = (message) => {
    mainContentEl.innerHTML = `<div class="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg" role="alert"><strong class="font-bold">Error!</strong><span class="block sm:inline ml-2">${message}</span></div>`;
};

const fetchData = async (endpoint, options = {}) => {
    const token = "YOUR_ADMIN_AUTH_TOKEN"; // Placeholder
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP Error! Status: ${response.status}` }));
            throw new Error(errorData.message);
        }
        if (response.status === 204) return { success: true };
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showError(error.message || 'Could not connect to the server.');
        return null;
    }
};

// --- VIEW RENDERING FUNCTIONS ---

const renderAllReservationsView = async () => {
    showLoading();
    const data = await fetchData('reservations');
    if (!data) return;

    mainContentEl.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-white">All System Reservations</h2>
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-gray-700">
                            <th class="p-3">User</th><th class="p-3">Restaurant</th><th class="p-3">Date & Time</th><th class="p-3">People</th><th class="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.reservations.length === 0 ? '<tr><td colspan="5" class="p-3 text-center text-gray-400">No reservations found.</td></tr>' : data.reservations.map(r => `
                            <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                                <td class="p-3">${r.user.name}</td>
                                <td class="p-3 font-medium text-indigo-400">${r.restaurant.name}</td>
                                <td class="p-3">${new Date(r.date).toLocaleDateString()} at ${r.time}</td>
                                <td class="p-3">${r.people}</td>
                                <td class="p-3"><span class="px-3 py-1 text-xs font-semibold rounded-full ${ r.status === 'Confirmed' ? 'bg-green-500/20 text-green-300' : r.status === 'Declined' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300' }">${r.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

const renderReviewsView = async () => {
    showLoading();
    const data = await fetchData('reviews');
    if (!data) return;

    mainContentEl.innerHTML = `
         <h2 class="text-3xl font-bold mb-6 text-white">Manage All Reviews</h2>
         <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
            <ul class="space-y-4">
                ${data.reviews.length === 0 ? '<p class="text-center text-gray-400">No reviews found.</p>' : data.reviews.map(r => `
                     <li class="p-4 border border-gray-700 rounded-lg flex justify-between items-start">
                        <div>
                            <div class="flex items-center mb-2"><p class="font-bold mr-4">${r.user.name}</p><div class="flex items-center">${[...Array(5)].map((_, i) => `<svg class="w-5 h-5 ${i < r.rating ? 'text-yellow-400' : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`).join('')}</div></div>
                            <p class="text-gray-400 italic">"${r.comment}"</p>
                            <p class="text-xs text-gray-500 mt-1">Restaurant: <span class="font-medium text-indigo-400">${r.restaurant.name}</span></p>
                        </div>
                        <button data-id="${r.id}" class="delete-review-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition">Delete</button>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
};

const renderUsersView = async () => {
    showLoading();
    const data = await fetchData('users');
    if (!data) return;

    mainContentEl.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-white">Manage Users</h2>
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
            <table class="w-full text-left">
                 <thead><tr class="border-b border-gray-700"><th class="p-3">Name</th><th class="p-3">Email</th><th class="p-3">Registered</th><th class="p-3">Status</th><th class="p-3">Action</th></tr></thead>
                <tbody>
                    ${data.users.map(u => `
                        <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                            <td class="p-3">${u.name}</td>
                            <td class="p-3 text-gray-400">${u.email}</td>
                            <td class="p-3">${new Date(u.registered).toLocaleDateString()}</td>
                            <td class="p-3"><span class="px-3 py-1 text-xs font-semibold rounded-full ${u.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}">${u.status}</span></td>
                            <td class="p-3"><button data-id="${u.id}" data-status="${u.status}" class="user-action-btn w-24 text-center bg-${u.status === 'Active' ? 'red' : 'green'}-600 hover:bg-${u.status === 'Active' ? 'red' : 'green'}-700 text-white font-bold py-1 px-3 rounded-md transition">${u.status === 'Active' ? 'Ban' : 'Unban'}</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

const renderRestaurantsView = async () => {
    showLoading();
    const data = await fetchData('restaurants');
    if (!data) return;

    mainContentEl.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-white">Manage Restaurants</h2>
         <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
            <table class="w-full text-left">
                 <thead><tr class="border-b border-gray-700"><th class="p-3">Name</th><th class="p-3">Owner Email</th><th class="p-3">Registered</th><th class="p-3">Status</th><th class="p-3">Action</th></tr></thead>
                <tbody>
                    ${data.restaurants.map(r => `
                        <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                            <td class="p-3 font-medium text-indigo-400">${r.name}</td>
                            <td class="p-3 text-gray-400">${r.owner}</td>
                            <td class="p-3">${new Date(r.registered).toLocaleDateString()}</td>
                            <td class="p-3"><span class="px-3 py-1 text-xs font-semibold rounded-full ${r.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}">${r.status}</span></td>
                            <td class="p-3"><button data-id="${r.id}" data-status="${r.status}" class="restaurant-action-btn w-24 text-center bg-${r.status === 'Active' ? 'red' : 'green'}-600 hover:bg-${r.status === 'Active' ? 'red' : 'green'}-700 text-white font-bold py-1 px-3 rounded-md transition">${r.status === 'Active' ? 'Ban' : 'Unban'}</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

const renderTicketsView = async () => {
    showLoading();
    const data = await fetchData('tickets');
    if (!data) return;

    mainContentEl.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-white">Support Tickets</h2>
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
            <table class="w-full text-left">
                 <thead>
                    <tr class="border-b border-gray-700">
                        <th class="p-3">Ticket ID</th>
                        <th class="p-3">User</th>
                        <th class="p-3">Subject</th>
                        <th class="p-3">Status</th>
                        <th class="p-3">Last Updated</th>
                        <th class="p-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.tickets.map(t => `
                        <tr class="border-b border-gray-700 hover:bg-gray-700/50">
                            <td class="p-3 font-mono text-xs text-gray-400">${t.id}</td>
                            <td class="p-3">${t.user.name}</td>
                            <td class="p-3 font-medium">${t.subject}</td>
                            <td class="p-3"><span class="px-3 py-1 text-xs font-semibold rounded-full ${t.status === 'Open' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}">${t.status}</span></td>
                            <td class="p-3">${new Date(t.lastUpdate).toLocaleString()}</td>
                            <td class="p-3"><button data-id="${t.id}" class="view-ticket-btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-md transition">View</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

const renderLogsView = async () => {
    showLoading();
    const data = await fetchData('logs');
    if (!data) return;

    const getLogLevelClass = (level) => {
        switch (level) {
            case 'INFO': return 'text-blue-300';
            case 'SUCCESS': return 'text-green-300';
            case 'WARN': return 'text-yellow-300';
            case 'ERROR': return 'text-red-300';
            default: return 'text-gray-400';
        }
    };

    mainContentEl.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-white">Activity Logs</h2>
        <div class="bg-black p-4 rounded-lg shadow-inner font-mono text-sm h-full max-h-[70vh] overflow-y-auto border border-gray-700">
            ${data.logs.length === 0 ? '<p class="text-gray-500">No log entries found.</p>' : data.logs.map(log => `
                <div class="flex items-start">
                    <span class="text-gray-500 whitespace-nowrap">${new Date(log.timestamp).toLocaleString()}</span>
                    <span class="font-bold mx-2 ${getLogLevelClass(log.level)}">[${log.level}]</span>
                    <span class="break-all">${log.message}</span>
                </div>
            `).join('')}
        </div>
    `;
};

// --- EVENT HANDLERS ---
const handleMainContentClick = async (e) => {
    // Delete review
    if (e.target.matches('.delete-review-btn')) {
        const reviewId = e.target.dataset.id;
        if (confirm('Are you sure you want to permanently delete this review?')) {
            const result = await fetchData(`reviews/${reviewId}`, { method: 'DELETE' });
            if (result) renderReviewsView();
        }
    }
    // Ban/Unban user
    if (e.target.matches('.user-action-btn')) {
        const button = e.target;
        const userId = button.dataset.id;
        const currentStatus = button.dataset.status;
        const newStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
        
        const result = await fetchData(`users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        if (result) renderUsersView();
    }
     // Ban/Unban restaurant
    if (e.target.matches('.restaurant-action-btn')) {
        const button = e.target;
        const restId = button.dataset.id;
        const currentStatus = button.dataset.status;
        const newStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
        
        const result = await fetchData(`restaurants/${restId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        if (result) renderRestaurantsView();
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
        case 'reservations': renderAllReservationsView(); break;
        case 'reviews': renderReviewsView(); break;
        case 'users': renderUsersView(); break;
        case 'restaurants': renderRestaurantsView(); break;
        case 'tickets': renderTicketsView(); break;
        case 'logs': renderLogsView(); break;
    }
};

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    sidebarNav.addEventListener('click', handleNavigation);
    mainContentEl.addEventListener('click', handleMainContentClick);
    renderAllReservationsView();
    // --- ADD RESTAURANT VIEW ---

const renderAddRestaurantView = () => {
    mainContentEl.innerHTML = `
        <h2 class="text-3xl font-bold mb-6 text-white">Add New Restaurant</h2>
        
        <div class="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xl">
            <form id="add-restaurant-form" class="space-y-4">

                <div>
                    <label class="text-gray-300 font-medium">Restaurant Name</label>
                    <input type="text" id="rest-name" class="w-full mt-1 p-2 bg-gray-900 text-white rounded-md"
                        placeholder="Example: Pizza House" required>
                </div>

                <div>
                    <label class="text-gray-300 font-medium">Location</label>
                    <input type="text" id="rest-location" class="w-full mt-1 p-2 bg-gray-900 text-white rounded-md"
                        placeholder="City, Street, Number" required>
                </div>

                <div>
                    <label class="text-gray-300 font-medium">Owner Email</label>
                    <input type="email" id="rest-owner" class="w-full mt-1 p-2 bg-gray-900 text-white rounded-md"
                        placeholder="owner@example.com" required>
                </div>

                <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-md transition">
                    Add Restaurant
                </button>
            </form>
        </div>
    `;
};

// --- FORM SUBMIT HANDLER ---
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'add-restaurant-form') {
        e.preventDefault();
        
        const name = document.getElementById('rest-name').value.trim();
        const location = document.getElementById('rest-location').value.trim();
        const owner = document.getElementById('rest-owner').value.trim();

        const result = await fetchData('restaurants', {
            method: 'POST',
            body: JSON.stringify({ name, location, owner })
        });

        if (result) {
            alert("Restaurant successfully added!");
            renderRestaurantsView();
        }
    }
});

});

