/**
 * MenuScene - Menu principal do jogo
 * Apresenta o titulo, dedicatoria e opcoes de jogo
 */

import Phaser from 'phaser';
import audioManager from '../managers/AudioManager.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Criar fundo com gradiente azul/verde
        this.createBackground(width, height);

        // Titulo principal
        const title = this.add.text(width / 2, 80, 'EcoHero ISCTE', {
            fontSize: '48px',
            fontFamily: 'Arial Black, Arial',
            color: '#2ecc71',
            stroke: '#1a1a2e',
            strokeThickness: 6
        });
        title.setOrigin(0.5);

        // Animacao do titulo (bounce suave)
        this.tweens.add({
            targets: title,
            y: 90,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Subtitulo dedicatoria
        const subtitle = this.add.text(width / 2, 140, 'Especial para Carla Farelo', {
            fontSize: '22px',
            fontFamily: 'Arial',
            color: '#e74c3c'
        });
        subtitle.setOrigin(0.5);

        // Emoji natalicio
        const christmasEmoji = this.add.text(width / 2 + 150, 140, '🎄', {
            fontSize: '24px'
        });
        christmasEmoji.setOrigin(0.5);

        // Descricao do jogo
        const description = this.add.text(width / 2, 190, 'Salva o campus da poluicao e torna mais verde o iscte!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        });
        description.setOrigin(0.5);

        // Botao JOGAR
        this.createPlayButton(width, height);

        // Instrucoes de controlo
        const instructions = this.add.text(width / 2, height - 60, '← → para mover    ↑ para saltar', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#95a5a6'
        });
        instructions.setOrigin(0.5);

        // Creditos
        const credits = this.add.text(width / 2, height - 25, 'Dezembro 2025', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#7f8c8d'
        });
        credits.setOrigin(0.5);

        // Adicionar particulas decorativas (folhas ou estrelas)
        this.createDecorativeParticles(width, height);
    }

    createBackground(width, height) {
        // Gradiente de fundo usando graficos
        const bg = this.add.graphics();

        // Criar gradiente manual com retangulos
        const colors = [0x1a1a2e, 0x16213e, 0x1a3a3a, 0x0f3d3d];
        const stepHeight = height / colors.length;

        colors.forEach((color, index) => {
            bg.fillStyle(color);
            bg.fillRect(0, index * stepHeight, width, stepHeight + 1);
        });

        // Adicionar algumas "estrelas" no fundo
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height / 2);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.3, 0.8);

            bg.fillStyle(0xffffff, alpha);
            bg.fillCircle(x, y, size);
        }
    }

    createPlayButton(width, height) {
        // Container para o botao
        const buttonY = height / 2 + 40;

        // Fundo do botao
        const buttonBg = this.add.rectangle(width / 2, buttonY, 200, 55, 0x2ecc71);
        buttonBg.setStrokeStyle(3, 0x27ae60);
        buttonBg.setInteractive({ useHandCursor: true });

        // Texto do botao
        const buttonText = this.add.text(width / 2, buttonY, 'JOGAR', {
            fontSize: '28px',
            fontFamily: 'Arial Black, Arial',
            color: '#ffffff'
        });
        buttonText.setOrigin(0.5);

        // Efeito hover
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x27ae60);
            buttonBg.setScale(1.05);
            buttonText.setScale(1.05);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x2ecc71);
            buttonBg.setScale(1);
            buttonText.setScale(1);
        });

        // Efeito click
        buttonBg.on('pointerdown', () => {
            buttonBg.setScale(0.95);
            buttonText.setScale(0.95);
        });

        buttonBg.on('pointerup', () => {
            // Inicializar e tocar audio
            audioManager.init();
            audioManager.playGameStart();

            // Transicao para o primeiro nivel
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Level1Scene');
            });
        });

        // Animacao de pulsacao suave
        this.tweens.add({
            targets: [buttonBg, buttonText],
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    createDecorativeParticles(width, height) {
        // Criar algumas folhas/particulas a cair
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(-50, height);
            const leaf = this.add.circle(x, y, 4, 0x2ecc71, 0.6);

            // Animacao de queda
            this.tweens.add({
                targets: leaf,
                y: height + 50,
                x: x + Phaser.Math.Between(-50, 50),
                duration: Phaser.Math.Between(4000, 8000),
                ease: 'Linear',
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => {
                    leaf.x = Phaser.Math.Between(0, width);
                    leaf.y = -50;
                }
            });

            // Rotacao suave
            this.tweens.add({
                targets: leaf,
                alpha: { from: 0.4, to: 0.8 },
                duration: 1000,
                yoyo: true,
                repeat: -1
            });
        }
    }
}
