// --- CONFIGURASYON ---
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  CATEGORIES: ['Starter', 'Main Course', 'Drinks', 'Desserts', 'Salads'],
  ENDPOINTS: {
    MENU: 'restaurants/menu',
    RESERVATIONS: 'restaurants/reservations',
    REVIEWS: 'restaurants/reviews',
    TICKETS: 'restaurants/tickets',
    GET_INFO: () => `restaurants/${localStorage.getItem("restaurantId")}`,
    UPDATE: (id) => `restaurants/update/${id}`,
  },
};

// --- DOM Elements ---
const DOM = {
  mainContent: document.getElementById('main-content'),
  sidebarNav: document.getElementById('sidebar-nav'),
  logoutButton: document.getElementById('logout-button'),
  restaurantNameDisplay: document.getElementById('res-name-display'),
  restaurantLogoDisplay: document.getElementById('res-logo-display'),
};

// --- Helper functions ---
const showLoading = () => {
  DOM.mainContent.innerHTML = `
    <div class="flex justify-center items-center h-full">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent"></div>
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
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `HTTP Error: ${response.status}` }));
      throw new Error(errorData.message || `Server Error (${response.status})`);
    }

    if (response.status === 204) return { success: true };
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { error: true, message: error.message };
  }
};

// --- Restaurant info ---
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

// --- Renderers (DİĞERLERİNE DOKUNMADIK) ---
window.renderReservationsView = async (filter = 'pending') => {
  showLoading();

  const data = await fetchData('reservations/by-restaurant');
  let reservations = (data && !data.error) ? (data.reservations || []) : [];
  const now = new Date();

  if (filter === 'pending') {
    reservations = reservations.filter((r) => r.status === 'Pending');
  } else if (filter === 'confirmed') {
    reservations = reservations.filter((r) => r.status === 'Confirmed' && new Date(r.date) >= now);
  } else if (filter === 'declined') {
    reservations = reservations.filter((r) => r.status === 'Declined');
  } else if (filter === 'completed') {
    reservations = reservations.filter((r) => r.status === 'Confirmed' && new Date(r.date) < now);
  }

  DOM.mainContent.innerHTML = `
    <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 animate-fade-in">
      <h2 class="text-3xl font-bold text-gray-800">Reservations</h2>
      <div class="flex bg-gray-100 p-1 rounded-xl border border-gray-200 w-full xl:w-auto overflow-x-auto">
        <button onclick="renderReservationsView('pending')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${
          filter === 'pending'
            ? 'bg-white text-yellow-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }">Pending</button>

        <button onclick="renderReservationsView('confirmed')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${
          filter === 'confirmed'
            ? 'bg-white text-green-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }">Confirmed</button>

        <button onclick="renderReservationsView('completed')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${
          filter === 'completed'
            ? 'bg-white text-gray-500 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }">Completed</button>

        <button onclick="renderReservationsView('declined')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${
          filter === 'declined'
            ? 'bg-white text-red-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }">Declined</button>

        <button onclick="renderReservationsView('all')" class="flex-1 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap ${
          filter === 'all'
            ? 'bg-white text-orange-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }">All History</button>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-fade-in">
      <ul class="space-y-4">
        ${
          reservations.length === 0
            ? `<p class="text-gray-500 text-center py-8">No ${filter} reservations found.</p>`
            : reservations
                .map((r) => {
                  const customerName =
                    r.userName || r.UserName || (r.user && r.user.name) || 'Guest';
                  const peopleCount = r.peopleCount || r.people || 0;

                  const resDate = new Date(r.date);
                  const timeString =
                    r.time || resDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  let displayStatus = r.status;
                  if (r.status === 'Confirmed' && resDate < now) displayStatus = 'Completed';

                  const statusStyles = {
                    Confirmed: 'bg-green-100 text-green-800 border-green-200',
                    Declined: 'bg-red-100 text-red-800 border-red-200',
                    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    Completed: 'bg-gray-100 text-gray-500 border-gray-200',
                  };

                  return `
                    <li class="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center transition hover:shadow-sm">
                      <div>
                        <p class="font-bold text-lg text-gray-800">${escapeHtml(customerName)}</p>
                        <p class="text-gray-600 text-sm mt-1">
                          <span>👥 ${peopleCount} Person</span>
                          <span class="ml-3">📅 ${resDate.toLocaleDateString()} 🕒 ${timeString}</span>
                        </p>
                      </div>

                      <div class="flex items-center space-x-2 mt-3 sm:mt-0">
                        <span class="px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                          statusStyles[displayStatus] || 'bg-gray-100'
                        }">${displayStatus}</span>

                        ${
                          displayStatus === 'Pending'
                            ? `<div class="flex space-x-1 ml-2">
                                <button onclick="updateReservation('${r.id}', 'Confirmed')" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition">Accept</button>
                                <button onclick="updateReservation('${r.id}', 'Declined')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition">Decline</button>
                              </div>`
                            : ''
                        }
                      </div>
                    </li>
                  `;
                })
                .join('')
        }
      </ul>
    </div>
  `;
};

const renderMenuView = async () => {
  showLoading();

  const data = await fetchData(API_CONFIG.ENDPOINTS.MENU);
  const menuItems = (data && !data.error) ? (data.menu || []) : [];

  // Dinamik kategori listesi (Benzersiz)
  const dynamicCategories = [
    ...new Set([
      ...API_CONFIG.CATEGORIES,
      ...menuItems.map((item) => item.category).filter(Boolean),
    ]),
  ].sort(); // Alfabetik sıralama

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
        ${
          Object.keys(groupedMenu).length === 0
            ? '<p class="text-gray-500 italic">Menu is empty.</p>'
            : Object.entries(groupedMenu)
                .map(([category, items]) => `
                  <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h3 class="text-xl font-bold mb-4 text-orange-600 border-b pb-2 uppercase tracking-wide">${category}</h3>
                    <ul class="space-y-3">
                      ${items
                        .map((item) => `
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
                        `)
                        .join('')}
                    </ul>
                  </div>
                `)
                .join('')
        }
      </div>

      <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit sticky top-6">
        <h3 class="text-xl font-semibold mb-4 text-orange-600">Add New Item</h3>

        <form id="add-menu-item-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium">Name</label>
            <input name="name" type="text" class="mt-1 block w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" required>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <div class="relative mt-1">
              <select
                id="category-select"
                name="category"
                class="block w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none cursor-pointer transition-all"
                onchange="toggleCategoryInput(this.value)"
                required
              >
                <option value="" disabled selected>Select Category</option>
                ${dynamicCategories
                  .map((cat, index) => {
                    // index çift ise (0, 2, 4...) beyaz, tek ise (1, 3, 5...) turuncu
                    const bgColor = index % 2 === 0 ? '#ffffff' : '#fff7ed';
                    return `<option value="${cat}" style="background-color: ${bgColor}; color: #9a3412; padding: 10px;">${cat}</option>`;
                  })
                  .join('')}
                <option value="NEW_CATEGORY" class="font-bold text-orange-600 bg-white border-t border-orange-200">+ Add New Category</option>
              </select>

              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-orange-600">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" stroke-width="2" />
                </svg>
              </div>
            </div>

            <div id="new-category-container" class="hidden mt-2 flex gap-2 animate-fade-in">
              <input
                id="new-category-input"
                type="text"
                placeholder="Enter Category Name"
                class="flex-1 border border-orange-300 rounded-lg p-2.5 bg-orange-50 text-orange-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                class="bg-red-50 text-red-500 font-bold px-3 rounded-lg hover:bg-red-100 transition"
                onclick="resetCategorySelection()"
              >✕</button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium">Price (PLN)</label>
            <input name="price" type="number" step="0.5" class="mt-1 block w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500" required>
          </div>

          <div>
            <label class="block text-sm font-medium">Description</label>
            <textarea name="description" rows="3" class="mt-1 block w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500 resize-none"></textarea>
          </div>

          <button type="submit" class="w-full bg-orange-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:bg-orange-700 transition">
            Add to Menu
          </button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('add-menu-item-form');
  if (form) form.addEventListener('submit', handleAddMenuSubmit);
};

// --- SETTINGS VIEW (USER PANELİ GİBİ KURGULANDI) ---
const renderSettingsView = async () => {
  showLoading();

  const resId = localStorage.getItem("restaurantId");
  const data = await fetchData(API_CONFIG.ENDPOINTS.GET_INFO());
  const resData = (data && !data.error) ? (data.restaurant || data) : null;

  const registrationDate = formatDate(resData.createdDate || resData.createdAt);

  DOM.mainContent.innerHTML = `
    <div class="animate-fade-in max-w-4xl mx-auto p-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-orange-200 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 uppercase tracking-tight">Restaurant Settings</h1>
          <div class="flex items-center gap-2 mt-2 text-orange-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-xs font-semibold uppercase tracking-widest">Partner Since: ${registrationDate}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white p-8 rounded-2xl border border-orange-100 shadow-xl">
            <h2 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="w-2 h-6 bg-orange-500 rounded-full"></span> Profile Information
            </h2>

            <form id="settings-form" class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Restaurant Name</label>
                <input type="text" id="set-name" value="${escapeHtml(resData.name)}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all">
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Email</label>
                  <input type="email" value="${escapeHtml(resData.email)}" disabled class="w-full p-3 bg-gray-100 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed">
                </div>

                <div>
                  <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                  <input type="text" id="set-phone" value="${escapeHtml(resData.phoneNumber || '')}" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                <textarea id="set-description" rows="3" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none">${escapeHtml(resData.description || '')}</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Address</label>
                <textarea id="set-address" rows="2" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none">${escapeHtml(resData.address || '')}</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Restaurant Image</label>

                <div id="drop-area" class="relative border-4 border-dashed border-orange-100 rounded-2xl transition-all hover:border-orange-500 bg-gray-50 h-64 flex items-center justify-center overflow-hidden group cursor-pointer ${
                  resData.imageUrl ? 'has-image' : ''
                }">
                  <input type="file" id="file-input" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50">

                  <div class="absolute inset-0 bg-black/60 items-center justify-center hidden group-hover:flex z-40 pointer-events-none transition-opacity duration-300">
                    <div class="text-center text-white p-4">
                      <svg class="w-10 h-10 mx-auto mb-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p class="text-sm font-black uppercase tracking-widest">Change Photo</p>
                    </div>
                  </div>

                  <img id="img-preview" src="${resData.imageUrl || ''}" class="absolute inset-0 w-full h-full object-cover ${
                    resData.imageUrl ? '' : 'hidden'
                  } z-30">

                  <div class="flex flex-col items-center justify-center space-y-2 z-10" id="upload-placeholder">
                    <svg class="w-12 h-12 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <p class="text-xs font-bold text-gray-400 uppercase">Click to Upload</p>
                  </div>
                </div>
              </div>

              <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl transition-all shadow-lg">
                SAVE CHANGES
              </button>
            </form>

            <div id="settings-message" class="mt-4 text-center font-bold text-sm"></div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white p-8 rounded-2xl border border-orange-100 shadow-lg text-center">
            <h2 class="text-lg font-bold text-gray-800 mb-4 italic">Security</h2>
            <button id="forgot-pass-btn" class="w-full border-2 border-orange-500/20 text-orange-600 hover:bg-orange-600 hover:text-white font-bold py-3 rounded-xl transition-all">
              Send Reset Link
            </button>
            <div id="forgot-message" class="mt-4 text-center text-xs font-medium uppercase tracking-widest"></div>
          </div>
        </div>
      </div>
    </div>
  `;

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
        imageUrl: currentBase64Image || imgPreview.src,
      };

      try {
        msg.textContent = "SAVING...";
        msg.className = "mt-4 text-center text-orange-400 font-bold animate-pulse";

        const res = await fetchData(API_CONFIG.ENDPOINTS.UPDATE(resId), {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        if (!res.error) {
          msg.textContent = "✓ SETTINGS UPDATED SUCCESSFULLY!";
          msg.className = "mt-4 text-center text-green-600 font-bold";
          setRestaurantInfo();
          setTimeout(() => renderSettingsView(), 2000);
        } else {
          throw new Error();
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
      fMsg.textContent = "SENDING...";
      fMsg.className = "mt-4 text-center text-orange-400 animate-pulse";

      const res = await fetchData('Auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: resEmail }),
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
  const result = await fetchData(`reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: status }),
  });
  if (result && !result.error) renderReservationsView();
};

