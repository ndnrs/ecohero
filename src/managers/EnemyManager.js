/**
 * EnemyManager - Gere grupos de inimigos por nivel
 */

import Enemy from '../entities/Enemy.js';
import gameState from './GameState.js';

export default class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = scene.physics.add.group();
        this.enemyList = [];
    }

    spawn(x, y, type = 'plastic-bag', options = {}) {
        const enemy = new Enemy(this.scene, x, y, type);

        if (options.patrolMin !== undefined) {
            enemy.patrolMin = options.patrolMin;
        }
        if (options.patrolMax !== undefined) {
            enemy.patrolMax = options.patrolMax;
        }

        this.enemies.add(enemy);
        this.enemyList.push(enemy);
        return enemy;
    }

    spawnFromArray(positions) {
        positions.forEach(pos => {
            this.spawn(pos.x, pos.y, pos.type, pos.options || {});
        });
    }

    createLevelLayout(levelNumber) {
        const layouts = {
            1: this.getLevel1Layout(),
            2: this.getLevel2Layout(),
            3: this.getLevel3Layout()
        };
        this.spawnFromArray(layouts[levelNumber] || layouts[1]);
    }

    getLevel1Layout() {
        const h = this.scene.cameras.main.height;
        return [
            // Sacos plasticos flutuantes
            { x: 300, y: h - 200, type: 'plastic-bag' },
            { x: 550, y: h - 250, type: 'plastic-bag' },
            // Copos a patrulhar
            { x: 450, y: h - 50, type: 'cup', options: { patrolMin: 350, patrolMax: 550 } },
            { x: 700, y: h - 50, type: 'cup', options: { patrolMin: 600, patrolMax: 780 } },
        ];
    }

    getLevel2Layout() {
        const h = this.scene.cameras.main.height;
        return [
            { x: 200, y: h - 200, type: 'plastic-bag' },
            { x: 400, y: h - 180, type: 'plastic-bag' },
            { x: 600, y: h - 220, type: 'plastic-bag' },
            { x: 300, y: h - 50, type: 'cup' },
            { x: 500, y: h - 50, type: 'cup' },
            { x: 350, y: h - 50, type: 'cigarette' },
            { x: 550, y: h - 50, type: 'cigarette' },
        ];
    }

    getLevel3Layout() {
        const h = this.scene.cameras.main.height;
        return [
            { x: 200, y: h - 100, type: 'toxic' },
            { x: 600, y: h - 100, type: 'toxic' },
        ];
    }

    setupCollision(player, platforms) {
        // Colisao inimigos com plataformas
        if (platforms) {
            this.scene.physics.add.collider(this.enemies, platforms);
        }

        // Colisao jogador com inimigos
        this.scene.physics.add.overlap(
            player,
            this.enemies,
            (player, enemy) => this.handleCollision(player, enemy),
            null,
            this.scene
        );
    }

    handleCollision(player, enemy) {
        // Verificar se jogador esta invencivel
        if (player.isInvincible) return;

        // Marcar como invencivel ANTES de processar dano
        player.isInvincible = true;

        // Aplicar efeitos visuais de dano
        enemy.hitPlayer(player);

        // Perder vida
        const livesLeft = gameState.loseLife();
        gameState.resetCombo();

        // Atualizar HUD
        if (this.scene.hud) {
            this.scene.hud.animateLifeLost(livesLeft);
        }

        // Verificar game over
        if (gameState.isGameOver()) {
            this.scene.time.delayedCall(500, () => {
                this.scene.cameras.main.fadeOut(500);
                this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.scene.start('GameOverScene');
                });
            });
        }
    }

    update() {
        this.enemyList.forEach(enemy => {
            if (enemy.active && enemy.update) {
                enemy.update();
            }
        });
    }

    getGroup() {
        return this.enemies;
    }

    destroy() {
        this.enemies.destroy(true);
        this.enemyList = [];
    }
}
