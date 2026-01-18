// Game Modes Manager
class ModesManager {
    constructor() {
        this.currentMode = 'free';
        this.modes = {
            free: {
                name: 'Свободный',
                description: 'Создавай и играй без ограничений',
                onActivate: () => this.activateFreeMode(),
                onDeactivate: () => this.deactivateFreeMode()
            },
            poet: {
                name: 'Поэт',
                description: 'Составь красивую фразу из слов',
                onActivate: () => this.activatePoetMode(),
                onDeactivate: () => this.deactivatePoetMode(),
                wordsUsed: []
            },
            tower: {
                name: 'Башня',
                description: 'Построй максимально высокую конструкцию',
                onActivate: () => this.activateTowerMode(),
                onDeactivate: () => this.deactivateTowerMode(),
                maxHeight: 0
            },
            chaos: {
                name: 'Хаос',
                description: 'Гравитация меняется случайным образом',
                onActivate: () => this.activateChaosMode(),
                onDeactivate: () => this.deactivateChaosMode(),
                interval: null
            }
        };
    }

    setMode(modeName) {
        if (this.modes[modeName]) {
            // Deactivate current mode
            if (this.modes[this.currentMode].onDeactivate) {
                this.modes[this.currentMode].onDeactivate();
            }

            // Activate new mode
            this.currentMode = modeName;
            if (this.modes[modeName].onActivate) {
                this.modes[modeName].onActivate();
            }

            return true;
        }
        return false;
    }

    getCurrentMode() {
        return this.currentMode;
    }

    // Free Mode
    activateFreeMode() {
        console.log('Free mode activated');
    }

    deactivateFreeMode() {
        console.log('Free mode deactivated');
    }

    // Poet Mode
    activatePoetMode() {
        console.log('Poet mode activated');
        this.modes.poet.wordsUsed = [];
    }

    deactivatePoetMode() {
        console.log('Poet mode deactivated');
    }

    addWordToPoem(word) {
        if (this.currentMode === 'poet') {
            this.modes.poet.wordsUsed.push(word);
        }
    }

    getPoem() {
        return this.modes.poet.wordsUsed.join(' ');
    }

    // Tower Mode
    activateTowerMode() {
        console.log('Tower mode activated');
        this.modes.tower.maxHeight = 0;
    }

    deactivateTowerMode() {
        console.log('Tower mode deactivated');
    }

    updateTowerHeight(height) {
        if (this.currentMode === 'tower') {
            if (height > this.modes.tower.maxHeight) {
                this.modes.tower.maxHeight = height;
                return true; // New record
            }
        }
        return false;
    }

    getTowerHeight() {
        return this.modes.tower.maxHeight;
    }

    // Chaos Mode
    activateChaosMode() {
        console.log('Chaos mode activated');

        // Change gravity direction randomly every 3-5 seconds
        this.modes.chaos.interval = setInterval(() => {
            const directions = ['up', 'down', 'left', 'right'];
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];

            if (window.gameInstance && window.gameInstance.physics) {
                window.gameInstance.physics.setGravityDirection(randomDirection);

                // Show notification
                if (window.gameInstance.ui) {
                    window.gameInstance.ui.showNotification(`Гравитация: ${this.getDirectionEmoji(randomDirection)}`);
                }
            }
        }, 3000 + Math.random() * 2000);
    }

    deactivateChaosMode() {
        console.log('Chaos mode deactivated');

        if (this.modes.chaos.interval) {
            clearInterval(this.modes.chaos.interval);
            this.modes.chaos.interval = null;
        }

        // Reset to default gravity
        if (window.gameInstance && window.gameInstance.physics) {
            window.gameInstance.physics.setGravityDirection('down');
        }
    }

    getDirectionEmoji(direction) {
        const emojis = {
            up: '↑',
            down: '↓',
            left: '←',
            right: '→'
        };
        return emojis[direction] || '↓';
    }
}

// Export for use in other modules
window.ModesManager = ModesManager;
