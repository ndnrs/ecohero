/**
 * Level2Scene - Nivel 2: Jardim em Perigo
 * Nivel exterior com dificuldade media
 */

import Phaser from 'phaser';
import TouchControls from '../ui/TouchControls.js';

export default class Level2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2Scene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fade in
        this.cameras.main.fadeIn(500);

        // Fundo temporario (tons de verde para jardim)
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a472a);

        // Texto placeholder
        const text = this.add.text(width / 2, height / 2 - 50, 'Nivel 2: Jardim em Perigo', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#27ae60'
        });
        text.setOrigin(0.5);

        const subtext = this.add.text(width / 2, height / 2 + 10, 'Em construcao...', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#95a5a6'
        });
        subtext.setOrigin(0.5);

        // Demo de controlos - quadrado que se move
        this.demoSquare = this.add.rectangle(width / 2, height / 2 + 80, 40, 40, 0x27ae60);

        // Instrucao para avancar
        const nextText = this.add.text(width / 2, height - 50, 'Prima ESPACO ou SALTAR para continuar', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#7f8c8d'
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

            // Saltar/avancar para proximo nivel
            if (controls.up.isDown || controls.space.isDown) {
                this.goToNextLevel();
            }

            // Limitar dentro do ecra
            const width = this.cameras.main.width;
            this.demoSquare.x = Phaser.Math.Clamp(this.demoSquare.x, 50, width - 50);
        }
    }

    goToNextLevel() {
        // Evitar multiplas transicoes
        if (this.transitioning) return;
        this.transitioning = true;

        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('Level3Scene');
        });
    }
}
