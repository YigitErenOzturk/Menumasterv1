document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const $ = (id) => document.getElementById(id);
    const chatIcon = $('chat-icon');
    const chatWindow = $('chat-window');
    const closeChatBtn = $('close-chat');
    const chatBody = $('chat-body');
    const chatInput = $('chat-input');
    const sendBtn = $('send-btn');

    // --- Chat toggle ---
    chatIcon.addEventListener('click', () => chatWindow.classList.toggle('open'));
    closeChatBtn.addEventListener('click', () => chatWindow.classList.remove('open'));

    // --- Send message ---
    sendBtn.addEventListener('click', handleUserMessage);
    chatInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleUserMessage());

    // --- AI Response Map ---
    const responses = [
        {
            keywords: ["restaurant", "register", "sign"],
            reply: "Registering your restaurant is simple! Just click 'Register Now' on the homepage."
        },
        {
            keywords: ["commands", "codes", "help list"],
            reply: "Available commands: restaurant, register, order, track, discount, cheap, support, hello, menu"
        },
        {
            keywords: ["order", "track", "where"],
            reply: "You can track your order in the 'My Orders' section after logging in."
        },
        {
            keywords: ["discount", "cheap", "promo", "campaign"],
            reply: "You can check all current promotions from the 'Featured Deals' section on the homepage."
        },
        {
            keywords: ["help", "hello", "hi", "hey"],
            reply: "Hello! 👋 I'm MenuMaster Bot. Ask me anything about registration, orders, or campaigns."
        },
        {
            keywords: ["menu", "food", "list"],
            reply: "Our menu contains hundreds of restaurants! What are you looking for?"
        }
    ];

    // --- Message Handling ---
    function handleUserMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        chatInput.value = "";

        setTimeout(() => {
            const response = getBotResponse(text);
            appendMessage('bot', response);
        }, 400);
    }

    // --- Append message ---
    function appendMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `chat-message ${sender}-message`;
        div.innerText = text;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // --- Determine Response ---
    function getBotResponse(input) {
        const lower = input.toLowerCase();

        // search for matching keyword group
        for (const rule of responses) {
            if (rule.keywords.some(k => lower.includes(k))) {
                return rule.reply;
            }
        }

        // fallback response
        return "I didn't understand that. Try using a command. Type: commands";
    }

    // --- Welcome message ---
    appendMessage('bot', "Hello! Welcome to MenuMaster 👋 How can I assist you today?");

});
