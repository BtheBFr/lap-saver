// script.js

// Конфигурация API с CORS-прокси
const API = {
    // Используем CORS прокси для обхода блокировки
    proxy: 'https://cors-anywhere.herokuapp.com/',
    savefrom: 'https://en.savefrom.net/api/convert'
};

// Альтернативные API (на случай если один не работает)
const APIS = [
    'https://api.codetabs.com/v1/proxy/?quest=',
    'https://corsproxy.io/?',
    'https://thingproxy.freeboard.io/fetch/'
];

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
            
            // Проверяем доступность
            const isPremium = window.isPremiumActive ? window.isPremiumActive() : false;
            
            // Если это YouTube и нет премиума - разрешаем только 480p
            if (platform === 'youtube' && !isPremium) {
                await downloadVideo(url, '480p');
            } 
            // Если есть премиум - разрешаем всё
            else if (isPremium) {
                await downloadVideo(url, 'all');
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

// Скачивание видео с использованием разных API
async function downloadVideo(url, quality) {
    // Пробуем разные прокси
    for (const proxy of APIS) {
        try {
            // Пробуем сначала через SaveFrom
            const result = await trySaveFrom(proxy, url);
            if (result) {
                showVideoOptions(result, quality === 'all');
                return;
            }
        } catch (error) {
            console.log('Прокси не сработал:', proxy);
        }
    }
    
    // Если ничего не сработало, показываем альтернативные ссылки
    showAlternativeLinks(url);
}

// Попытка через SaveFrom.net
async function trySaveFrom(proxy, url) {
    try {
        const apiUrl = `${proxy}${encodeURIComponent('https://en.savefrom.net/api/convert?url=' + encodeURIComponent(url))}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Origin': window.location.origin
            }
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        
        if (data.url) {
            return {
                title: data.title || 'Видео',
                duration: data.duration || '0:00',
                thumbnail: data.thumbnail || '',
                downloadUrl: data.url
            };
        }
        return null;
    } catch (error) {
        console.log('SaveFrom не сработал:', error);
        return null;
    }
}

// Показать альтернативные ссылки
function showAlternativeLinks(url) {
    const platform = detectPlatform(url);
    
    let html = `
        <div class="video-info">
            <h3>🔗 Прямые ссылки для скачивания</h3>
            <p>Скопируйте ссылку и вставьте в один из сервисов:</p>
        </div>
        <div class="download-options" style="grid-template-columns: 1fr;">
    `;
    
    const services = [
        { name: 'SaveFrom.net', link: `https://ru.savefrom.net/ru/#url=${encodeURIComponent(url)}` },
        { name: 'SSYouTube', link: `https://ssyoutube.com/ru/youtube-video-downloader?url=${encodeURIComponent(url)}` }
    ];
    
    if (platform === 'tiktok') {
        services.push({ name: 'SnapTik', link: `https://snaptik.app/ru?url=${encodeURIComponent(url)}` });
    }
    
    if (platform === 'instagram') {
        services.push({ name: 'SaveInsta', link: `https://saveinsta.app/ru/download?url=${encodeURIComponent(url)}` });
    }
    
    services.forEach(service => {
        html += `
            <a href="${service.link}" target="_blank" class="download-option video" style="margin-bottom: 10px;">
                <i class="fas fa-external-link-alt"></i>
                <span>${service.name}</span>
            </a>
        `;
    });
    
    html += '</div>';
    
    if (platform === 'youtube') {
        html += `
            <div style="margin-top: 20px; text-align: center;">
                <p style="color: #aaa;">📱 Или используйте YouTube Music для скачивания аудио</p>
            </div>
        `;
    }
    
    showResult(html, 'info');
}

// Показать варианты скачивания
function showVideoOptions(videoInfo, isPremium) {
    let html = `
        <div class="video-info">
            <h3>📹 ${videoInfo.title}</h3>
            <p><i class="far fa-clock"></i> Длительность: ${videoInfo.duration}</p>
        </div>
        <div class="download-options">
    `;
    
    if (isPremium) {
        // Премиум форматы
        const formats = [
            { quality: '4K', icon: 'fa-video', type: 'video' },
            { quality: '1080p', icon: 'fa-video', type: 'video' },
            { quality: '720p', icon: 'fa-video', type: 'video' },
            { quality: '480p', icon: 'fa-video', type: 'video' },
            { quality: '360p', icon: 'fa-video', type: 'video' },
            { quality: 'MP3', icon: 'fa-music', type: 'audio' }
        ];
        
        formats.forEach(format => {
            html += `
                <a href="${videoInfo.downloadUrl}&quality=${format.quality}" target="_blank" class="download-option ${format.type}">
                    <i class="fas ${format.icon || 'fa-download'}"></i>
                    <span>${format.quality}</span>
                </a>
            `;
        });
    } else {
        // Бесплатно только 480p
        html += `
            <a href="${videoInfo.downloadUrl}&quality=480p" target="_blank" class="download-option video">
                <i class="fas fa-video"></i>
                <span>480p (бесплатно)</span>
            </a>
        `;
    }
    
    html += '</div>';
    
    if (!isPremium) {
        html += `
            <div class="premium-upsell">
                <p>✨ Хотите 4K, TikTok без водяного знака и аудио?</p>
                <a href="premium.html">Получить Premium →</a>
            </div>
        `;
    }
    
    showResult(html, isPremium ? 'premium' : 'success');
}

// Определение платформы
function detectPlatform(url) {
    const urlLower = url.toLowerCase();
    
    const platforms = [
        { name: 'youtube', patterns: ['youtube.com', 'youtu.be', 'm.youtube.com', 'youtube shorts', 'youtube.com/shorts'] },
        { name: 'tiktok', patterns: ['tiktok.com', 'vm.tiktok.com'] },
        { name: 'instagram', patterns: ['instagram.com', 'instagr.am', 'reels'] },
        { name: 'vk', patterns: ['vk.com', 'vkontakte.ru', 'vkvideo.ru'] },
        { name: 'twitter', patterns: ['twitter.com', 'x.com'] },
        { name: 'facebook', patterns: ['facebook.com', 'fb.com', 'fb.watch'] },
        { name: 'twitch', patterns: ['twitch.tv', 'clips.twitch.tv'] },
        { name: 'soundcloud', patterns: ['soundcloud.com', 'snd.cloud'] },
        { name: 'vimeo', patterns: ['vimeo.com'] },
        { name: 'likee', patterns: ['likee.com', 'likee.video'] }
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
        'vimeo': 'Vimeo',
        'likee': 'Likee'
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

// Добавляем обработку Enter в поле ввода
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
