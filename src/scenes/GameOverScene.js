/**
 * GameOverScene - Cena de fim de jogo (derrota)
 * Mostrada quando o jogador perde todas as vidas
 */

import Phaser from 'phaser';
import gameState from '../managers/GameState.js';
import audioManager from '../managers/AudioManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Obter dados do jogo
        const data = gameState.getEndScreenData();

        // Som de morte
        audioManager.playDeath();

        // Fade in
        this.cameras.main.fadeIn(500);

        // Fundo escuro com overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Criar particulas de lixo a cair (ambiente triste)
        this.createSadParticles(width, height);

        // Titulo Game Over com animacao
        const title = this.add.text(width / 2, -50, 'Oh nao! O lixo venceu...', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#e74c3c',
            stroke: '#000000',
            strokeThickness: 3
        });
        title.setOrigin(0.5);

        // Animacao do titulo
        this.tweens.add({
            targets: title,
            y: 80,
            duration: 800,
            ease: 'Bounce.easeOut'
        });

        // Emoji triste com animacao
        const emoji = this.add.text(width / 2, 130, '😢', {
            fontSize: '48px'
        });
        emoji.setOrigin(0.5);
        emoji.setAlpha(0);

        this.tweens.add({
            targets: emoji,
            alpha: 1,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            delay: 500,
            ease: 'Back.easeOut'
        });

        // Animacao de balanco no emoji
        this.tweens.add({
            targets: emoji,
            angle: { from: -10, to: 10 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1000
        });

        // Mensagem de encorajamento personalizada
        const message = this.add.text(width / 2, 190, 'Nao desistas, Carla!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#2ecc71',
            fontStyle: 'bold'
        });
        message.setOrigin(0.5);
        message.setAlpha(0);

        this.tweens.add({
            targets: message,
            alpha: 1,
            y: 180,
            duration: 500,
            delay: 800
        });

        const message2 = this.add.text(width / 2, 215, 'O planeta precisa de ti! 🌍', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        });
        message2.setOrigin(0.5);
        message2.setAlpha(0);

        this.tweens.add({
            targets: message2,
            alpha: 1,
            duration: 500,
            delay: 1000
        });

        // Caixa de pontuacao
        const scoreBox = this.add.rectangle(width / 2, 290, 280, 80, 0x2c3e50, 0.8);
        scoreBox.setStrokeStyle(2, 0x3498db);
        scoreBox.setAlpha(0);

        this.tweens.add({
            targets: scoreBox,
            alpha: 1,
            duration: 500,
            delay: 1200
        });

        // Pontuacao
        const scoreLabel = this.add.text(width / 2, 265, 'Pontuacao', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#95a5a6'
        });
        scoreLabel.setOrigin(0.5);
        scoreLabel.setAlpha(0);

        const scoreText = this.add.text(width / 2, 290, '0', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#f1c40f'
        });
        scoreText.setOrigin(0.5);
        scoreText.setAlpha(0);

        // Animacao de contagem da pontuacao
        this.tweens.add({
            targets: [scoreLabel, scoreText],
            alpha: 1,
            duration: 500,
            delay: 1400,
            onComplete: () => {
                // Contador animado
                let currentScore = 0;
                const targetScore = data.score;
                const increment = Math.max(1, Math.ceil(targetScore / 30));

                const timer = this.time.addEvent({
                    delay: 30,
                    callback: () => {
                        currentScore = Math.min(currentScore + increment, targetScore);
                        scoreText.setText(currentScore.toString());
                        if (currentScore >= targetScore) {
                            timer.destroy();
                        }
                    },
                    loop: true
                });
            }
        });

        // High Score
        const highScoreText = this.add.text(width / 2, 320, `Recorde: ${data.highScore}`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#9b59b6'
        });
        highScoreText.setOrigin(0.5);
        highScoreText.setAlpha(0);

        this.tweens.add({
            targets: highScoreText,
            alpha: 1,
            duration: 500,
            delay: 1600
        });

        // Novo recorde?
        if (data.score >= data.highScore && data.score > 0) {
            const newRecord = this.add.text(width / 2, 345, '🏆 NOVO RECORDE! 🏆', {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#f1c40f',
                fontStyle: 'bold'
            });
            newRecord.setOrigin(0.5);
            newRecord.setAlpha(0);

            this.tweens.add({
                targets: newRecord,
                alpha: 1,
                scale: { from: 0.5, to: 1 },
                duration: 500,
                delay: 2000,
                ease: 'Back.easeOut'
            });

            // Pulsar
            this.tweens.add({
                targets: newRecord,
                scale: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1,
                delay: 2500
            });
        }

        // Botoes (aparecem com delay)
        this.time.delayedCall(1800, () => {
            this.createButton(width / 2, 385, '🔄 Tentar Novamente', () => {
                this.cameras.main.fadeOut(500);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    gameState.reset(); // Reiniciar estado do jogo
                    this.scene.start('Level1Scene');
                });
            });

            this.createButton(width / 2, 430, '🏠 Menu Principal', () => {
                this.cameras.main.fadeOut(500);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    gameState.reset(); // Reiniciar estado do jogo
                    this.scene.start('MenuScene');
                });
            });
        });
    }

    createSadParticles(width, height) {
        // Criar pequenas particulas cinzentas a cair (simbolizam lixo/tristeza)
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(-height, 0);
            const size = Phaser.Math.Between(3, 8);
            const color = Phaser.Utils.Array.GetRandom([0x7f8c8d, 0x95a5a6, 0xbdc3c7]);

            const particle = this.add.rectangle(x, y, size, size, color);
            particle.setAlpha(0.5);

            this.tweens.add({
                targets: particle,
                y: height + 50,
                x: x + Phaser.Math.Between(-50, 50),
                rotation: Phaser.Math.FloatBetween(1, 3),
                duration: Phaser.Math.Between(4000, 8000),
                ease: 'Linear',
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, width);
                    particle.y = -20;
                }
            });
        }
    }

    createButton(x, y, text, callback) {
        // Fundo do botao
        const button = this.add.rectangle(x, y, 260, 38, 0x34495e);
        button.setStrokeStyle(2, 0x2ecc71);
        button.setInteractive({ useHandCursor: true });

        // Iniciar invisivel para animacao
        button.setAlpha(0);
        button.setScale(0.8);

        // Texto do botao
        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        });
        buttonText.setOrigin(0.5);
        buttonText.setAlpha(0);

        // Animacao de entrada
        this.tweens.add({
            targets: [button, buttonText],
            alpha: 1,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Efeitos hover
        button.on('pointerover', () => {
            button.setFillStyle(0x2ecc71);
            this.tweens.add({
                targets: [button, buttonText],
                scale: 1.05,
                duration: 100
            });
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x34495e);
            this.tweens.add({
                targets: [button, buttonText],
                scale: 1,
                duration: 100
            });
        });

        button.on('pointerdown', () => {
            button.setScale(0.95);
            buttonText.setScale(0.95);
        });

        button.on('pointerup', () => {
            button.setScale(1);
            buttonText.setScale(1);
            audioManager.playClick();
            callback();
        });
    }
}
