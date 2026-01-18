// UI менеджер
class UIManager {
    constructor(game) {
        this.game = game;

        // Элементы интерфейса
        this.wordInput = document.getElementById('wordInput');
        this.wordCountDisplay = document.getElementById('wordCount');
        this.gravityToggleBtn = document.getElementById('gravityToggle');
        this.clearAllBtn = document.getElementById('clearAll');
        this.modeToggleBtn = document.getElementById('modeToggle');
        this.modePanel = document.getElementById('modePanel');
        this.achievementsToggleBtn = document.getElementById('achievementsToggle');
        this.achievementsPanel = document.getElementById('achievementsPanel');
        this.closeAchievementsBtn = document.getElementById('closeAchievements');
        this.achievementsList = document.getElementById('achievementsList');
        this.achievementsUnlockedDisplay = document.getElementById('achievementsUnlocked');
        this.achievementsTotalDisplay = document.getElementById('achievementsTotal');
        this.achievementsProgressBar = document.getElementById('achievementsProgressBar');
        this.gravityStrengthSlider = document.getElementById('gravityStrength');
        this.gravityValueDisplay = document.getElementById('gravityValue');
        this.directionButtons = document.querySelectorAll('.dir-btn');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.achievementNotif = document.getElementById('achievementNotif');
        this.tutorial = document.getElementById('tutorial');
        this.closeTutorialBtn = document.getElementById('closeTutorial');
        this.musicToggleBtn = document.getElementById('musicToggle');
        this.challengesToggleBtn = document.getElementById('challengesToggle');
        this.challengesPanel = document.getElementById('challengesPanel');
        this.closeChallengesBtn = document.getElementById('closeChallenges');
        this.challengesList = document.getElementById('challengesList');
        this.challengesCompletedDisplay = document.getElementById('challengesCompleted');
        this.challengesTotalDisplay = document.getElementById('challengesTotal');
        this.challengesProgressBar = document.getElementById('challengesProgressBar');

        this.notificationTimeout = null;
    }

