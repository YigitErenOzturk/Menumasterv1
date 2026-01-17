const API_BASE_URL = 'http://localhost:5000/api';

const mainContentEl = document.getElementById('main-content');
const loadingIndicator = document.getElementById('loading-indicator');

// --- Utility Functions ---
const getRestaurantIdFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

const getRestaurantNameFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('name') || 'Restaurant';
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

const fetchData = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/${endpoint}`;
  const authToken = localStorage.getItem('authToken');
  const headers = { 'Content-Type': 'application/json', ...(authToken && { 'Authorization': `Bearer ${authToken}` }) };

  try {
    const response = await fetch(url, { headers, ...options });
    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    return { error: true, message: error.message };
  }
};

const fetchMenu = async (restaurantId) => {
  const data = await fetchData(`restaurants/menu/${restaurantId}`);
  return data.error ? [] : (data.menu || []);
};

// Added Fetch Reviews
const fetchReviews = async (restaurantId) => {
  const data = await fetchData(`reviews/restaurant/${restaurantId}`);
  return data.error ? [] : (data.reviews || []);
};

const createStarSvg = (rating, index) => {
  const colorClass = index < Math.round(rating || 0) ? 'text-yellow-500' : 'text-gray-300';
  return `<svg class="w-6 h-6 ${colorClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
};

