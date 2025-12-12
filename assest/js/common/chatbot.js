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
        loadHistory(); // Load previous chat history
        setupEventListeners();
        
        // Send opening message if history is empty
        if (chatBody && !chatBody.innerHTML.trim()) {
            addBotMessage(`Hello! 👋 I'm ${CONFIG.botName}. How can I assist you today? (e.g., "Register", "Track Order", "Discounts")`);
        }
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        if(chatIcon) chatIcon.addEventListener('click', toggleChat);
        if(closeChatBtn) closeChatBtn.addEventListener('click', toggleChat);
        
        if(sendBtn) sendBtn.addEventListener('click', handleUserMessage);
        
        if(chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleUserMessage();
            });
        }
    }

    // --- TOGGLE CHAT WINDOW ---
    function toggleChat() {
        if (!chatWindow) return;
        
        // Check if currently hidden (checks for 'hidden' class OR CSS display: none)
        const isHidden = chatWindow.classList.contains('hidden') || window.getComputedStyle(chatWindow).display === 'none';
        
        if (isHidden) {
            // OPEN
            chatWindow.classList.remove('hidden');
            chatWindow.classList.add('flex'); // Tailwind flex display
            chatWindow.classList.add('open'); // Custom CSS support
            
            // Focus input after a small delay to ensure transition finishes
            setTimeout(() => {
                if(chatInput) chatInput.focus();
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
        if(!chatInput) return;
        
        const text = chatInput.value.trim();
        if (!text || isTyping) return; // Prevent new messages while bot is typing

        // 1. Add User Message
        addUserMessage(text);
        chatInput.value = "";
        
        // 2. Show "Typing..." Animation
        isTyping = true;
        showTypingIndicator();

        // Random delay based on response length (Adds natural feel)
        const delay = CONFIG.typingSpeed + Math.random() * 500;

        setTimeout(() => {
            removeTypingIndicator(); // Remove animation
            
            // 3. Generate and Add Bot Response
            const response = generateSmartResponse(text);
            addBotMessage(response);
            
            isTyping = false;
        }, delay);
    }

    // --- SMART RESPONSE ENGINE ---
    function generateSmartResponse(input) {
        const lower = input.toLowerCase();

        // Rule-based responses
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
                response: "Need human support? Reach us at **support@menumaster.com** or call our hotline at **+1-800-MENU-MSTR**."
            },
            {
                keywords: ["bye", "goodbye", "thanks", "thank you"],
                response: "Goodbye! Enjoy your meal! 😋"
            },
            {
                keywords: ["commands", "what can you do"],
                response: "You can ask me about: **Registering**, **Orders**, **Support**, or just say **Hello**!"
            }
        ];

        // Find matching keyword
        const match = rules.find(rule => rule.keywords.some(k => lower.includes(k)));
        if (match) return match.response;

        // Return random fallback if not understood
        const fallbacks = [
            "I'm not sure I understand. Could you try rephrasing that? 🤔",
            "I'm still learning! You can ask me about 'Registration', 'Orders', or 'Support'.",
            "Did you mean you want to find a restaurant? Try using the search bar!"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // --- UI HELPERS (HTML GENERATION) ---
    
    function addUserMessage(text) {
        // User message (Right side, Indigo color)
        const div = createMessageBubble(text, 'user');
        chatBody.appendChild(div);
        saveHistory();
        scrollToBottom();
    }

    function addBotMessage(text) {
        // Bot message (Left side, Gray color)
        const div = createMessageBubble(text, 'bot');
        chatBody.appendChild(div);
        saveHistory();
        scrollToBottom();
    }

    function createMessageBubble(text, sender) {
        const div = document.createElement('div');
        const isUser = sender === 'user';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Styling with Tailwind classes
        div.className = `flex flex-col mb-3 ${isUser ? 'items-end' : 'items-start'} animate-fade-in`;
        
        // Bubble HTML
        div.innerHTML = `
            <div class="${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'} px-4 py-2 rounded-2xl max-w-[85%] shadow-sm text-sm break-words">
                ${text}
            </div>
            <span class="text-[10px] text-gray-400 mt-1 px-1 select-none">${time}</span>
        `;
        return div;
    }

    function showTypingIndicator() {
        const div = document.createElement('div');
        div.id = 'typing-indicator';
        div.className = 'flex items-start mb-3 animate-pulse';
        // 3-dot animation
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
        if(chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

    // --- HISTORY MANAGEMENT (LOCAL STORAGE) ---
    function saveHistory() {
        // Save chat content as HTML (Simple method)
        if(chatBody) {
            localStorage.setItem(CONFIG.storageKey, chatBody.innerHTML);
        }
    }

    function loadHistory() {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved && chatBody) {
            chatBody.innerHTML = saved;
            scrollToBottom();
        }
    }
});