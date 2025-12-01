/**
 * VictoryScene - Cena de vitoria
 * Mostrada quando o jogador completa todos os niveis
 */

import Phaser from 'phaser';

export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fade in
        this.cameras.main.fadeIn(500);

        // Fundo festivo (verde escuro)
        this.add.rectangle(width / 2, height / 2, width, height, 0x145214);

        // Criar confetti
        this.createConfetti(width, height);

        // Titulo de parabens
        const title = this.add.text(width / 2, 60, 'PARABENS CARLA!', {
            fontSize: '42px',
            fontFamily: 'Arial Black, Arial',
            color: '#f1c40f',
            stroke: '#27ae60',
            strokeThickness: 4
        });
        title.setOrigin(0.5);

        // Animacao bounce do titulo
        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            ease: 'Bounce.easeOut',
            yoyo: true,
            repeat: -1,
            repeatDelay: 2000
        });

        // Emojis festivos
        const emojis = this.add.text(width / 2, 115, '🎉🌍🎄', {
            fontSize: '36px'
        });
        emojis.setOrigin(0.5);

        // Subtitulo
        const subtitle = this.add.text(width / 2, 160, 'Salvaste o campus do ISCTE!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#2ecc71'
        });
        subtitle.setOrigin(0.5);

        // Mensagem do boss
        const bossMessage = this.add.text(width / 2, 200, 'O Doutor Plastico foi derrotado!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#e74c3c'
        });
        bossMessage.setOrigin(0.5);

        // Pontuacao (placeholder)
        const score = this.add.text(width / 2, 250, 'Pontuacao Final: 0', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#f1c40f'
        });
        score.setOrigin(0.5);

        // Estrelas (rating placeholder)
        const stars = this.add.text(width / 2, 290, '⭐⭐⭐', {
            fontSize: '32px'
        });
        stars.setOrigin(0.5);

        // Mensagem especial de Natal
        const christmasMessage = this.add.text(width / 2, 340, 'Feliz Natal! 🎄', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#e74c3c'
        });
        christmasMessage.setOrigin(0.5);

        // Mensagem do planeta
        const planetMessage = this.add.text(width / 2, 370, 'O planeta agradece! 🌍', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#3498db'
        });
        planetMessage.setOrigin(0.5);

        // Botoes
        this.createButton(width / 2 - 100, 420, 'Jogar Novamente', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Level1Scene');
            });
        });

        this.createButton(width / 2 + 100, 420, 'Menu Principal', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
    }

    createConfetti(width, height) {
        // Criar particulas de confetti coloridas a cair
        const colors = [0x2ecc71, 0xf1c40f, 0xe74c3c, 0x3498db, 0x9b59b6];

        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(-height, 0);
            const color = Phaser.Utils.Array.GetRandom(colors);
            const size = Phaser.Math.Between(4, 8);

            const confetti = this.add.rectangle(x, y, size, size * 1.5, color);
            confetti.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));

            // Animacao de queda
            this.tweens.add({
                targets: confetti,
                y: height + 50,
                x: x + Phaser.Math.Between(-100, 100),
                rotation: confetti.rotation + Phaser.Math.FloatBetween(2, 5),
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Linear',
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000),
                onRepeat: () => {
                    confetti.x = Phaser.Math.Between(0, width);
                    confetti.y = -20;
                }
            });
        }
    }

    createButton(x, y, text, callback) {
        // Fundo do botao
        const button = this.add.rectangle(x, y, 150, 35, 0x27ae60);
        button.setStrokeStyle(2, 0x2ecc71);
        button.setInteractive({ useHandCursor: true });

        // Texto do botao
        const buttonText = this.add.text(x, y, text, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        buttonText.setOrigin(0.5);

        // Efeitos
        button.on('pointerover', () => {
            button.setFillStyle(0x2ecc71);
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x27ae60);
        });

        button.on('pointerup', () => {
            callback();
        });
    }
}
