/**
 * PauseScene - Menu de pausa do jogo
 * Overlay que aparece quando o jogador pausa o jogo
 */

import Phaser from 'phaser';
import audioManager from '../managers/AudioManager.js';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    init(data) {
        // Guardar referencia a cena que foi pausada
        this.pausedScene = data.pausedScene || 'Level1Scene';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Overlay escuro semi-transparente
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

        // Caixa de pausa
        const pauseBox = this.add.rectangle(width / 2, height / 2, 300, 280, 0x1a1a2e, 0.95);
        pauseBox.setStrokeStyle(3, 0x2ecc71);

        // Titulo PAUSA
        const title = this.add.text(width / 2, height / 2 - 100, 'PAUSA', {
            fontSize: '42px',
            fontFamily: 'Arial Black, Arial',
            color: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);

        // Animacao do titulo
        this.tweens.add({
            targets: title,
            scale: { from: 0.8, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Icone de pausa
        const pauseIcon = this.add.text(width / 2, height / 2 - 50, '⏸️', {
            fontSize: '36px'
        });
        pauseIcon.setOrigin(0.5);

        // Botoes
        this.createButton(width / 2, height / 2 + 10, '▶️ Continuar', () => {
            this.resumeGame();
        });

        this.createButton(width / 2, height / 2 + 60, '🔄 Reiniciar', () => {
            this.restartLevel();
        });

        this.createButton(width / 2, height / 2 + 110, '🏠 Menu', () => {
            this.goToMenu();
        });

        // Instrucao
        const hint = this.add.text(width / 2, height - 40, 'Prima P ou ESC para continuar', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#7f8c8d'
        });
        hint.setOrigin(0.5);

        // Input para retomar
        this.input.keyboard.on('keydown-P', () => this.resumeGame());
        this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 220, 40, 0x34495e);
        button.setStrokeStyle(2, 0x2ecc71);
        button.setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        });
        buttonText.setOrigin(0.5);

        // Efeitos hover
        button.on('pointerover', () => {
            button.setFillStyle(0x2ecc71);
            button.setScale(1.05);
            buttonText.setScale(1.05);
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x34495e);
            button.setScale(1);
            buttonText.setScale(1);
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

    resumeGame() {
        // Retomar a cena pausada
        this.scene.resume(this.pausedScene);
        this.scene.stop();
    }

    restartLevel() {
        // Parar cena pausada e reiniciar
        this.scene.stop(this.pausedScene);
        this.scene.start(this.pausedScene);
        this.scene.stop();
    }

    goToMenu() {
        // Parar musica atual do nivel antes de ir para menu
        audioManager.stopBGM(0.3);

        // Parar cena pausada e ir para menu
        this.scene.stop(this.pausedScene);
        this.scene.start('MenuScene');
        this.scene.stop();
    }
}