const renderPage = (data) => {
  const stars = Array(5).fill(0).map((_, i) => createStarSvg(data.rating, i)).join('');
  const menuItems = Array.isArray(data.menu) ? data.menu : [];
  const reviews = Array.isArray(data.reviews) ? data.reviews : [];

  // --- Menu Logic ---
  const groupedMenu = menuItems.reduce((acc, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const menuHtml = Object.keys(groupedMenu).length === 0
    ? '<p class="text-gray-500 italic">No menu items available.</p>'
    : Object.entries(groupedMenu).map(([category, items]) => `
      <div class="mb-6">
        <h3 class="text-lg font-bold text-orange-600 border-b border-orange-200 mb-3 uppercase tracking-wide">${category}</h3>
        <div class="space-y-4">
          ${items.map(item => `
            <div class="flex justify-between items-start group">
              <div class="flex-grow pr-4">
                <div class="flex items-center">
                  <span class="text-gray-800 font-semibold group-hover:text-orange-600 transition-colors">${escapeHtml(item.name)}</span>
                  <div class="flex-grow border-b border-dotted border-gray-300 mx-2 mb-1"></div>
                </div>
                <p class="text-xs text-gray-500 italic mt-0.5">${escapeHtml(item.description || 'No description available.')}</p>
              </div>
              <span class="font-bold text-orange-700 whitespace-nowrap">${item.price} PLN</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

  // --- Reviews HTML ---
  const reviewsHtml = reviews.length === 0
    ? '<p class="text-gray-500 italic">No reviews yet. Be the first to review!</p>'
    : reviews.map(review => {
      const reviewStars = Array(5).fill(0).map((_, i) => {
        const color = i < Math.round(review.rating) ? 'text-yellow-500' : 'text-gray-300';
        return `<svg class="w-4 h-4 ${color}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
      }).join('');

      return `
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-gray-800">${escapeHtml(review.userName || 'Anonymous')}</span>
            <div class="flex">${reviewStars}</div>
          </div>
          <p class="text-gray-600 text-sm">${escapeHtml(review.comment)}</p>
          <p class="text-xs text-gray-400 mt-2 text-right">${new Date(review.date).toLocaleDateString()}</p>
        </div>`;
    }).join('');

  // --- Map Logic ---
  const mapAddress = encodeURIComponent(data.address || '');
  const mapSrc = `https://maps.google.com/maps?q=${mapAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  mainContentEl.innerHTML = `
    <header class="relative rounded-2xl overflow-hidden mb-8 shadow-xl border border-gray-200">
      <img src="${data.imageUrl || 'https://placehold.co/1200x400/ea580c/ffffff?text=' + data.name}" alt="${data.name}" class="w-full h-48 md:h-72 object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div class="absolute bottom-0 left-0 p-6 md:p-10">
        <h1 class="text-4xl md:text-6xl font-extrabold text-white drop-shadow-md">${data.name}</h1>
        <div class="flex items-center mt-3">${stars}</div>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <section class="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-orange-500 pb-2 inline-block">Menu</h2>
          <div id="menu-container">${menuHtml}</div>
        </section>

        <section class="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-orange-500 pb-2 inline-block">Reviews</h2>

          <div class="mb-8 bg-orange-50 p-4 rounded-xl border border-orange-200">
            <h3 class="font-bold text-lg mb-3">Write a Review</h3>
            <form id="review-form" class="space-y-3">
              <div class="rating flex flex-row-reverse justify-end gap-1">
                <input type="radio" id="star5" name="rating" value="5" /><label for="star5" title="5 stars"></label>
                <input type="radio" id="star4" name="rating" value="4" /><label for="star4" title="4 stars"></label>
                <input type="radio" id="star3" name="rating" value="3" /><label for="star3" title="3 stars"></label>
                <input type="radio" id="star2" name="rating" value="2" /><label for="star2" title="2 stars"></label>
                <input type="radio" id="star1" name="rating" value="1" /><label for="star1" title="1 star"></label>
              </div>
              <textarea id="review-comment" placeholder="Share your experience..." class="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500 bg-white" rows="3" required></textarea>
              <button type="submit" class="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition">Submit Review</button>
              <p id="review-message" class="text-sm mt-1"></p>
            </form>
          </div>

          <div id="reviews-list" class="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            ${reviewsHtml}
          </div>
        </section>
      </div>

      <div class="lg:col-span-1 space-y-8">
        <aside class="bg-white p-6 rounded-2xl shadow-lg border border-orange-100 sticky top-24">
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-orange-500 pb-2 inline-block">Contact & Info</h2>

          <div class="map-container shadow-inner border border-gray-200">
            <iframe src="${mapSrc}" allowfullscreen="" loading="lazy"></iframe>
          </div>

          <ul class="space-y-4 text-gray-600">
            <li class="flex items-start"><span class="font-medium">📍 ${data.address || 'Address not listed'}</span></li>
            <li class="flex items-center"><span class="font-medium">📞 ${data.phoneNumber || 'N/A'}</span></li>
          </ul>
        </aside>

        <aside class="bg-orange-100/50 p-6 rounded-2xl shadow-lg border-2 border-orange-300">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Make a Reservation</h2>
          <form id="reservation-form" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Number of People</label>
              <input type="number" id="people" value="2" min="1" class="w-full p-3 border border-orange-200 rounded-xl outline-none" required>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Date</label>
              <input type="date" id="date" class="w-full p-3 border border-orange-200 rounded-xl outline-none" required>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Time</label>
              <input type="time" id="time" class="w-full p-3 border border-orange-200 rounded-xl outline-none" required>
            </div>
            <button type="submit" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition shadow-md">Book a Table</button>
            <p id="form-message" class="text-center mt-2 h-5 font-medium"></p>
          </form>
        </aside>
      </div>
    </div>
  `;

  document.getElementById('reservation-form').addEventListener('submit', handleReservationSubmit);
  document.getElementById('review-form').addEventListener('submit', handleReviewSubmit);
};

const handleReservationSubmit = async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('form-message');
  msgEl.textContent = 'Submitting...';
  msgEl.className = 'text-center mt-2 h-5 font-medium text-gray-500';

  const rawId = getRestaurantIdFromURL();
  const resId = parseInt(rawId);

  if (isNaN(resId)) {
    msgEl.textContent = 'Error: Invalid Restaurant ID';
    msgEl.className = 'text-center mt-2 text-red-600 font-bold';
    return;
  }

  const reservationData = {
    restaurantId: resId,
    people: parseInt(document.getElementById('people').value),
    date: document.getElementById('date').value,
    time: document.getElementById('time').value
  };

  const result = await fetchData('reservations', {
    method: 'POST',
    body: JSON.stringify(reservationData)
  });

  if (!result.error) {
    msgEl.textContent = 'Reservation successful! Redirecting...';
    msgEl.className = 'text-center mt-2 text-green-600 font-bold';
    setTimeout(() => {
      window.location.href = '../userfiles/dashboard-preview.html?section=reservations';
    }, 2000);
  } else {
    msgEl.textContent = 'Error: ' + (result.message || 'Submission failed');
    msgEl.className = 'text-center mt-2 text-red-600 font-bold';
  }
};

// Added Handle Review Submit
const handleReviewSubmit = async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('review-message');
  msgEl.textContent = 'Posting...';
  msgEl.className = 'text-sm mt-1 text-gray-500';

  const rawId = getRestaurantIdFromURL();
  const restaurantId = parseInt(rawId);

  const ratingInput = document.querySelector('input[name="rating"]:checked');
  if (!ratingInput) {
    msgEl.textContent = 'Please select a star rating.';
    msgEl.className = 'text-sm mt-1 text-red-500 font-bold';
    return;
  }

  const reviewData = {
    restaurantId: restaurantId,
    rating: parseInt(ratingInput.value),
    comment: document.getElementById('review-comment').value,
  };

  const result = await fetchData('reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  });

  if (!result.error) {
    msgEl.textContent = 'Review added successfully!';
    msgEl.className = 'text-sm mt-1 text-green-600 font-bold';
    setTimeout(() => window.location.reload(), 1500);
  } else {
    msgEl.textContent = 'Error: ' + (result.message || 'Failed to post review');
    msgEl.className = 'text-sm mt-1 text-red-600 font-bold';
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const restaurantId = getRestaurantIdFromURL();
  if (!restaurantId) {
    mainContentEl.innerHTML = `<p class="text-center text-red-500 font-bold mt-10">Error: No restaurant selected.</p>`;
    return;
  }

  const [restaurantData, menuItems, reviewsData] = await Promise.all([
    fetchData(`restaurants/${restaurantId}`),
    fetchMenu(restaurantId),
    fetchReviews(restaurantId)
  ]);

  if (loadingIndicator) loadingIndicator.style.display = 'none';

  renderPage({
    ...restaurantData,
    menu: menuItems,
    reviews: reviewsData
  });
});
