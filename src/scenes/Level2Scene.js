/**
 * Level2Scene - Nivel 2: Jardim em Perigo
 * Nivel exterior com dificuldade media
 */

import Phaser from 'phaser';
import TouchControls from '../ui/TouchControls.js';
import Player from '../entities/Player.js';
import HUD from '../ui/HUD.js';
import gameState from '../managers/GameState.js';
import CollectibleManager from '../managers/CollectibleManager.js';
import EnemyManager from '../managers/EnemyManager.js';

export default class Level2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2Scene' });
    }

    create() {
        // Resetar flag de transicao
        this.transitioning = false;

        gameState.currentLevel = 2;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.cameras.main.fadeIn(500);

        this.createBackground(width, height);
        this.createPlatforms(width, height);
        this.createPlayer();
        this.createControls();
        this.hud = new HUD(this);
        this.createCollectibles();
        this.createEnemies();
        this.setupCollisions();

        // Criar porta de saida
        this.createExit(width, height);
    }

    createBackground(width, height) {
        if (this.textures.exists('bg-garden')) {
            this.add.image(width / 2, height / 2, 'bg-garden');
        } else {
            this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb);
        }
    }

    createPlatforms(width, height) {
        this.platforms = this.physics.add.staticGroup();

        const layout = [
            { x: 0, y: height - 16, w: 300, h: 32 },
            { x: 500, y: height - 16, w: 300, h: 32 },
            { x: 100, y: height - 100, w: 128, h: 32 },
            { x: 300, y: height - 160, w: 192, h: 32 },
            { x: 550, y: height - 120, w: 128, h: 32 },
            { x: 200, y: height - 250, w: 128, h: 32 },
            { x: 450, y: height - 220, w: 128, h: 32 },
            { x: 650, y: height - 280, w: 150, h: 32 },
        ];

        layout.forEach(p => this.createPlatform(p.x, p.y, p.w));
    }

    createPlatform(x, y, width) {
        const key = 'platform-grass';
        const tileW = 64;
        const tiles = Math.ceil(width / tileW);

        for (let i = 0; i < tiles; i++) {
            let plat = this.textures.exists(key)
                ? this.add.image(x + i * tileW + tileW / 2, y, key)
                : this.add.rectangle(x + i * tileW + tileW / 2, y, tileW, 32, 0x27ae60);
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

    createCollectibles() {
        this.collectibleManager = new CollectibleManager(this);
        this.collectibleManager.createLevelLayout(2);
        this.collectibleManager.setupCollision(this.player, (p, i) => this.collectibleManager.handleCollect(p, i));
    }

    createEnemies() {
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.createLevelLayout(2);
        this.enemyManager.setupCollision(this.player, this.platforms);
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.platforms);
    }

    createExit(width, height) {
        // Porta de saida no canto direito superior
        this.exit = this.add.rectangle(width - 40, height - 310, 40, 50, 0x2ecc71);
        this.exit.setStrokeStyle(3, 0x27ae60);
        this.physics.add.existing(this.exit, true);

        // Texto
        this.add.text(width - 40, height - 340, 'SAIDA', {
            fontSize: '12px', fontFamily: 'Arial', color: '#ffffff'
        }).setOrigin(0.5);

        // Colisao com saida
        this.physics.add.overlap(this.player, this.exit, () => this.goToNextLevel());
    }

    getControls() {
        return this.touchControls.getState(this.cursors);
    }

    update() {
        if (!this.player?.body) return;

        this.player.update(this.getControls());
        this.hud?.update();
        this.enemyManager?.update();

        if (this.player.y > this.cameras.main.height + 50) {
            this.handlePlayerFall();
        }
    }

    handlePlayerFall() {
        const lives = gameState.loseLife();
        if (gameState.isGameOver()) {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('GameOverScene'));
        } else {
            this.player.reset(80, this.cameras.main.height - 100);
            this.cameras.main.flash(500, 255, 0, 0);
            this.hud?.animateLifeLost(lives);
        }
    }

    goToNextLevel() {
        if (this.transitioning) return;
        this.transitioning = true;
        gameState.nextLevel();
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Level3Scene'));
    }
}
