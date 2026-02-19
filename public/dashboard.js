const balanceBtn = document.getElementById('checkBalanceBtn');
const balanceDisplay = document.getElementById('balance-display');

balanceBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/check-balance', {
            method: 'GET'
        });

        const result = await response.json();

        if (response.ok) {
            balanceDisplay.textContent = `Your balance is : ${result.balance}`;
            balanceDisplay.style.color = '#4ade80'; // Success green
            triggerConfetti();
        } else {
            balanceDisplay.textContent = 'Error: ' + result.error;
            balanceDisplay.style.color = '#ff4d4d'; // Error red
            if (response.status === 401) {
                setTimeout(() => window.location.href = 'login.html', 2000);
            }
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
        balanceDisplay.textContent = 'Failed to fetch balance';
    }
});

function triggerConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');

        // Random properties
        const bg = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100 + 'vw';
        const animDuration = Math.random() * 3 + 2 + 's';
        const size = Math.random() * 10 + 5 + 'px';

        confetti.style.backgroundColor = bg;
        confetti.style.left = left;
        confetti.style.animationDuration = animDuration;
        confetti.style.width = size;
        confetti.style.height = size;
        confetti.style.top = '-10px';
        confetti.style.position = 'fixed';
        confetti.style.borderRadius = '50%';
        confetti.style.zIndex = '100';

        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}
