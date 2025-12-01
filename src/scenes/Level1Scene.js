/**
 * Level1Scene - Nivel 1: Cantina Caotica
 * Primeiro nivel do jogo, serve como tutorial
 */

import Phaser from 'phaser';
import TouchControls from '../ui/TouchControls.js';
import Player from '../entities/Player.js';
import HUD from '../ui/HUD.js';
import gameState from '../managers/GameState.js';
import CollectibleManager from '../managers/CollectibleManager.js';
import EnemyManager from '../managers/EnemyManager.js';

export default class Level1Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1Scene' });
    }

    create() {
        // Resetar estado do jogo para nivel 1
        if (gameState.currentLevel !== 1) {
            gameState.reset();
        }
        gameState.currentLevel = 1;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fade in
        this.cameras.main.fadeIn(500);

        // Criar fundo
        this.createBackground(width, height);

        // Criar plataformas
        this.createPlatforms(width, height);

        // Criar jogador
        this.createPlayer();

        // Criar controlos
        this.createControls();

        // Criar HUD
        this.hud = new HUD(this);

        // Criar coletaveis
        this.createCollectibles();

        // Criar inimigos
        this.createEnemies();

        // Configurar colisoes
        this.setupCollisions();

        // Texto de instrucoes (desaparece apos alguns segundos)
        this.showInstructions(width, height);
    }

    createBackground(width, height) {
        // Usar fundo gerado ou fallback
        if (this.textures.exists('bg-cantina')) {
            this.add.image(width / 2, height / 2, 'bg-cantina');
        } else {
            // Fallback: cor solida
            this.add.rectangle(width / 2, height / 2, width, height, 0xd7ccc8);
        }
    }

    createPlatforms(width, height) {
        // Grupo estatico de plataformas
        this.platforms = this.physics.add.staticGroup();

        // Definicao do layout do nivel
        const platformLayout = [
            // Chao principal
            { x: 0, y: height - 16, w: width, h: 32 },
            // Plataformas flutuantes
            { x: 150, y: height - 120, w: 128, h: 32 },
            { x: 400, y: height - 180, w: 192, h: 32 },
            { x: 650, y: height - 120, w: 128, h: 32 },
            { x: 300, y: height - 280, w: 128, h: 32 },
            { x: 550, y: height - 280, w: 128, h: 32 },
        ];

        // Criar cada plataforma
        platformLayout.forEach(plat => {
            this.createPlatform(plat.x, plat.y, plat.w, plat.h);
        });
    }

    createPlatform(x, y, width, height) {
        const textureKey = 'platform-brick';
        const tileWidth = 64;

        // Calcular quantos tiles precisamos
        const tilesX = Math.ceil(width / tileWidth);

        for (let i = 0; i < tilesX; i++) {
            let platform;

            if (this.textures.exists(textureKey)) {
                platform = this.add.image(x + i * tileWidth + tileWidth / 2, y, textureKey);
            } else {
                // Fallback: retangulo colorido
                platform = this.add.rectangle(x + i * tileWidth + tileWidth / 2, y, tileWidth, 32, 0xb71c1c);
            }

            this.physics.add.existing(platform, true); // true = static
            this.platforms.add(platform);
        }
    }

    createPlayer() {
        const height = this.cameras.main.height;

        // Criar jogador no lado esquerdo
        this.player = new Player(this, 100, height - 100);
    }

    createControls() {
        // Controlos de teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Controlos touch
        this.touchControls = new TouchControls(this);

        // Evento de resize para reposicionar controlos touch
        this.scale.on('resize', () => {
            if (this.touchControls) {
                this.touchControls.resize();
            }
        });
    }

    createCollectibles() {
        // Criar manager de coletaveis
        this.collectibleManager = new CollectibleManager(this);

        // Criar layout do nivel 1
        this.collectibleManager.createLevelLayout(1);

        // Configurar colisao com jogador
        this.collectibleManager.setupCollision(
            this.player,
            (player, item) => this.collectibleManager.handleCollect(player, item)
        );
    }

    createEnemies() {
        // Criar manager de inimigos
        this.enemyManager = new EnemyManager(this);

        // Criar layout do nivel 1
        this.enemyManager.createLevelLayout(1);

        // Configurar colisoes
        this.enemyManager.setupCollision(this.player, this.platforms);
    }

    setupCollisions() {
        // Colisao jogador com plataformas
        this.physics.add.collider(this.player, this.platforms);
    }

    showInstructions(width, height) {
        const instructions = this.add.text(width / 2, height / 2 - 50,
            '← → para mover\n↑ ou ESPACO para saltar', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });
        instructions.setOrigin(0.5);
        instructions.setAlpha(0.8);

        // Desaparecer apos 3 segundos
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: instructions,
                alpha: 0,
                duration: 500,
                onComplete: () => instructions.destroy()
            });
        });
    }

    /**
     * Obter estado combinado dos controlos (teclado + touch)
     */
    getControls() {
        // Usar o metodo do TouchControls que combina ambos os inputs
        return this.touchControls.getState(this.cursors);
    }

    update() {
        // Verificar se jogador existe
        if (!this.player || !this.player.body) return;

        // Obter estado combinado dos controlos
        const controls = this.getControls();

        // Atualizar jogador com os controlos
        this.player.update(controls);

        // Atualizar HUD
        if (this.hud) {
            this.hud.update();
        }

        // Atualizar inimigos
        if (this.enemyManager) {
            this.enemyManager.update();
        }

        // Verificar se caiu do mapa
        if (this.player.y > this.cameras.main.height + 50) {
            this.handlePlayerFall();
        }
    }

    handlePlayerFall() {
        // Perder vida
        const livesLeft = gameState.loseLife();

        if (gameState.isGameOver()) {
            // Game Over
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameOverScene');
            });
        } else {
            // Respawn
            this.player.reset(100, this.cameras.main.height - 100);

            // Animacao de flash
            this.cameras.main.flash(500, 255, 0, 0);

            // Atualizar HUD
            if (this.hud) {
                this.hud.animateLifeLost(livesLeft);
            }
        }
    }

    /**
     * Ir para o proximo nivel
     */
    goToNextLevel() {
        if (this.transitioning) return;
        this.transitioning = true;

        gameState.nextLevel();

        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Level2Scene');
        });
    }
}
