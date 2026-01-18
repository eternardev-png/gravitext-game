// Word Block Management
class BlockManager {
    constructor(physicsEngine) {
        this.physics = physicsEngine;
        this.blocks = [];
        this.blockCount = 0;
    }

    createBlock(text, x, y) {
        if (!text || text.trim() === '') return null;

        const word = text.trim();

        // Calculate block size based on word length
        const charWidth = 25;
        const padding = 30;
        const width = Math.max(word.length * charWidth + padding, 80);
        const height = 50;

        // Generate random vibrant color
        const hue = Math.random() * 360;
        const saturation = 60 + Math.random() * 20; // 60-80%
        const lightness = 50 + Math.random() * 15; // 50-65%
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        // Create physics body
        const body = Matter.Bodies.rectangle(x, y, width, height, {
            restitution: 0.6,
            friction: 0.3,
            density: 0.001 * word.length, // Weight based on word length
            render: {
                fillStyle: color,
                strokeStyle: `hsl(${hue}, ${saturation}%, ${lightness - 10}%)`,
                lineWidth: 3
            },
            chamfer: { radius: 10 }
        });

        // Store word data
        body.label = 'wordBlock';
        body.wordData = {
            text: word,
            color: color,
            hue: hue,
            id: this.blockCount++
        };

        // Add to physics world
        this.physics.addBody(body);
        this.blocks.push(body);

        // Render text on canvas
        this.renderBlockText(body);

        return body;
    }

    renderBlockText(body) {
        const canvas = this.physics.render.canvas;
        const context = this.physics.render.context;

        // This will be called on each render frame
        Matter.Events.on(this.physics.render, 'afterRender', () => {
            const bodies = this.physics.getAllBodies();

            bodies.forEach(body => {
                if (body.label === 'wordBlock' && body.wordData) {
                    const pos = body.position;
                    const angle = body.angle;

                    context.save();
                    context.translate(pos.x, pos.y);
                    context.rotate(angle);

                    // Draw text
                    context.fillStyle = 'white';
                    context.font = 'bold 18px Inter, sans-serif';
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    context.shadowBlur = 4;
                    context.fillText(body.wordData.text, 0, 0);

                    context.restore();
                }
            });
        });
    }

    removeBlock(body) {
        this.physics.removeBody(body);
        const index = this.blocks.indexOf(body);
        if (index > -1) {
            this.blocks.splice(index, 1);
        }
    }

    clearAll() {
        this.blocks.forEach(block => {
            this.physics.removeBody(block);
        });
        this.blocks = [];
    }

    getAllBlocks() {
        return this.blocks;
    }

    getBlockCount() {
        return this.blocks.length;
    }

    changeAllColors() {
        this.blocks.forEach(block => {
            const hue = Math.random() * 360;
            const saturation = 60 + Math.random() * 20;
            const lightness = 50 + Math.random() * 15;
            const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

            block.render.fillStyle = color;
            block.render.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness - 10}%)`;
            block.wordData.color = color;
            block.wordData.hue = hue;
        });
    }

    makeBlocksSticky() {
        // Увеличиваем трение для стабильности
        this.blocks.forEach(block => {
            Matter.Body.set(block, {
                friction: 1,
                frictionStatic: 1.5,
                frictionAir: 0.02,
                restitution: 0.2
            });
        });

        // Храним созданные constraints в массиве класса
        if (!this.glueConstraints) {
            this.glueConstraints = [];
        }
        const createdConstraints = new Set();

        // Создаём связи между блоками при столкновении
        Matter.Events.on(this.physics.engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;

                if (bodyA.label === 'wordBlock' && bodyB.label === 'wordBlock') {
                    const pairId = [bodyA.id, bodyB.id].sort().join('-');

                    if (!createdConstraints.has(pairId)) {
                        // Вычисляем текущее расстояние между центрами
                        const dx = bodyB.position.x - bodyA.position.x;
                        const dy = bodyB.position.y - bodyA.position.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        // Создаём constraint с текущим расстоянием
                        // Это не даст блокам слиться, но склеит их
                        const constraint = Matter.Constraint.create({
                            bodyA: bodyA,
                            bodyB: bodyB,
                            length: Math.max(distance, 50), // Минимум 50px между центрами
                            stiffness: 0.3,
                            damping: 0.2
                        });

                        Matter.World.add(this.physics.world, constraint);
                        this.glueConstraints.push(constraint); // Сохраняем для удаления
                        createdConstraints.add(pairId);

                        // Немного замедляем блоки при склеивании
                        Matter.Body.setVelocity(bodyA, {
                            x: bodyA.velocity.x * 0.7,
                            y: bodyA.velocity.y * 0.7
                        });
                        Matter.Body.setVelocity(bodyB, {
                            x: bodyB.velocity.x * 0.7,
                            y: bodyB.velocity.y * 0.7
                        });
                    }
                }
            });
        });

        // Ограничиваем вращение склеенных блоков
        const dampingInterval = setInterval(() => {
            this.blocks.forEach(block => {
                if (Math.abs(block.angularVelocity) > 0.2) {
                    Matter.Body.setAngularVelocity(block, block.angularVelocity * 0.85);
                }
            });
        }, 100);

        setTimeout(() => clearInterval(dampingInterval), 15000);
    }

    makeBlocksUnsticky() {
        // Удаляем только constraints клея, а не все
        if (this.glueConstraints && this.glueConstraints.length > 0) {
            this.glueConstraints.forEach(constraint => {
                Matter.World.remove(this.physics.world, constraint);
            });
            this.glueConstraints = [];
        }

        // Возвращаем нормальные физические свойства
        this.blocks.forEach(block => {
            Matter.Body.set(block, {
                friction: 0.3,
                frictionStatic: 0.5,
                frictionAir: 0.01,
                restitution: 0.6
            });
        });

        console.log('🧊 Блоки расклеены!');
    }

    getHighestBlock() {
        if (this.blocks.length === 0) return null;

        return this.blocks.reduce((highest, block) => {
            return block.position.y < highest.position.y ? block : highest;
        });
    }

    getTowerHeight() {
        if (this.blocks.length === 0) return 0;

        const highest = this.getHighestBlock();
        const lowest = this.blocks.reduce((lowest, block) => {
            return block.position.y > lowest.position.y ? block : lowest;
        });

        return Math.abs(lowest.position.y - highest.position.y);
    }
}

// Export for use in other modules
window.BlockManager = BlockManager;
