// script.js

// Конфигурация API
const API = {
    savefrom: 'https://en.savefrom.net/api/convert'
};

// Проверка премиум статуса при загрузке
document.addEventListener('DOMContentLoaded', function() {
    checkPremiumStatus();
    setupDownloadButton();
});

// Проверка премиум статуса
function checkPremiumStatus() {
    const isPremium = window.isPremiumActive ? window.isPremiumActive() : false;
    
    if (isPremium) {
        showNotification('Премиум активен! Доступны все функции', 'success');
    }
}

// Настройка кнопки скачивания
function setupDownloadButton() {
    const downloadBtn = document.getElementById('downloadBtn');
    const videoUrl = document.getElementById('videoUrl');
    const resultDiv = document.getElementById('result');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async function() {
            const url = videoUrl.value.trim();
            
            if (!url) {
                showResult('❌ Введите ссылку на видео', 'error');
                return;
            }
            
            // Показываем загрузку
            showResult('🔄 Получаем информацию о видео...', 'info');
            
            // Определяем платформу
            const platform = detectPlatform(url);
            
            if (!platform) {
                showResult('❌ Платформа не поддерживается', 'error');
                return;
            }
            
            // Проверяем доступность
            const isPremium = window.isPremiumActive ? window.isPremiumActive() : false;
            
            // Если это YouTube и нет премиума - разрешаем только 480p
            if (platform === 'youtube' && !isPremium) {
                await downloadFromSaveFrom(url, '480p');
            } 
            // Если есть премиум - разрешаем всё
            else if (isPremium) {
                await downloadFromSaveFrom(url, 'all');
            } 
            // Если нет премиума и это не YouTube
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

// Скачивание через SaveFrom.net API
async function downloadFromSaveFrom(url, quality) {
    try {
        // Их публичный API для конвертации
        const apiUrl = `https://en.savefrom.net/api/convert?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.url) {
            // Получаем информацию о видео
            const videoInfo = {
                title: data.title || 'video',
                duration: data.duration || '0:00',
                thumbnail: data.thumbnail || '',
                formats: []
            };
            
            // Формируем доступные форматы
            if (quality === '480p') {
                // Только 480p для бесплатных
                videoInfo.formats.push({
                    quality: '480p',
                    url: data.url,
                    type: 'video'
                });
            } else {
                // Все форматы для премиум
                videoInfo.formats = [
                    { quality: '4K', url: data.url + '&quality=4k', type: 'video' },
                    { quality: '1080p', url: data.url + '&quality=1080', type: 'video' },
                    { quality: '720p', url: data.url + '&quality=720', type: 'video' },
                    { quality: '480p', url: data.url + '&quality=480', type: 'video' },
                    { quality: '360p', url: data.url + '&quality=360', type: 'video' },
                    { quality: 'MP3', url: data.url + '&format=mp3', type: 'audio' }
                ];
            }
            
            showVideoOptions(videoInfo, quality === 'all');
        } else {
            showResult('❌ Не удалось получить видео. Проверьте ссылку.', 'error');
        }
    } catch (error) {
        console.error('Ошибка API:', error);
        showResult('❌ Ошибка при загрузке. Попробуйте позже.', 'error');
    }
}

// Показать варианты скачивания
function showVideoOptions(videoInfo, isPremium) {
    let html = `
        <div class="video-info">
            <h3>${videoInfo.title}</h3>
            <p>Длительность: ${videoInfo.duration}</p>
        </div>
        <div class="download-options">
    `;
    
    videoInfo.formats.forEach(format => {
        html += `
            <a href="${format.url}" target="_blank" class="download-option ${format.type}">
                <i class="fas fa-${format.type === 'video' ? 'video' : 'music'}"></i>
                <span>${format.quality}</span>
            </a>
        `;
    });
    
    html += '</div>';
    
    if (!isPremium) {
        html += `
            <div class="premium-upsell">
                <p>✨ Хотите больше качества? <a href="premium.html">Получите Premium</a></p>
            </div>
        `;
    }
    
    showResult(html, 'success');
}

// Определение платформы
function detectPlatform(url) {
    const platforms = [
        { name: 'youtube', patterns: ['youtube.com', 'youtu.be', 'm.youtube', 'youtube shorts'] },
        { name: 'tiktok', patterns: ['tiktok.com', 'vm.tiktok'] },
        { name: 'instagram', patterns: ['instagram.com', 'instagr.am'] },
        { name: 'vk', patterns: ['vk.com', 'vkontakte.ru'] },
        { name: 'twitter', patterns: ['twitter.com', 'x.com'] },
        { name: 'facebook', patterns: ['facebook.com', 'fb.com', 'fb.watch'] },
        { name: 'twitch', patterns: ['twitch.tv', 'clips.twitch'] },
        { name: 'soundcloud', patterns: ['soundcloud.com', 'snd.cloud'] },
        { name: 'vimeo', patterns: ['vimeo.com'] },
        { name: 'likee', patterns: ['likee.com', 'likee.video'] }
    ];
    
    for (const platform of platforms) {
        if (platform.patterns.some(pattern => url.toLowerCase().includes(pattern))) {
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
        'twitch': 'Twitch',
        'soundcloud': 'SoundCloud',
        'vimeo': 'Vimeo',
        'likee': 'Likee'
    };
    return names[platform] || platform;
}

// Показать результат
function showResult(message, type) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.className = 'result-card ' + type;
    resultDiv.innerHTML = message;
    
    // Прокрутка к результату
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Показать уведомление
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' : '#f44336'};
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        z-index: 2000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем стили для анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -100%); opacity: 0; }
    }
    
    .download-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
        margin-top: 20px;
    }
    
    .download-option {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border-radius: 50px;
        text-decoration: none;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    
    .download-option.video {
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
    }
    
    .download-option.audio {
        background: linear-gradient(135deg, #2196F3, #1976D2);
        color: white;
    }
    
    .download-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    
    .premium-upsell {
        margin-top: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        border-radius: 50px;
        text-align: center;
    }
    
    .premium-upsell a {
        color: #000;
        font-weight: bold;
        text-decoration: none;
    }
    
    .video-info {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .video-info h3 {
        font-size: 16px;
        margin-bottom: 5px;
        color: #fff;
    }
    
    .video-info p {
        color: #aaa;
        font-size: 14px;
    }
`;
document.head.appendChild(style);
