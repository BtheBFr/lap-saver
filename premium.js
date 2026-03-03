// premium.js
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHVZwGqYDuVeyEIf3bgwvnoow8MvB_um27k9-x3jL0QBg3GJGb-d5yj787HuxG38yL/exec';

// Прокси для обхода CORS (если понадобится)
const PROXIES = [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy/?quest=',
    'https://corsproxy.io/?'
];

// Проверка доступности прокси при загрузке
(function() {
    console.log('Premium.js загружен');
    
    // Проверяем сохраненный токен при загрузке
    const savedToken = localStorage.getItem('premium_token');
    if (savedToken) {
        console.log('Найден сохраненный токен:', savedToken);
        checkPremiumToken(savedToken).then(result => {
            if (result.isValid) {
                showNotification('✅ Премиум активен', 'success');
            } else {
                // Если токен недействителен, удаляем его
                localStorage.removeItem('premium_token');
                localStorage.removeItem('premium_expiry');
                localStorage.removeItem('premium_activated');
            }
        });
    }
})();

// Функция проверки токена
async function checkPremiumToken(token) {
    try {
        // Сначала пробуем прямой запрос
        try {
            const url = `${SCRIPT_URL}?action=checkToken&token=${encodeURIComponent(token)}&t=${Date.now()}`;
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Ответ от сервера:', data);
                return data;
            }
        } catch (directError) {
            console.log('Прямой запрос не сработал, пробуем через прокси');
        }
        
        // Если прямой запрос не сработал, пробуем через прокси
        for (const proxy of PROXIES) {
            try {
                const proxyUrl = `${proxy}${encodeURIComponent(SCRIPT_URL + '?action=checkToken&token=' + encodeURIComponent(token) + '&t=' + Date.now())}`;
                
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Ответ через прокси:', data);
                    return data;
                }
            } catch (proxyError) {
                console.log('Прокси не сработал:', proxy);
            }
        }
        
        // Если все прокси не сработали, проверяем по локальному токену
        if (token === 'KL3OEW') {
            return {
                status: 'success',
                isValid: true,
                premium: true,
                name: 'Данил',
                expiryDate: '20.02.2099',
                message: '✅ Премиум активен (локальная проверка)'
            };
        }
        
        throw new Error('Все способы подключения не сработали');
        
    } catch (error) {
        console.error('Ошибка при проверке токена:', error);
        
        // Проверяем локально для тестового токена
        if (token === 'KL3OEW') {
            return {
                status: 'success',
                isValid: true,
                premium: true,
                name: 'Данил',
                expiryDate: '20.02.2099',
                message: '✅ Премиум активен (оффлайн режим)'
            };
        }
        
        return {
            status: 'error',
            isValid: false,
            message: '❌ Ошибка соединения с сервером. Проверьте интернет.'
        };
    }
}

// Сохранение токена в localStorage
function saveToken(token, expiryDate) {
    localStorage.setItem('premium_token', token);
    localStorage.setItem('premium_expiry', expiryDate || '2099-12-31');
    localStorage.setItem('premium_activated', Date.now().toString());
    
    // Сохраняем дополнительную информацию для токена KL3OEW
    if (token === 'KL3OEW') {
        localStorage.setItem('premium_name', 'Данил');
        localStorage.setItem('premium_forever', 'true');
    }
}

// Проверка, активен ли премиум
function isPremiumActive() {
    const token = localStorage.getItem('premium_token');
    const expiry = localStorage.getItem('premium_expiry');
    const forever = localStorage.getItem('premium_forever');
    
    if (!token) return false;
    
    // Специальная проверка для KL3OEW (бессрочный)
    if (token === 'KL3OEW' || forever === 'true') {
        return true;
    }
    
    if (!expiry) return false;
    
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Пробуем разные форматы даты
        let expiryDate;
        if (expiry.includes('.')) {
            const parts = expiry.split('.');
            expiryDate = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
            expiryDate = new Date(expiry);
        }
        
        if (isNaN(expiryDate.getTime())) return false;
        
        expiryDate.setHours(0, 0, 0, 0);
        return today <= expiryDate;
    } catch (e) {
        console.error('Ошибка при проверке даты:', e);
        return false;
    }
}

// Получить информацию о премиуме
function getPremiumInfo() {
    return {
        token: localStorage.getItem('premium_token'),
        expiry: localStorage.getItem('premium_expiry'),
        name: localStorage.getItem('premium_name'),
        activated: localStorage.getItem('premium_activated'),
        isActive: isPremiumActive()
    };
}

// Очистить премиум (выход)
function clearPremium() {
    localStorage.removeItem('premium_token');
    localStorage.removeItem('premium_expiry');
    localStorage.removeItem('premium_activated');
    localStorage.removeItem('premium_name');
    localStorage.removeItem('premium_forever');
}

// Показать уведомление
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : 
                      type === 'error' ? '#f44336' : 
                      'linear-gradient(135deg, #2196F3, #1976D2)'};
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        z-index: 2000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Обработчик формы токена
document.addEventListener('DOMContentLoaded', function() {
    const activateBtn = document.getElementById('activateTokenBtn');
    const tokenInput = document.getElementById('tokenInput');
    const tokenResult = document.getElementById('tokenResult');
    
    if (activateBtn && tokenInput && tokenResult) {
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
                if (result.expiryDate && result.expiryDate !== 'бессрочно' && result.expiryDate !== '20.02.2099') {
                    message += `<br>📅 Срок действия: ${result.expiryDate}`;
                } else {
                    message += '<br>📅 Срок действия: бессрочно';
                }
                
                if (result.name) {
                    message += `<br>👤 Владелец: ${result.name}`;
                    localStorage.setItem('premium_name', result.name);
                }
                
                showResult(message, 'success');
                
                // Показываем уведомление
                showNotification('✅ Премиум активирован!', 'success');
                
                // Перенаправление через 2 секунды
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showResult(result.message || '❌ Недействительный токен', 'error');
            }
        });
        
        // Добавляем обработку Enter
        tokenInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                activateBtn.click();
            }
        });
    }
    
    function showResult(message, type) {
        tokenResult.style.display = 'block';
        tokenResult.className = 'token-result ' + type;
        tokenResult.innerHTML = message;
    }
});

// Экспорт функций в глобальную область
window.checkPremiumToken = checkPremiumToken;
window.isPremiumActive = isPremiumActive;
window.saveToken = saveToken;
window.getPremiumInfo = getPremiumInfo;
window.clearPremium = clearPremium;

console.log('Premium.js готов к работе');
