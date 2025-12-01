/**
 * Enemy - Classe base para inimigos/obstaculos
 * Sacos plastico, copos, beatas, lixo toxico
 */

import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'plastic-bag') {
        const textureMap = {
            'plastic-bag': 'enemy-plastic-bag',
            'cup': 'enemy-cup',
            'cigarette': 'enemy-cigarette',
            'toxic': 'enemy-toxic'
        };

        const texture = textureMap[type] || 'enemy-plastic-bag';
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.type = type;
        this.damage = type === 'toxic' ? 2 : 1;
        this.speed = this.getSpeedForType(type);
        this.pattern = this.getPatternForType(type);

        // Limites de patrulha
        this.patrolMin = x - 80;
        this.patrolMax = x + 80;
        this.startY = y;

        // Configurar fisica baseada no tipo
        this.setupPhysics();
        this.startBehavior();
    }

    getSpeedForType(type) {
        const speeds = {
            'plastic-bag': 30,
            'cup': 60,
            'cigarette': 100,
            'toxic': 0
        };
        return speeds[type] || 50;
    }

    getPatternForType(type) {
        const patterns = {
            'plastic-bag': 'float',
            'cup': 'patrol',
            'cigarette': 'jump',
            'toxic': 'static'
        };
        return patterns[type] || 'patrol';
    }

    setupPhysics() {
        this.body.setSize(24, 24);
        this.body.setOffset(4, 4);

        if (this.pattern === 'float' || this.pattern === 'static') {
            this.body.setAllowGravity(false);
            this.body.setImmovable(true);
        } else {
            this.body.setAllowGravity(true);
            this.setBounce(0.2);
        }
    }

    startBehavior() {
        switch (this.pattern) {
            case 'float':
                this.startFloatPattern();
                break;
            case 'patrol':
                this.setVelocityX(this.speed);
                break;
            case 'jump':
                this.startJumpPattern();
                break;
            case 'static':
                this.startToxicEffect();
                break;
        }
    }

    startFloatPattern() {
        // Movimento sinusoidal
        this.scene.tweens.add({
            targets: this,
            y: this.startY - 30,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Movimento horizontal lento
        this.setVelocityX(-this.speed);
    }

    startJumpPattern() {
        // Saltar aleatoriamente
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(1500, 3000),
            callback: () => {
                if (this.body && this.body.blocked.down) {
                    this.setVelocityY(-200);
                }
            },
            loop: true
        });
        this.setVelocityX(this.speed * (Math.random() > 0.5 ? 1 : -1));
    }

    startToxicEffect() {
        // Particulas toxicas
        this.scene.time.addEvent({
            delay: 500,
            callback: () => this.emitToxicParticle(),
            loop: true
        });
    }

    emitToxicParticle() {
        if (!this.scene || !this.active) return;

        const particle = this.scene.add.circle(
            this.x + Phaser.Math.Between(-15, 15),
            this.y - 10,
            4,
            0x4caf50,
            0.6
        );

        this.scene.tweens.add({
            targets: particle,
            y: particle.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => particle.destroy()
        });
    }

    update() {
        if (this.pattern === 'patrol') {
            // Inverter direcao nos limites
            if (this.x <= this.patrolMin) {
                this.setVelocityX(this.speed);
                this.setFlipX(false);
            } else if (this.x >= this.patrolMax) {
                this.setVelocityX(-this.speed);
                this.setFlipX(true);
            }
        }

        if (this.pattern === 'float') {
            // Voltar se sair do ecra
            if (this.x < -50) {
                this.x = this.scene.cameras.main.width + 50;
            }
        }

        if (this.pattern === 'jump') {
            // Inverter direcao
            if (this.body && this.body.blocked.left) {
                this.setVelocityX(this.speed);
            } else if (this.body && this.body.blocked.right) {
                this.setVelocityX(-this.speed);
            }
        }
    }

    /**
     * Causar dano ao jogador
     */
    hitPlayer(player) {
        if (player.hit) {
            return player.hit();
        }
        return false;
    }
}
