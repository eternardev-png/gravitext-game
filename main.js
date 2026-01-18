// Главный файл приложения
class GravitextGame {
    constructor() {
        // Инициализация всех модулей
        this.physics = null;
        this.blocks = null;
        this.effects = null;
        this.modes = null;
        this.specialWords = null;
        this.achievements = null;
        this.audio = null;
        this.ui = null;
        this.wordRelationships = null;
        this.dailyChallenges = null;

        // Telegram WebApp
        this.tg = window.Telegram?.WebApp;
    }

    // Инициализация игры
    async init() {
        console.log('🚀 Запуск GRAVITEXT...');

        // Инициализация Telegram WebApp
        this.initTelegram();

        // Получаем контейнер для canvas
        const container = document.getElementById('canvasContainer');

        // Создаём модули
        this.physics = new PhysicsEngine();
        this.physics.init(container);

        this.blocks = new BlockManager(this.physics);

        this.effects = new EffectsManager(this.physics.render.canvas);
        this.effects.animate();

        this.modes = new ModesManager();

        this.specialWords = new SpecialWords(this);

        this.achievements = new AchievementsManager();
        this.achievements.load();
        this.achievements.onUnlock((achievement) => {
            if (this.ui) {
                this.ui.showAchievement(achievement);
            }
        });

        this.audio = new AudioManager();
        this.audio.init();

        this.wordRelationships = new WordRelationships(this);
        this.wordRelationships.init();

        this.dailyChallenges = new DailyChallenges(this);
        this.dailyChallenges.init();

        this.ui = new UIManager(this);
        this.ui.init();

        // Сохраняем глобальную ссылку
        window.gameInstance = this;

        // Добавляем обработчик столкновений для звуков
        this.setupCollisionSounds();

        // Обновление высоты башни каждую секунду
        setInterval(() => {
            if (this.modes.getCurrentMode() === 'tower') {
                this.ui.updateTowerHeight();
            }
        }, 1000);

        console.log('✅ GRAVITEXT готов к игре!');
    }

    // Инициализация Telegram WebApp
    initTelegram() {
        if (this.tg) {
            console.log('📱 Telegram WebApp обнаружен');

            // Разворачиваем на весь экран
            this.tg.ready();
            this.tg.expand();

            // Включаем подтверждение закрытия
            this.tg.enableClosingConfirmation();

            // Устанавливаем цвет заголовка
            this.tg.setHeaderColor('#0a0e27');
            this.tg.setBackgroundColor('#050816');

            // Показываем главную кнопку (опционально)
            // this.tg.MainButton.setText('Поделиться');
            // this.tg.MainButton.show();

            console.log('✅ Telegram WebApp инициализирован');
        } else {
            console.log('🌐 Запуск в обычном браузере');
        }
    }

    // Настройка звуков столкновений
    setupCollisionSounds() {
        Matter.Events.on(this.physics.engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;

                // Проверяем, что хотя бы один объект - это блок слова
                if ((bodyA.label === 'wordBlock' || bodyB.label === 'wordBlock') &&
                    !bodyA.isStatic && !bodyB.isStatic) {

                    // Вычисляем силу столкновения
                    const velocityA = Math.sqrt(bodyA.velocity.x ** 2 + bodyA.velocity.y ** 2);
                    const velocityB = Math.sqrt(bodyB.velocity.x ** 2 + bodyB.velocity.y ** 2);
                    const impactVelocity = Math.max(velocityA, velocityB);

                    // Воспроизводим звук только при достаточно сильном столкновении
                    if (impactVelocity > 2) {
                        this.audio.playSound('collision');
                    }
                }
            });
        });
    }

    // Получить статистику игры
    getStats() {
        return {
            totalWords: this.achievements.totalWordsCreated,
            currentBlocks: this.blocks.getBlockCount(),
            achievementsUnlocked: this.achievements.getUnlockedAchievements().length,
            achievementsTotal: Object.keys(this.achievements.achievements).length,
            currentMode: this.modes.getCurrentMode(),
            gravityEnabled: this.physics.gravityEnabled
        };
    }

    // Сброс игры
    reset() {
        this.blocks.clearAll();
        this.effects.clear();
        this.ui.updateWordCount();
        this.ui.showNotification('🔄 Игра сброшена');
    }
}

// Запуск игры при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    const game = new GravitextGame();
    game.init();
});

// Предотвращаем масштабирование на мобильных устройствах
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
});
