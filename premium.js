// premium.js
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHVZwGqYDuVeyEIf3bgwvnoow8MvB_um27k9-x3jL0QBg3GJGb-d5yj787HuxG38yL/exec';

// Функция проверки токена
async function checkPremiumToken(token) {
    try {
        // Добавляем параметр для избежания кэширования
        const url = `${SCRIPT_URL}?action=checkToken&token=${encodeURIComponent(token)}&t=${Date.now()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Ответ от сервера:', data); // Для отладки
        
        return data;
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        return {
            status: 'error',
            isValid: false,
            message: '❌ Ошибка соединения с сервером'
        };
    }
}

// Сохранение токена в localStorage
function saveToken(token, expiryDate) {
    localStorage.setItem('premium_token', token);
    localStorage.setItem('premium_expiry', expiryDate || '2099-12-31');
    localStorage.setItem('premium_activated', Date.now().toString());
}

// Проверка, активен ли премиум
function isPremiumActive() {
    const token = localStorage.getItem('premium_token');
    const expiry = localStorage.getItem('premium_expiry');
    
    if (!token || !expiry) return false;
    
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const expiryDate = new Date(expiry);
        if (isNaN(expiryDate.getTime())) {
            // Если дата некорректная, проверяем по токену
            return token === 'KL3OEW'; // Специально для вашего токена
        }
        
        expiryDate.setHours(0, 0, 0, 0);
        return today <= expiryDate;
    } catch (e) {
        // В случае ошибки, проверяем по токену
        return token === 'KL3OEW';
    }
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
                showResult('❌ Введите токен', 'error');
                return;
            }
            
            showResult('🔄 Проверка токена...', 'info');
            
            const result = await checkPremiumToken(token);
            
            if (result.status === 'success' && result.isValid) {
                // Сохраняем токен
                saveToken(token, result.expiryDate);
                
                let message = '✅ Премиум активирован!';
                if (result.expiryDate && result.expiryDate !== 'бессрочно') {
                    message += `<br>📅 Срок действия: ${result.expiryDate}`;
                } else {
                    message += '<br>📅 Срок действия: бессрочно';
                }
                
                if (result.name) {
                    message += `<br>👤 Владелец: ${result.name}`;
                }
                
                showResult(message, 'success');
                
                // Перенаправление через 2 секунды
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showResult(result.message || '❌ Недействительный токен', 'error');
            }
        });
    }
    
    function showResult(message, type) {
        if (tokenResult) {
            tokenResult.style.display = 'block';
            tokenResult.className = 'token-result ' + type;
            tokenResult.innerHTML = message;
        }
    }
});

// Экспорт функций
window.checkPremiumToken = checkPremiumToken;
window.isPremiumActive = isPremiumActive;
window.saveToken = saveToken;
