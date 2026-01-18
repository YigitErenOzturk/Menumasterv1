// --- IMPORTS ---
import { userService } from '../../api/userService.js';
import { authService } from '../../api/authService.js';

// --- DOM Elements ---
const DOM = {
    userName: document.getElementById('user-name'),
    userInitial: document.getElementById('user-initial'),
    mainContent: document.getElementById('main-content'),
    logoutButton: document.getElementById('logout-button'),
    navLinks: {
        dashboard: document.getElementById('nav-dashboard'),
        reservations: document.getElementById('nav-reservations'),
        reviews: document.getElementById('nav-reviews'),
        settings: document.getElementById('nav-settings'),
    }
};
const polishCities = [
    "Warszawa", "Krakow", "Poznan", "Wroclaw", "Gdansk",
    "Lodz", "Szczecin", "Katowice", "Lublin", "Bydgoszcz",
    "Bialystok", "Gdynia", "Czestochowa", "Radom", "Sosnowiec"
];

// --- Helper Functions ---
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
    if (!dateString) return 'Member';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Member';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

// --- Core Functions ---
const checkAuth = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.warn('userId not found.');
    }
};

const setUserInfo = async () => {
    const localName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');

    if (localName && DOM.userName) {
        DOM.userName.textContent = escapeHtml(localName);
        if (DOM.userInitial) DOM.userInitial.textContent = localName.charAt(0).toUpperCase();
    }

    try {
        if (!userId) return;
        const response = await userService.getUserInfo(userId);
        const userData = response.data;

        const displayName = userData.name || userData.username || userData.email || 'Guest User';
        localStorage.setItem('userName', displayName);

        if (DOM.userName) DOM.userName.textContent = escapeHtml(displayName);
        if (DOM.userInitial) DOM.userInitial.textContent = displayName.charAt(0).toUpperCase();
    } catch (error) {
        console.error("User info error:", error);
    }
};

// --- View Rendering Functions ---
const createRestaurantCards = (restaurants) => {
    if (!Array.isArray(restaurants) || restaurants.length === 0) {
        return '<p class="col-span-4 text-center text-gray-400">No restaurants found.</p>';
    }

    return restaurants.map(r => {
        const badgeText = r.rating ? `⭐ ${r.rating}` : 'New';
        return `
            <a href="../restaurantfiles/restaurant-details.html?id=${r.id}&name=${encodeURIComponent(r.name)}" 
               class="block bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300 group border-2 border-transparent hover:border-orange-600">
                <div class="relative h-48 overflow-hidden">
                  <img src="${r.imageUrl || 'https://placehold.co/400x200?text=Restaurant'}" alt="${escapeHtml(r.name)}" class="w-full h-full object-cover group-hover:opacity-75 transition-opacity">
                  <div class="absolute top-2 right-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">${badgeText}</div>
                </div>
                <div class="p-4">
                  <h3 class="text-lg font-semibold text-black truncate">${escapeHtml(r.name)}</h3>
                   <p class="text-gray-700 text-sm mt-2 flex items-center gap-1">
    <span class="text-orange-500">📍</span>
    <span class="font-medium">${escapeHtml(r.city || 'Unknown')}</span>
  </p>
                  <p class="text-gray-600 text-sm mt-2 uppercase tracking-wider text-xs">${escapeHtml(r.address || 'Global')}</p>
                </div>
            </a>
        `;
    }).join('');
};

window.renderDashboardView = async () => {
    DOM.mainContent.innerHTML = `
        <div class="animate-fade-in">
            <h1 class="text-3xl font-bold text-orange-500 mb-6">Discover Restaurants</h1>
            <div class="mb-8">
                <label for="city-select" class="text-sm font-medium text-gray-900">Filter by City:</label>
                <select id="city-select" class="mt-2 w-full max-w-sm p-3 border border-gray-300 rounded-lg outline-none focus:ring-orange-500">
                    <option value="">All Cities (Popular)</option>
                </select>
            </div>
            <div id="restaurant-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div class="col-span-4 flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>
            </div>
        </div>`;

    const citySelect = document.getElementById('city-select');

    try {
        const res = await userService.getCities();
        if (Array.isArray(res.data)) {
            citySelect.innerHTML += res.data
                .map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
                .join('');
        }
    } catch (e) {
        console.error("Cities fetch error", e);
    }

    const loadRestaurants = async (filter = '') => {
        const grid = document.getElementById('restaurant-grid');
        grid.innerHTML = '<div class="col-span-4 flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>';

        try {
            const response = filter ? await userService.getRestaurantsByCity(filter) : await userService.getAllRestaurants();
            grid.innerHTML = createRestaurantCards(response.data);
        } catch (e) {
            grid.innerHTML = '<p class="col-span-4 text-center text-red-500">Failed to load restaurants.</p>';
        }
    };

    citySelect.addEventListener('change', (e) => loadRestaurants(e.target.value));
    loadRestaurants();
};

