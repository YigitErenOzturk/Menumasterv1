// assets/js/shared/config/api.config.js

export const API_CONFIG = {
  BASE_URL: "http://localhost:5000/api",

  CATEGORIES: ["Starter", "Main Course", "Drinks", "Desserts", "Salads"],

  ENDPOINTS: {
    // Auth
    FORGOT_PASSWORD: "Auth/forgot-password",

    // Restaurant
    RESTAURANT_GET: (id) => `restaurants/${id}`,
    RESTAURANT_UPDATE: (id) => `restaurants/update/${id}`,
    MENU: "restaurants/menu",

    // Reservations
    RESERVATIONS_BY_RESTAURANT: "reservations/by-restaurant",
    RESERVATION_UPDATE: (id) => `reservations/${id}`,

    // (ileride)
    REVIEWS: "restaurants/reviews",
    TICKETS: "restaurants/tickets",
  },
};