window.deleteMenuItem = async (id) => {
  if (!confirm('Delete this item?')) return;
  const result = await fetchData(`${API_CONFIG.ENDPOINTS.MENU}/${id}`, { method: 'DELETE' });
  if (result && !result.error) renderMenuView();
};

const handleAddMenuSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const newItem = Object.fromEntries(formData.entries());
  newItem.price = parseFloat(newItem.price);

  const result = await fetchData(API_CONFIG.ENDPOINTS.MENU, {
    method: 'POST',
    body: JSON.stringify(newItem),
  });

  if (result && !result.error) {
    e.target.reset();
    renderMenuView();
  }
};

// --- ROUTER ---
const handleNavigation = (e) => {
  const link = e.target.closest('.sidebar-link');
  if (!link) return;

  e.preventDefault();

  const targetId = link.getAttribute('href').substring(1);
  document.querySelectorAll('.sidebar-link').forEach((l) => l.classList.remove('active'));
  link.classList.add('active');

  switch (targetId) {
    case 'reservations':
      renderReservationsView();
      break;
    case 'menu':
      renderMenuView();
      break;
    case 'settings':
      renderSettingsView();
      break;
    case 'reviews':
      renderReviewsView();
      break;
    case 'tickets':
      DOM.mainContent.innerHTML = `<div class="p-8 text-center text-gray-500">Feature coming soon!</div>`;
      break;
    default:
      renderReservationsView();
  }
};

