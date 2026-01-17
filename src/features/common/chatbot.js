document.addEventListener('DOMContentLoaded', () => {
    
    // --- SETTINGS ---
    const CONFIG = {
        botName: "MenuMaster Bot",
        storageKey: "menumaster_chat_history",
        typingSpeed: 800 
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
        
        if (chatBody && !chatBody.innerHTML.trim()) {
            addBotMessage(`Hello! 👋 I'm ${CONFIG.botName}. How can I assist you today? (Write Commands To See Options)`);
        }
        createHelpBubble();
    }

    // --- HELP BUBBLE LOGIC ---
    function createHelpBubble() {
        if (!chatIcon) return;

        const bubble = document.createElement('div');
        bubble.className = "fixed bottom-24 right-20 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-2xl border border-gray-200 text-sm font-bold z-50 transform scale-0 origin-bottom-right transition-transform duration-500 ease-out";
        bubble.innerHTML = "Do you need help? 👋"; 
        
        const arrow = document.createElement('div');
        arrow.className = "absolute -bottom-1 right-4 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45";
        bubble.appendChild(arrow);
        document.body.appendChild(bubble);

        setTimeout(() => {
            bubble.classList.remove('scale-0');
            chatIcon.classList.add('animate-shake-hard');
            
            setTimeout(() => { 
                chatIcon.classList.remove('animate-shake-hard'); 
            }, 2000);

            // Kullanıcı chat'i açarsa balonu kaldır
            chatIcon.addEventListener('click', () => bubble.remove(), { once: true });
        }, 3000);
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
        
        const isHidden = chatWindow.classList.contains('hidden') || window.getComputedStyle(chatWindow).display === 'none';
        
        if (isHidden) {
            chatWindow.classList.remove('hidden');
            chatWindow.classList.add('flex');
            chatWindow.classList.add('open');
            
            setTimeout(() => {
                if(chatInput) chatInput.focus();
                scrollToBottom();
            }, 50);
        } else {
            chatWindow.classList.add('hidden');
            chatWindow.classList.remove('flex');
            chatWindow.classList.remove('open');
        }
    }

    // --- MESSAGING LOGIC ---
    function handleUserMessage() {
        if(!chatInput) return;
        
        const text = chatInput.value.trim();
        if (!text || isTyping) return; 

        addUserMessage(text);
        chatInput.value = "";
        
        isTyping = true;
        showTypingIndicator();

        const delay = CONFIG.typingSpeed + Math.random() * 500;

        setTimeout(() => {
            removeTypingIndicator(); 
            const response = generateSmartResponse(text);
            addBotMessage(response);
            isTyping = false;
        }, delay);
    }

    // --- SMART RESPONSE ENGINE ---
    function generateSmartResponse(input) {
        const lower = input.toLowerCase();
        const rules = [
            { keywords: ["hello", "hi", "hey"], response: "Hello there! 👋 Welcome to MenuMaster." },
            { keywords: ["register", "sign up"], response: "Click the **'Register Now'** button to start!" },
            { keywords: ["order", "track"], response: "Track orders in the **'My Orders'** section." },
            { keywords: ["contact", "support"], response: "Email us at **support@menumaster.com**." },
            { keywords: ["commands"], response: "help, menu, order, price, register, login, password" },
            { keywords: ["login", "sign in"], response: "Click **'Login'** at the top right to access your account." },
            { keywords: ["reservation", "book"], response: "Book tables directly on the restaurant page! 📅" }
        ];

        const match = rules.find(rule => rule.keywords.some(k => lower.includes(k)));
        if (match) return match.response;

        const fallbacks = [
            "I'm not sure I understand. Could you rephrase? 🤔",
            "I'm still learning! Try asking about 'Login' or 'Support'."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // --- UI HELPERS ---
    function addUserMessage(text) {
        const div = createMessageBubble(text, 'user');
        chatBody.appendChild(div);
        saveHistory();
        scrollToBottom();
    }

    function addBotMessage(text) {
        const div = createMessageBubble(text, 'bot');
        chatBody.appendChild(div);
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
        if(chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    }

    function saveHistory() {
        if(chatBody) localStorage.setItem(CONFIG.storageKey, chatBody.innerHTML);
    }

    function loadHistory() {
        const saved = localStorage.getItem(CONFIG.storageKey);
        if (saved && chatBody) {
            chatBody.innerHTML = saved;
            scrollToBottom();
        }
    }
});