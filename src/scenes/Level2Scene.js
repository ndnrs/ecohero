/**
 * Level2Scene - Nivel 2: Jardim em Perigo
 * Nivel exterior com dificuldade media
 */

import Phaser from 'phaser';

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

        // Instrucao para avancar
        const nextText = this.add.text(width / 2, height - 50, 'Prima ESPACO para continuar', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#7f8c8d'
        });
        nextText.setOrigin(0.5);

        // Input para avancar
        this.input.keyboard.once('keydown-SPACE', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Level3Scene');
            });
        });
    }

    update() {
        // Logica de update sera implementada nas proximas fases
    }
}
