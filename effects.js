// Visual Effects System
class EffectsManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.particles = [];
        this.trails = [];
    }

    createParticles(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const velocity = 2 + Math.random() * 3;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                size: 3 + Math.random() * 4,
                color: color
            });
        }
    }

    createExplosionParticles(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 10;
            const hue = Math.random() * 360;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1,
                decay: 0.01 + Math.random() * 0.02,
                size: 4 + Math.random() * 6,
                color: `hsl(${hue}, 80%, 60%)`
            });
        }
    }

    addTrail(x, y, color) {
        this.trails.push({
            x: x,
            y: y,
            life: 1,
            decay: 0.05,
            size: 8,
            color: color
        });
    }

    update() {
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravity
            particle.life -= particle.decay;

            return particle.life > 0;
        });

        // Update trails
        this.trails = this.trails.filter(trail => {
            trail.life -= trail.decay;
            return trail.life > 0;
        });
    }

    render() {
        // Render trails
        this.trails.forEach(trail => {
            this.context.save();
            this.context.globalAlpha = trail.life * 0.5;
            this.context.fillStyle = trail.color;
            this.context.beginPath();
            this.context.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
            this.context.fill();
            this.context.restore();
        });

        // Render particles
        this.particles.forEach(particle => {
            this.context.save();
            this.context.globalAlpha = particle.life;
            this.context.fillStyle = particle.color;
            this.context.beginPath();
            this.context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.context.fill();
            this.context.restore();
        });
    }

    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    clear() {
        this.particles = [];
        this.trails = [];
    }
}

// Export for use in other modules
window.EffectsManager = EffectsManager;
