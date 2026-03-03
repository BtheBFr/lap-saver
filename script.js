// script.js

// Проверка премиум статуса при загрузке
document.addEventListener('DOMContentLoaded', function() {
    checkPremiumStatus();
    setupDownloadButton();
});

// Проверка премиум статуса
function checkPremiumStatus() {
    const isPremium = window.isPremiumActive ? window.isPremiumActive() : false;
    
    if (isPremium) {
        // Показываем уведомление о премиуме
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
                showResult('Введите ссылку на видео', 'error');
                return;
            }
            
            // Определяем платформу
            const platform = detectPlatform(url);
            
            if (!platform) {
                showResult('Платформа не поддерживается', 'error');
                return;
            }
            
            // Проверяем доступность
            const isPremium = window.isPremiumActive ? window.isPremiumActive() : false;
            
            if (platform === 'youtube' && !isPremium) {
                // YouTube бесплатно до 480p
                downloadYouTube(url, '480p');
            } else if (isPremium) {
                // Премиум скачивание
                downloadPremium(url, platform);
            } else {
                // Нет доступа
                showResult(
                    '❌ Для скачивания с ' + platform + ' нужен Premium. ' +
                    '<a href="premium.html" style="color: #FFD700;">Купить Premium →</a>',
                    'error'
                );
            }
        });
    }
}

// Определение платформы
function detectPlatform(url) {
    const platforms = [
        { name: 'youtube', patterns: ['youtube.com', 'youtu.be', 'm.youtube'] },
        { name: 'tiktok', patterns: ['tiktok.com'] },
        { name: 'instagram', patterns: ['instagram.com'] },
        { name: 'vk', patterns: ['vk.com', 'vkontakte'] },
        { name: 'twitter', patterns: ['twitter.com', 'x.com'] },
        { name: 'facebook', patterns: ['facebook.com', 'fb.com'] },
        { name: 'twitch', patterns: ['twitch.tv'] },
        { name: 'soundcloud', patterns: ['soundcloud.com'] }
    ];
    
    for (const platform of platforms) {
        if (platform.patterns.some(pattern => url.includes(pattern))) {
            return platform.name;
        }
    }
    
    return null;
}

// Скачивание с YouTube (бесплатно)
function downloadYouTube(url, quality) {
    showResult(
        `🔄 Подготовка скачивания с YouTube (${quality})...<br>` +
        `📥 Ссылка: ${url}`,
        'info'
    );
    
    // Здесь будет интеграция с yt-dlp API
    setTimeout(() => {
        showResult(
            '✅ Видео готово к скачиванию!<br>' +
            '<a href="#" class="download-btn" style="display: inline-block; margin-top: 15px;">' +
            '<i class="fas fa-download"></i> Скачать</a>',
            'success'
        );
    }, 2000);
}

// Премиум скачивание
function downloadPremium(url, platform) {
    showResult(
        `🔄 Premium: Подготовка скачивания с ${platform}...<br>` +
        `📥 Ссылка: ${url}`,
        'premium'
    );
    
    // Показываем выбор качества
    const qualityOptions = `
        <div style="margin-top: 20px;">
            <p>Выберите качество:</p>
            <select id="qualitySelect" style="
                width: 100%;
                padding: 12px;
                border-radius: 10px;
                background: rgba(0,0,0,0.5);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
                margin: 10px 0;
            ">
                <option value="4k">4K (2160p)</option>
                <option value="1080p">Full HD (1080p)</option>
                <option value="720p">HD (720p)</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
                <option value="audio">Аудио (MP3)</option>
            </select>
            <button onclick="startPremiumDownload()" class="download-btn" style="width: 100%;">
                <i class="fas fa-download"></i> Скачать
            </button>
        </div>
    `;
    
    document.getElementById('result').innerHTML += qualityOptions;
}

// Начало премиум скачивания
function startPremiumDownload() {
    const quality = document.getElementById('qualitySelect').value;
    showResult('📥 Скачивание началось...', 'info');
    
    setTimeout(() => {
        if (quality === 'audio') {
            showResult(
                '✅ Аудио готово!<br>' +
                '<a href="#" class="download-btn" style="display: inline-block; margin-top: 15px;">' +
                '<i class="fas fa-music"></i> Скачать MP3</a>',
                'success'
            );
        } else {
            showResult(
                `✅ Видео ${quality} готово!<br>` +
                '<a href="#" class="download-btn" style="display: inline-block; margin-top: 15px;">' +
                '<i class="fas fa-download"></i> Скачать</a>',
                'success'
            );
        }
    }, 3000);
}

// Показать результат
function showResult(message, type) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.className = 'result-card ' + type;
    resultDiv.innerHTML = message;
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
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        z-index: 2000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