    // Инициализация обработчиков событий
    init() {
        // Ввод слова
        this.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleWordInput();
            }
        });

        // Кнопка гравитации
        this.gravityToggleBtn.addEventListener('click', () => {
            this.handleGravityToggle();
        });

        // Кнопка очистки
        this.clearAllBtn.addEventListener('click', () => {
            this.handleClearAll();
        });

        // Кнопка режимов
        this.modeToggleBtn.addEventListener('click', () => {
            this.toggleModePanel();
        });

        // Кнопка достижений
        this.achievementsToggleBtn.addEventListener('click', () => {
            this.toggleAchievementsPanel();
        });

        // Закрытие панели достижений
        this.closeAchievementsBtn.addEventListener('click', () => {
            this.achievementsPanel.classList.add('hidden');
        });

        // Слайдер силы гравитации
        this.gravityStrengthSlider.addEventListener('input', (e) => {
            this.handleGravityStrength(e.target.value);
        });

        // Кнопки направления гравитации
        this.directionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleDirectionChange(e.target.dataset.direction);
            });
        });

        // Кнопки выбора режима
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleModeChange(e.currentTarget.dataset.mode);
            });
        });

        // Закрытие туториала
        this.closeTutorialBtn.addEventListener('click', () => {
            this.closeTutorial();
        });

        // Кнопка музыки
        this.musicToggleBtn.addEventListener('click', () => {
            const enabled = this.game.audio.toggleMusic();
            this.musicToggleBtn.classList.toggle('btn-primary', enabled);
            this.musicToggleBtn.classList.toggle('btn-secondary', !enabled);
            this.showNotification(enabled ? '🎵 Музыка включена' : '🔇 Музыка выключена');
        });

        // Кнопка челленджей
        this.challengesToggleBtn.addEventListener('click', () => {
            this.renderChallenges();
            this.challengesPanel.classList.remove('hidden');
        });

        // Закрытие панели челленджей
        this.closeChallengesBtn.addEventListener('click', () => {
            this.challengesPanel.classList.add('hidden');
        });

        // Проверяем, показывали ли туториал раньше
        const tutorialShown = localStorage.getItem('gravitext_tutorial_shown');
        if (tutorialShown) {
            this.tutorial.classList.add('hidden');
        }

        // Закрытие панели режимов при клике вне её
        document.addEventListener('click', (e) => {
            if (!this.modePanel.contains(e.target) && e.target !== this.modeToggleBtn) {
                this.modePanel.classList.add('hidden');
            }
        });
    }

    // Обработка ввода слова
    handleWordInput() {
        const text = this.wordInput.value.trim();

        if (!text) return;

        // Координаты для создания блока
        const canvas = this.game.physics.render.canvas;
        const x = canvas.width / 2;
        const y = 100;

        // Проверяем специальные команды (передаём координаты)
        const isSpecial = this.game.specialWords.check(text, x, y);

        if (!isSpecial) {
            // Создаём блок в центре экрана
            const block = this.game.blocks.createBlock(text, x, y);

            if (block) {
                // Создаём частицы
                this.game.effects.createParticles(x, y, block.wordData.color, 15);

                // Воспроизводим звук
                this.game.audio.playSound('create');

                // Вибрация
                this.game.audio.vibrate([50]);

                // Обновляем счётчик
                this.game.achievements.incrementWordCount();
                this.updateWordCount();

                // Проверяем связи слов (синонимы/антонимы)
                if (this.game.wordRelationships) {
                    this.game.wordRelationships.checkNewBlock(block);
                }

                // Отслеживание слов без гравитации для челленджей
                if (this.game.dailyChallenges) {
                    this.game.dailyChallenges.trackNoGravityWord();
                }

                // Добавляем слово в режим Поэт
                if (this.game.modes.getCurrentMode() === 'poet') {
                    this.game.modes.addWordToPoem(text);
                }
            }
        }

        // Очищаем поле ввода
        this.wordInput.value = '';
        this.wordInput.focus();
    }

    // Переключение гравитации
    handleGravityToggle() {
        const enabled = this.game.physics.toggleGravity();

        if (enabled) {
            this.gravityToggleBtn.classList.remove('active');
            this.gravityToggleBtn.querySelector('.btn-text').textContent = 'GRAVITI OFF';
            this.showNotification('🌍 Гравитация включена');
        } else {
            this.gravityToggleBtn.classList.add('active');
            this.gravityToggleBtn.querySelector('.btn-text').textContent = 'GRAVITI ON';
            this.showNotification('🌌 Левитация активирована!');
            this.game.achievements.incrementLevitation();
        }

        this.game.audio.playSound('flip');
        this.game.audio.vibrate([100]);
    }

    // Очистка всех блоков
    handleClearAll() {
        // Создаём эффект взрыва для всех блоков
        const blocks = this.game.blocks.getAllBlocks();
        blocks.forEach(block => {
            this.game.effects.createParticles(
                block.position.x,
                block.position.y,
                block.wordData.color,
                10
            );
        });

        this.game.blocks.clearAll();
        this.updateWordCount();
        this.showNotification('🗑️ Всё очищено!');
        this.game.audio.playSound('explosion');
        this.game.audio.vibrate([50, 50, 50]);
    }

    // Изменение силы гравитации
    handleGravityStrength(value) {
        const strength = parseFloat(value);
        this.game.physics.setGravityStrength(strength);
        this.gravityValueDisplay.textContent = strength.toFixed(1);
    }

    // Изменение направления гравитации
    handleDirectionChange(direction) {
        this.game.physics.setGravityDirection(direction);

        // Обновляем активную кнопку
        this.directionButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.direction === direction) {
                btn.classList.add('active');
            }
        });

        const directionNames = {
            up: 'вверх ↑',
            down: 'вниз ↓',
            left: 'влево ←',
            right: 'вправо →'
        };

        this.showNotification(`Гравитация: ${directionNames[direction]}`);
        this.game.audio.playSound('flip');
    }

    // Переключение панели режимов
    toggleModePanel() {
        this.modePanel.classList.toggle('hidden');
    }

    // Изменение режима игры
    handleModeChange(mode) {
        this.game.modes.setMode(mode);

        // Обновляем активную кнопку
        this.modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });

        const modeNames = {
            free: 'Свободный режим',
            poet: 'Режим Поэт',
            tower: 'Режим Башня',
            chaos: 'Режим Хаос'
        };

        this.showNotification(`📍 ${modeNames[mode]}`);
        this.modePanel.classList.add('hidden');
    }

    // Обновление счётчика слов
    updateWordCount() {
        const count = this.game.blocks.getBlockCount();
        this.wordCountDisplay.textContent = count;
    }

    // Показать уведомление
    showNotification(text) {
        const notifText = this.achievementNotif.querySelector('.achievement-text');
        notifText.textContent = text;

        this.achievementNotif.classList.remove('hidden');

        // Скрываем через 3 секунды
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }

        this.notificationTimeout = setTimeout(() => {
            this.achievementNotif.classList.add('hidden');
        }, 3000);
    }

    // Показать достижение
    showAchievement(achievement) {
        const text = `${achievement.icon} ${achievement.name}`;
        this.showNotification(text);
        this.game.audio.vibrate([100, 50, 100]);
    }

    // Закрыть туториал
    closeTutorial() {
        this.tutorial.classList.add('hidden');
        localStorage.setItem('gravitext_tutorial_shown', 'true');
        this.wordInput.focus();
    }

    // Обновление высоты башни (для режима Tower)
    updateTowerHeight() {
        const height = this.game.blocks.getTowerHeight();
        this.game.modes.updateTowerHeight(height);
        this.game.achievements.checkTowerHeight(height);
    }

    // Переключение панели достижений
    toggleAchievementsPanel() {
        const isHidden = this.achievementsPanel.classList.contains('hidden');

        if (isHidden) {
            this.renderAchievements();
            this.achievementsPanel.classList.remove('hidden');
        } else {
            this.achievementsPanel.classList.add('hidden');
        }
    }

    // Отрисовка списка достижений
    renderAchievements() {
        const achievements = this.game.achievements.achievements;
        const progress = this.game.achievements.getProgress();

        // Обновляем прогресс
        this.achievementsUnlockedDisplay.textContent = progress.unlocked;
        this.achievementsTotalDisplay.textContent = progress.total;
        this.achievementsProgressBar.style.width = `${progress.percentage}%`;

        // Очищаем список
        this.achievementsList.innerHTML = '';

        // Добавляем каждое достижение
        Object.values(achievements).forEach(achievement => {
            const card = document.createElement('div');
            card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;

            let progressHTML = '';
            if (achievement.target && !achievement.unlocked) {
                const progressPercent = (achievement.progress / achievement.target) * 100;
                progressHTML = `
                    <div class="achievement-progress-bar">
                        <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="achievement-status">${achievement.progress} / ${achievement.target}</div>
                `;
            } else if (achievement.unlocked) {
                progressHTML = `<div class="achievement-status">✅ Разблокировано!</div>`;
            }

            card.innerHTML = `
                <div class="achievement-icon-large">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    ${progressHTML}
                </div>
            `;

            this.achievementsList.appendChild(card);
        });
    }

    // Обновление отображения достижений (вызывается при разблокировке)
    updateAchievementsDisplay() {
        if (!this.achievementsPanel.classList.contains('hidden')) {
            this.renderAchievements();
        }
    }

    // Отрисовка челленджей
    renderChallenges() {
        if (!this.game.dailyChallenges) {
            console.error('dailyChallenges не существует!');
            return;
        }

        const challenges = this.game.dailyChallenges.currentChallenges;
        const progress = this.game.dailyChallenges.getProgress();

        // Обновляем прогресс
        this.challengesCompletedDisplay.textContent = progress.completed;
        this.challengesTotalDisplay.textContent = progress.total;
        this.challengesProgressBar.style.width = `${progress.percentage}%`;

        // Очищаем список
        this.challengesList.innerHTML = '';

        // Добавляем каждый челлендж
        challenges.forEach(challenge => {
            const card = document.createElement('div');
            card.className = `achievement-card ${challenge.completed ? 'unlocked' : ''}`;

            const percent = Math.floor((challenge.current / challenge.target) * 100);
            const progressHTML = `
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="progress-text">${challenge.current} / ${challenge.target}</div>
                </div>
            `;

            const rewardHTML = challenge.completed ?
                '<div class="achievement-reward">✅ Выполнено!</div>' :
                `<div class="achievement-reward">🎁 Награда: ${challenge.reward} очков</div>`;

            card.innerHTML = `
                <div class="achievement-icon-large">${challenge.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${challenge.title}</div>
                    ${progressHTML}
                    ${rewardHTML}
                </div>
            `;

            this.challengesList.appendChild(card);
        });
    }
}

// Экспорт для использования в других модулях
window.UIManager = UIManager;
