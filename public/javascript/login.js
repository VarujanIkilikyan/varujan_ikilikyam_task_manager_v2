console.log('Login SCRIPT initialized');

const loginForm = document.querySelector('#loginForm');
const generalErrorDiv = document.querySelector('#generalError');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Clear previous field errors and general errors
        document.querySelectorAll('.error-message').forEach((span) => span.textContent = '');
        if (generalErrorDiv) generalErrorDiv.textContent = '';

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data)

        try {
            const response = await fetch('/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            console.log(result);

            if (!response.ok) {
                // Handle field-specific validation errors (if your API returns them)
                if (result.errors) {
                    for (const [field, errorMessage] of Object.entries(result.errors)) {
                        const errorSpan = document.querySelector(`[data-error="${field}"]`);
                        if (errorSpan) {
                            errorSpan.textContent = errorMessage;
                        }
                    }
                }
                // Handle a general authentication failure (e.g., { message: "Invalid email or password" })
                else if (result.message) {
                    if (generalErrorDiv) generalErrorDiv.textContent = result.message;
                }
            } else {
                // Redirect upon successful authentication
                // Adjust the destination route based on your application's flow
                localStorage.setItem('token', result.token);
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Login submission error:', error);
            if (generalErrorDiv) generalErrorDiv.textContent = 'A network error occurred. Please try again later.';
        }
    });
}