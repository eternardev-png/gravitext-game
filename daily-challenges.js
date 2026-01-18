// Daily Challenges System
class DailyChallenges {
    constructor(game) {
        this.game = game;

        // Типы челленджей
        this.challengeTypes = {
            create_words: {
                title: 'Создай {target} слов',
                icon: '📝',
                checkProgress: () => this.game.achievements.totalWordsCreated
            },
            find_synonyms: {
                title: 'Найди {target} пар синонимов',
                icon: '🧲',
                checkProgress: () => this.game.wordRelationships?.synonymPairsFound || 0
            },
            find_antonyms: {
                title: 'Найди {target} пар антонимов',
                icon: '⚡',
                checkProgress: () => this.game.wordRelationships?.antonymPairsFound || 0
            },
            use_explosion: {
                title: 'Используй ВЗРЫВ {target} раз',
                icon: '💥',
                checkProgress: () => this.explosionCount || 0
            },
            build_tower: {
                title: 'Построй башню высотой {target}px',
                icon: '🏗️',
                checkProgress: () => Math.floor(this.game.blocks.getTowerHeight())
            },
            no_gravity_words: {
                title: 'Создай {target} слов без гравитации',
                icon: '🌌',
                checkProgress: () => this.noGravityWordsCount || 0
            }
        };

        // Текущие челленджи
        this.currentChallenges = [];
        this.completedChallenges = [];

        // Счетчики
        this.explosionCount = 0;
        this.noGravityWordsCount = 0;

        // Дата последнего обновления
        this.lastUpdate = null;
    }

    // Генерация seed из даты для одинаковых челленджей у всех
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    // Генерация случайного челленджа
    generateChallenge(seed, index) {
        const types = Object.keys(this.challengeTypes);
        const typeIndex = (seed + index) % types.length;
        const type = types[typeIndex];

        // Определяем цель в зависимости от типа
        let target;
        switch (type) {
            case 'create_words':
                target = 15 + (seed % 20);
                break;
            case 'find_synonyms':
            case 'find_antonyms':
                target = 3 + (seed % 5);
                break;
            case 'use_explosion':
                target = 2 + (seed % 3);
                break;
            case 'build_tower':
                target = 300 + (seed % 300);
                break;
            case 'no_gravity_words':
                target = 5 + (seed % 10);
                break;
            default:
                target = 10;
        }

        const config = this.challengeTypes[type];

        return {
            id: `${type}_${index}`,
            type: type,
            title: config.title.replace('{target}', target),
            icon: config.icon,
            target: target,
            current: 0,
            completed: false,
            reward: Math.floor(target * 10)
        };
    }

    // Генерация ежедневных челленджей
    generateDailyChallenges() {
        const today = new Date().toISOString().split('T')[0];
        const seed = this.hashCode(today);

        return [
            this.generateChallenge(seed, 0),
            this.generateChallenge(seed, 1),
            this.generateChallenge(seed, 2)
        ];
    }

    // Проверка, нужно ли обновить челленджи
    shouldUpdate() {
        const today = new Date().toISOString().split('T')[0];
        return this.lastUpdate !== today;
    }

    // Обновление челленджей
    updateChallenges() {
        if (this.shouldUpdate()) {
            const today = new Date().toISOString().split('T')[0];
            this.lastUpdate = today;
            this.currentChallenges = this.generateDailyChallenges();
            this.save();

            console.log('🎯 Новые ежедневные челленджи!');
            return true;
        }
        return false;
    }

    // Проверка прогресса всех челленджей
    checkProgress() {
        let anyCompleted = false;

        this.currentChallenges.forEach(challenge => {
            if (challenge.completed) return;

            const config = this.challengeTypes[challenge.type];
            const current = config.checkProgress();
            challenge.current = Math.min(current, challenge.target);

            // Проверяем выполнение
            if (challenge.current >= challenge.target && !challenge.completed) {
                challenge.completed = true;
                anyCompleted = true;
                this.onChallengeComplete(challenge);
            }
        });

        if (anyCompleted) {
            this.save();
        }
    }

    // Обработка выполнения челленджа
    onChallengeComplete(challenge) {
        console.log(`✅ Челлендж выполнен: ${challenge.title}`);

        // Уведомление
        if (this.game.ui) {
            this.game.ui.showNotification(`🎉 Челлендж выполнен: ${challenge.title}!`);
        }

        // Звук
        if (this.game.audio) {
            this.game.audio.playSound('achievement');
        }

        // Добавляем в список выполненных
        this.completedChallenges.push(challenge.id);

        // Достижения
        if (this.completedChallenges.length >= 10) {
            this.game.achievements.unlock('challenge_master');
        }
    }

    // Отслеживание специальных событий
    trackExplosion() {
        this.explosionCount++;
        this.checkProgress();
    }

    trackNoGravityWord() {
        if (!this.game.physics.gravityEnabled) {
            this.noGravityWordsCount++;
            this.checkProgress();
        }
    }

    // Получить прогресс в процентах
    getProgress() {
        const total = this.currentChallenges.length;
        const completed = this.currentChallenges.filter(c => c.completed).length;
        return {
            completed,
            total,
            percentage: total > 0 ? (completed / total) * 100 : 0
        };
    }

    // Сохранение в localStorage
    save() {
        const data = {
            lastUpdate: this.lastUpdate,
            currentChallenges: this.currentChallenges,
            completedChallenges: this.completedChallenges,
            explosionCount: this.explosionCount,
            noGravityWordsCount: this.noGravityWordsCount
        };
        localStorage.setItem('gravitext_challenges', JSON.stringify(data));
    }

    // Загрузка из localStorage
    load() {
        const saved = localStorage.getItem('gravitext_challenges');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.lastUpdate = data.lastUpdate;
                this.currentChallenges = data.currentChallenges || [];
                this.completedChallenges = data.completedChallenges || [];
                this.explosionCount = data.explosionCount || 0;
                this.noGravityWordsCount = data.noGravityWordsCount || 0;
            } catch (e) {
                console.error('Failed to load challenges:', e);
            }
        }

        // Обновляем челленджи если нужно
        this.updateChallenges();

        // Если челленджей всё ещё нет, создаём их принудительно
        if (this.currentChallenges.length === 0) {
            console.log('🎯 Генерируем челленджи принудительно...');
            this.currentChallenges = this.generateDailyChallenges();
            const today = new Date().toISOString().split('T')[0];
            this.lastUpdate = today;
            this.save();
        }
    }

    // Инициализация
    init() {
        this.load();

        // Проверяем прогресс каждые 2 секунды
        setInterval(() => {
            this.checkProgress();
        }, 2000);

        // Проверяем обновление челленджей каждую минуту
        setInterval(() => {
            if (this.updateChallenges()) {
                if (this.game.ui) {
                    this.game.ui.renderChallenges();
                }
            }
        }, 60000);

        console.log('✅ Система ежедневных челленджей инициализирована');
    }
}

// Export for use in other modules
window.DailyChallenges = DailyChallenges;
