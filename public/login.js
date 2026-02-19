document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Token is set in cookie by server
            window.location.href = 'dashboard.html';
        } else {
            alert('Login Failed: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Login mechanism failed!');
    }
});
