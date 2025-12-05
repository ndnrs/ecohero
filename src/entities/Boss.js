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
        // Sprite principal do boss - corpo
        this.sprite = this.scene.add.rectangle(0, 20, 80, 80, 0x8e44ad);
        this.sprite.setStrokeStyle(3, 0x6c3483);
        this.add(this.sprite);

        // Moldura para a foto do Ricardo
        const photoFrame = this.scene.add.rectangle(0, -25, 70, 70, 0x4a0000);
        photoFrame.setStrokeStyle(4, 0xe74c3c);
        this.add(photoFrame);

        // Tentar usar foto real do Ricardo (foto 2 - versao vilao)
        if (this.scene.textures.exists('ricardo-photo-2')) {
            const photo = this.scene.add.image(0, -25, 'ricardo-photo-2');
            photo.setOrigin(0.5); // Centrar na moldura
            // Ajustar escala para caber na moldura
            const maxSize = 60;
            const scale = Math.min(maxSize / photo.width, maxSize / photo.height);
            photo.setScale(scale);
            this.add(photo);
            this.photoSprite = photo;
        } else {
            // Fallback: inicial R
            const placeholder = this.scene.add.text(0, -25, 'R', {
                fontSize: '40px',
                fontFamily: 'Arial Black',
                color: '#ffffff'
            }).setOrigin(0.5);
            this.add(placeholder);
        }

        // Simbolo de vilao
        const villainSymbol = this.scene.add.text(0, 55, '🦹', {
            fontSize: '20px'
        }).setOrigin(0.5);
        this.add(villainSymbol);

        // Efeito de "aura maligna"
        this.createEvilAura();
    }

    createEvilAura() {
        // Particulas roxas a volta do boss
        this.auraParticles = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const particle = this.scene.add.circle(
                Math.cos(angle) * 50,
                Math.sin(angle) * 50 - 10,
                4,
                0x9b59b6,
                0.5
            );
            this.add(particle);
            this.auraParticles.push(particle);

            // Rotacao continua
            this.scene.tweens.add({
                targets: particle,
                x: Math.cos(angle + Math.PI) * 50,
                y: Math.sin(angle + Math.PI) * 50 - 10,
                duration: 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
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

        // Mostrar frase engracada ocasionalmente
        if (Math.random() < 0.4) {
            this.showBattlePhrase();
        }

        // Lancar lixo
        for (let i = 0; i < numProjectiles; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                this.spawnTrash();
            });
        }
    }

    showBattlePhrase() {
        // Frases engracadas do Ricardo durante a luta
        const phrases = [
            'Desliga o AC!',
            'Ja estou com farfalheira! AAAAHHHH',
            'Preciso das papas de linhaca!',
            'Odeio correntes de ar!',
            'Esta demasiado frio aqui!',
            'Quero o meu umidificador!',
            'Vou vestir mais uma camada de roupa!'
        ];

        // Frase especial na fase 3
        if (this.phase === 3 && Math.random() < 0.5) {
            phrases.push('Pelo poder das 6 camadas de roupa vou-te destruir!');
        }

        const phrase = Phaser.Utils.Array.GetRandom(phrases);
        const width = this.scene.cameras.main.width;

        // Balao de fala
        const bubbleX = this.x + (this.x < width / 2 ? 100 : -100);
        const bubbleY = this.y + 30;

        // Fundo do balao
        const bubble = this.scene.add.rectangle(bubbleX, bubbleY, 180, 40, 0x2c2c2c, 0.9);
        bubble.setStrokeStyle(2, 0xe74c3c);

        // Texto da frase
        const text = this.scene.add.text(bubbleX, bubbleY, phrase, {
            fontSize: '11px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold',
            wordWrap: { width: 160 },
            align: 'center'
        }).setOrigin(0.5);

        // Guardar referencia para limpeza quando boss morre
        if (!this.activeBattlePhrases) this.activeBattlePhrases = [];
        this.activeBattlePhrases.push({ bubble, text });

        // Animacao de entrada
        bubble.setScale(0);
        text.setAlpha(0);

        this.scene.tweens.add({
            targets: bubble,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        this.scene.tweens.add({
            targets: text,
            alpha: 1,
            duration: 150,
            delay: 100
        });

        // Remover apos 5 segundos (aumentado de 3s para dar mais tempo de ler)
        this.scene.time.delayedCall(5000, () => {
            this.scene.tweens.add({
                targets: [bubble, text],
                alpha: 0,
                scale: 0.5,
                duration: 300,
                onComplete: () => {
                    bubble.destroy();
                    text.destroy();
                }
            });
        });
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

        // Adicionar fisica - gravidade ativada para cair naturalmente
        this.scene.physics.add.existing(trash);
        trash.body.setVelocityY(100 + (this.phase * 20)); // Velocidade inicial
        trash.body.setAllowGravity(true); // Gravidade ativa para queda natural

        // Rotacao
        this.scene.tweens.add({
            targets: trash,
            angle: 360,
            duration: 1000,
            repeat: -1
        });

        // Adicionar ao grupo de projeteis
        // O collider global em Level3Scene trata a colisao com plataformas
        if (this.scene.trashProjectiles) {
            this.scene.trashProjectiles.add(trash);
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

        // Criar coletavel - NAO usar grupo, criar manualmente para controlar a fisica
        const types = ['item-bottle', 'item-can', 'item-paper'];
        const type = Phaser.Utils.Array.GetRandom(types);

        let collectible;

        // Cores fallback por tipo
        const colors = {
            'item-bottle': 0x3498db,
            'item-can': 0x95a5a6,
            'item-paper': 0xecf0f1
        };

        // Usar sprite se textura existir, senao usar rectangle
        if (this.scene.textures.exists(type)) {
            collectible = this.scene.add.sprite(x, y, type);
        } else {
            collectible = this.scene.add.rectangle(x, y, 28, 28, colors[type] || 0x2ecc71);
            collectible.setStrokeStyle(2, 0x27ae60);
        }

        // Adicionar fisica - simples, sem gravidade
        this.scene.physics.add.existing(collectible);
        if (collectible.body) {
            collectible.body.setAllowGravity(false);
            collectible.body.setImmovable(true);
            collectible.body.setVelocity(0, 0);
            collectible.body.setSize(32, 32);
        }

        // Adicionar ao grupo para colisao
        if (this.scene.bossCollectibles) {
            this.scene.bossCollectibles.add(collectible);
        }

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

        // Apenas pulsacao de escala - SEM movimento para nao tremer
        this.scene.tweens.add({
            targets: collectible,
            scale: { from: 1.0, to: 1.1 },
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: 200 // Esperar animacao de aparecimento
        });

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
        // Guard: se ja foi derrotado, retorna true para indicar derrota
        if (this.isDefeated) return true;

        // Guard: se esta invencivel, nao toma dano
        if (this.isInvincible) return false;

        this.isInvincible = true;
        this.health--;

        console.log('[BOSS] takeDamage() - health now:', this.health);

        // Som de boss hit
        audioManager.playBossHit();

        // Atualizar fase
        this.updatePhase();

        // Efeito visual de dano
        this.playHitAnimation();

        // Camera shake - curto para nao conflitar
        try {
            this.scene.cameras.main.shake(150, 0.012);
        } catch (e) {
            // Ignorar erro de camera
        }

        // Texto de dano
        this.showDamageText();

        // Verificar derrota
        if (this.health <= 0) {
            this.defeat();
            return true;
        }

        // Recuperar apos 0.8 segundos
        this.scene.time.delayedCall(800, () => {
            if (!this.isDefeated) {
                this.isInvincible = false;
                if (this.sprite?.clearTint) {
                    this.sprite.clearTint();
                }
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
                // Aumentado de 1.5s para 4s para dar mais tempo de ler
                this.scene.time.delayedCall(4000, () => {
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
        // Guard contra chamadas multiplas
        if (this.isDefeated) return;
        this.isDefeated = true;

        console.log('[BOSS] defeat() called');

        // Limpar frases de batalha ativas (para nao sobrepor)
        if (this.activeBattlePhrases) {
            this.activeBattlePhrases.forEach(({ bubble, text }) => {
                if (bubble?.active) bubble.destroy();
                if (text?.active) text.destroy();
            });
            this.activeBattlePhrases = [];
        }

        // Som de derrota do boss
        audioManager.playBossDefeat();

        // Parar timers IMEDIATAMENTE
        if (this.attackTimer) {
            this.attackTimer.destroy();
            this.attackTimer = null;
        }
        if (this.moveTimer) {
            this.moveTimer.destroy();
            this.moveTimer = null;
        }

        // Parar todas as tweens neste objeto
        this.scene.tweens.killTweensOf(this);

        // Parar tweens das particulas de aura
        if (this.auraParticles) {
            this.auraParticles.forEach(p => {
                if (p && p.active) {
                    this.scene.tweens.killTweensOf(p);
                }
            });
        }

        // Mensagem de derrota (Y=100 para nao sobrepor HUD)
        const width = this.scene.cameras.main.width;

        const defeatText = this.scene.add.text(width / 2, 100, 'MONSTRO FICOU COM FARFALHEIRA!', {
            fontSize: '20px',
            fontFamily: 'Arial Black',
            color: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Frase engracada de derrota (Y=160 para maior espacamento)
        const funnyDefeat = this.scene.add.text(width / 2, 160, 'Continua...', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            fontStyle: 'bold italic',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        funnyDefeat.setAlpha(0);
        this.scene.tweens.add({
            targets: funnyDefeat,
            alpha: 1,
            duration: 500,
            delay: 800
        });

        this.scene.tweens.add({
            targets: defeatText,
            scale: { from: 0, to: 1.2 },
            duration: 500,
            ease: 'Back.easeOut'
        });

        // Particulas de explosao verde
        this.createDefeatParticles();

        // Animacao de derrota do boss - SEM onComplete para destruir
        // A destruicao sera gerida pelo scene quando transitar
        this.scene.tweens.add({
            targets: this,
            y: this.y + 300,
            alpha: 0,
            angle: 360,
            scale: 0.3,
            duration: 2000,
            ease: 'Power2'
            // REMOVIDO: onComplete que chamava this.destroy()
            // O scene vai destruir tudo quando transitar para VictoryScene
        });

        // Bonus de pontuacao
        gameState.addScore(1000);

        // Camera effects - CURTOS para nao interferir com fadeOut posterior
        // Shake curto e flash curto
        try {
            this.scene.cameras.main.shake(300, 0.015);
            this.scene.cameras.main.flash(300, 46, 204, 113);
        } catch (e) {
            console.log('[BOSS] Camera effects failed, ignoring');
        }
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
        // Limpar referencia na cena para evitar acesso a objeto destruido
        if (this.scene && this.scene.boss === this) {
            this.scene.boss = null;
        }
        super.destroy();
    }
}