window.renderReservationsView = async () => {
    DOM.mainContent.innerHTML = `
        <div class="animate-fade-in">
          <h1 class="text-3xl font-bold text-white mb-6 uppercase tracking-tight">My Reservations</h1>
          <div id="reservations-list" class="grid grid-cols-1 gap-4">
            <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>
          </div>
        </div>`;

    const listEl = document.getElementById('reservations-list');

    try {
        const response = await userService.getMyReservations();
        const reservations = response.data;

        if (!reservations || reservations.length === 0) {
            listEl.innerHTML = `<div class="text-center py-16 bg-white/90 rounded-2xl border-2 border-dashed border-orange-400">
                <p class="text-orange-600 text-lg">You don't have any reservations yet.</p>
                <button onclick="renderDashboardView()" class="mt-4 text-orange-500 hover:text-orange-600 font-bold">Discover Restaurants →</button>
            </div>`;
            return;
        }

        listEl.innerHTML = reservations.map(res => {
            const statusClass =
                res.status === 'Confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    res.status === 'Declined' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

            return `
                <div class="bg-white p-6 rounded-2xl border border-orange-600 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-orange-500/50 transition-colors shadow-xl">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center text-orange-400">
                       <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m4 0h1m-5 4h1m4 0h1m-5 4h1m4 0h1" /></svg>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-black">${escapeHtml(res.restaurantName)}</h3>
                      <div class="flex items-center gap-3 mt-1 text-gray-800 text-sm">
                        <span>📅 ${new Date(res.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>👥 ${res.peopleCount} People</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${statusClass}">${res.status || 'Pending'}</span>
                    <button onclick="cancelReservation(${res.id})" class="text-gray-500 hover:text-red-400 p-2 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>`;
        }).join('');
    } catch (e) {
        console.error("Reservations view error", e);
    }
};

window.cancelReservation = async (id) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
        await userService.cancelReservation(id);
        window.renderReservationsView();
    } catch (error) {
        alert('Failed to cancel reservation.');
    }
};

window.renderReviewsView = async () => {
    DOM.mainContent.innerHTML = `<div class="animate-fade-in"><h1 class="text-3xl font-bold text-white mb-6">My Reviews</h1><div id="reviews-list" class="space-y-4"></div></div>`;
    const listEl = document.getElementById('reviews-list');

    try {
        const response = await userService.getMyReviews();
        const reviews = response.data;

        if (!reviews || reviews.length === 0) {
            listEl.innerHTML = `<p class="text-center text-gray-400 py-8">No reviews written yet.</p>`;
            return;
        }

        listEl.innerHTML = reviews.map(rev => {
            const stars = '⭐'.repeat(rev.rating || 0);
            return `
                <div id="review-card-${rev.id}" class="bg-gray p-6 rounded-2xl border border-orange-600 shadow-xl">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h3 class="text-xl font-bold text-black">${escapeHtml(rev.restaurantName)}</h3>
                      <div class="text-yellow-500 mt-1 text-sm">${stars}</div>
                    </div>
                    <div class="flex gap-2">
                      <button onclick="editReviewInline(${rev.id}, ${rev.rating}, '${escapeHtml(rev.comment)}')" class="p-2 text-black hover:text-yellow-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onclick="deleteReview(${rev.id})" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  <p class="text-black italic leading-relaxed text-lg">"${escapeHtml(rev.comment)}"</p>
                </div>`;
        }).join('');
    } catch (e) {
        console.error("Reviews view error", e);
    }
};

window.deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
        await userService.deleteReview(id);
        document.getElementById(`review-card-${id}`).remove();
    } catch (error) {
        console.error("Delete review error:", error);
    }
};