const handleLogout = (e) => {
  e.preventDefault();
  if (confirm('Logout?')) {
    localStorage.clear();
    window.location.href = '../commonfiles/main-page.html';
  }
};

window.renderReviewsView = async function renderReviewsView()  {
  DOM.mainContent.innerHTML = `
    <div class="p-6">
      <h2 class="text-3xl font-bold mb-4 text-gray-800">Customer Reviews</h2>
      <div id="reviewsList" class="text-gray-500">Loading reviews...</div>
    </div>
  `;

  const listEl = document.getElementById("reviewsList");

  try {
    const restaurantId = localStorage.getItem("restaurantId");
    if (!restaurantId) {
      listEl.innerHTML = `<div class="text-red-600 font-bold">restaurantId localStorage'da yok.</div>`;
      return;
    }

    let data = await fetchData(
      `${API_CONFIG.ENDPOINTS.REVIEWS}?restaurantId=${encodeURIComponent(restaurantId)}`
    );
    if (data?.error) throw new Error(data.message || "Failed to fetch reviews");

    let reviews =
      Array.isArray(data) ? data :
      Array.isArray(data.reviews) ? data.reviews :
      Array.isArray(data.data) ? data.data :
      [];

    // (opsiyonel) A boşsa B'yi dene
    if (!reviews.length) {
      data = await fetchData(`restaurants/${restaurantId}/reviews`);
      if (!data?.error) {
        reviews =
          Array.isArray(data) ? data :
          Array.isArray(data.reviews) ? data.reviews :
          Array.isArray(data.data) ? data.data :
          [];
      }
    }

    if (!reviews.length) {
      listEl.innerHTML = `<div class="text-gray-500">No reviews yet.</div>`;
      return;
    }

    listEl.innerHTML = `
      <div class="flex items-center justify-between mb-5">
        <div>
          <p class="text-sm text-gray-500 uppercase tracking-widest font-bold">Total Reviews</p>
          <p class="text-2xl font-black text-gray-800">${reviews.length}</p>
        </div>

        <div class="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
          </svg>
          Customer Feedback
        </div>
      </div>

      <div class="space-y-4">
        ${reviews
          .map((r) => {
            const user = escapeHtml(r.userName || r.user?.name || "Anonymous");
            const date = formatDate(r.createdAt || r.createdDate || r.date);
            const rating = Number(r.rating) || 0;

            const badge =
              rating >= 4 ? 'bg-green-50 text-green-700 border-green-200' :
              rating >= 3 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              'bg-red-50 text-red-700 border-red-200';

            return `
              <div class="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition p-5">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center font-black text-orange-700">
                      ${user.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p class="font-black text-gray-800">${user}</p>
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">${escapeHtml(date)}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <span class="px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest ${badge}">
                      ${rating}/5
                    </span>
                    <div class="text-sm">${renderStars(r.rating)}</div>
                  </div>
                </div>

                <div class="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4 text-gray-700 leading-relaxed">
                  ${escapeHtml(r.comment || r.text || r.message || "No comment.")}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `
      <div class="text-red-600 font-bold">
        Reviews couldn't load: ${escapeHtml(String(err.message || err))}
      </div>
    `;
  }
}

function renderStars(rating) {
  const n = Math.max(0, Math.min(5, Number(rating) || 0));
  const rr = Math.round(n);

  return `
    <span class="text-orange-500">${"★".repeat(rr)}</span>
    <span class="text-gray-300">${"☆".repeat(5 - rr)}</span>
  `;
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  if (DOM.sidebarNav) DOM.sidebarNav.addEventListener('click', handleNavigation);
  if (DOM.logoutButton) DOM.logoutButton.addEventListener('click', handleLogout);

  setRestaurantInfo();
  renderReservationsView('pending');
});

document.addEventListener("DOMContentLoaded", () => {
            const helpLink = document.getElementById("help-link");

            if (helpLink) {
                helpLink.addEventListener("click", (e) => {
                    e.preventDefault();
                    let modal = document.getElementById('help-modal');

                    if (!modal) {
                        const modalHTML = `
                <div id="help-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div class="bg-white rounded-lg shadow-2xl p-6 max-w-md text-center border-t-4 border-orange-500">
                        <h2 class="text-2xl font-bold text-gray-800 mb-3">Need Help?</h2>
                        <p class="text-gray-600 mb-4">You can reach us at <span class="text-orange-600 font-medium">support@menumaster.com</span> or chat with our bot!</p>
                        <button id="close-help-dynamic" class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-md">Close</button>
                    </div>
                </div>`;
                        document.body.insertAdjacentHTML('beforeend', modalHTML);
                        modal = document.getElementById('help-modal');

                        document.getElementById('close-help-dynamic').addEventListener('click', () => {
                            modal.classList.add('hidden');
                        });
                    }

                    modal.classList.remove("hidden");
                });
            }
        });