/**
 * AssetGenerator - Gera todos os assets graficos programaticamente
 * Nenhum ficheiro externo necessario - tudo criado com Phaser Graphics
 */

export default class AssetGenerator {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Gera todos os assets do jogo
     */
    generateAll() {
        this.generateHero();
        this.generatePlatforms();
        this.generateCollectibles();
        this.generateEnemies();
        this.generateBackgrounds();
        this.generateUI();
        this.generateBoss();
        this.generateParticles();
    }

    // ═══════════════════════════════════════════════════════════
    // HEROI - EcoHero
    // ═══════════════════════════════════════════════════════════

    generateHero() {
        // Frame 1: Parado (idle)
        this.createHeroFrame('hero-idle', 0);

        // Frame 2: Andar 1
        this.createHeroFrame('hero-walk1', 1);

        // Frame 3: Andar 2
        this.createHeroFrame('hero-walk2', 2);

        // Frame 4: Saltar
        this.createHeroFrame('hero-jump', 3);
    }

    createHeroFrame(key, frame) {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 48;

        // Offset para animacao de andar
        const legOffset = frame === 1 ? 2 : (frame === 2 ? -2 : 0);
        const armOffset = frame === 1 ? -3 : (frame === 2 ? 3 : 0);
        const jumpSquish = frame === 3 ? 4 : 0;

        // Capa verde (atras)
        g.fillStyle(0x27ae60);
        g.fillRoundedRect(4, 12 - jumpSquish, 8, 28 + jumpSquish, 2);

        // Pernas (calcas azuis escuras)
        g.fillStyle(0x2c3e50);
        // Perna esquerda
        g.fillRect(10 + legOffset, 36, 5, 12);
        // Perna direita
        g.fillRect(17 - legOffset, 36, 5, 12);

        // Sapatos verdes
        g.fillStyle(0x27ae60);
        g.fillRect(9 + legOffset, 44, 7, 4);
        g.fillRect(16 - legOffset, 44, 7, 4);

        // Corpo (t-shirt verde clara)
        g.fillStyle(0x2ecc71);
        g.fillRoundedRect(8, 16 - jumpSquish, 16, 22 + jumpSquish, 3);

        // Simbolo reciclagem no peito
        g.fillStyle(0xffffff);
        g.fillCircle(16, 26, 4);
        g.fillStyle(0x2ecc71);
        g.fillCircle(16, 26, 2);

        // Bracos
        g.fillStyle(0xf5cba7); // Pele
        // Braco esquerdo
        g.fillRect(4 + armOffset, 18, 5, 12);
        // Braco direito
        g.fillRect(23 - armOffset, 18, 5, 12);

        // Cabeca
        g.fillStyle(0xf5cba7);
        g.fillCircle(16, 8, 8);

        // Cabelo castanho
        g.fillStyle(0x8b4513);
        g.fillRect(9, 0, 14, 6);
        g.fillRect(8, 2, 3, 4);
        g.fillRect(21, 2, 3, 4);

        // Olhos
        g.fillStyle(0x2c3e50);
        g.fillCircle(13, 7, 2);
        g.fillCircle(19, 7, 2);

        // Pupilas
        g.fillStyle(0xffffff);
        g.fillCircle(13.5, 6.5, 0.8);
        g.fillCircle(19.5, 6.5, 0.8);

        // Sorriso
        g.lineStyle(1, 0xe74c3c);
        g.beginPath();
        g.arc(16, 10, 3, 0.2, Math.PI - 0.2);
        g.strokePath();

        g.generateTexture(key, w, h);
        g.destroy();
    }

    // ═══════════════════════════════════════════════════════════
    // PLATAFORMAS
    // ═══════════════════════════════════════════════════════════

    generatePlatforms() {
        // Plataforma de relva
        this.createGrassPlatform();

        // Plataforma de tijolo (estilo ISCTE)
        this.createBrickPlatform();

        // Plataforma de metal (telhado)
        this.createMetalPlatform();
    }

    createGrassPlatform() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 64, h = 32;

        // Terra
        g.fillStyle(0x8b4513);
        g.fillRect(0, 8, w, h - 8);

