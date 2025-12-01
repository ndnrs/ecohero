/**
 * Level1Scene - Nivel 1: Cantina Caotica
 * Primeiro nivel do jogo, serve como tutorial
 */

import Phaser from 'phaser';

export default class Level1Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1Scene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fade in
        this.cameras.main.fadeIn(500);

        // Fundo temporario
        this.add.rectangle(width / 2, height / 2, width, height, 0x2c3e50);

        // Texto placeholder
        const text = this.add.text(width / 2, height / 2 - 50, 'Nivel 1: Cantina Caotica', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#2ecc71'
        });
        text.setOrigin(0.5);

        const subtext = this.add.text(width / 2, height / 2 + 10, 'Em construcao...', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#95a5a6'
        });
        subtext.setOrigin(0.5);

        // Instrucao para voltar
        const backText = this.add.text(width / 2, height - 50, 'Prima ESPACO para continuar', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#7f8c8d'
        });
        backText.setOrigin(0.5);

        // Input para avancar (placeholder)
        this.input.keyboard.once('keydown-SPACE', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Level2Scene');
            });
        });
    }

    update() {
        // Logica de update sera implementada nas proximas fases
    }
}
