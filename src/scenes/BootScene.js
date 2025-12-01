/**
 * BootScene - Cena de carregamento inicial
 * Carrega todos os assets e mostra barra de progresso
 */

import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Criar barra de progresso
        this.createProgressBar();

        // Por agora, criar assets placeholder (retangulos coloridos)
        // Numa fase posterior, estes serao substituidos por sprites reais
        this.createPlaceholderAssets();
    }

    createProgressBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Texto de carregamento
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'A carregar...', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#2ecc71'
        });
        loadingText.setOrigin(0.5);

        // Barra de fundo
        const progressBarBg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x222222);
        progressBarBg.setStrokeStyle(2, 0x2ecc71);

        // Barra de progresso
        const progressBar = this.add.rectangle(width / 2 - 195, height / 2, 0, 22, 0x2ecc71);
        progressBar.setOrigin(0, 0.5);

        // Texto de percentagem
        const percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        percentText.setOrigin(0.5);

        // Atualizar barra durante carregamento
        this.load.on('progress', (value) => {
            progressBar.width = 390 * value;
            percentText.setText(Math.round(value * 100) + '%');
        });

        // Quando terminar de carregar
        this.load.on('complete', () => {
            loadingText.setText('Pronto!');
            percentText.setText('100%');
        });
    }

    createPlaceholderAssets() {
        // Criar texturas placeholder usando graficos
        // Estas serao substituidas na Fase 2

        // Heroi - retangulo azul com capa verde
        const heroGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        heroGraphics.fillStyle(0x3498db); // Azul
        heroGraphics.fillRect(8, 8, 16, 32); // Corpo
        heroGraphics.fillStyle(0x2ecc71); // Verde (capa)
        heroGraphics.fillRect(4, 8, 6, 24); // Capa
        heroGraphics.fillStyle(0xf5cba7); // Bege (cara)
        heroGraphics.fillRect(10, 0, 12, 10); // Cabeca
        heroGraphics.generateTexture('hero-idle', 32, 48);
        heroGraphics.destroy();

        // Plataforma - retangulo verde (relva)
        const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        platformGraphics.fillStyle(0x27ae60);
        platformGraphics.fillRect(0, 0, 64, 32);
        platformGraphics.fillStyle(0x2ecc71);
        platformGraphics.fillRect(0, 0, 64, 8); // Topo mais claro
        platformGraphics.generateTexture('platform-grass', 64, 32);
        platformGraphics.destroy();

        // Item - estrela amarela
        const starGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        starGraphics.fillStyle(0xf1c40f);
        starGraphics.fillCircle(16, 16, 12);
        starGraphics.generateTexture('item-star', 32, 32);
        starGraphics.destroy();

        // Botao - retangulo com cantos arredondados
        const buttonGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        buttonGraphics.fillStyle(0x2ecc71);
        buttonGraphics.fillRoundedRect(0, 0, 200, 50, 10);
        buttonGraphics.generateTexture('ui-button', 200, 50);
        buttonGraphics.destroy();
    }

    create() {
        // Pequeno delay antes de ir para o menu
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }
}