        // Relva base
        g.fillStyle(0x27ae60);
        g.fillRect(0, 0, w, 12);

        // Detalhes de relva (tufos)
        g.fillStyle(0x2ecc71);
        for (let i = 0; i < 8; i++) {
            const x = i * 8 + 2;
            g.fillTriangle(x, 8, x + 3, 0, x + 6, 8);
        }

        // Textura da terra
        g.fillStyle(0x6d4c41);
        for (let i = 0; i < 5; i++) {
            g.fillCircle(10 + i * 12, 20, 3);
        }

        g.generateTexture('platform-grass', w, h);
        g.destroy();
    }

    createBrickPlatform() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 64, h = 32;

        // Fundo
        g.fillStyle(0xb71c1c);
        g.fillRect(0, 0, w, h);

        // Tijolos
        const brickW = 14, brickH = 8;
        const colors = [0xc62828, 0xd32f2f, 0xb71c1c];

        for (let row = 0; row < 4; row++) {
            const offset = row % 2 === 0 ? 0 : brickW / 2;
            for (let col = 0; col < 5; col++) {
                const x = col * brickW + offset;
                const y = row * brickH;
                g.fillStyle(colors[(row + col) % 3]);
                g.fillRect(x + 1, y + 1, brickW - 2, brickH - 2);
            }
        }

        // Linhas de cimento
        g.lineStyle(1, 0x9e9e9e);
        for (let i = 1; i < 4; i++) {
            g.moveTo(0, i * brickH);
            g.lineTo(w, i * brickH);
        }
        g.strokePath();

        g.generateTexture('platform-brick', w, h);
        g.destroy();
    }

    createMetalPlatform() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 64, h = 32;

        // Base metal
        g.fillStyle(0x607d8b);
        g.fillRect(0, 0, w, h);

        // Gradiente simulado
        g.fillStyle(0x78909c);
        g.fillRect(0, 0, w, 4);
        g.fillStyle(0x546e7a);
        g.fillRect(0, h - 4, w, 4);

        // Parafusos nos cantos
        g.fillStyle(0x37474f);
        g.fillCircle(6, 6, 3);
        g.fillCircle(w - 6, 6, 3);
        g.fillCircle(6, h - 6, 3);
        g.fillCircle(w - 6, h - 6, 3);

        // Brilho dos parafusos
        g.fillStyle(0x90a4ae);
        g.fillCircle(5, 5, 1);
        g.fillCircle(w - 7, 5, 1);

        // Linhas decorativas
        g.lineStyle(1, 0x455a64);
        g.moveTo(16, 0);
        g.lineTo(16, h);
        g.moveTo(48, 0);
        g.lineTo(48, h);
        g.strokePath();

        g.generateTexture('platform-metal', w, h);
        g.destroy();
    }

    // ═══════════════════════════════════════════════════════════
    // ITENS COLETAVEIS
    // ═══════════════════════════════════════════════════════════

    generateCollectibles() {
        this.createBottle();
        this.createCan();
        this.createBattery();
        this.createPaper();
        this.createStar();
    }

    createBottle() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 32;

        // Corpo da garrafa (transparente azul)
        g.fillStyle(0x3498db, 0.7);
        g.fillRoundedRect(10, 8, 12, 20, 3);

        // Gargalo
        g.fillStyle(0x3498db, 0.8);
        g.fillRect(13, 2, 6, 8);

        // Tampa
        g.fillStyle(0x2980b9);
        g.fillRect(12, 0, 8, 4);

        // Brilho
        g.fillStyle(0xffffff, 0.4);
        g.fillRect(12, 10, 3, 14);

        // Etiqueta
        g.fillStyle(0x2ecc71);
        g.fillRect(11, 16, 10, 6);

        g.generateTexture('item-bottle', w, h);
        g.destroy();
    }

    createCan() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 32;

        // Corpo da lata
        g.fillStyle(0xbdc3c7);
        g.fillRoundedRect(8, 6, 16, 22, 2);

        // Topo
        g.fillStyle(0x95a5a6);
        g.fillEllipse(16, 7, 16, 6);

        // Anel de abertura
        g.fillStyle(0x7f8c8d);
        g.fillEllipse(16, 6, 8, 3);

        // Faixa colorida (marca)
        g.fillStyle(0xe74c3c);
        g.fillRect(8, 12, 16, 8);

        // Brilho
        g.fillStyle(0xffffff, 0.3);
        g.fillRect(10, 8, 4, 18);

        g.generateTexture('item-can', w, h);
        g.destroy();
    }

    createBattery() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 32;

        // Corpo da pilha
        g.fillStyle(0x2c3e50);
        g.fillRoundedRect(8, 6, 16, 24, 2);

        // Terminal positivo
        g.fillStyle(0x7f8c8d);
        g.fillRect(12, 2, 8, 5);

        // Faixa vermelha
        g.fillStyle(0xe74c3c);
        g.fillRect(8, 10, 16, 10);

        // Simbolo +
        g.fillStyle(0xffffff);
        g.fillRect(14, 4, 4, 1);

        // Texto na pilha
        g.fillStyle(0xf1c40f);
        g.fillRect(10, 22, 12, 4);

        // Brilho
        g.fillStyle(0xffffff, 0.2);
        g.fillRect(9, 8, 3, 18);

        g.generateTexture('item-battery', w, h);
        g.destroy();
    }

    createPaper() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 32;

        // Folha de papel
        g.fillStyle(0xecf0f1);
        g.fillRect(6, 4, 20, 26);

        // Canto dobrado
        g.fillStyle(0xbdc3c7);
        g.fillTriangle(26, 4, 26, 12, 18, 4);

        // Linhas de texto
        g.fillStyle(0x95a5a6);
        for (let i = 0; i < 5; i++) {
            g.fillRect(9, 10 + i * 4, 14, 1);
        }

        // Sombra
        g.fillStyle(0x000000, 0.1);
        g.fillRect(8, 28, 18, 2);

        g.generateTexture('item-paper', w, h);
        g.destroy();
    }

    createStar() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 32;

        // Brilho exterior
        g.fillStyle(0xf1c40f, 0.3);
        g.fillCircle(16, 16, 14);

        // Estrela principal
        g.fillStyle(0xf1c40f);
        this.drawStar(g, 16, 16, 5, 12, 6);

        // Centro brilhante
        g.fillStyle(0xffffff);
        g.fillCircle(16, 16, 4);

        // Simbolo reciclagem
        g.fillStyle(0x27ae60);
        g.fillCircle(16, 16, 2);

        g.generateTexture('item-star', w, h);
        g.destroy();
    }

    drawStar(graphics, cx, cy, points, outerRadius, innerRadius) {
        const step = Math.PI / points;
        graphics.beginPath();
        for (let i = 0; i < 2 * points; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            if (i === 0) graphics.moveTo(x, y);
            else graphics.lineTo(x, y);
        }
        graphics.closePath();
        graphics.fillPath();
    }

    // ═══════════════════════════════════════════════════════════
    // INIMIGOS / OBSTACULOS
    // ═══════════════════════════════════════════════════════════

    generateEnemies() {
        this.createPlasticBag();
        this.createCup();
        this.createCigarette();
        this.createToxicBarrel();
    }

    createPlasticBag() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 32;

        // Corpo do saco
        g.fillStyle(0xffffff, 0.8);
        g.fillRoundedRect(4, 8, 24, 20, 4);

        // Asas do saco
        g.fillStyle(0xffffff, 0.7);
        g.fillTriangle(8, 8, 4, 0, 12, 8);
        g.fillTriangle(24, 8, 28, 0, 20, 8);

        // Vincos/dobras
        g.lineStyle(1, 0xbdc3c7);
        g.moveTo(10, 10);
        g.lineTo(14, 24);
        g.moveTo(22, 10);
        g.lineTo(18, 24);
        g.strokePath();

        // Olhos maus
        g.fillStyle(0xe74c3c);
        g.fillCircle(12, 16, 3);
        g.fillCircle(20, 16, 3);

        // Pupilas
        g.fillStyle(0x000000);
        g.fillCircle(13, 16, 1.5);
        g.fillCircle(21, 16, 1.5);

        g.generateTexture('enemy-plastic-bag', w, h);
        g.destroy();
    }

    createCup() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 32;

        // Corpo do copo (trapezio)
        g.fillStyle(0xffffff);
        g.beginPath();
        g.moveTo(8, 4);
        g.lineTo(24, 4);
        g.lineTo(22, 30);
        g.lineTo(10, 30);
        g.closePath();
        g.fillPath();

        // Tampa
        g.fillStyle(0x8b4513);
        g.fillRect(6, 2, 20, 4);

        // Mancha de cafe
        g.fillStyle(0x5d4037, 0.5);
        g.fillEllipse(16, 16, 10, 12);

        // Olhos maus
        g.fillStyle(0xe74c3c);
        g.fillCircle(12, 14, 3);
        g.fillCircle(20, 14, 3);

        // Sorriso mau
        g.lineStyle(2, 0xe74c3c);
        g.beginPath();
        g.arc(16, 22, 4, Math.PI, 0);
        g.strokePath();

        g.generateTexture('enemy-cup', w, h);
        g.destroy();
    }

    createCigarette() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 32;

        // Corpo da beata
        g.fillStyle(0xf5f5dc);
        g.fillRect(6, 14, 16, 6);

        // Filtro laranja
        g.fillStyle(0xff9800);
        g.fillRect(22, 14, 6, 6);

        // Ponta queimada
        g.fillStyle(0x424242);
        g.fillRect(4, 14, 4, 6);

        // Fumo
        g.fillStyle(0x9e9e9e, 0.5);
        g.fillCircle(4, 10, 3);
        g.fillCircle(2, 6, 2);
        g.fillCircle(6, 4, 2);

        // Olhos pequenos e maus
        g.fillStyle(0xe74c3c);
        g.fillCircle(12, 16, 1.5);
        g.fillCircle(18, 16, 1.5);

        g.generateTexture('enemy-cigarette', w, h);
        g.destroy();
    }

    createToxicBarrel() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 32;

        // Corpo do barril
        g.fillStyle(0x4caf50);
        g.fillRoundedRect(4, 4, 24, 26, 3);

        // Aros metalicos
        g.fillStyle(0x37474f);
        g.fillRect(4, 8, 24, 3);
        g.fillRect(4, 22, 24, 3);

        // Simbolo de perigo (caveira simplificada)
        g.fillStyle(0x000000);
        g.fillCircle(16, 14, 5);

        // Olhos da caveira
        g.fillStyle(0x4caf50);
        g.fillCircle(14, 13, 1.5);
        g.fillCircle(18, 13, 1.5);

        // Boca
        g.fillRect(13, 17, 6, 2);

        // Brilho toxico
        g.fillStyle(0x8bc34a, 0.5);
        g.fillCircle(10, 10, 4);

        g.generateTexture('enemy-toxic', w, h);
        g.destroy();
    }

    // ═══════════════════════════════════════════════════════════
    // FUNDOS
    // ═══════════════════════════════════════════════════════════

    generateBackgrounds() {
        this.createCantinaBg();
        this.createGardenBg();
        this.createRooftopBg();
        this.createISCTESilhouette();
    }

    createCantinaBg() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 800, h = 450;

        // Parede de fundo
        g.fillGradientStyle(0xd7ccc8, 0xd7ccc8, 0xbcaaa4, 0xbcaaa4);
        g.fillRect(0, 0, w, h);

        // Chao
        g.fillStyle(0x8d6e63);
        g.fillRect(0, h - 80, w, 80);

        // Azulejos no chao
        g.fillStyle(0x795548);
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 2; j++) {
                if ((i + j) % 2 === 0) {
                    g.fillRect(i * 40, h - 80 + j * 40, 40, 40);
                }
            }
        }

        // Janelas
        g.fillStyle(0x87ceeb);
        g.fillRect(100, 50, 120, 150);
        g.fillRect(580, 50, 120, 150);

        // Molduras das janelas
        g.lineStyle(8, 0x5d4037);
        g.strokeRect(100, 50, 120, 150);
        g.strokeRect(580, 50, 120, 150);

        // Mesas (silhuetas)
        g.fillStyle(0x6d4c41, 0.3);
        g.fillRect(50, 280, 80, 50);
        g.fillRect(200, 300, 100, 40);
        g.fillRect(500, 290, 90, 45);
        g.fillRect(680, 280, 70, 50);

        // Cadeiras
        g.fillStyle(0x5d4037, 0.3);
        g.fillRect(60, 330, 20, 40);
        g.fillRect(100, 330, 20, 40);
        g.fillRect(520, 335, 20, 35);
        g.fillRect(560, 335, 20, 35);

        // Luz ambiente
        g.fillStyle(0xfff8e1, 0.1);
        g.fillCircle(400, 0, 300);

        g.generateTexture('bg-cantina', w, h);
        g.destroy();
    }

    createGardenBg() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 800, h = 450;

        // Ceu
        g.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xb3e5fc, 0xb3e5fc);
        g.fillRect(0, 0, w, h);

        // Nuvens
        g.fillStyle(0xffffff, 0.8);
        this.drawCloud(g, 100, 60, 60);
        this.drawCloud(g, 350, 40, 80);
        this.drawCloud(g, 600, 70, 50);
        this.drawCloud(g, 750, 30, 40);

        // Relva de fundo
        g.fillStyle(0x81c784);
        g.fillRect(0, h - 100, w, 100);

        // Colinas
        g.fillStyle(0x66bb6a);
        g.beginPath();
        g.moveTo(0, h - 80);
        for (let x = 0; x <= w; x += 50) {
            g.lineTo(x, h - 80 - Math.sin(x * 0.02) * 30);
        }
        g.lineTo(w, h);
        g.lineTo(0, h);
        g.closePath();
        g.fillPath();

        // Arvores de fundo
        this.drawTree(g, 80, h - 150, 0.7);
        this.drawTree(g, 250, h - 180, 0.9);
        this.drawTree(g, 450, h - 160, 0.8);
        this.drawTree(g, 650, h - 170, 0.85);
        this.drawTree(g, 750, h - 140, 0.6);

        // Flores
        g.fillStyle(0xffeb3b);
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * w;
            const y = h - 20 - Math.random() * 60;
            g.fillCircle(x, y, 4);
        }

        g.fillStyle(0xe91e63);
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * w;
            const y = h - 20 - Math.random() * 60;
            g.fillCircle(x, y, 3);
        }

        g.generateTexture('bg-garden', w, h);
        g.destroy();
    }

    drawCloud(graphics, x, y, size) {
        graphics.fillCircle(x, y, size * 0.5);
        graphics.fillCircle(x + size * 0.4, y - size * 0.1, size * 0.4);
        graphics.fillCircle(x + size * 0.8, y, size * 0.35);
        graphics.fillCircle(x + size * 0.3, y + size * 0.2, size * 0.3);
    }

    drawTree(graphics, x, y, scale) {
        // Tronco
        graphics.fillStyle(0x795548);
        graphics.fillRect(x - 8 * scale, y, 16 * scale, 60 * scale);

        // Copa
        graphics.fillStyle(0x388e3c);
        graphics.fillCircle(x, y - 20 * scale, 40 * scale);
        graphics.fillCircle(x - 25 * scale, y + 10 * scale, 30 * scale);
        graphics.fillCircle(x + 25 * scale, y + 10 * scale, 30 * scale);
    }

    createRooftopBg() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 800, h = 450;

        // Ceu por-do-sol
        g.fillGradientStyle(0xff7043, 0xff7043, 0x7b1fa2, 0x7b1fa2);
        g.fillRect(0, 0, w, h);

        // Sol
        g.fillStyle(0xffeb3b, 0.8);
        g.fillCircle(650, 100, 60);
        g.fillStyle(0xfff59d, 0.4);
        g.fillCircle(650, 100, 80);

        // Cidade ao fundo (silhuetas)
        g.fillStyle(0x37474f);
        // Predios
        g.fillRect(0, h - 200, 60, 200);
        g.fillRect(70, h - 150, 50, 150);
        g.fillRect(130, h - 220, 70, 220);
        g.fillRect(210, h - 180, 55, 180);
        g.fillRect(280, h - 250, 80, 250);
        g.fillRect(370, h - 160, 60, 160);
        g.fillRect(450, h - 200, 65, 200);
        g.fillRect(530, h - 170, 50, 170);
        g.fillRect(600, h - 230, 70, 230);
        g.fillRect(690, h - 190, 55, 190);
        g.fillRect(760, h - 210, 50, 210);

        // Janelas iluminadas
        g.fillStyle(0xfff59d, 0.7);
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * w;
            const y = h - 50 - Math.random() * 180;
            g.fillRect(x, y, 8, 10);
        }

        // Telhado metalico
        g.fillStyle(0x546e7a);
        g.fillRect(0, h - 50, w, 50);

        // Paineis solares
        g.fillStyle(0x1a237e);
        for (let i = 0; i < 6; i++) {
            g.fillRect(50 + i * 120, h - 45, 80, 35);
            // Reflexo
            g.fillStyle(0x3f51b5, 0.3);
            g.fillRect(55 + i * 120, h - 43, 30, 8);
            g.fillStyle(0x1a237e);
        }

        g.generateTexture('bg-rooftop', w, h);
        g.destroy();
    }

    createISCTESilhouette() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 400, h = 200;

        // Silhueta estilizada dos edificios ISCTE
        g.fillStyle(0x37474f, 0.6);

        // Edificio principal (torre)
        g.fillRect(150, 20, 100, 180);

        // Edificio lateral esquerdo
        g.fillRect(30, 80, 110, 120);

        // Edificio lateral direito
        g.fillRect(260, 60, 120, 140);

        // Detalhes geometricos
        g.fillStyle(0x455a64, 0.4);
        g.fillRect(160, 30, 20, 160);
        g.fillRect(200, 30, 20, 160);

        // Janelas
        g.fillStyle(0x90a4ae, 0.3);
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 4; col++) {
                g.fillRect(155 + col * 22, 35 + row * 20, 15, 12);
            }
        }

        g.generateTexture('silhouette-iscte', w, h);
        g.destroy();
    }

    // ═══════════════════════════════════════════════════════════
    // UI ELEMENTS
    // ═══════════════════════════════════════════════════════════

    generateUI() {
        this.createHeart();
        this.createRecycleIcon();
        this.createButton();
    }

    createHeart() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 24, h = 24;

        g.fillStyle(0xe74c3c);
        // Coracao usando circulos e triangulo
        g.fillCircle(8, 8, 6);
        g.fillCircle(16, 8, 6);
        g.fillTriangle(2, 10, 22, 10, 12, 22);

        // Brilho
        g.fillStyle(0xffffff, 0.3);
        g.fillCircle(7, 6, 2);

        g.generateTexture('ui-heart', w, h);
        g.destroy();
    }

    createRecycleIcon() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 32, h = 32;

        // Circulo de fundo
        g.fillStyle(0x27ae60);
        g.fillCircle(16, 16, 14);

        // Setas de reciclagem (simplificado)
        g.fillStyle(0xffffff);
        // Seta 1
        g.fillTriangle(16, 4, 10, 12, 22, 12);
        // Seta 2
        g.fillTriangle(6, 22, 14, 16, 10, 28);
        // Seta 3
        g.fillTriangle(26, 22, 18, 16, 22, 28);

        g.generateTexture('ui-recycle', w, h);
        g.destroy();
    }

    createButton() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 200, h = 50;

        // Fundo do botao
        g.fillStyle(0x2ecc71);
        g.fillRoundedRect(0, 0, w, h, 10);

        // Borda
        g.lineStyle(3, 0x27ae60);
        g.strokeRoundedRect(0, 0, w, h, 10);

        // Brilho superior
        g.fillStyle(0xffffff, 0.2);
        g.fillRoundedRect(4, 4, w - 8, h / 2 - 4, 8);

        g.generateTexture('ui-button', w, h);
        g.destroy();
    }

    // ═══════════════════════════════════════════════════════════
    // BOSS - DOUTOR PLASTICO
    // ═══════════════════════════════════════════════════════════

    generateBoss() {
        this.createBossIdle();
        this.createBossHit();
    }

    createBossIdle() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 64, h = 80;

        // Corpo do contentor
        g.fillStyle(0x546e7a);
        g.fillRoundedRect(8, 20, 48, 56, 4);

        // Tampa
        g.fillStyle(0x37474f);
        g.fillRect(4, 12, 56, 12);
        g.fillRect(8, 4, 48, 10);

        // Faixa de cor (identificacao)
        g.fillStyle(0x7b1fa2);
        g.fillRect(8, 40, 48, 15);

        // Simbolo de lixo
        g.fillStyle(0x000000, 0.5);
        g.fillRect(24, 44, 16, 8);

        // Olhos maus
        g.fillStyle(0xe74c3c);
        g.fillCircle(22, 30, 8);
        g.fillCircle(42, 30, 8);

        // Pupilas
        g.fillStyle(0x000000);
        g.fillCircle(24, 30, 4);
        g.fillCircle(44, 30, 4);

        // Sobrancelhas raivosas
        g.lineStyle(3, 0x37474f);
        g.moveTo(14, 22);
        g.lineTo(28, 26);
        g.moveTo(50, 22);
        g.lineTo(36, 26);
        g.strokePath();

        // Boca com dentes
        g.fillStyle(0x000000);
        g.fillRect(20, 58, 24, 10);
        g.fillStyle(0xffffff);
        // Dentes
        for (let i = 0; i < 4; i++) {
            g.fillRect(22 + i * 6, 58, 4, 5);
        }

        // Bracos
        g.fillStyle(0x455a64);
        g.fillRect(0, 35, 10, 25);
        g.fillRect(54, 35, 10, 25);

        // Maos/garras
        g.fillStyle(0x37474f);
        g.fillRect(-2, 55, 14, 8);
        g.fillRect(52, 55, 14, 8);

        g.generateTexture('boss-idle', w, h);
        g.destroy();
    }

    createBossHit() {
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        const w = 64, h = 80;

        // Corpo do contentor (vermelho = dano)
        g.fillStyle(0xc62828);
        g.fillRoundedRect(8, 20, 48, 56, 4);

        // Tampa
        g.fillStyle(0xb71c1c);
        g.fillRect(4, 12, 56, 12);
        g.fillRect(8, 4, 48, 10);

        // Faixa
        g.fillStyle(0x880e4f);
        g.fillRect(8, 40, 48, 15);

        // Olhos (fechados de dor)
        g.lineStyle(4, 0xffffff);
        g.moveTo(16, 30);
        g.lineTo(28, 30);
        g.moveTo(36, 30);
        g.lineTo(48, 30);
        g.strokePath();

        // Boca (gritando)
        g.fillStyle(0x000000);
        g.fillCircle(32, 62, 8);

        // Bracos (levantados)
        g.fillStyle(0xb71c1c);
        g.fillRect(0, 25, 10, 25);
        g.fillRect(54, 25, 10, 25);

        // Estrelas de dano
        g.fillStyle(0xffeb3b);
        this.drawStar(g, 56, 10, 4, 6, 3);
        this.drawStar(g, 8, 8, 4, 5, 2.5);

        g.generateTexture('boss-hit', w, h);
        g.destroy();
    }

    // ═══════════════════════════════════════════════════════════
    // PARTICULAS
    // ═══════════════════════════════════════════════════════════

    generateParticles() {
        // Particula generica (para confetti e efeitos)
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });

        g.fillStyle(0xffffff);
        g.fillRect(0, 0, 8, 8);

        g.generateTexture('particle', 8, 8);
        g.destroy();

        // Particula de folha
        const leaf = this.scene.make.graphics({ x: 0, y: 0, add: false });
        leaf.fillStyle(0x27ae60);
        leaf.fillEllipse(8, 8, 12, 8);
        leaf.generateTexture('particle-leaf', 16, 16);
        leaf.destroy();

        // Particula de poeira
        const dust = this.scene.make.graphics({ x: 0, y: 0, add: false });
        dust.fillStyle(0xbcaaa4);
        dust.fillCircle(4, 4, 4);
        dust.generateTexture('particle-dust', 8, 8);
        dust.destroy();
    }
}
