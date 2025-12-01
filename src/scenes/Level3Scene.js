/**
 * Level3Scene - Nivel 3: Telhado Solar - Boss Final
 * Nivel final com confronto contra Doutor Plastico
 */

import Phaser from 'phaser';
import TouchControls from '../ui/TouchControls.js';
import Player from '../entities/Player.js';
import HUD from '../ui/HUD.js';
import gameState from '../managers/GameState.js';

export default class Level3Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level3Scene' });
    }

    create() {
        // Resetar flag de transicao
        this.transitioning = false;

        gameState.currentLevel = 3;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.cameras.main.fadeIn(500);

        this.createBackground(width, height);
        this.createPlatforms(width, height);
        this.createPlayer();
        this.createControls();
        this.hud = new HUD(this);
        this.createBoss(width, height);
        this.createProjectiles();
        this.setupCollisions();

        // Texto de instrucao inicial
        this.showBossIntro(width, height);
    }

    createBackground(width, height) {
        if (this.textures.exists('bg-rooftop')) {
            this.add.image(width / 2, height / 2, 'bg-rooftop');
        } else {
            // Fallback: gradiente por-do-sol
            const bg = this.add.graphics();
            bg.fillGradientStyle(0xe74c3c, 0xe74c3c, 0x9b59b6, 0x9b59b6, 1);
            bg.fillRect(0, 0, width, height);
        }
    }

    createPlatforms(width, height) {
        this.platforms = this.physics.add.staticGroup();

        // Layout especial para boss fight - arena
        const layout = [
            // Chao principal
            { x: 0, y: height - 16, w: 800, h: 32 },
            // Plataformas para saltar e evitar ataques
            { x: 50, y: height - 100, w: 100, h: 32 },
            { x: 200, y: height - 150, w: 100, h: 32 },
            { x: 400, y: height - 120, w: 150, h: 32 },
            { x: 600, y: height - 160, w: 100, h: 32 },
            // Plataforma elevada para atacar o boss
            { x: 300, y: height - 250, w: 200, h: 32 },
        ];

        layout.forEach(p => this.createPlatform(p.x, p.y, p.w));
    }

    createPlatform(x, y, width) {
        const key = 'platform-metal';
        const tileW = 64;
        const tiles = Math.ceil(width / tileW);

        for (let i = 0; i < tiles; i++) {
            let plat = this.textures.exists(key)
                ? this.add.image(x + i * tileW + tileW / 2, y, key)
                : this.add.rectangle(x + i * tileW + tileW / 2, y, tileW, 32, 0x7f8c8d);
            this.physics.add.existing(plat, true);
            this.platforms.add(plat);
        }
    }

    createPlayer() {
        this.player = new Player(this, 80, this.cameras.main.height - 100);
    }

    createControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.touchControls = new TouchControls(this);
        this.scale.on('resize', () => this.touchControls?.resize());
    }

    createBoss(width, height) {
        this.bossHealth = 5;
        this.bossMaxHealth = 5;
        this.bossInvincible = false;
        this.bossAttacking = false;
        this.bossDefeated = false;

        // Criar sprite do boss
        const bossX = width - 100;
        const bossY = height - 80;

        if (this.textures.exists('boss-idle')) {
            this.boss = this.physics.add.sprite(bossX, bossY, 'boss-idle');
        } else {
            // Fallback: criar boss como rectangle
            this.boss = this.add.rectangle(bossX, bossY, 80, 100, 0x8e44ad);
            this.physics.add.existing(this.boss);
        }

        this.boss.body.setImmovable(true);
        this.boss.body.allowGravity = false;

        // Barra de vida do boss
        this.createBossHealthBar(width);

        // Nome do boss
        this.bossNameText = this.add.text(width / 2, 30, 'DOUTOR PLASTICO', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Iniciar comportamento do boss
        this.time.delayedCall(3000, () => this.startBossBehavior());
    }

    createBossHealthBar(width) {
        const barWidth = 200;
        const barHeight = 16;
        const x = width / 2 - barWidth / 2;
        const y = 50;

        // Fundo da barra
        this.bossHealthBg = this.add.rectangle(x + barWidth / 2, y, barWidth, barHeight, 0x2c3e50);
        this.bossHealthBg.setStrokeStyle(2, 0xecf0f1);

        // Barra de vida
        this.bossHealthBar = this.add.rectangle(x + barWidth / 2, y, barWidth - 4, barHeight - 4, 0xe74c3c);
    }

    updateBossHealthBar() {
        const percent = this.bossHealth / this.bossMaxHealth;
        const barWidth = 196;
        this.bossHealthBar.width = barWidth * percent;

        // Mudar cor conforme a vida
        if (percent <= 0.3) {
            this.bossHealthBar.fillColor = 0xc0392b;
        } else if (percent <= 0.6) {
            this.bossHealthBar.fillColor = 0xe67e22;
        }
    }

    createProjectiles() {
        this.projectiles = this.physics.add.group();
    }

    showBossIntro(width, height) {
        const introText = this.add.text(width / 2, height / 2 - 50,
            'ALERTA!\nDoutor Plastico apareceu!', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#e74c3c',
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const tipText = this.add.text(width / 2, height / 2 + 30,
            'Salta na cabeca dele para atacar!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#f1c40f'
        }).setOrigin(0.5);

        // Fade out apos 2.5 segundos
        this.time.delayedCall(2500, () => {
            this.tweens.add({
                targets: [introText, tipText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    introText.destroy();
                    tipText.destroy();
                }
            });
        });
    }

    startBossBehavior() {
        if (this.bossDefeated) return;

        // Ciclo de ataque do boss
        this.bossAttackTimer = this.time.addEvent({
            delay: 2000,
            callback: () => this.bossAttack(),
            loop: true
        });

        // Movimento do boss
        this.bossMoveTimer = this.time.addEvent({
            delay: 3000,
            callback: () => this.bossMove(),
            loop: true
        });
    }

    bossAttack() {
        if (this.bossDefeated || !this.boss || !this.player) return;

        this.bossAttacking = true;

        // Flash vermelho no boss
        if (this.boss.setTint) {
            this.boss.setTint(0xff0000);
            this.time.delayedCall(200, () => this.boss?.clearTint?.());
        }

        // Lancar projectil na direcao do jogador
        const projectile = this.add.circle(this.boss.x - 40, this.boss.y, 15, 0x9b59b6);
        this.physics.add.existing(projectile);
        this.projectiles.add(projectile);

        // Calcular direcao para o jogador
        const angle = Phaser.Math.Angle.Between(
            projectile.x, projectile.y,
            this.player.x, this.player.y
        );

        const speed = 200;
        projectile.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );

        // Destruir projectil apos 4 segundos
        this.time.delayedCall(4000, () => projectile?.destroy?.());

        this.bossAttacking = false;
    }

    bossMove() {
        if (this.bossDefeated || !this.boss) return;

        const width = this.cameras.main.width;
        const targetX = Phaser.Math.Between(width / 2, width - 60);

        this.tweens.add({
            targets: this.boss,
            x: targetX,
            duration: 1000,
            ease: 'Power2'
        });
    }

    setupCollisions() {
        // Player com plataformas
        this.physics.add.collider(this.player, this.platforms);

        // Player com boss (para saltar em cima)
        this.physics.add.overlap(this.player, this.boss, (player, boss) => {
            this.handleBossCollision(player, boss);
        });

        // Player com projecteis
        this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => {
            this.handleProjectileHit(player, projectile);
        });
    }

    handleBossCollision(player, boss) {
        if (this.bossDefeated || this.bossInvincible) return;

        // Verificar se o jogador está a cair em cima do boss
        const playerBottom = player.y + player.body.height / 2;
        const bossTop = boss.y - (boss.body ? boss.body.height / 2 : 50);
        const isFalling = player.body.velocity.y > 0;

        if (isFalling && playerBottom < boss.y) {
            // Atacou o boss!
            this.hitBoss();
            // Bounce do jogador
            player.body.setVelocityY(-300);
        } else if (!player.isInvincible) {
            // Tocou no boss lateralmente - toma dano
            this.handlePlayerDamage();
        }
    }

    hitBoss() {
        this.bossInvincible = true;
        this.bossHealth--;

        // Atualizar barra de vida
        this.updateBossHealthBar();

        // Efeito de dano
        if (this.boss.setTint) {
            this.boss.setTint(0xffffff);
        }

        // Camera shake
        this.cameras.main.shake(200, 0.01);

        // Texto de combo
        const comboText = this.add.text(this.boss.x, this.boss.y - 60,
            `-1 HP!`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: comboText,
            y: comboText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => comboText.destroy()
        });

        // Pontuacao
        gameState.addScore(200);

        // Verificar se o boss morreu
        if (this.bossHealth <= 0) {
            this.defeatBoss();
        } else {
            // Boss fica invencivel por 1 segundo
            this.time.delayedCall(1000, () => {
                this.bossInvincible = false;
                if (this.boss?.clearTint) {
                    this.boss.clearTint();
                }
            });
        }
    }

    defeatBoss() {
        this.bossDefeated = true;

        // Parar timers do boss
        this.bossAttackTimer?.destroy();
        this.bossMoveTimer?.destroy();

        // Destruir projecteis
        this.projectiles.clear(true, true);

        // Animacao de derrota
        this.tweens.add({
            targets: this.boss,
            y: this.boss.y + 200,
            alpha: 0,
            angle: 180,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                this.boss?.destroy();
            }
        });

        // Esconder HUD do boss
        this.tweens.add({
            targets: [this.bossHealthBg, this.bossHealthBar, this.bossNameText],
            alpha: 0,
            duration: 500
        });

        // Mensagem de vitoria
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const victoryText = this.add.text(width / 2, height / 2 - 30,
            'DOUTOR PLASTICO DERROTADO!', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#2ecc71',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: victoryText,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            ease: 'Back.easeOut'
        });

        // Bonus de pontuacao
        gameState.addScore(1000);

        // Transicao para Victory apos 3 segundos
        this.time.delayedCall(3000, () => this.goToVictory());
    }

    handleProjectileHit(player, projectile) {
        if (player.isInvincible) return;

        projectile.destroy();
        this.handlePlayerDamage();
    }

    handlePlayerDamage() {
        if (this.player.isInvincible) return;

        this.player.isInvincible = true;
        this.player.hit();

        const livesLeft = gameState.loseLife();
        this.hud?.animateLifeLost(livesLeft);

        if (gameState.isGameOver()) {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameOverScene');
            });
        } else {
            // Recuperar apos 1.5 segundos
            this.time.delayedCall(1500, () => {
                if (this.player) {
                    this.player.isInvincible = false;
                }
            });
        }
    }

    getControls() {
        return this.touchControls.getState(this.cursors);
    }

    update() {
        if (!this.player?.body) return;

        this.player.update(this.getControls());
        this.hud?.update();

        // Verificar queda
        if (this.player.y > this.cameras.main.height + 50) {
            this.handlePlayerFall();
        }

        // Limpar projecteis fora da tela
        this.projectiles.getChildren().forEach(p => {
            if (p.x < -50 || p.x > 850 || p.y < -50 || p.y > 650) {
                p.destroy();
            }
        });
    }

    handlePlayerFall() {
        const lives = gameState.loseLife();
        if (gameState.isGameOver()) {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameOverScene');
            });
        } else {
            this.player.reset(80, this.cameras.main.height - 100);
            this.cameras.main.flash(500, 255, 0, 0);
            this.hud?.animateLifeLost(lives);
        }
    }

    goToVictory() {
        if (this.transitioning) return;
        this.transitioning = true;

        this.cameras.main.fadeOut(1000);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('VictoryScene');
        });
    }
}
