/**
 * VictoryScene - Cena de vitoria
 * Mostrada quando o jogador completa todos os niveis
 * Com confetti, estrelas e mensagens personalizadas para Carla
 */

import Phaser from 'phaser';
import gameState from '../managers/GameState.js';
import audioManager from '../managers/AudioManager.js';

export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Obter dados do jogo
        const data = gameState.getEndScreenData();

        // Iniciar musica de vitoria e som de vitoria
        audioManager.init();
        audioManager.playBGM('victory');
        audioManager.playVictory();

        // Fade in
        this.cameras.main.fadeIn(500);

        // Fundo festivo (gradiente verde/dourado)
        this.createBackground(width, height);

        // Criar confetti continuo
        this.createConfetti(width, height);

        // Elementos da UI (aparecem sequencialmente)
        this.createHeroPhoto(width);
        this.createTitle(width, data);
        this.createSubtitle(width);
        this.createBossMessage(width);
        this.createScoreSection(width, data);
        this.createStars(width, data);
        this.createSpecialMessages(width, data);
        this.createChristmasMessage(width);
        this.createButtons(width, height);

        // Efeitos especiais
        this.time.delayedCall(500, () => {
            this.cameras.main.flash(300, 46, 204, 113, true);
        });
    }

    createHeroPhoto(width) {
        // Foto da Carla como heroina vitoriosa
        const photoY = 225;

        // Moldura dourada
        const frame = this.add.rectangle(width - 100, photoY, 90, 90, 0xf1c40f);
        frame.setStrokeStyle(4, 0x27ae60);
        frame.setAlpha(0);

        // Tentar usar foto real da Carla
        let photoElement;
        if (this.textures.exists('carla-photo')) {
            photoElement = this.add.image(width - 100, photoY, 'carla-photo');
            const maxSize = 80;
            const scale = Math.min(maxSize / photoElement.width, maxSize / photoElement.height);
            photoElement.setScale(scale);
        } else {
            // Fallback: inicial C
            photoElement = this.add.text(width - 100, photoY, 'C', {
                fontSize: '48px',
                fontFamily: 'Arial Black',
                color: '#27ae60'
            }).setOrigin(0.5);
        }
        photoElement.setAlpha(0);

        // Titulo da heroina
        const heroTitle = this.add.text(width - 100, photoY + 60, 'ECOHERO!', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#f1c40f',
            stroke: '#27ae60',
            strokeThickness: 2
        }).setOrigin(0.5);
        heroTitle.setAlpha(0);

        // Coroa de vitoria
        const crown = this.add.text(width - 100, photoY - 55, '👑', {
            fontSize: '28px'
        }).setOrigin(0.5);
        crown.setAlpha(0);

        // Animacoes de entrada
        this.tweens.add({
            targets: [frame, photoElement, heroTitle, crown],
            alpha: 1,
            duration: 500,
            delay: 400
        });

        // Brilho na moldura
        this.tweens.add({
            targets: frame,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            delay: 1000
        });

        // Coroa a flutuar
        this.tweens.add({
            targets: crown,
            y: photoY - 60,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 1000
        });
    }

    createBackground(width, height) {
        // Gradiente verde festivo
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x145214, 0x1e7b1e, 0x0d3d0d, 0x145214, 1);
        bg.fillRect(0, 0, width, height);

        // Adicionar estrelas douradas no fundo
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(2, 5);

            const star = this.add.circle(x, y, size, 0xf1c40f, 0.3);

            // Piscar
            this.tweens.add({
                targets: star,
                alpha: { from: 0.3, to: 0.8 },
                duration: Phaser.Math.Between(1000, 2000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            });
        }
    }

    createConfetti(width, height) {
        const colors = [0x2ecc71, 0xf1c40f, 0xe74c3c, 0x3498db, 0x9b59b6, 0xe67e22];

        // Criar 60 particulas de confetti
        for (let i = 0; i < 60; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(-height, 0);
            const color = Phaser.Utils.Array.GetRandom(colors);
            const sizeW = Phaser.Math.Between(4, 10);
            const sizeH = Phaser.Math.Between(8, 15);

            const confetti = this.add.rectangle(x, y, sizeW, sizeH, color);
            confetti.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));

            // Animacao de queda
            this.tweens.add({
                targets: confetti,
                y: height + 50,
                x: x + Phaser.Math.Between(-150, 150),
                rotation: confetti.rotation + Phaser.Math.FloatBetween(3, 8),
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Linear',
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => {
                    confetti.x = Phaser.Math.Between(0, width);
                    confetti.y = -30;
                }
            });
        }
    }

    createTitle(width, data) {
        // Titulo principal
        const title = this.add.text(width / 2, 45, 'PARABENS CARLA!', {
            fontSize: '38px',
            fontFamily: 'Arial Black, Arial',
            color: '#f1c40f',
            stroke: '#27ae60',
            strokeThickness: 5
        });
        title.setOrigin(0.5);
        title.setScale(0);

        // Animacao bounce do titulo
        this.tweens.add({
            targets: title,
            scale: 1,
            duration: 800,
            ease: 'Bounce.easeOut'
        });

        // Pulsar continuo
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            delay: 1000
        });

        // Emojis festivos
        const emojis = this.add.text(width / 2, 90, '🎉🌍🎄', {
            fontSize: '32px'
        });
        emojis.setOrigin(0.5);
        emojis.setAlpha(0);

        this.tweens.add({
            targets: emojis,
            alpha: 1,
            y: 85,
            duration: 500,
            delay: 600
        });
    }

    createSubtitle(width) {
        const subtitle = this.add.text(width / 2, 115, 'Salvaste o campus do ISCTE!', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#2ecc71',
            fontStyle: 'bold'
        });
        subtitle.setOrigin(0.5);
        subtitle.setAlpha(0);

        this.tweens.add({
            targets: subtitle,
            alpha: 1,
            duration: 500,
            delay: 800
        });
    }

    createBossMessage(width) {
        const bossMessage = this.add.text(width / 2, 142, 'O Monstro dos AC\'s foi derrotado! Os ACs estao todos salvos! ❄️', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#e74c3c',
            fontStyle: 'bold'
        });
        bossMessage.setOrigin(0.5);
        bossMessage.setAlpha(0);

        this.tweens.add({
            targets: bossMessage,
            alpha: 1,
            duration: 500,
            delay: 1000
        });

        // Mensagem extra engracada
        const funnyMsg = this.add.text(width / 2, 162, 'Agora ele pode vestir as suas 6 camadas de roupa em paz!', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'italic'
        });
        funnyMsg.setOrigin(0.5);
        funnyMsg.setAlpha(0);

        this.tweens.add({
            targets: funnyMsg,
            alpha: 1,
            duration: 500,
            delay: 1200
        });
    }

    createScoreSection(width, data) {
        // Caixa de pontuacao
        const scoreBox = this.add.rectangle(width / 2, 210, 280, 70, 0x27ae60, 0.3);
        scoreBox.setStrokeStyle(2, 0xf1c40f);
        scoreBox.setAlpha(0);

        this.tweens.add({
            targets: scoreBox,
            alpha: 1,
            duration: 500,
            delay: 1200
        });

        // Label
        const scoreLabel = this.add.text(width / 2, 185, 'Pontuacao Final', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#bdc3c7'
        });
        scoreLabel.setOrigin(0.5);
        scoreLabel.setAlpha(0);

        // Pontuacao
        const scoreText = this.add.text(width / 2, 215, '0', {
            fontSize: '36px',
            fontFamily: 'Arial Black',
            color: '#f1c40f'
        });
        scoreText.setOrigin(0.5);
        scoreText.setAlpha(0);

        // Animacao de contagem
        this.tweens.add({
            targets: [scoreLabel, scoreText],
            alpha: 1,
            duration: 500,
            delay: 1400,
            onComplete: () => {
                let currentScore = 0;
                const targetScore = data.score;
                const increment = Math.max(1, Math.ceil(targetScore / 40));

                const timer = this.time.addEvent({
                    delay: 25,
                    callback: () => {
                        currentScore = Math.min(currentScore + increment, targetScore);
                        scoreText.setText(currentScore.toString());
                        if (currentScore >= targetScore) {
                            timer.destroy();
                            // Pulsar quando terminar
                            this.tweens.add({
                                targets: scoreText,
                                scale: 1.2,
                                duration: 200,
                                yoyo: true
                            });
                        }
                    },
                    loop: true
                });
            }
        });
    }

    createStars(width, data) {
        const starsY = 260;
        const starSpacing = 45;
        const startX = width / 2 - starSpacing;
        const numStars = data.stars;

        // Criar 3 estrelas (algumas podem estar vazias)
        for (let i = 0; i < 3; i++) {
            const x = startX + i * starSpacing;
            const isFilled = i < numStars;

            // Estrela (preenchida ou vazia)
            const star = this.add.text(x, starsY, isFilled ? '⭐' : '☆', {
                fontSize: '36px',
                color: isFilled ? '#f1c40f' : '#7f8c8d'
            });
            star.setOrigin(0.5);
            star.setAlpha(0);
            star.setScale(0);

            // Animacao sequencial
            this.tweens.add({
                targets: star,
                alpha: 1,
                scale: 1,
                duration: 400,
                delay: 1800 + (i * 300),
                ease: 'Back.easeOut',
                onComplete: () => {
                    if (isFilled) {
                        // Brilho extra
                        this.tweens.add({
                            targets: star,
                            scale: 1.3,
                            duration: 200,
                            yoyo: true
                        });
                    }
                }
            });
        }
    }

    createSpecialMessages(width, data) {
        // Easter egg: pontuacao alta
        if (data.score > 1000) {
            const easterEgg = this.add.text(width / 2, 330,
                'Carla, es uma verdadeira EcoHero! 🦸‍♀️', {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            easterEgg.setOrigin(0.5);
            easterEgg.setAlpha(0);

            this.tweens.add({
                targets: easterEgg,
                alpha: 1,
                scale: { from: 0.8, to: 1 },
                duration: 500,
                delay: 3000,
                ease: 'Back.easeOut'
            });

            // Brilho
            this.tweens.add({
                targets: easterEgg,
                alpha: { from: 1, to: 0.7 },
                duration: 500,
                yoyo: true,
                repeat: -1,
                delay: 3500
            });
        }

        // Easter egg: 3 estrelas
        if (data.stars === 3) {
            const perfectText = this.add.text(width / 2, 350,
                '🏆 MESTRE DA RECICLAGEM 🏆', {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: '#f1c40f',
                fontStyle: 'bold'
            });
            perfectText.setOrigin(0.5);
            perfectText.setAlpha(0);

            this.tweens.add({
                targets: perfectText,
                alpha: 1,
                duration: 500,
                delay: 3200
            });
        }
    }

    createChristmasMessage(width) {
        // Mensagem de Natal da equipa
        const christmasBox = this.add.rectangle(width / 2, 375, 320, 50, 0x145214, 0.8);
        christmasBox.setStrokeStyle(2, 0xe74c3c);
        christmasBox.setAlpha(0);

        const christmasMsg = this.add.text(width / 2, 375,
            'Feliz Natal da equipa GEQS! 🎄', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#e74c3c',
            fontStyle: 'bold'
        });
        christmasMsg.setOrigin(0.5);
        christmasMsg.setAlpha(0);

        this.tweens.add({
            targets: [christmasBox, christmasMsg],
            alpha: 1,
            duration: 500,
            delay: 3400
        });

        // Animacao festiva na mensagem
        this.tweens.add({
            targets: christmasMsg,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            delay: 4000
        });
    }

    createButtons(width, height) {
        // Botoes aparecem por ultimo
        this.time.delayedCall(3800, () => {
            this.createButton(width / 2 - 90, 420, '🔄 Jogar Novamente', () => {
                audioManager.stopBGM(0.3);
                this.cameras.main.fadeOut(500);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    gameState.reset(); // Reiniciar estado do jogo
                    this.scene.start('Level1Scene');
                });
            });

            this.createButton(width / 2 + 90, 420, '🏠 Menu', () => {
                audioManager.stopBGM(0.3);
                this.cameras.main.fadeOut(500);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    gameState.reset(); // Reiniciar estado do jogo
                    this.scene.start('MenuScene');
                });
            });
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 150, 35, 0x27ae60);
        button.setStrokeStyle(2, 0x2ecc71);
        button.setInteractive({ useHandCursor: true });
        button.setAlpha(0);
        button.setScale(0.8);

        const buttonText = this.add.text(x, y, text, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
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
                scale: 1.1,
                duration: 100
            });
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x27ae60);
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
