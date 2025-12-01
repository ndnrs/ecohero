/**
 * Level3Scene - Nivel 3: Telhado Solar - Boss Final
 * Nivel final com confronto contra Doutor Plastico
 * Mecanica: Boss atira lixo -> lixo vira coletavel -> apanhar causa dano ao boss
 */

import Phaser from 'phaser';
import TouchControls from '../ui/TouchControls.js';
import Player from '../entities/Player.js';
import HUD from '../ui/HUD.js';
import Boss from '../entities/Boss.js';
import gameState from '../managers/GameState.js';
import audioManager from '../managers/AudioManager.js';

export default class Level3Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level3Scene' });
    }

    create() {
        // Resetar flag de transicao
        this.transitioning = false;

        gameState.currentLevel = 3;

        // Definir total de itens para este nivel (boss = 10 itens necessarios)
        gameState.setTotalItems(10);
        this.itemsCollectedThisLevel = 0;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.cameras.main.fadeIn(500);

        this.createBackground(width, height);
        this.createPlatforms(width, height);
        this.createPlayer();
        this.createControls();
        this.hud = new HUD(this);
        this.createBoss(width, height);
        this.createGroups();
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

        // Layout especial para boss fight - arena aberta
        const layout = [
            // Chao principal com gap no meio para perigo
            { x: 0, y: height - 16, w: 300, h: 32 },
            { x: 500, y: height - 16, w: 300, h: 32 },
            // Plataformas laterais
            { x: 50, y: height - 120, w: 120, h: 32 },
            { x: 630, y: height - 120, w: 120, h: 32 },
            // Plataformas medias
            { x: 200, y: height - 200, w: 150, h: 32 },
            { x: 450, y: height - 200, w: 150, h: 32 },
            // Plataforma central alta
            { x: 300, y: height - 300, w: 200, h: 32 },
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

        // Tecla de pausa (P ou ESC)
        this.input.keyboard.on('keydown-P', () => this.pauseGame());
        this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
    }

    pauseGame() {
        this.scene.pause();
        this.scene.launch('PauseScene', { pausedScene: 'Level3Scene' });
    }

    createBoss(width, height) {
        // Criar boss no topo central
        this.boss = new Boss(this, width / 2, 80);

        // Criar barra de vida do boss
        this.createBossHealthBar(width);

        // Nome do boss
        this.bossNameText = this.add.text(width / 2, 15, 'DOUTOR PLASTICO', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#e74c3c',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Iniciar comportamento do boss apos intro
        this.time.delayedCall(3500, () => {
            if (this.boss && !this.boss.isDefeated) {
                this.boss.startBehavior();
            }
        });
    }

    createBossHealthBar(width) {
        const barWidth = 250;
        const barHeight = 18;
        const x = width / 2;
        const y = 38;

        // Fundo da barra
        this.bossHealthBg = this.add.rectangle(x, y, barWidth, barHeight, 0x2c3e50);
        this.bossHealthBg.setStrokeStyle(2, 0xecf0f1);

        // Barra de vida (comeca verde)
        this.bossHealthBar = this.add.rectangle(x, y, barWidth - 4, barHeight - 4, 0x2ecc71);

        // Texto de HP
        this.bossHPText = this.add.text(x, y, '10/10', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    updateBossHealthBar() {
        if (!this.boss) return;

        const percent = this.boss.getHealthPercent();
        const maxWidth = 246;
        this.bossHealthBar.width = maxWidth * percent;

        // Mudar cor conforme a vida
        if (percent <= 0.3) {
            this.bossHealthBar.fillColor = 0xe74c3c; // Vermelho
        } else if (percent <= 0.6) {
            this.bossHealthBar.fillColor = 0xf39c12; // Laranja
        } else {
            this.bossHealthBar.fillColor = 0x2ecc71; // Verde
        }

        // Atualizar texto
        this.bossHPText.setText(`${this.boss.health}/${this.boss.maxHealth}`);

        // Animacao de shake na barra
        this.tweens.add({
            targets: [this.bossHealthBar, this.bossHealthBg],
            scaleX: 1.05,
            duration: 50,
            yoyo: true,
            repeat: 2
        });
    }

    createGroups() {
        // Grupo para projeteis do boss
        this.trashProjectiles = this.physics.add.group();

        // Grupo para coletaveis gerados pelo boss
        this.bossCollectibles = this.physics.add.group();
    }

    showBossIntro(width, height) {
        // Escurecer um pouco
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);

        const introText = this.add.text(width / 2, height / 2 - 60,
            'ALERTA!\nDoutor Plastico apareceu!', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#e74c3c',
            align: 'center',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const tipText = this.add.text(width / 2, height / 2 + 20,
            'Apanha o lixo que ele atira!\nCada item apanhado causa dano!', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#f1c40f',
            align: 'center'
        }).setOrigin(0.5);

        const carlaText = this.add.text(width / 2, height / 2 + 70,
            'Vamos Carla! Tu consegues! 💪', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#2ecc71',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Animacao de entrada
        [introText, tipText, carlaText].forEach((text, i) => {
            text.setScale(0);
            this.tweens.add({
                targets: text,
                scale: 1,
                duration: 300,
                delay: i * 200,
                ease: 'Back.easeOut'
            });
        });

        // Fade out apos 3 segundos
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [overlay, introText, tipText, carlaText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    overlay.destroy();
                    introText.destroy();
                    tipText.destroy();
                    carlaText.destroy();
                }
            });
        });
    }

    setupCollisions() {
        // Player com plataformas
        this.physics.add.collider(this.player, this.platforms);

        // Player com projeteis do boss (dano)
        this.physics.add.overlap(this.player, this.trashProjectiles, (player, trash) => {
            this.handleTrashHit(player, trash);
        });

        // Player com coletaveis (apanhar e causar dano ao boss)
        this.physics.add.overlap(this.player, this.bossCollectibles, (player, item) => {
            this.handleCollectItem(player, item);
        });
    }

    handleTrashHit(player, trash) {
        if (player.isInvincible) return;

        trash.destroy();
        this.handlePlayerDamage();
    }

    handleCollectItem(player, item) {
        if (!item || !item.active) return;

        // Som de coleta
        audioManager.playCollect();

        // Pontos
        const points = item.points || 10;
        const result = gameState.addScore(points);
        gameState.collectItem();
        this.itemsCollectedThisLevel++;

        // Som de combo se aplicavel
        if (result.multiplier > 1) {
            audioManager.playCombo(result.multiplier);
        }

        // Efeito visual de coleta
        this.showCollectEffect(item.x, item.y, result.points, result.multiplier);

        // Destruir item
        item.destroy();

        // Causar dano ao boss
        if (this.boss && !this.boss.isDefeated) {
            const defeated = this.boss.takeDamage();
            this.updateBossHealthBar();

            if (defeated) {
                this.handleBossDefeated();
            }
        }

        // Mensagem motivacional ocasional
        if (Math.random() < 0.3) {
            this.showMotivationalMessage();
        }
    }

    showCollectEffect(x, y, points, multiplier) {
        // Texto de pontos
        const pointText = multiplier > 1 ?
            `+${points} x${multiplier}!` :
            `+${points}`;

        const text = this.add.text(x, y, pointText, {
            fontSize: multiplier > 1 ? '24px' : '20px',
            fontFamily: 'Arial',
            color: multiplier > 1 ? '#f1c40f' : '#2ecc71',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 40,
            alpha: 0,
            scale: multiplier > 1 ? 1.5 : 1.2,
            duration: 800,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });

        // Particulas
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(x, y, 4, 0x2ecc71);
            const angle = (Math.PI * 2 / 8) * i;
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 40,
                y: y + Math.sin(angle) * 40,
                alpha: 0,
                scale: 0,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
    }

    showMotivationalMessage() {
        const messages = [
            'Boa Carla! 🌱',
            'Continua assim!',
            'O planeta agradece! 🌍',
            'Eco-power! ♻️',
            'Fantastico!',
            'ISCTE mais verde!'
        ];

        const message = Phaser.Utils.Array.GetRandom(messages);
        const width = this.cameras.main.width;

        const text = this.add.text(width / 2, 120, message, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#2ecc71',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: text.y - 20,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => text.destroy()
        });
    }

    handleBossDefeated() {
        // Limpar projeteis e coletaveis restantes
        this.trashProjectiles.clear(true, true);
        this.bossCollectibles.clear(true, true);

        // Esconder HUD do boss
        this.tweens.add({
            targets: [this.bossHealthBg, this.bossHealthBar, this.bossNameText, this.bossHPText],
            alpha: 0,
            duration: 500
        });

        // Transicao para Victory apos 3 segundos
        this.time.delayedCall(3000, () => this.goToVictory());
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

        // Limpar projeteis fora do ecra
        this.trashProjectiles.getChildren().forEach(p => {
            if (p && p.active && (p.x < -50 || p.x > 850 || p.y > 500)) {
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
