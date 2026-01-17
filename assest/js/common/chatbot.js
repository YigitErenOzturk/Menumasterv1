document.addEventListener('DOMContentLoaded', () => {
  // --- SETTINGS ---
  const CONFIG = {
    botName: "MenuMaster Bot",
    storageKey: "menumaster_chat_history", // Key for conversation history
    typingSpeed: 800 // Average typing speed (ms)
  };

  // --- DOM ELEMENTS ---
  const chatIcon = document.getElementById('chat-icon');
  const chatWindow = document.getElementById('chat-window');
  const closeChatBtn = document.getElementById('close-chat');
  const chatBody = document.getElementById('chat-body');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');

  // --- STATE ---
  let isTyping = false;

  // --- INITIALIZATION ---
  init();

  function init() {
    loadHistory();
    setupEventListeners();

    // Send opening message if history is empty
    if (chatBody && !chatBody.innerHTML.trim()) {
      addBotMessage(`Hello! 👋 I'm ${CONFIG.botName}. How can I assist you today? (Write Commands To See Options)`);
    }
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    if (chatIcon) chatIcon.addEventListener('click', toggleChat);
    if (closeChatBtn) closeChatBtn.addEventListener('click', toggleChat);

    if (sendBtn) sendBtn.addEventListener('click', handleUserMessage);

    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
      });
    }
  }

  // --- TOGGLE CHAT WINDOW ---
  function toggleChat() {
    if (!chatWindow) return;

    const isHidden =
      chatWindow.classList.contains('hidden') ||
      window.getComputedStyle(chatWindow).display === 'none';

    if (isHidden) {
      // OPEN
      chatWindow.classList.remove('hidden');
      chatWindow.classList.add('flex');
      chatWindow.classList.add('open');

      setTimeout(() => {
        if (chatInput) chatInput.focus();
        scrollToBottom();
      }, 50);
    } else {
      // CLOSE
      chatWindow.classList.add('hidden');
      chatWindow.classList.remove('flex');
      chatWindow.classList.remove('open');
    }
  }

  // --- MESSAGING LOGIC ---
  function handleUserMessage() {
    if (!chatInput || !chatBody) return;

    const text = chatInput.value.trim();
    if (!text || isTyping) return;

    // 1) Add User Message
    addUserMessage(text);
    chatInput.value = "";

    // 2) Typing animation
    isTyping = true;
    showTypingIndicator();

    const delay = CONFIG.typingSpeed + Math.random() * 500;

    setTimeout(() => {
      removeTypingIndicator();

      // 3) Bot response
      const response = generateSmartResponse(text);
      addBotMessage(response);

      isTyping = false;
    }, delay);
  }

  // --- SMART RESPONSE ENGINE ---
  function generateSmartResponse(input) {
    const lower = input.toLowerCase();

    const rules = [
      {
        keywords: ["hello", "hi", "hey", "morning", "evening", "greetings"],
        response: "Hello there! 👋 Welcome to MenuMaster. Are you looking for a restaurant or need help?"
      },
      {
        keywords: ["register", "sign up", "join", "owner", "restaurant add"],
        response: "Restaurant owners can join us easily! Click the **'Register Now'** button on the main page to start automating your reservations."
      },
      {
        keywords: ["order", "track", "where is my food", "status", "delivery"],
        response: "You can track your active orders in the **'My Orders'** section after logging in. 🛵"
      },
      {
        keywords: ["price", "cost", "expensive", "cheap", "budget"],
        response: "We have options for every budget! Check out our 'Affordable' category for great value meals 💰."
      },
      {
        keywords: ["menu", "food", "list", "burger", "pizza", "sushi", "eat"],
        response: "We list hundreds of restaurants. Use the search bar above to find specific cuisines like Pizza, Sushi, or Burgers! 🍔🍕"
      },
      {
        keywords: ["contact", "support", "help", "phone", "email", "problem"],
        response: "Need human support? Reach us at **support@menumaster.com**."
      },
      {
        keywords: ["bye", "goodbye", "thanks", "thank you"],
        response: "Goodbye! Enjoy your meal! 😋"
      },
      {
        keywords: ["commands", "what can you do"],
        response: "contact,support,help,menu,food,list,price,cost,expensive,order,track,register,login"
      },
      {
        keywords: ["login", "sign in", "log in", "account access"],
        response: "You can log in by clicking the **'Login'** button at the top right. Forgot your password? No worries—we’ve got you covered 🔐"
      },
      {
        keywords: ["forgot password", "reset password", "password help"],
        response: "To reset your password, click **'Forgot Password'** on the login page and follow the instructions sent to your email 📧"
      },
      {
        keywords: ["payment", "pay", "card", "cash", "apple pay", "google pay"],
        response: "We support multiple payment methods including **Card**, **Cash**, and **Digital Wallets** for your convenience 💳"
      },
      {
        keywords: ["cancel order", "refund", "money back"],
        response: "Orders can be cancelled within a limited time. Visit **'My Orders'** and select the order to see cancellation options 🔄"
      },
      {
        keywords: ["restaurant hours", "open", "close", "working hours"],
        response: "Restaurant opening hours are listed on each restaurant’s page. Hours may vary on weekends ⏰"
      },
      {
        keywords: ["location", "near me", "nearby", "closest"],
        response: "Enable location access to discover the best restaurants **near you** 📍"
      },
      {
        keywords: ["rating", "reviews", "feedback", "stars"],
        response: "Check real customer reviews and ratings on restaurant pages to make the best choice ⭐"
      },
      {
        keywords: ["offers", "discount", "deal", "promo", "coupon"],
        response: "Looking for deals? Visit the **'Special Offers'** section to find discounts and promotions 🎉"
      },
      {
        keywords: ["vegetarian", "vegan", "halal", "gluten free"],
        response: "We support dietary preferences! Use filters to find **Vegan**, **Vegetarian**, **Halal**, or **Gluten-Free** options 🌱"
      },
      {
        keywords: ["reservation", "book table", "table booking"],
        response: "You can book a table directly from the restaurant page using our **Reservation System** 📅"
      },
      {
        keywords: ["app", "mobile", "android", "ios"],
        response: "Our mobile app is available for **Android** and **iOS**—order food anytime, anywhere 📱"
      },
      {
        keywords: ["error", "bug", "not working", "issue"],
        response: "Sorry about that! Please contact **support@menumaster.com** and describe the issue so we can help quickly 🛠️"
      },
      {
        keywords: ["language", "change language", "english", "polish"],
        response: "You can change the language from the **Settings** menu to enjoy MenuMaster in your preferred language 🌍"
      },
      {
        keywords: ["profile", "account", "my info"],
        response: "Manage your personal details and preferences in the **'My Profile'** section 👤"
      }
    ];

    const match = rules.find(rule => rule.keywords.some(k => lower.includes(k)));
    if (match) return match.response;

    const fallbacks = [
      "I'm not sure I understand. Could you try rephrasing that? 🤔",
      "I'm still learning! You can ask me about 'Registration', 'Orders', or 'Support'.",
      "Did you mean you want to find a restaurant? Try using the search bar!"
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // --- UI HELPERS ---
  function addUserMessage(text) {
    if (!chatBody) return;
    chatBody.appendChild(createMessageBubble(text, 'user'));
    saveHistory();
    scrollToBottom();
  }

  function addBotMessage(text) {
    if (!chatBody) return;
    chatBody.appendChild(createMessageBubble(text, 'bot'));
    saveHistory();
    scrollToBottom();
  }

  function createMessageBubble(text, sender) {
    const div = document.createElement('div');
    const isUser = sender === 'user';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.className = `flex flex-col mb-3 ${isUser ? 'items-end' : 'items-start'} animate-fade-in`;

    div.innerHTML = `
      <div class="${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'} px-4 py-2 rounded-2xl max-w-[85%] shadow-sm text-sm break-words">
        ${text}
      </div>
      <span class="text-[10px] text-gray-400 mt-1 px-1 select-none">${time}</span>
    `;

    return div;
  }

  function showTypingIndicator() {
    if (!chatBody) return;

    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'flex items-start mb-3 animate-pulse';

    div.innerHTML = `
      <div class="bg-gray-700 text-gray-400 px-4 py-3 rounded-2xl rounded-bl-none text-xs flex items-center space-x-1">
        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
      </div>
    `;

    chatBody.appendChild(div);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    if (!chatBody) return;
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // --- HISTORY MANAGEMENT ---
  function saveHistory() {
    if (!chatBody) return;
    localStorage.setItem(CONFIG.storageKey, chatBody.innerHTML);
  }

  function loadHistory() {
    if (!chatBody) return;
    const saved = localStorage.getItem(CONFIG.storageKey);

    if (saved) {
      chatBody.innerHTML = saved;
      scrollToBottom();
    }
  }
});
