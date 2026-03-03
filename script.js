// script.js - ИСПРАВЛЕННАЯ ВЕРСИЯ

// Проверка премиум статуса при загрузке
document.addEventListener('DOMContentLoaded', function() {
    checkPremiumStatus();
    setupDownloadButton();
});

// Проверка премиум статуса
function checkPremiumStatus() {
    const isPremium = window.isPremiumActive ? window.isPremiumActive() : false;
    
    if (isPremium) {
        showNotification('👑 Премиум активен! Доступны все функции', 'success');
    }
}

// Настройка кнопки скачивания
function setupDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    const videoUrl = document.getElementById('videoUrl');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async function() {
            const url = videoUrl.value.trim();
            
            if (!url) {
                showResult('❌ Введите ссылку на видео', 'error');
                return;
            }
            
            // Определяем платформу
            const platform = detectPlatform(url);
            
            if (!platform) {
                showResult('❌ Платформа не поддерживается', 'error');
                return;
            }
            
            // Проверяем премиум статус
            const isPremium = window.isPremiumActive ? window.isPremiumActive() : false;
            
            // Если есть премиум - показываем выбор качества
            if (isPremium) {
                showQualitySelector(url, platform);
            } 
            // Если YouTube без премиума - только 480p
            else if (platform === 'youtube') {
                await downloadFromSaveFrom(url, '480');
            }
            // Остальные платформы без премиума
            else {
                showResult(
                    '❌ Для скачивания с ' + getPlatformName(platform) + ' нужен Premium<br>' +
                    '<a href="premium.html" style="color: #FFD700; text-decoration: none;">' +
                    '👑 Купить Premium →</a>',
                    'error'
                );
            }
        });
    }
}

// Скачивание через SaveFrom.net (работает без CORS)
async function downloadFromSaveFrom(url, quality) {
    try {
        showResult('🔄 Получаем видео...', 'info');
        
        // Используем их публичный сервис (открывается в новой вкладке)
        const saveFromUrl = `https://en.savefrom.net/ru/#url=${encodeURIComponent(url)}`;
        
        let resultHtml = `
            <div class="video-info">
                <h3>✅ Видео готово к скачиванию</h3>
                <p>Нажмите кнопку ниже:</p>
            </div>
            <div style="text-align: center;">
                <a href="${saveFromUrl}" target="_blank" class="download-option video" style="display: inline-flex; width: auto; padding: 15px 40px;">
                    <i class="fas fa-download"></i>
                    <span>Скачать видео</span>
                </a>
            </div>
        `;
        
        // Добавляем рекламу премиума
        resultHtml += `
            <div class="premium-upsell" style="margin-top: 25px;">
                <p>✨ Хотите скачивать с других платформ?</p>
                <a href="premium.html">Получить Premium →</a>
            </div>
        `;
        
        showResult(resultHtml, 'success');
        
    } catch (error) {
        console.error('Ошибка:', error);
        showResult('❌ Ошибка при загрузке. Попробуйте позже.', 'error');
    }
}

// Показываем выбор качества для премиум пользователей
function showQualitySelector(url, platform) {
    let html = `
        <div class="video-info">
            <h3>🎬 Выберите качество</h3>
            <p>Платформа: ${getPlatformName(platform)}</p>
        </div>
        <div class="download-options">
    `;
    
    // Качество для разных платформ
    const qualities = [
        { value: '2160', label: '4K (2160p)', type: 'video' },
        { value: '1080', label: 'Full HD (1080p)', type: 'video' },
        { value: '720', label: 'HD (720p)', type: 'video' },
        { value: '480', label: '480p', type: 'video' },
        { value: 'audio', label: 'Аудио (MP3)', type: 'audio' }
    ];
    
    qualities.forEach(q => {
        html += `
            <button onclick="downloadPremiumVideo('${url}', '${q.value}')" class="download-option ${q.type}">
                <i class="fas fa-${q.type === 'video' ? 'video' : 'music'}"></i>
                <span>${q.label}</span>
            </button>
        `;
    });
    
    html += '</div>';
    
    showResult(html, 'premium');
}

