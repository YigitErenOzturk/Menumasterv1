// --- API CONFIGURATION ---

const API_BASE_URL = 'http://192.168.1.100:3000'; 


// DOM Elements
const restaurantListEl = document.getElementById('restaurant-list');
const locationInput = document.getElementById('location-input');
const cuisineInput = document.getElementById('cuisine-input');
const searchButton = document.getElementById('search-button');

// --- Core Functions ---

/**
 * Renders the given list of restaurants to the UI.
 * @param {Array<Object>} restaurants - Array of restaurant objects.
 */
const renderRestaurants = (restaurants) => {
    restaurantListEl.innerHTML = ''; // Clear existing content

    if (!restaurants || restaurants.length === 0) {
        restaurantListEl.innerHTML = '<p class="col-span-4 text-center text-red-400">No restaurants found matching your criteria.</p>';
        return;
    }

    restaurants.forEach(restaurant => {
        // Expected fields from the API: 'imageUrl', 'name', 'cuisine', 'city', 'rating', 'reviews', 'type'
        const card = `
            <div class="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300 cursor-pointer">
                <img src="${restaurant.imageUrl || 'https://placehold.co/400x200/4f46e5/ffffff?text=Restaurant'}" 
                     alt="${restaurant.name} Image" class="w-full h-32 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-indigo-400">${restaurant.name || 'Unknown Restaurant'}</h3>
                    <p class="text-gray-400 text-sm">${restaurant.cuisine || 'Unknown Cuisine'}, ${restaurant.city || 'Unknown City'}</p>
                    <div class="flex items-center mt-2">
                        <span class="text-yellow-400 font-bold mr-1">${(restaurant.rating || 0).toFixed(1)}</span>
                        <span class="text-gray-500 text-xs">(${(restaurant.reviews || 0)} Reviews)</span>
                    </div>
                    <button class="mt-3 w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition duration-200">
                        ${restaurant.type === 'booking' ? 'Book a Table' : 'Order Now'}
                    </button>
                </div>
            </div>
        `;
        restaurantListEl.innerHTML += card;
    });
};

/**
 * Fetches data from the given URL and processes the results.
 * @param {string} url - API endpoint URL.
 */
const fetchData = async (url) => {
    restaurantListEl.innerHTML = '<p class="col-span-4 text-center text-gray-400">Loading data...</p>';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const data = await response.json();
        renderRestaurants(data);
    } catch (error) {
        console.error("API Data Fetching Error:", error);
        restaurantListEl.innerHTML = '<p class="col-span-4 text-center text-red-400">API connection error or data could not be loaded. Check the console.</p>';
    }
};

/**
 * Initially loads the most popular restaurants (from API).
 */
const initAndLoadData = () => {
    const url = `${API_BASE_URL}/restaurants`;
    fetchData(url);
};

/**
 * Fetches filtered data from the API based on search form values.
 */
const handleSearch = () => {
    const city = locationInput.value.trim();
    const cuisine = cuisineInput.value.trim();

    const params = new URLSearchParams();
    if (city) {
        params.append('city', city);
    }
    if (cuisine) {
        params.append('cuisine', cuisine);
    }

    const url = `${API_BASE_URL}/search?${params.toString()}`;
    fetchData(url);
};

// --- Event Listeners and Initial Load ---

// Bind click event to the search button
searchButton.addEventListener('click', handleSearch);

// Standard JS logic for scroll button and mobile menu
const scrollTopBtn = document.getElementById('scrollTopBtn');
const mobileMenuBtn = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

function checkScroll() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        scrollTopBtn.classList.add('opacity-100');
        scrollTopBtn.classList.remove('opacity-0');
    } else {
        scrollTopBtn.classList.remove('opacity-100');
        scrollTopBtn.classList.add('opacity-0');
    }
}
window.addEventListener('scroll', checkScroll);

// Start fetching data when the page loads
initAndLoadData();
