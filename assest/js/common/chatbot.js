document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const chatIcon = document.getElementById('chat-icon');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    // --- Event Listeners ---
    chatIcon.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
    });

    closeChatBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });
    
    sendBtn.addEventListener('click', handleUserMessage);
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleUserMessage();
        }
    });

    // --- Functions ---

    // Handles sending the user's message
    function handleUserMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        // Display user's message
        appendMessage('user', messageText);
        chatInput.value = '';

        // Get and display bot's response
        setTimeout(() => {
            const botResponse = getBotResponse(messageText);
            appendMessage('bot', botResponse);
        }, 500); // Simulate bot thinking
    }

    // Appends a message to the chat body
    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);
        messageDiv.innerText = text;
        chatBody.appendChild(messageDiv);
        
        // Scroll to the bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Determines the bot's response
    function getBotResponse(userInput) {
        const lowerInput = userInput.toLowerCase();

        // --- PREDEFINED QUESTIONS AND ANSWERS ---
        if (lowerInput.includes('restaurant') && lowerInput.includes('register')) {
            return "Registering your restaurant is easy! Start by clicking the 'Register Now' button on the homepage.";
        }
        if (lowerInput.includes('commands') && lowerInput.includes('codes')) {
            return "restaurant,register,order,track,discount,cheap,help,hello";
        }
        
        if (lowerInput.includes('order') && lowerInput.includes('track')) {
            return "To track your order, you can visit the 'My Orders' section after logging in.";
        }

        if (lowerInput.includes('discount') || lowerInput.includes('cheap')) {
            return "Great question! You can always find our current promotions in the 'Featured Deals' section on our homepage.";
        }

        if (lowerInput.includes('help') || lowerInput.includes('hello')) {
            return "Hello! 👋 I'm MenuMaster Bot. How can I help you? You can ask questions about 'restaurant registration', 'order tracking', or 'campaigns'.";
        }

        // response if no keyword is matched
        return "Sorry, I didn't understand this question. Please try asking it differently. For commands write commands !";
    }
    
    // Initial bot welcome message
    function showWelcomeMessage() {
        appendMessage('bot', "Hello! Welcome to MenuMaster. How can I help you?");
    }
    
    showWelcomeMessage();
});