/**
 * Level3Scene - Nivel 3: Telhado Solar - Boss Final
 * Nivel final com confronto contra Doutor Plastico
 */

import Phaser from 'phaser';
import TouchControls from '../ui/TouchControls.js';

export default class Level3Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level3Scene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fade in
        this.cameras.main.fadeIn(500);

        // Fundo temporario (tons de laranja/roxo para por-do-sol)
        const bg = this.add.graphics();
        bg.fillGradientStyle(0xe74c3c, 0xe74c3c, 0x9b59b6, 0x9b59b6, 1);
        bg.fillRect(0, 0, width, height);

        // Texto placeholder
        const text = this.add.text(width / 2, height / 2 - 50, 'Nivel 3: Telhado Solar', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#f1c40f'
        });
        text.setOrigin(0.5);

        const bossText = this.add.text(width / 2, height / 2, 'BOSS: Doutor Plastico', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#e74c3c'
        });
        bossText.setOrigin(0.5);

        const subtext = this.add.text(width / 2, height / 2 + 40, 'Em construcao...', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#95a5a6'
        });
        subtext.setOrigin(0.5);

        // Demo de controlos - quadrado que se move
        this.demoSquare = this.add.rectangle(width / 2, height / 2 + 100, 40, 40, 0xf1c40f);

        // Instrucao
        const nextText = this.add.text(width / 2, height - 50, 'SALTAR=Vitoria | Duplo-tap centro=Game Over', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        });
        nextText.setOrigin(0.5);

        // Criar controlos touch
        this.touchControls = new TouchControls(this);

        // Criar cursores do teclado
        this.cursors = this.input.keyboard.createCursorKeys();

        // Evento de resize
        this.scale.on('resize', () => {
            if (this.touchControls) {
                this.touchControls.resize();
            }
        });

        // Input para game over (tecla G ou tap no centro)
        this.input.keyboard.on('keydown-G', () => {
            this.goToGameOver();
        });

        // Zona central para game over (touch)
        const centerZone = this.add.zone(width / 2, height / 2, 200, 200);
        centerZone.setInteractive();
        centerZone.on('pointerdown', () => {
            this.goToGameOver();
        });
    }

    update() {
        // Obter estado combinado (touch + teclado)
        const controls = this.touchControls.getState(this.cursors);

        // Mover o quadrado demo
        if (this.demoSquare) {
            const speed = 4;

            if (controls.left.isDown) {
                this.demoSquare.x -= speed;
            }
            if (controls.right.isDown) {
                this.demoSquare.x += speed;
            }

            // Saltar = Vitoria
            if (controls.up.isDown || controls.space.isDown) {
                this.goToVictory();
            }

            // Limitar dentro do ecra
            const width = this.cameras.main.width;
            this.demoSquare.x = Phaser.Math.Clamp(this.demoSquare.x, 50, width - 50);
        }
    }

    goToVictory() {
        // Evitar multiplas transicoes
        if (this.transitioning) return;
        this.transitioning = true;

        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('VictoryScene');
        });
    }

    goToGameOver() {
        // Evitar multiplas transicoes
        if (this.transitioning) return;
        this.transitioning = true;

        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameOverScene');
        });
    }
}