// Скачивание премиум видео через разные сервисы
window.downloadPremiumVideo = async function(url, quality) {
    showResult('🔄 Подготовка ссылок для скачивания...', 'info');
    
    const platform = detectPlatform(url);
    
    // Словарь сервисов для разных платформ
    const services = {
        youtube: `https://ru.savefrom.net/ru/#url=${encodeURIComponent(url)}`,
        tiktok: `https://snaptik.app/ru?url=${encodeURIComponent(url)}`,
        instagram: `https://saveinsta.app/ru/download?url=${encodeURIComponent(url)}`,
        vk: `https://ru.savefrom.net/ru/#url=${encodeURIComponent(url)}`,
        twitter: `https://savetweet.app/ru?url=${encodeURIComponent(url)}`,
        facebook: `https://fdown.net/ru/download.php?url=${encodeURIComponent(url)}`,
        soundcloud: `https://soundcloudmp3.co/download?url=${encodeURIComponent(url)}`,
        default: `https://en.savefrom.net/ru/#url=${encodeURIComponent(url)}`
    };
    
    const downloadUrl = services[platform] || services.default;
    
    let resultHtml = `
        <div class="video-info">
            <h3>✅ Видео готово к скачиванию</h3>
            <p>Качество: ${quality === 'audio' ? 'MP3 Аудио' : quality + 'p'}</p>
        </div>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${downloadUrl}" target="_blank" class="download-option ${quality === 'audio' ? 'audio' : 'video'}" style="display: inline-flex; width: auto; padding: 15px 40px;">
                <i class="fas fa-${quality === 'audio' ? 'music' : 'download'}"></i>
                <span>Скачать</span>
            </a>
        </div>
        <div style="margin-top: 15px; font-size: 12px; color: #888;">
            <p>💡 Если ссылка не открывается, попробуйте:</p>
            <p>1. Разрешите всплывающие окна</p>
            <p>2. Скопируйте ссылку: ${downloadUrl}</p>
        </div>
    `;
    
    showResult(resultHtml, 'success');
};

// Определение платформы
function detectPlatform(url) {
    const urlLower = url.toLowerCase();
    
    const platforms = [
        { name: 'youtube', patterns: ['youtube.com', 'youtu.be', 'm.youtube.com', 'youtube.com/shorts'] },
        { name: 'tiktok', patterns: ['tiktok.com', 'vm.tiktok.com'] },
        { name: 'instagram', patterns: ['instagram.com', 'instagr.am', 'reels'] },
        { name: 'vk', patterns: ['vk.com', 'vkontakte.ru', 'vkvideo.ru'] },
        { name: 'twitter', patterns: ['twitter.com', 'x.com'] },
        { name: 'facebook', patterns: ['facebook.com', 'fb.com', 'fb.watch'] },
        { name: 'soundcloud', patterns: ['soundcloud.com', 'snd.cloud'] },
        { name: 'vimeo', patterns: ['vimeo.com'] }
    ];
    
    for (const platform of platforms) {
        if (platform.patterns.some(pattern => urlLower.includes(pattern))) {
            return platform.name;
        }
    }
    
    return null;
}

// Получить название платформы
function getPlatformName(platform) {
    const names = {
        'youtube': 'YouTube',
        'tiktok': 'TikTok',
        'instagram': 'Instagram',
        'vk': 'VK',
        'twitter': 'Twitter/X',
        'facebook': 'Facebook',
        'soundcloud': 'SoundCloud',
        'vimeo': 'Vimeo'
    };
    return names[platform] || platform;
}

// Показать результат
function showResult(message, type) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.className = 'result-card ' + type;
        resultDiv.innerHTML = message;
        
        setTimeout(() => {
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
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

// Обработка Enter
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('videoUrl');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('downloadBtn').click();
            }
        });
    }
});
