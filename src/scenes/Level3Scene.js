/**
 * Level3Scene - Nivel 3: Telhado Solar - Boss Final
 * Nivel final com confronto contra Doutor Plastico
 */

import Phaser from 'phaser';

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

        // Instrucao
        const nextText = this.add.text(width / 2, height - 50, 'Prima V para vitoria, G para game over', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        });
        nextText.setOrigin(0.5);

        // Inputs para testar cenas finais
        this.input.keyboard.once('keydown-V', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('VictoryScene');
            });
        });

        this.input.keyboard.once('keydown-G', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameOverScene');
            });
        });
    }

    update() {
        // Logica de update e boss fight sera implementada nas proximas fases
    }
}
