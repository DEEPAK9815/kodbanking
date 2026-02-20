document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries()); // Converts form data to JSON object

    if (!data.uid) delete data.uid; // Remove empty UID to let DB auto-increment

    try {
        console.log('Sending registration data:', data);
        alert('Sending registration data...'); // Debug alert

        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        alert('Response received: ' + response.status); // Debug alert

        const contentType = response.headers.get("content-type");
        let result;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            result = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
        }

        if (response.ok) {
            alert('Registration Successful! Redirecting to login...');
            window.location.href = 'login.html';
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong: ' + error.message);
    }
});
