const balanceBtn = document.getElementById('checkBalanceBtn');
const balanceDisplay = document.getElementById('balance-display');
const userGreeting = document.getElementById('user-greeting');

// Try to set username from cookie/storage if available
const getUsername = () => {
    const cookies = document.cookie.split(';');
    const userCookie = cookies.find(c => c.trim().startsWith('username='));
    return userCookie ? userCookie.split('=')[1] : 'User';
};

userGreeting.textContent = getUsername();

balanceBtn.addEventListener('click', async () => {
    balanceBtn.disabled = true;
    balanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

    try {
        const response = await fetch('/check-balance', {
            method: 'GET'
        });

        const result = await response.json();

        if (response.ok) {
            // Format as currency
            const formattedBalance = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(result.balance);

            balanceDisplay.textContent = formattedBalance;
            balanceDisplay.style.color = 'white';
            triggerConfetti();
        } else {
            balanceDisplay.textContent = 'Error';
            alert('Error: ' + result.error);
            if (response.status === 401) {
                setTimeout(() => window.location.href = 'login.html', 1000);
            }
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
        balanceDisplay.textContent = 'Failed';
    } finally {
        balanceBtn.disabled = false;
        balanceBtn.innerHTML = 'Refresh Balance';
    }
});

function triggerConfetti() {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background-color: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: 50%;
            z-index: 1000;
            pointer-events: none;
            animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
        `;

        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 5000);
    }
}

// Add CSS animation for confetti
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

