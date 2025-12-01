/**
 * GameOverScene - Cena de fim de jogo (derrota)
 * Mostrada quando o jogador perde todas as vidas
 */

import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fade in
        this.cameras.main.fadeIn(500);

        // Fundo escuro
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Titulo Game Over
        const title = this.add.text(width / 2, 100, 'Oh nao! O lixo venceu...', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#e74c3c'
        });
        title.setOrigin(0.5);

        // Emoji triste
        const emoji = this.add.text(width / 2, 160, '😢', {
            fontSize: '48px'
        });
        emoji.setOrigin(0.5);

        // Mensagem de encorajamento
        const message = this.add.text(width / 2, 220, 'Mas nao desistas, Carla!', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#2ecc71'
        });
        message.setOrigin(0.5);

        const message2 = this.add.text(width / 2, 250, 'O planeta precisa de ti!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        });
        message2.setOrigin(0.5);

        // Pontuacao (placeholder)
        const score = this.add.text(width / 2, 300, 'Pontos: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#f1c40f'
        });
        score.setOrigin(0.5);

        // Botao Tentar Novamente
        this.createButton(width / 2, 370, '🔄 Tentar Novamente', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Level1Scene');
            });
        });

        // Botao Menu Principal
        this.createButton(width / 2, 420, '🏠 Menu Principal', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
    }

    createButton(x, y, text, callback) {
        // Fundo do botao
        const button = this.add.rectangle(x, y, 250, 40, 0x34495e);
        button.setStrokeStyle(2, 0x2ecc71);
        button.setInteractive({ useHandCursor: true });

        // Texto do botao
        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        });
        buttonText.setOrigin(0.5);

        // Efeitos hover
        button.on('pointerover', () => {
            button.setFillStyle(0x2ecc71);
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x34495e);
        });

        button.on('pointerdown', () => {
            button.setScale(0.95);
            buttonText.setScale(0.95);
        });

        button.on('pointerup', () => {
            button.setScale(1);
            buttonText.setScale(1);
            callback();
        });
    }
}
