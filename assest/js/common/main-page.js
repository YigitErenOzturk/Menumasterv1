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

const chatIcon = document.getElementById('chat-icon');
    
    if (chatIcon) {
        // Create Ballon To Ask Do you have a question
        const bubble = document.createElement('div');
        // Tailwind Classes
        bubble.className = "fixed bottom-24 right-20 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-2xl border border-gray-200 text-sm font-bold z-50 transform scale-0 origin-bottom-right transition-transform duration-500 ease-out";
        bubble.innerHTML = "Do you need help? 👋"; 
        
       
        const arrow = document.createElement('div');
        arrow.className = "absolute -bottom-1 right-4 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45";
        bubble.appendChild(arrow);
        
        document.body.appendChild(bubble);

        // Shaking Animation
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes shake-hard {
                0% { transform: rotate(0deg); }
                25% { transform: rotate(15deg); }
                50% { transform: rotate(0deg); }
                75% { transform: rotate(-15deg); }
                100% { transform: rotate(0deg); }
            }
            .animate-shake-hard {
                animation: shake-hard 0.4s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);

        // It will work after 3 Seconds
        setTimeout(() => {
            // show ballon
            bubble.classList.remove('scale-0');
            
            // shake
            chatIcon.classList.remove('animate-bounce'); 
            chatIcon.classList.add('animate-shake-hard');
            
            // It will stop to shake after 2 seconds
            setTimeout(() => {
                chatIcon.classList.remove('animate-shake-hard');
            }, 2000);

        }, 3000);
    }

 const liveCounter = document.getElementById('live-counter');

    async function fetchActiveUsers() {
        if (!liveCounter) return;

        try {
            // --- For api connection (active member number) ---
            /*
            const response = await fetch('https://api.menumaster.com/v1/active-users');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const userCount = data.count; 
            */

            const userCount = await new Promise((resolve) => {
                setTimeout(() => {
                    // real number
                    let current = parseInt(liveCounter.innerText) || 100;
                    // For to make its crowded make it more
                    let change = Math.floor(Math.random() * 15) - 5; 
                    let newVal = current + change;
                    if (newVal < 50) newVal = 50; // Min Limitr
                    resolve(newVal);
                }, 800); 
            });

            liveCounter.innerText = userCount;
            
            // If User Number is growin it will be green otherway red
            liveCounter.parentElement.classList.add('scale-110');
            setTimeout(() => liveCounter.parentElement.classList.remove('scale-110'), 200);

        } catch (error) {
            console.error("Error:", error);
            // If there is an error it will be empty or old number
        }
    }

    // Pull when refresh page
    fetchActiveUsers();

    // Check Server every 10 Minutes (Polling)
    setInterval(fetchActiveUsers, 10000);

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