window.currentEditRating = 0;
window.editReviewInline = (id, oldRating, oldComment) => {
    window.currentEditRating = oldRating;
    const card = document.getElementById(`review-card-${id}`);
    card.innerHTML = `
        <div class="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">Edit Review</h3>
            <div class="flex items-center space-x-1 mb-4">
                ${[1, 2, 3, 4, 5].map(num => `
                    <svg onclick="window.updateStarSelection(${id}, ${num})" id="star-${id}-${num}" class="w-8 h-8 cursor-pointer ${num <= oldRating ? 'text-yellow-500' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                `).join('')}
            </div>
            <textarea id="edit-comment-${id}" class="w-full p-4 border rounded-xl mb-4" rows="4">${oldComment}</textarea>
            <div class="flex gap-3">
                <button onclick="window.saveReview(${id})" class="bg-orange-600 text-white px-6 py-2 rounded-xl font-bold">Update</button>
                <button onclick="window.renderReviewsView()" class="text-gray-500">Cancel</button>
            </div>
        </div>`;
};

window.updateStarSelection = (reviewId, rating) => {
    window.currentEditRating = rating;
    for (let i = 1; i <= 5; i++) {
        const star = document.getElementById(`star-${reviewId}-${i}`);
        star.classList.toggle('text-yellow-500', i <= rating);
        star.classList.toggle('text-gray-300', i > rating);
    }
};

window.saveReview = async (id) => {
    const newComment = document.getElementById(`edit-comment-${id}`).value;
    try {
        await userService.updateReview(id, { rating: window.currentEditRating, comment: newComment });
        window.renderReviewsView();
    } catch (e) {
        alert('Update failed.');
    }
};

window.renderSettingsView = async () => {
    const userId = localStorage.getItem('userId');
    try {
        const response = await userService.getUserInfo(userId);
        const userData = response.data;
        const registrationDate = formatDate(userData.createdDate);

        DOM.mainContent.innerHTML = `
            <div class="animate-fade-in max-w-4xl mx-auto p-4">
              <h1 class="text-3xl font-bold text-orange uppercase mb-6">Account Settings</h1>
              <p class="text-orange-600 mb-6 font-semibold">Member Since: ${registrationDate}</p>
              <form id="settings-form" class="bg-white p-8 rounded-2xl border border-orange-400 shadow-2xl space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label class="block text-xs font-bold uppercase mb-2">Full Name</label><input type="text" id="set-name" value="${escapeHtml(userData.name)}" class="w-full p-3 bg-gray-100 border rounded-xl"></div>           
                  <div><label class="block text-xs font-bold uppercase mb-2">Username</label><input type="text" id="set-username" value="${escapeHtml(userData.username)}" class="w-full p-3 bg-gray-300 text-gray-500 border rounded-xl cursor-not-allowed" readonly></div>
                </div>
                <div>
                    <label class="block text-xs font-bold uppercase mb-2">City</label>
                    <select id="set-city" class="w-full p-3 bg-gray-100 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer">
                        <option value="" disabled ${!userData.city ? 'selected' : ''}>Select your city</option>
                        ${polishCities.map(city => `
                            <option value="${city}" ${userData.city === city ? 'selected' : ''}>
                                ${city}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div><label class="block text-xs font-bold uppercase mb-2">Email</label><input type="email" id="set-email" value="${escapeHtml(userData.email)}" class="w-full p-3 bg-gray-300 text-gray-500 border rounded-xl cursor-not-allowed" readonly></div>
                <div><label class="block text-xs font-bold uppercase mb-2">Phone</label><input type="text" id="set-phone" value="${escapeHtml(userData.phoneNumber || '')}" class="w-full p-3 bg-gray-100 border rounded-xl"></div>
                <div><label class="block text-xs font-bold uppercase mb-2">Address</label><textarea id="set-address" rows="3" class="w-full p-3 bg-gray-100 border rounded-xl resize-none">${escapeHtml(userData.address || '')}</textarea></div>
                <button type="submit" class="w-full bg-orange-500 text-white font-black py-4 rounded-xl shadow-lg">SAVE CHANGES</button>
              </form>
              <div class="mt-6 bg-white p-8 rounded-2xl border border-orange-400 shadow-2xl">
 <h2 class="text-xl font-extrabold text-gray-900 mb-2">Reset Password</h2>
  <p class="text-gray-600 mb-4 text-sm">We will send a verification code to your email.</p>

  <button id="open-reset-modal"
    class="w-full bg-black text-white font-black py-4 rounded-xl shadow-lg hover:opacity-90">
    RESET PASSWORD
  </button>
</div>

<!-- Reset Password Modal -->
<div id="fpModal" class="fixed inset-0 hidden bg-black/50 backdrop-blur-sm items-center justify-center z-50">
  <div class="bg-white rounded-2xl shadow-2xl p-6 w-[95%] max-w-md border-t-4 border-orange-500">
    <h2 class="text-2xl font-extrabold text-gray-900 mb-4">Reset Password</h2>

    <!-- Step 1 -->
    <div id="fpStep1">
      <label class="block text-sm font-bold mb-2">Email</label>
      <input id="fpEmail" type="email" class="w-full p-3 border rounded-xl bg-gray-50" placeholder="Enter your email" />
      <button id="fpSendCode" class="w-full mt-4 bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700">
        Send Verification Code
      </button>
    </div>

    <!-- Step 2 -->
    <div id="fpStep2" class="hidden">
      <label class="block text-sm font-bold mb-2">Verification Code</label>
      <input id="fpCode" type="text" class="w-full p-3 border rounded-xl bg-gray-50" placeholder="Enter the code" />
      <button id="fpGoPass" class="w-full mt-4 bg-black text-white font-bold py-3 rounded-xl hover:opacity-90">
        Continue
      </button>
    </div>

    <!-- Step 3 -->
    <div id="fpStep3" class="hidden">
      <label class="block text-sm font-bold mb-2">New Password</label>
      <input id="fpNewPass" type="password" class="w-full p-3 border rounded-xl bg-gray-50" placeholder="New password" />

      <label class="block text-sm font-bold mt-3 mb-2">Confirm Password</label>
      <input id="fpNewPass2" type="password" class="w-full p-3 border rounded-xl bg-gray-50" placeholder="Confirm password" />

      <button id="fpResetBtn" class="w-full mt-4 bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700">
        Reset Password
      </button>
    </div>

    <p id="fpMsg" class="mt-4 text-center text-sm font-semibold"></p>

    <button id="fpClose" class="w-full mt-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold">
      Close
    </button>
  </div>
</div>

              <div id="settings-message" class="mt-4 text-center font-bold"></div>
            </div>`;
        attachSettingsListeners(userId, userData);
        attachResetPasswordModal(userData.email);
    } catch (e) {
        console.error("Settings load error", e);
    }
};

const attachSettingsListeners = (userId, originalUserData) => {
    const settingsForm = document.getElementById('settings-form');
    if (!settingsForm) return;

    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('settings-message');

        const payload = {
            ...originalUserData,
            name: document.getElementById('set-name').value.trim(),
            city: document.getElementById('set-city').value.trim(),
            phoneNumber: document.getElementById('set-phone').value.trim(),
            address: document.getElementById('set-address').value.trim(),
        };

        try {
            msg.textContent = " SAVING...";
            msg.className = "mt-4 text-center text-orange-600 font-bold";

            const res = await userService.updateUser(userId, payload);

            if (res.status === 200 || res.status === 204 || !res.data.error) {
                localStorage.setItem('userName', payload.name);

                msg.textContent = "✓ SUCCESSFULLY UPDATED!";
                msg.className = "mt-4 text-center text-green-600 font-bold";

                setUserInfo();

                setTimeout(() => renderSettingsView(), 2000);
            }
        } catch (err) {
            console.error("Update error details:", err.response?.data || err);
            msg.textContent = "❌ UPDATE FAILED! " + (err.response?.data?.message || "");
            msg.className = "mt-4 text-center text-red-500 font-bold";
        }
    });
};

