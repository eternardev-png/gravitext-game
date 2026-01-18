// Achievements System
class AchievementsManager {
    constructor() {
        this.achievements = {
            first_word: {
                id: 'first_word',
                name: 'Первое слово',
                description: 'Создай своё первое слово',
                icon: '✨',
                unlocked: false
            },
            word_master_10: {
                id: 'word_master_10',
                name: 'Мастер слов',
                description: 'Создай 10 слов',
                icon: '📝',
                unlocked: false,
                progress: 0,
                target: 10
            },
            word_master_50: {
                id: 'word_master_50',
                name: 'Гуру слов',
                description: 'Создай 50 слов',
                icon: '📚',
                unlocked: false,
                progress: 0,
                target: 50
            },
            word_master_100: {
                id: 'word_master_100',
                name: 'Легенда слов',
                description: 'Создай 100 слов',
                icon: '👑',
                unlocked: false,
                progress: 0,
                target: 100
            },
            tower_builder: {
                id: 'tower_builder',
                name: 'Строитель башен',
                description: 'Построй башню высотой 500px',
                icon: '🏗️',
                unlocked: false
            },
            levitation_master: {
                id: 'levitation_master',
                name: 'Мастер левитации',
                description: 'Используй левитацию 10 раз',
                icon: '🌌',
                unlocked: false,
                progress: 0,
                target: 10
            },
            explosion_master: {
                id: 'explosion_master',
                name: 'Взрывник',
                description: 'Используй команду ВЗРЫВ',
                icon: '💥',
                unlocked: false
            },
            time_master: {
                id: 'time_master',
                name: 'Властелин времени',
                description: 'Используй команду СТОП',
                icon: '❄️',
                unlocked: false
            },
            rainbow_artist: {
                id: 'rainbow_artist',
                name: 'Радужный художник',
                description: 'Используй команду РАДУГА',
                icon: '🌈',
                unlocked: false
            },
            gravity_flipper: {
                id: 'gravity_flipper',
                name: 'Переворот гравитации',
                description: 'Используй команду АНТИГРАВИТИ',
                icon: '🔄',
                unlocked: false
            },
            glue_master: {
                id: 'glue_master',
                name: 'Мастер клея',
                description: 'Используй команду КЛЕЙ',
                icon: '🔗',
                unlocked: false
            },
            synonym_finder: {
                id: 'synonym_finder',
                name: 'Искатель синонимов',
                description: 'Найди первую пару синонимов',
                icon: '🧲',
                unlocked: false
            },
            antonym_clash: {
                id: 'antonym_clash',
                name: 'Столкновение антонимов',
                description: 'Создай первую пару антонимов',
                icon: '⚡',
                unlocked: false
            },
            word_master: {
                id: 'word_master',
                name: 'Мастер связей',
                description: 'Создай 10 пар связанных слов',
                icon: '🎓',
                unlocked: false
            },
            challenge_master: {
                id: 'challenge_master',
                name: 'Мастер челленджей',
                description: 'Выполни 10 ежедневных челленджей',
                icon: '🎯',
                unlocked: false
            },
            music_lover: {
                id: 'music_lover',
                name: 'Меломан',
                description: 'Включи музыку 10 раз',
                icon: '🎵',
                unlocked: false,
                progress: 0,
                target: 10
            }
        };

        this.totalWordsCreated = 0;
        this.onUnlockCallback = null;
    }

    unlock(achievementId) {
        const achievement = this.achievements[achievementId];

        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;

            // Save to localStorage
            this.save();

            // Trigger callback
            if (this.onUnlockCallback) {
                this.onUnlockCallback(achievement);
            }

            // Обновляем UI панели достижений если она открыта
            if (window.gameInstance && window.gameInstance.ui) {
                window.gameInstance.ui.updateAchievementsDisplay();
            }

            return true;
        }

        return false;
    }

    updateProgress(achievementId, progress) {
        const achievement = this.achievements[achievementId];

        if (achievement && !achievement.unlocked) {
            achievement.progress = progress;

            if (achievement.target && progress >= achievement.target) {
                this.unlock(achievementId);
            }

            this.save();
        }
    }

    incrementWordCount() {
        this.totalWordsCreated++;

        // Check first word
        if (this.totalWordsCreated === 1) {
            this.unlock('first_word');
        }

        // Update word master achievements
        this.updateProgress('word_master_10', this.totalWordsCreated);
        this.updateProgress('word_master_50', this.totalWordsCreated);
        this.updateProgress('word_master_100', this.totalWordsCreated);

        this.save();
    }

    checkTowerHeight(height) {
        if (height >= 500 && !this.achievements.tower_builder.unlocked) {
            this.unlock('tower_builder');
        }
    }

    incrementLevitation() {
        const achievement = this.achievements.levitation_master;
        if (!achievement.unlocked) {
            achievement.progress = (achievement.progress || 0) + 1;
            this.updateProgress('levitation_master', achievement.progress);
        }
    }

    getUnlockedAchievements() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    }

    getLockedAchievements() {
        return Object.values(this.achievements).filter(a => !a.unlocked);
    }

    getProgress() {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.getUnlockedAchievements().length;
        return { unlocked, total, percentage: (unlocked / total) * 100 };
    }

    save() {
        const data = {
            achievements: this.achievements,
            totalWordsCreated: this.totalWordsCreated
        };
        localStorage.setItem('gravitext_achievements', JSON.stringify(data));
    }

    load() {
        const saved = localStorage.getItem('gravitext_achievements');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.achievements = { ...this.achievements, ...data.achievements };
                this.totalWordsCreated = data.totalWordsCreated || 0;
            } catch (e) {
                console.error('Failed to load achievements:', e);
            }
        }
    }

    reset() {
        Object.values(this.achievements).forEach(achievement => {
            achievement.unlocked = false;
            if (achievement.progress !== undefined) {
                achievement.progress = 0;
            }
        });
        this.totalWordsCreated = 0;
        this.save();
    }

    onUnlock(callback) {
        this.onUnlockCallback = callback;
    }
}

// Export for use in other modules
window.AchievementsManager = AchievementsManager;
