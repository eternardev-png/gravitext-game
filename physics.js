// Physics Engine Management
class PhysicsEngine {
    constructor() {
        this.engine = null;
        this.world = null;
        this.render = null;
        this.runner = null;
        this.mouse = null;
        this.mouseConstraint = null;
        this.gravityEnabled = true;
        this.gravityStrength = 1;
        this.gravityDirection = 'down';
        this.walls = [];
    }

    init(container) {
        const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Events } = Matter;

        // Create engine
        this.engine = Engine.create();
        this.world = this.engine.world;
        this.world.gravity.y = 1;

        // Create renderer
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        this.render = Render.create({
            element: container,
            engine: this.engine,
            options: {
                width: containerWidth,
                height: containerHeight,
                wireframes: false,
                background: 'transparent',
                pixelRatio: window.devicePixelRatio
            }
        });

        // Create walls
        const wallThickness = 50;
        const wallOptions = {
            isStatic: true,
            render: {
                fillStyle: 'transparent',
                strokeStyle: 'rgba(99, 102, 241, 0.3)',
                lineWidth: 2
            }
        };

        this.walls = [
            Bodies.rectangle(containerWidth / 2, -wallThickness / 2, containerWidth, wallThickness, wallOptions), // Top
            Bodies.rectangle(containerWidth / 2, containerHeight + wallThickness / 2, containerWidth, wallThickness, wallOptions), // Bottom
            Bodies.rectangle(-wallThickness / 2, containerHeight / 2, wallThickness, containerHeight, wallOptions), // Left
            Bodies.rectangle(containerWidth + wallThickness / 2, containerHeight / 2, wallThickness, containerHeight, wallOptions) // Right
        ];

        World.add(this.world, this.walls);

        // Mouse control
        this.mouse = Mouse.create(this.render.canvas);
        this.mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

        World.add(this.world, this.mouseConstraint);

        // Keep mouse in sync with rendering
        this.render.mouse = this.mouse;

        // Run renderer
        Render.run(this.render);

        // Create runner
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize(container));
    }

    handleResize(container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        this.render.canvas.width = containerWidth;
        this.render.canvas.height = containerHeight;
        this.render.options.width = containerWidth;
        this.render.options.height = containerHeight;

        // Update walls
        Matter.World.remove(this.world, this.walls);

        const wallThickness = 50;
        const wallOptions = {
            isStatic: true,
            render: {
                fillStyle: 'transparent',
                strokeStyle: 'rgba(99, 102, 241, 0.3)',
                lineWidth: 2
            }
        };

        this.walls = [
            Matter.Bodies.rectangle(containerWidth / 2, -wallThickness / 2, containerWidth, wallThickness, wallOptions),
            Matter.Bodies.rectangle(containerWidth / 2, containerHeight + wallThickness / 2, containerWidth, wallThickness, wallOptions),
            Matter.Bodies.rectangle(-wallThickness / 2, containerHeight / 2, wallThickness, containerHeight, wallOptions),
            Matter.Bodies.rectangle(containerWidth + wallThickness / 2, containerHeight / 2, wallThickness, containerHeight, wallOptions)
        ];

        Matter.World.add(this.world, this.walls);
    }

    toggleGravity() {
        this.gravityEnabled = !this.gravityEnabled;

        if (!this.gravityEnabled) {
            // Turn off gravity
            this.world.gravity.x = 0;
            this.world.gravity.y = 0;

            // Make all bodies float (reduce velocity)
            const bodies = Matter.Composite.allBodies(this.world);
            bodies.forEach(body => {
                if (!body.isStatic) {
                    Matter.Body.setVelocity(body, { x: body.velocity.x * 0.5, y: body.velocity.y * 0.5 });
                }
            });
        } else {
            // Turn on gravity
            this.updateGravityDirection();
        }

        return this.gravityEnabled;
    }

    setGravityStrength(strength) {
        this.gravityStrength = strength;
        if (this.gravityEnabled) {
            this.updateGravityDirection();
        }
    }

    setGravityDirection(direction) {
        this.gravityDirection = direction;
        if (this.gravityEnabled) {
            this.updateGravityDirection();
        }
    }

    updateGravityDirection() {
        const strength = this.gravityStrength;

        switch (this.gravityDirection) {
            case 'down':
                this.world.gravity.x = 0;
                this.world.gravity.y = strength;
                break;
            case 'up':
                this.world.gravity.x = 0;
                this.world.gravity.y = -strength;
                break;
            case 'left':
                this.world.gravity.x = -strength;
                this.world.gravity.y = 0;
                break;
            case 'right':
                this.world.gravity.x = strength;
                this.world.gravity.y = 0;
                break;
        }
    }

    addBody(body) {
        Matter.World.add(this.world, body);
    }

    removeBody(body) {
        Matter.World.remove(this.world, body);
    }

    getAllBodies() {
        return Matter.Composite.allBodies(this.world).filter(body => !body.isStatic);
    }

    clearAllBodies() {
        const bodies = this.getAllBodies();
        bodies.forEach(body => {
            Matter.World.remove(this.world, body);
        });
    }

    applyExplosion(centerX, centerY, force) {
        const bodies = this.getAllBodies();

        bodies.forEach(body => {
            const dx = body.position.x - centerX;
            const dy = body.position.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Increased radius from 500 to 1000 for wider explosion range
            if (distance < 1000) {
                // Much stronger force - closer objects get MUCH more force
                const distanceFactor = Math.max(0.1, 1 - (distance / 1000));
                const explosionForce = force * distanceFactor * 10; // Multiplied by 10!
                const angle = Math.atan2(dy, dx);

                Matter.Body.applyForce(body, body.position, {
                    x: Math.cos(angle) * explosionForce,
                    y: Math.sin(angle) * explosionForce
                });
            }
        });
    }

    freezePhysics(duration) {
        const originalTimeScale = this.engine.timing.timeScale;
        this.engine.timing.timeScale = 0;

        setTimeout(() => {
            this.engine.timing.timeScale = originalTimeScale;
        }, duration);
    }
}

// Export for use in other modules
window.PhysicsEngine = PhysicsEngine;