// --- Navigation & Router ---
const handleNavigation = (e) => {
    e.preventDefault();
    Object.values(DOM.navLinks).forEach(l => l && l.classList.remove('bg-orange-600', 'text-white'));
    e.currentTarget.classList.add('bg-orange-600', 'text-white');

    const viewMap = {
        'nav-dashboard': window.renderDashboardView,
        'nav-reservations': window.renderReservationsView,
        'nav-reviews': window.renderReviewsView,
        'nav-settings': window.renderSettingsView,
    };

    if (viewMap[e.currentTarget.id]) viewMap[e.currentTarget.id]();
};

const handleLogout = (e) => {
    if (confirm('Logout?')) {
        localStorage.clear();
        window.location.href = '../commonfiles/main-page.html';
    }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setUserInfo();
    window.renderDashboardView();

    if (DOM.logoutButton) DOM.logoutButton.addEventListener('click', handleLogout);
    Object.values(DOM.navLinks).forEach(link => {
        if (link) link.addEventListener('click', handleNavigation);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const helpLink = document.getElementById("help-link");

    if (helpLink) {
        helpLink.addEventListener("click", (e) => {
            e.preventDefault();
            let modal = document.getElementById('help-modal');
            if (!modal) {
                const modalHTML = `
                <div id="help-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div class="bg-white rounded-lg shadow-2xl p-6 max-w-md text-center border-t-4 border-orange-500">
                        <h2 class="text-2xl font-bold text-gray-800 mb-3">Need Help?</h2>
                        <p class="text-gray-600 mb-4">You can reach us at <span class="text-orange-600 font-medium">support@menumaster.com</span> or chat with our bot!</p>
                        <button id="close-help-dynamic" class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-md">Close</button>
                    </div>
                </div>`;
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                modal = document.getElementById('help-modal');
                document.getElementById('close-help-dynamic').addEventListener('click', () => modal.classList.add('hidden'));
            }
            modal.classList.remove("hidden");
        });
    }
});

function attachResetPasswordModal(defaultEmail = "") {
    const openBtn = document.getElementById("open-reset-modal");

    const fpModal = document.getElementById("fpModal");
    const fpStep1 = document.getElementById("fpStep1");
    const fpStep2 = document.getElementById("fpStep2");
    const fpStep3 = document.getElementById("fpStep3");

    const fpEmail = document.getElementById("fpEmail");
    const fpCode = document.getElementById("fpCode");
    const fpNewPass = document.getElementById("fpNewPass");
    const fpNewPass2 = document.getElementById("fpNewPass2");

    const fpSendCode = document.getElementById("fpSendCode");
    const fpGoPass = document.getElementById("fpGoPass");
    const fpResetBtn = document.getElementById("fpResetBtn");
    const fpClose = document.getElementById("fpClose");
    const fpMsg = document.getElementById("fpMsg");

    if (!openBtn || !fpModal) return;

    const show = (el) => el.classList.remove("hidden");
    const hide = (el) => el.classList.add("hidden");

    const showMsg = (text, ok = true) => {
        fpMsg.textContent = text;
        fpMsg.className = ok
            ? "mt-4 text-center text-sm font-semibold text-green-600"
            : "mt-4 text-center text-sm font-semibold text-red-600";
    };

    const open = () => {
        fpEmail.value = defaultEmail || "";
        fpCode.value = "";
        fpNewPass.value = "";
        fpNewPass2.value = "";
        fpMsg.textContent = "";

        show(fpModal);
        fpModal.classList.add("flex");
        fpModal.classList.remove("hidden");

        // step reset
        show(fpStep1); hide(fpStep2); hide(fpStep3);
    };

    const close = () => {
        fpModal.classList.add("hidden");
        fpModal.classList.remove("flex");
    };

    openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        open();
    });

    fpClose.addEventListener("click", close);

    // click outside closes
    fpModal.addEventListener("click", (e) => {
        if (e.target === fpModal) close();
    });

    // STEP 1: send code
    fpSendCode.addEventListener("click", async () => {
        const email = fpEmail.value.trim();
        if (!email) return showMsg("Email is required.", false);

        try {
            showMsg("Sending verification code...", true);
            await authService.forgotPassword(email);
            showMsg("Verification code sent. Check your email.", true);

            hide(fpStep1); show(fpStep2);
        } catch (err) {
            showMsg("Failed to send verification code.", false);
        }
    });

    // STEP 2: go to password step
    fpGoPass.addEventListener("click", (e) => {
        e.preventDefault();
        const code = fpCode.value.trim();
        if (!code) return showMsg("Verification code is required.", false);

        showMsg("Code received. Please set a new password.", true);
        hide(fpStep2); show(fpStep3);
    });

    // STEP 3: reset
    fpResetBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const email = fpEmail.value.trim();
        const code = fpCode.value.trim();
        const pass1 = fpNewPass.value;
        const pass2 = fpNewPass2.value;

        if (!pass1 || !pass2) return showMsg("Password is required.", false);
        if (pass1 !== pass2) return showMsg("Passwords do not match.", false);
        if (pass1.length < 6) return showMsg("Password must be at least 6 characters.", false);

        try {
            showMsg("Resetting password...", true);
            await authService.resetPassword(code, pass1, email);
            showMsg("Password reset successful.", true);

            setTimeout(close, 800);
        } catch (err) {
            showMsg("Password reset failed.", false);
        }
    });
}
