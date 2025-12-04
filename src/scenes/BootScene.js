/**
 * BootScene - Cena de carregamento inicial
 * Gera todos os assets graficos e mostra barra de progresso
 */

import Phaser from 'phaser';
import AssetGenerator from '../utils/AssetGenerator.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Criar elementos visuais da barra de progresso
        this.createProgressBar();

        // Carregar fotos reais para a intro e boss
        // IMPORTANTE: Coloca as fotos em public/assets/images/
        this.load.image('carla-photo', '/assets/images/carla.jpg');
        this.load.image('ricardo-photo', '/assets/images/ricardo.jpeg');

        // Handler para erros de carregamento (fotos opcionais)
        this.load.on('loaderror', (file) => {
            console.warn('Foto nao encontrada:', file.key, '- usando placeholder');
        });

        // Simular carregamento para a barra de progresso
        // (os assets sao gerados no create, mas mostramos progresso aqui)
        for (let i = 0; i < 100; i++) {
            this.load.image(`loading-${i}`, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        }
    }

    createProgressBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fundo
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Logo/titulo
        const title = this.add.text(width / 2, height / 2 - 100, 'EcoHero ISCTE', {
            fontSize: '36px',
            fontFamily: 'Arial Black, Arial',
            color: '#2ecc71'
        });
        title.setOrigin(0.5);

        // Icone de reciclagem animado
        this.recycleIcon = this.add.text(width / 2, height / 2 - 40, '♻️', {
            fontSize: '48px'
        });
        this.recycleIcon.setOrigin(0.5);

        // Animacao de rotacao
        this.tweens.add({
            targets: this.recycleIcon,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // Texto de carregamento
        this.loadingText = this.add.text(width / 2, height / 2 + 20, 'A gerar assets...', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        });
        this.loadingText.setOrigin(0.5);

        // Barra de fundo
        const progressBarBg = this.add.rectangle(width / 2, height / 2 + 60, 400, 24, 0x222222);
        progressBarBg.setStrokeStyle(2, 0x2ecc71);

        // Barra de progresso
        this.progressBar = this.add.rectangle(width / 2 - 195, height / 2 + 60, 0, 18, 0x2ecc71);
        this.progressBar.setOrigin(0, 0.5);

        // Texto de percentagem
        this.percentText = this.add.text(width / 2, height / 2 + 100, '0%', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#95a5a6'
        });
        this.percentText.setOrigin(0.5);

        // Atualizar barra durante carregamento
        this.load.on('progress', (value) => {
            this.progressBar.width = 390 * value;
            this.percentText.setText(Math.round(value * 100) + '%');
        });

        // Creditos
        const credits = this.add.text(width / 2, height - 30, 'Um presente especial para Carla Farelo', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#7f8c8d'
        });
        credits.setOrigin(0.5);
    }

    create() {
        // Atualizar texto
        this.loadingText.setText('A gerar graficos...');

        // Gerar todos os assets
        const assetGenerator = new AssetGenerator(this);
        assetGenerator.generateAll();

        // Criar animacoes do heroi
        this.createHeroAnimations();

        // Atualizar UI
        this.loadingText.setText('Pronto!');
        this.progressBar.width = 390;
        this.percentText.setText('100%');

        // Transicao para a intro (historia)
        this.time.delayedCall(800, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('IntroScene');
            });
        });
    }

    createHeroAnimations() {
        // Animacao idle (parado)
        this.anims.create({
            key: 'hero-idle-anim',
            frames: [{ key: 'hero-idle' }],
            frameRate: 1,
            repeat: -1
        });

        // Animacao andar
        this.anims.create({
            key: 'hero-walk-anim',
            frames: [
                { key: 'hero-walk1' },
                { key: 'hero-idle' },
                { key: 'hero-walk2' },
                { key: 'hero-idle' }
            ],
            frameRate: 10,
            repeat: -1
        });

        // Animacao saltar
        this.anims.create({
            key: 'hero-jump-anim',
            frames: [{ key: 'hero-jump' }],
            frameRate: 1,
            repeat: 0
        });
    }
}
