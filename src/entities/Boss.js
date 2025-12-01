/**
 * Boss - Doutor Plastico
 * Vilao final do jogo que atira lixo para o jogador
 * O lixo transforma-se em coletavel ao tocar no chao
 * Apanhar itens causa dano ao boss
 */

import Phaser from 'phaser';
import gameState from '../managers/GameState.js';
import audioManager from '../managers/AudioManager.js';

export default class Boss extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.scene = scene;

        // Propriedades do boss
        this.health = 10;
        this.maxHealth = 10;
        this.phase = 1;
        this.isDefeated = false;
        this.isInvincible = false;

        // Tempos de ataque por fase (ms)
        this.attackIntervals = {
            1: 2500,  // Fase 1: ataca devagar
            2: 1800,  // Fase 2: mais rapido
            3: 1200   // Fase 3: muito rapido
        };

        // Velocidade de movimento por fase
        this.moveSpeed = {
            1: 1000,  // Fase 1: move devagar
            2: 800,   // Fase 2: mais rapido
            3: 500    // Fase 3: muito rapido
        };

        // Criar sprite do boss
        this.createSprite();

        // Adicionar ao scene
        scene.add.existing(this);

        // Animacao de flutuacao
        this.createFloatAnimation();

        // Iniciar comportamento apos delay
        this.attackTimer = null;
        this.moveTimer = null;
    }

    createSprite() {
        // Sprite principal do boss
        if (this.scene.textures.exists('boss-idle')) {
            this.sprite = this.scene.add.sprite(0, 0, 'boss-idle');
        } else {
            // Fallback: criar boss como graphics
            this.sprite = this.scene.add.rectangle(0, 0, 80, 100, 0x8e44ad);
            this.sprite.setStrokeStyle(3, 0x6c3483);

            // Olhos malvados
            const leftEye = this.scene.add.circle(-15, -15, 10, 0xff0000);
            const rightEye = this.scene.add.circle(15, -15, 10, 0xff0000);
            const leftPupil = this.scene.add.circle(-15, -15, 5, 0x000000);
            const rightPupil = this.scene.add.circle(15, -15, 5, 0x000000);

            // Boca zangada
            const mouth = this.scene.add.rectangle(0, 20, 40, 8, 0x000000);

            this.add([this.sprite, leftEye, rightEye, leftPupil, rightPupil, mouth]);
            return;
        }

        this.add(this.sprite);
    }

    createFloatAnimation() {
        // Movimento de flutuacao suave
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    startBehavior() {
        if (this.isDefeated) return;

        // Iniciar ataques
        this.scheduleNextAttack();

        // Iniciar movimento
        this.scheduleNextMove();
    }

    scheduleNextAttack() {
        if (this.isDefeated) return;

        const delay = this.attackIntervals[this.phase];

        this.attackTimer = this.scene.time.delayedCall(delay, () => {
            this.attack();
            this.scheduleNextAttack();
        });
    }

    scheduleNextMove() {
        if (this.isDefeated) return;

        const delay = this.moveSpeed[this.phase] + Phaser.Math.Between(500, 1500);

        this.moveTimer = this.scene.time.delayedCall(delay, () => {
            this.move();
            this.scheduleNextMove();
        });
    }

    attack() {
        if (this.isDefeated) return;

        // Numero de projeteis baseado na fase
        const numProjectiles = this.phase;

        // Animacao de ataque
        this.playAttackAnimation();

        // Lancar lixo
        for (let i = 0; i < numProjectiles; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                this.spawnTrash();
            });
        }
    }

    playAttackAnimation() {
        // Flash vermelho
        if (this.sprite.setTint) {
            this.sprite.setTint(0xff0000);
            this.scene.time.delayedCall(200, () => {
                if (!this.isDefeated && this.sprite?.clearTint) {
                    this.sprite.clearTint();
                }
            });
        } else {
            // Para rectangle fallback
            const originalColor = this.sprite.fillColor;
            this.sprite.setFillStyle(0xff0000);
            this.scene.time.delayedCall(200, () => {
                if (!this.isDefeated) {
                    this.sprite.setFillStyle(originalColor);
                }
            });
        }

        // Shake do boss
        this.scene.tweens.add({
            targets: this,
            x: this.x + 5,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
    }

    spawnTrash() {
        if (this.isDefeated || !this.scene) return;

        // Posicao aleatoria horizontal
        const x = Phaser.Math.Between(100, 700);

        // Criar projetil de lixo
        const trash = this.scene.add.circle(x, this.y + 60, 18, 0x9b59b6);
        trash.setStrokeStyle(2, 0x8e44ad);

        // Adicionar fisica
        this.scene.physics.add.existing(trash);
        trash.body.setVelocityY(180 + (this.phase * 30)); // Mais rapido em fases avancadas
        trash.body.setAllowGravity(false);

        // Rotacao
        this.scene.tweens.add({
            targets: trash,
            angle: 360,
            duration: 1000,
            repeat: -1
        });

        // Adicionar ao grupo de projeteis
        if (this.scene.trashProjectiles) {
            this.scene.trashProjectiles.add(trash);
        }

        // Colisao com plataformas - transforma em coletavel
        if (this.scene.platforms) {
            this.scene.physics.add.collider(trash, this.scene.platforms, () => {
                this.transformToCollectible(trash);
            });
        }

        // Destruir se sair do ecra
        this.scene.time.delayedCall(5000, () => {
            if (trash && trash.active) {
                trash.destroy();
            }
        });
    }

    transformToCollectible(trash) {
        if (!trash || !trash.active) return;

        const x = trash.x;
        const y = trash.y - 16;

        // Destruir lixo
        trash.destroy();

        // Criar coletavel
        const types = ['item-bottle', 'item-can', 'item-paper'];
        const type = Phaser.Utils.Array.GetRandom(types);

        let collectible;
        if (this.scene.textures.exists(type)) {
            collectible = this.scene.physics.add.sprite(x, y, type);
        } else {
            // Fallback com cores diferentes por tipo
            const colors = {
                'item-bottle': 0x3498db,
                'item-can': 0x95a5a6,
                'item-paper': 0xecf0f1
            };
            collectible = this.scene.add.rectangle(x, y, 24, 24, colors[type] || 0x2ecc71);
            this.scene.physics.add.existing(collectible);
        }

        collectible.body.setAllowGravity(false);
        collectible.body.setImmovable(true);

        // Guardar tipo e pontos
        collectible.itemType = type;
        collectible.points = type === 'item-bottle' ? 10 : (type === 'item-can' ? 15 : 10);

        // Animacao de aparecimento
        collectible.setScale(0);
        this.scene.tweens.add({
            targets: collectible,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        // Flutuacao suave
        this.scene.tweens.add({
            targets: collectible,
            y: y - 5,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Brilho
        this.scene.tweens.add({
            targets: collectible,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Adicionar ao grupo de coletaveis
        if (this.scene.bossCollectibles) {
            this.scene.bossCollectibles.add(collectible);
        }

        // Auto-destruir apos 8 segundos se nao apanhado
        this.scene.time.delayedCall(8000, () => {
            if (collectible && collectible.active) {
                this.scene.tweens.add({
                    targets: collectible,
                    alpha: 0,
                    scale: 0,
                    duration: 300,
                    onComplete: () => collectible.destroy()
                });
            }
        });
    }

    move() {
        if (this.isDefeated) return;

        const width = this.scene.cameras.main.width;
        const minX = 100;
        const maxX = width - 100;

        // Calcular nova posicao
        let targetX = Phaser.Math.Between(minX, maxX);

        // Na fase 3, move-se mais drasticamente
        if (this.phase === 3) {
            // Mover para o lado oposto do jogador
            if (this.scene.player) {
                targetX = this.scene.player.x < width / 2 ?
                    Phaser.Math.Between(width / 2, maxX) :
                    Phaser.Math.Between(minX, width / 2);
            }
        }

        this.scene.tweens.add({
            targets: this,
            x: targetX,
            duration: this.moveSpeed[this.phase],
            ease: 'Sine.easeInOut'
        });
    }

    takeDamage() {
        if (this.isDefeated || this.isInvincible) return false;

        this.isInvincible = true;
        this.health--;

        // Som de boss hit
        audioManager.playBossHit();

        // Atualizar fase
        this.updatePhase();

        // Efeito visual de dano
        this.playHitAnimation();

        // Camera shake
        this.scene.cameras.main.shake(200, 0.015);

        // Texto de dano
        this.showDamageText();

        // Verificar derrota
        if (this.health <= 0) {
            this.defeat();
            return true;
        }

        // Recuperar apos 0.8 segundos
        this.scene.time.delayedCall(800, () => {
            this.isInvincible = false;
            if (this.sprite?.clearTint) {
                this.sprite.clearTint();
            }
        });

        return false;
    }

    updatePhase() {
        const oldPhase = this.phase;

        if (this.health <= 3) {
            this.phase = 3;
        } else if (this.health <= 6) {
            this.phase = 2;
        } else {
            this.phase = 1;
        }

        // Se mudou de fase, mostrar alerta
        if (this.phase !== oldPhase) {
            this.showPhaseChange();
        }
    }

    showPhaseChange() {
        const width = this.scene.cameras.main.width;

        const phaseMessages = {
            2: 'Doutor Plastico esta furioso!',
            3: 'FASE FINAL! Cuidado Carla!'
        };

        const message = phaseMessages[this.phase];
        if (!message) return;

        const text = this.scene.add.text(width / 2, 100, message, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: this.phase === 3 ? '#e74c3c' : '#f39c12',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: text,
            scale: { from: 0.5, to: 1.2 },
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(1500, () => {
                    this.scene.tweens.add({
                        targets: text,
                        alpha: 0,
                        y: text.y - 30,
                        duration: 500,
                        onComplete: () => text.destroy()
                    });
                });
            }
        });

        // Som visual extra na fase 3
        if (this.phase === 3) {
            this.scene.cameras.main.flash(300, 255, 0, 0, true);
        }
    }

    playHitAnimation() {
        // Flash branco
        if (this.sprite.setTint) {
            this.sprite.setTint(0xffffff);
        }

        // Piscar
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 80,
            yoyo: true,
            repeat: 4
        });

        // Shake
        const startX = this.x;
        this.scene.tweens.add({
            targets: this,
            x: startX + 10,
            duration: 40,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.x = startX;
            }
        });
    }

    showDamageText() {
        const damageText = this.scene.add.text(this.x, this.y - 80, '-1', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#e74c3c',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            scale: 1.5,
            duration: 800,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    }

    defeat() {
        this.isDefeated = true;

        // Som de derrota do boss
        audioManager.playBossDefeat();

        // Parar timers
        if (this.attackTimer) this.attackTimer.destroy();
        if (this.moveTimer) this.moveTimer.destroy();

        // Parar todas as tweens neste objeto
        this.scene.tweens.killTweensOf(this);

        // Mensagem de derrota
        const width = this.scene.cameras.main.width;

        const defeatText = this.scene.add.text(width / 2, 80, 'DOUTOR PLASTICO DERROTADO!', {
            fontSize: '28px',
            fontFamily: 'Arial Black',
            color: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: defeatText,
            scale: { from: 0, to: 1.2 },
            duration: 500,
            ease: 'Back.easeOut'
        });

        // Particulas de explosao verde
        this.createDefeatParticles();

        // Animacao de derrota do boss
        this.scene.tweens.add({
            targets: this,
            y: this.y + 300,
            alpha: 0,
            angle: 360,
            scale: 0.3,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });

        // Bonus de pontuacao
        gameState.addScore(1000);

        // Camera effects
        this.scene.cameras.main.shake(500, 0.02);
        this.scene.cameras.main.flash(500, 46, 204, 113);
    }

    createDefeatParticles() {
        // Criar multiplas particulas verdes
        const colors = [0x2ecc71, 0x27ae60, 0x1abc9c, 0xf1c40f];

        for (let i = 0; i < 30; i++) {
            const color = Phaser.Utils.Array.GetRandom(colors);
            const size = Phaser.Math.Between(8, 20);

            const particle = this.scene.add.rectangle(
                this.x + Phaser.Math.Between(-30, 30),
                this.y + Phaser.Math.Between(-40, 40),
                size, size, color
            );

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.Between(200, 400);
            const targetX = this.x + Math.cos(angle) * speed;
            const targetY = this.y + Math.sin(angle) * speed;

            this.scene.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                alpha: 0,
                scale: 0,
                angle: Phaser.Math.Between(180, 720),
                duration: Phaser.Math.Between(800, 1500),
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    getHealthPercent() {
        return this.health / this.maxHealth;
    }

    destroy() {
        if (this.attackTimer) this.attackTimer.destroy();
        if (this.moveTimer) this.moveTimer.destroy();
        super.destroy();
    }
}
