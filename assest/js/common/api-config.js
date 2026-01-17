// ../assest/js/common/api-config.js
(() => {
  // Tek yerden değiştireceğin base adres:
  // İstersen ENV gibi yönetmek için host'a göre de seçebilirsin.
  const API = {
    // default (çoğu sayfanda bu var)
    BASE_URL: 'http://localhost:5000/api',

    // bazı sayfalarda düz 3000 kullanmışsın (register.js gibi)
    ALT_BASE_URL: 'http://192.168.1.100:3000',

    ENDPOINTS: {
      // USERS
      USER_BY_ID: (id) => `/users/${id}`,
      UPDATE_USER: (id) => `/users/update/${id}`,
      USER_LOGIN: `/users/login`,
      USER_REGISTER: `/users/register`,

      // AUTH
      FORGOT_PASSWORD: `/Auth/forgot-password`,

      // RESTAURANTS
      RESTAURANTS_REGISTER: `/restaurants/Register`,
      RESTAURANTS_LOGIN: `/restaurants/login`,
      RESTAURANTS_POPULAR: `/restaurants/popular`,
      RESTAURANTS_ALL: `/restaurants/all`,
      RESTAURANT_BY_ID: (id) => `/restaurants/${id}`,
      RESTAURANT_MENU: (id) => `/restaurants/menu/${id}`,

      // OTHER
      CITIES: `/cities`,
      RESERVATIONS: `/reservations`,
      MY_RESERVATIONS: `/reservations/my-reservations`,
      REVIEWS: `/reviews`,
      REVIEWS_BY_RESTAURANT: (id) => `/reviews/restaurant/${id}`,
    },

    // token helper (sen zaten token/authToken iki türlü kullanıyorsun)
    getToken() {
      return localStorage.getItem('authToken') || localStorage.getItem('token');
    }
  };

  // Global erişim (module kullanmıyorsan en pratik yol)
  window.API_CONFIG = API;
})();
