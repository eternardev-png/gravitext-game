// Special Words Handler
class SpecialWords {
    constructor(game) {
        this.game = game;
        this.specialCommands = {
            'ВЗРЫВ': (x, y) => this.explosion(x, y),
            'ВЗРЫВ!': (x, y) => this.explosion(x, y),
            'BOOM': (x, y) => this.explosion(x, y),

            'СТОП': (x, y) => this.freeze(x, y),
            'СТОП!': (x, y) => this.freeze(x, y),
            'STOP': (x, y) => this.freeze(x, y),
            'FREEZE': (x, y) => this.freeze(x, y),

            'РАДУГА': (x, y) => this.rainbow(x, y),
            'RAINBOW': (x, y) => this.rainbow(x, y),
            'COLOR': (x, y) => this.rainbow(x, y),

            'АНТИГРАВИТИ': (x, y) => this.antiGravity(x, y),
            'ANTIGRAVITY': (x, y) => this.antiGravity(x, y),
            'FLIP': (x, y) => this.antiGravity(x, y),

            'КЛЕЙ': (x, y) => this.glue(x, y),
            'GLUE': (x, y) => this.glue(x, y),
            'STICK': (x, y) => this.glue(x, y),

            'РАСКЛЕЙ': (x, y) => this.unglue(x, y),
            'UNGLUE': (x, y) => this.unglue(x, y),
            'UNSTICK': (x, y) => this.unglue(x, y)
        };
    }

    check(word, x, y) {
        const upperWord = word.toUpperCase();

        if (this.specialCommands[upperWord]) {
            this.specialCommands[upperWord](x, y);
            return true;
        }

        return false;
    }

    explosion(x, y) {
        console.log('💥 ВЗРЫВ!');

        // Use provided coordinates or default to center of screen
        const canvas = this.game.physics.render.canvas;
        const explosionX = x !== undefined ? x : canvas.width / 2;
        const explosionY = y !== undefined ? y : canvas.height / 2;

        // Create explosion particles
        this.game.effects.createExplosionParticles(explosionX, explosionY, 100);

        // Apply MUCH stronger explosion force to nearby blocks (increased from 0.1 to 0.3)
        this.game.physics.applyExplosion(explosionX, explosionY, 0.3);

        // Play sound
        if (this.game.audio) {
            this.game.audio.playSound('explosion');
        }

        // Show notification
        this.game.ui.showNotification('💥 ВЗРЫВ!');

        // Achievement
        this.game.achievements.unlock('explosion_master');

        // Track for daily challenge
        if (this.game.dailyChallenges) {
            this.game.dailyChallenges.trackExplosion();
        }
    }

    freeze(x, y) {
        console.log('❄️ СТОП!');

        // Freeze physics for 3 seconds
        this.game.physics.freezePhysics(3000);

        // Show notification
        this.game.ui.showNotification('❄️ Время остановлено на 3 секунды!');

        // Play sound
        if (this.game.audio) {
            this.game.audio.playSound('freeze');
        }

        // Achievement
        this.game.achievements.unlock('time_master');
    }

    rainbow(x, y) {
        console.log('🌈 РАДУГА!');

        // Change all block colors
        this.game.blocks.changeAllColors();

        // Create rainbow particles
        const canvas = this.game.physics.render.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        for (let i = 0; i < 50; i++) {
            const hue = (i / 50) * 360;
            const color = `hsl(${hue}, 80%, 60%)`;
            this.game.effects.createParticles(centerX, centerY, color, 5);
        }

        // Show notification
        this.game.ui.showNotification('🌈 Радужные цвета!');

        // Play sound
        if (this.game.audio) {
            this.game.audio.playSound('rainbow');
        }

        // Achievement
        this.game.achievements.unlock('rainbow_artist');
    }

    antiGravity(x, y) {
        console.log('🔄 АНТИГРАВИТИ!');

        // Reverse gravity direction
        const currentDirection = this.game.physics.gravityDirection;
        const oppositeDirection = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        this.game.physics.setGravityDirection(oppositeDirection[currentDirection]);

        // Show notification
        this.game.ui.showNotification('🔄 Гравитация перевёрнута!');

        // Play sound
        if (this.game.audio) {
            this.game.audio.playSound('flip');
        }

        // Achievement
        this.game.achievements.unlock('gravity_flipper');
    }

    glue(x, y) {
        console.log('🔗 КЛЕЙ!');

        // Make blocks sticky
        this.game.blocks.makeBlocksSticky();

        // Show notification
        this.game.ui.showNotification('🔗 Блоки теперь липкие!');

        // Play sound
        if (this.game.audio) {
            this.game.audio.playSound('glue');
        }

        // Achievement
        this.game.achievements.unlock('glue_master');
    }

    unglue(x, y) {
        console.log('🧊 РАСКЛЕЙ!');

        // Remove sticky effect
        this.game.blocks.makeBlocksUnsticky();

        // Show notification
        this.game.ui.showNotification('🧊 Блоки расклеены!');

        // Play sound
        if (this.game.audio) {
            this.game.audio.playSound('freeze');
        }
    }

    getCommandsList() {
        return Object.keys(this.specialCommands);
    }
}

// Export for use in other modules
window.SpecialWords = SpecialWords;
