

document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signup-form');
    const messageDiv = document.getElementById('message');
    
    // The address of our server.
    const API_URL = 'http://localhost:3000/api/register';

    signupForm.addEventListener('submit', async (event) => {
        // Stop the page from reloading when you click the button.
        event.preventDefault();

        // Get what the user typed in the form.
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Check if the password is long enough.
        if (password.length < 8) {
            messageDiv.textContent = 'Password must be 8 characters or more.';
            messageDiv.classList.add('text-red-400');
            return;
        }

        // Put the user's information into an object.
        const userData = {
            name,
            email,
            password
        };
        
        try {
            messageDiv.textContent = 'Please wait...';
            messageDiv.classList.add('text-yellow-400');
            
            // We send the user's data to the server.
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            // We read the answer from the server.
            const result = await response.json();

            // If the server says there is a problem, show the error message.
            if (!response.ok) {
                throw new Error(result.message);
            }

            // If everything is okay, show a success message.
            messageDiv.textContent = 'Success! You are being moved to the login page.';
            messageDiv.classList.add('text-green-400');

            signupForm.reset();

            // Go to the login page after 2 seconds.
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            // If there is any error
            messageDiv.textContent = error.message;
            messageDiv.classList.add('text-red-400');
        }
    });
});