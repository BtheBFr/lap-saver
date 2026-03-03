// script.js - РАБОЧАЯ ВЕРСИЯ с Cobalt API

// API Cobalt (публичный, бесплатный, без CORS)
const COBALT_API = 'https://co.wuk.sh/api/json';

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
            
            // Показываем загрузку
            showResult('🔄 Получаем информацию о видео...', 'info');
            
            // Определяем платформу
            const platform = detectPlatform(url);
            
            if (!platform) {
                showResult('❌ Платформа не поддерживается', 'error');
                return;
            }
            
            // Проверяем премиум статус
            const isPremium = window.isPremiumActive ? window.isPremiumActive() : false;
            
            // Если это YouTube и нет премиума - только 480p
            if (platform === 'youtube' && !isPremium) {
                await fetchVideoFromCobalt(url, '480');
            } 
            // Если есть премиум - все качества + аудио
            else if (isPremium) {
                // Показываем выбор качества
                showQualitySelector(url, platform);
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

// Показываем выбор качества для премиум пользователей
function showQualitySelector(url, platform) {
    let html = `
        <div class="video-info">
            <h3>🎬 Выберите качество</h3>
        </div>
        <div class="download-options">
    `;
    
    const qualities = [
        { value: '2160', label: '4K (2160p)', type: 'video' },
        { value: '1440', label: '2K (1440p)', type: 'video' },
        { value: '1080', label: 'Full HD (1080p)', type: 'video' },
        { value: '720', label: 'HD (720p)', type: 'video' },
        { value: '480', label: '480p', type: 'video' },
        { value: '360', label: '360p', type: 'video' },
        { value: 'audio', label: 'Аудио (MP3)', type: 'audio' }
    ];
    
    qualities.forEach(q => {
        html += `
            <button onclick="downloadWithQuality('${url}', '${q.value}')" class="download-option ${q.type}">
                <i class="fas fa-${q.type === 'video' ? 'video' : 'music'}"></i>
                <span>${q.label}</span>
            </button>
        `;
    });
    
    html += '</div>';
    
    showResult(html, 'premium');
}

// Глобальная функция для скачивания с выбранным качеством
window.downloadWithQuality = async function(url, quality) {
    await fetchVideoFromCobalt(url, quality);
};

// Основная функция для запроса к Cobalt API
async function fetchVideoFromCobalt(url, quality) {
    try {
        showResult('🔄 Загружаем видео... Пожалуйста, подождите.', 'info');
        
        // Настраиваем параметры запроса
        const requestBody = {
            url: url,
            vCodec: 'h264', // самый совместимый кодек
            vQuality: quality, // качество: '2160', '1440', '1080', '720', '480', '360', 'audio'
            aFormat: 'mp3', // для аудио
            isAudioOnly: quality === 'audio',
            isNoTTWatermark: true, // убираем водяной знак с TikTok
        };
        
        const response = await fetch(COBALT_API, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
            throw new Error(data.text || 'Ошибка при загрузке');
        }
        
        if (data.url) {
            // Успех - показываем ссылку на скачивание
            const fileType = quality === 'audio' ? 'audio' : 'video';
            const fileIcon = quality === 'audio' ? 'fa-music' : 'fa-video';
            const qualityText = quality === 'audio' ? 'Аудио MP3' : `${quality}p`;
            
            let resultHtml = `
                <div class="video-info">
                    <h3>✅ Готово к скачиванию!</h3>
                    <p>Формат: ${qualityText}</p>
                </div>
                <div style="text-align: center;">
                    <a href="${data.url}" target="_blank" class="download-option ${fileType}" style="display: inline-flex; width: auto; padding: 15px 40px;">
                        <i class="fas ${fileIcon}"></i>
                        <span>Скачать ${qualityText}</span>
                    </a>
                </div>
            `;
            
            // Добавляем рекламу премиума для бесплатных пользователей
            const isPremium = window.isPremiumActive ? window.isPremiumActive() : false;
            if (!isPremium) {
                resultHtml += `
                    <div class="premium-upsell" style="margin-top: 25px;">
                        <p>✨ Хотите 4K и другие платформы?</p>
                        <a href="premium.html">Получить Premium →</a>
                    </div>
                `;
            }
            
            showResult(resultHtml, 'success');
        } else {
            showResult('❌ Не удалось получить видео. Попробуйте другую ссылку.', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка Cobalt API:', error);
        showResult('❌ Ошибка при загрузке. Попробуйте позже.', 'error');
    }
}

// Определение платформы
function detectPlatform(url) {
    const urlLower = url.toLowerCase();
    
    const platforms = [
        { name: 'youtube', patterns: ['youtube.com', 'youtu.be', 'm.youtube.com', 'youtube.com/shorts'] },
        { name: 'tiktok', patterns: ['tiktok.com', 'vm.tiktok.com'] },
        { name: 'instagram', patterns: ['instagram.com', 'instagr.am', 'reels'] },
        { name: 'vk', patterns: ['vk.com', 'vkontakte.ru'] },
        { name: 'twitter', patterns: ['twitter.com', 'x.com'] },
        { name: 'facebook', patterns: ['facebook.com', 'fb.com', 'fb.watch'] },
        { name: 'twitch', patterns: ['twitch.tv'] },
        { name: 'soundcloud', patterns: ['soundcloud.com'] },
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
        'twitch': 'Twitch',
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
        
        // Прокрутка к результату
        setTimeout(() => {
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Показать уведомление
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = 'notification';
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

// Добавляем обработку Enter
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
