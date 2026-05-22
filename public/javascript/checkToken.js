export async function checkAuth() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/users/login';
        return false;
    }

    try {
        const response = await fetch('/users/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Invalid token');
        }

        const result = await response.json();
        localStorage.setItem('userData', JSON.stringify(result.user));
        return result.user;
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/users/login';
        return null;
    }
}