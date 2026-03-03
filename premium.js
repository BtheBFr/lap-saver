// premium.js
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHVZwGqYDuVeyEIf3bgwvnoow8MvB_um27k9-x3jL0QBg3GJGb-d5yj787HuxG38yL/exec';

// Функция проверки токена
async function checkPremiumToken(token) {
    try {
        const url = `${SCRIPT_URL}?action=checkToken&token=${encodeURIComponent(token)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        return {
            status: 'error',
            isValid: false,
            message: 'Ошибка соединения с сервером'
        };
    }
}

// Сохранение токена в localStorage
function saveToken(token) {
    localStorage.setItem('premium_token', token);
    localStorage.setItem('premium_expiry', '2099-02-20'); // Для токена KL3OEW
}

// Проверка, активен ли премиум
function isPremiumActive() {
    const token = localStorage.getItem('premium_token');
    const expiry = localStorage.getItem('premium_expiry');
    
    if (!token || !expiry) return false;
    
    const today = new Date();
    const expiryDate = new Date(expiry);
    
    return today <= expiryDate;
}

// Обработчик формы токена
document.addEventListener('DOMContentLoaded', function() {
    const activateBtn = document.getElementById('activateTokenBtn');
    const tokenInput = document.getElementById('tokenInput');
    const tokenResult = document.getElementById('tokenResult');
    
    if (activateBtn) {
        activateBtn.addEventListener('click', async function() {
            const token = tokenInput.value.trim();
            
            if (!token) {
                showResult('Введите токен', 'error');
                return;
            }
            
            showResult('Проверка...', 'info');
            
            const result = await checkPremiumToken(token);
            
            if (result.isValid) {
                saveToken(token);
                showResult('✅ Премиум активирован! Срок до: ' + result.expiryDate, 'success');
                
                // Перенаправление через 2 секунды
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showResult('❌ ' + result.message, 'error');
            }
        });
    }
    
    function showResult(message, type) {
        tokenResult.style.display = 'block';
        tokenResult.className = 'token-result ' + type;
        tokenResult.innerHTML = message;
    }
});

// Экспорт функций
window.checkPremiumToken = checkPremiumToken;
window.isPremiumActive = isPremiumActive;
