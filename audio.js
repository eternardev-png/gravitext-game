// Аудио менеджер
class AudioManager {
    constructor() {
        // Звуковые эффекты
        this.sounds = {
            create: null,      // Звук создания блока
            collision: null,   // Звук столкновения
            explosion: null,   // Звук взрыва
            freeze: null,      // Звук заморозки
            rainbow: null,     // Звук радуги
            flip: null,        // Звук переворота гравитации
            glue: null         // Звук клея
        };

        this.enabled = true;
        this.volume = 0.5;

        // Фоновая музыка
        this.musicEnabled = false;
        this.musicVolume = 0.3;
        this.musicOscillators = [];
        this.musicGainNode = null;

        // Загружаем настройки из localStorage
        this.loadSettings();
    }

    // Инициализация звуков (используем Web Audio API для генерации звуков)
    init() {
        // Создаём простые звуковые эффекты с помощью Web Audio API
        // Это позволяет не загружать внешние файлы
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Воспроизведение звука
    playSound(soundName) {
        if (!this.enabled || !this.audioContext) return;

        try {
            switch (soundName) {
                case 'create':
                    this.playCreateSound();
                    break;
                case 'collision':
                    this.playCollisionSound();
                    break;
                case 'explosion':
                    this.playExplosionSound();
                    break;
                case 'freeze':
                    this.playFreezeSound();
                    break;
                case 'rainbow':
                    this.playRainbowSound();
                    break;
                case 'flip':
                    this.playFlipSound();
                    break;
                case 'glue':
                    this.playGlueSound();
                    break;
            }
        } catch (e) {
            console.error('Ошибка воспроизведения звука:', e);
        }
    }

    // Звук создания блока (короткий "пинг")
    playCreateSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // Звук столкновения (короткий "бум")
    playCollisionSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 100;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }

    // Звук взрыва
    playExplosionSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // Звук заморозки
    playFreezeSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(500, this.audioContext.currentTime + 0.2);
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // Звук радуги (восходящая гамма)
    playRainbowSound() {
        const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = this.audioContext.currentTime + (index * 0.05);
            gainNode.gain.setValueAtTime(this.volume * 0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.1);
        });
    }

    // Звук переворота гравитации
    playFlipSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }

    // Звук клея
    playGlueSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 150;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // Включить/выключить звук
    toggle() {
        this.enabled = !this.enabled;
        this.saveSettings();
        return this.enabled;
    }

    // Установить громкость
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    // Сохранить настройки
    saveSettings() {
        localStorage.setItem('gravitext_audio', JSON.stringify({
            enabled: this.enabled,
            volume: this.volume,
            musicEnabled: this.musicEnabled,
            musicVolume: this.musicVolume
        }));
    }

    // Загрузить настройки
    loadSettings() {
        const saved = localStorage.getItem('gravitext_audio');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.enabled = settings.enabled !== undefined ? settings.enabled : true;
                this.volume = settings.volume !== undefined ? settings.volume : 0.5;
                this.musicEnabled = settings.musicEnabled !== undefined ? settings.musicEnabled : false;
                this.musicVolume = settings.musicVolume !== undefined ? settings.musicVolume : 0.3;
            } catch (e) {
                console.error('Ошибка загрузки настроек аудио:', e);
            }
        }
    }

    // Вибрация для Telegram (если доступна)
    vibrate(pattern = [100]) {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        } else if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // Запуск фоновой музыки
    playBackgroundMusic() {
        if (!this.audioContext || this.musicOscillators.length > 0) return;

        try {
            // Создаём главный gain node для музыки
            this.musicGainNode = this.audioContext.createGain();
            this.musicGainNode.gain.value = this.musicVolume;
            this.musicGainNode.connect(this.audioContext.destination);

            // Чистая космическая музыка
            const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C Major

            // Мягкий пад (фоновый звук)
            [261.63, 329.63, 392.00].forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const startTime = this.audioContext.currentTime + i * 0.5;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.03, startTime + 2);
                osc.connect(gain);
                gain.connect(this.musicGainNode);
                osc.start(startTime);
                this.musicOscillators.push({ oscillator: osc, gain: gain });
            });

            // Мелодичный арпеджиатор
            let arpIndex = 0;
            this.arpInterval = setInterval(() => {
                if (!this.musicEnabled) return;
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.type = 'sine';
                osc.frequency.value = scale[arpIndex % scale.length];
                gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
                osc.connect(gain);
                gain.connect(this.musicGainNode);
                osc.start();
                osc.stop(this.audioContext.currentTime + 0.8);
                arpIndex++;
            }, 500);

            this.musicEnabled = true;
            console.log('🎵 Фоновая музыка запущена');
        } catch (e) {
            console.error('Ошибка запуска музыки:', e);
        }
    }

    // Остановка фоновой музыки
    stopBackgroundMusic() {
        // Останавливаем арпеджиатор
        if (this.arpInterval) {
            clearInterval(this.arpInterval);
            this.arpInterval = null;
        }

        this.musicOscillators.forEach(({ oscillator }) => {
            try {
                oscillator.stop();
            } catch (e) {
                // Игнорируем ошибки остановки
            }
        });

        this.musicOscillators = [];
        this.musicEnabled = false;
        console.log('🎵 Фоновая музыка остановлена');
    }

    // Переключение фоновой музыки
    toggleMusic() {
        if (this.musicEnabled) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
        this.saveSettings();
        return this.musicEnabled;
    }

    // Установить громкость музыки
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGainNode) {
            this.musicGainNode.gain.value = this.musicVolume;
        }
        this.saveSettings();
    }
}

// Экспорт для использования в других модулях
window.AudioManager = AudioManager;
