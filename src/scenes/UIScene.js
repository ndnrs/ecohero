/**
 * UIScene - Cena de UI Global
 * Corre em paralelo com todas as outras cenas
 * Mantem o botao fullscreen sempre visivel
 */

import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Criar botao fullscreen
        this.createFullscreenButton();

        // Handler para mudancas de orientacao
        this.setupOrientationHandler();

        // Handler para resize
        this.scale.on('resize', this.handleResize, this);
    }

    createFullscreenButton() {
        const width = 800;  // Dimensoes base do jogo
        const height = 450;

        // Botao no canto superior direito
        const btnSize = 44;
        const btnX = width - 35;
        const btnY = 35;

        // Fundo do botao
        this.btnBg = this.add.circle(btnX, btnY, btnSize / 2, 0x000000, 0.6);
        this.btnBg.setStrokeStyle(2, 0x2ecc71);
        this.btnBg.setInteractive({ useHandCursor: true });
        this.btnBg.setDepth(9999);

        // Icone fullscreen (usar texto mais compativel)
        this.btnIcon = this.add.text(btnX, btnY, '[ ]', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#2ecc71',
            fontStyle: 'bold'
        });
        this.btnIcon.setOrigin(0.5);
        this.btnIcon.setDepth(10000);

        // Hover effect
        this.btnBg.on('pointerover', () => {
            this.btnBg.setFillStyle(0x2ecc71, 0.8);
            this.btnIcon.setColor('#ffffff');
        });

        this.btnBg.on('pointerout', () => {
            this.btnBg.setFillStyle(0x000000, 0.6);
            this.btnIcon.setColor('#2ecc71');
        });

        // Click - toggle fullscreen
        this.btnBg.on('pointerdown', () => {
            this.btnBg.setScale(0.9);
        });

        this.btnBg.on('pointerup', () => {
            this.btnBg.setScale(1);
            this.toggleFullscreen();
        });

        // Listener para mudanca de fullscreen
        this.scale.on('fullscreenchange', () => {
            this.updateFullscreenIcon();
        });
    }

    toggleFullscreen() {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    }

    updateFullscreenIcon() {
        if (this.scale.isFullscreen) {
            this.btnIcon.setText('X');
        } else {
            this.btnIcon.setText('[ ]');
        }
    }

    setupOrientationHandler() {
        // Detectar mudancas de orientacao
        window.addEventListener('orientationchange', () => {
            // Pequeno delay para dar tempo ao browser de atualizar
            setTimeout(() => {
                this.forceRefresh();
            }, 100);
        });

        // Tambem ouvir resize para casos onde orientationchange nao dispara
        window.addEventListener('resize', () => {
            // Debounce para evitar multiplos refreshes
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            this.resizeTimeout = setTimeout(() => {
                this.forceRefresh();
            }, 150);
        });
    }

    forceRefresh() {
        // Forcar o scale manager a recalcular
        this.scale.refresh();
    }

    handleResize(gameSize) {
        // Reposicionar botao se necessario
        // Com FIT mode e dimensoes fixas, isto nao deve ser necessario
        // mas mantem-se para robustez
    }
}
