/**
 * HUD - Heads Up Display
 * Mostra vidas, pontuacao, nivel e combo
 */

import gameState from '../managers/GameState.js';

export default class HUD {
    constructor(scene) {
        this.scene = scene;

        // Containers para elementos
        this.hearts = [];
        this.elements = {};

        // Sistema anti-sobreposicao de mensagens
        this.currentMotivationalText = null;
        this.isShowingMotivational = false;

        // Criar HUD
        this.create();
    }

    create() {
        const width = this.scene.cameras.main.width;

        // Fundo semi-transparente no topo
        this.elements.bg = this.scene.add.rectangle(width / 2, 25, width, 50, 0x000000, 0.3);
        this.elements.bg.setScrollFactor(0);
        this.elements.bg.setDepth(100);

        // Criar coracoes (vidas) - esquerda
        this.createHearts();

        // Texto de nivel - centro
        this.elements.levelText = this.scene.add.text(width / 2, 25, 'Nivel 1', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.elements.levelText.setOrigin(0.5);
        this.elements.levelText.setScrollFactor(0);
        this.elements.levelText.setDepth(101);

        // Pontuacao - direita
        this.createScoreDisplay(width);

        // Combo indicator (escondido por defeito)
        this.createComboDisplay(width);

        // Contador de itens
        this.createItemsCounter(width);
    }

    createHearts() {
        const startX = 20;
        const y = 25;

        for (let i = 0; i < 3; i++) {
            let heart;

            // Usar textura se existir, senao usar emoji
            if (this.scene.textures.exists('ui-heart')) {
                heart = this.scene.add.image(startX + i * 30, y, 'ui-heart');
                heart.setScale(1);
            } else {
                heart = this.scene.add.text(startX + i * 30, y, '❤️', {
                    fontSize: '20px'
                });
                heart.setOrigin(0.5);
            }

            heart.setScrollFactor(0);
            heart.setDepth(101);
            this.hearts.push(heart);
        }
    }

    createScoreDisplay(width) {
        // Icone de reciclagem
        if (this.scene.textures.exists('ui-recycle')) {
            this.elements.recycleIcon = this.scene.add.image(width - 120, 25, 'ui-recycle');
            this.elements.recycleIcon.setScale(0.8);
        } else {
            this.elements.recycleIcon = this.scene.add.text(width - 120, 25, '♻️', {
                fontSize: '20px'
            });
            this.elements.recycleIcon.setOrigin(0.5);
        }
        this.elements.recycleIcon.setScrollFactor(0);
        this.elements.recycleIcon.setDepth(101);

        // Texto de pontuacao
        this.elements.scoreText = this.scene.add.text(width - 60, 25, '0', {
            fontSize: '20px',
            fontFamily: 'Arial Black, Arial',
            color: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.elements.scoreText.setOrigin(0.5);
        this.elements.scoreText.setScrollFactor(0);
        this.elements.scoreText.setDepth(101);
    }

    createComboDisplay(width) {
        this.elements.comboText = this.scene.add.text(width / 2, 55, '', {
            fontSize: '16px',
            fontFamily: 'Arial Black, Arial',
            color: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.elements.comboText.setOrigin(0.5);
        this.elements.comboText.setScrollFactor(0);
        this.elements.comboText.setDepth(101);
        this.elements.comboText.setVisible(false);
    }

    createItemsCounter(width) {
        this.elements.itemsText = this.scene.add.text(width / 2, 45, '0/0 itens', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#bdc3c7'
        });
        this.elements.itemsText.setOrigin(0.5);
        this.elements.itemsText.setScrollFactor(0);
        this.elements.itemsText.setDepth(101);
    }

    /**
     * Atualizar HUD com dados do GameState
     */
    update() {
        const data = gameState.getHUDData();

        // Atualizar vidas
        this.updateHearts(data.lives);

        // Atualizar nivel
        this.elements.levelText.setText(`Nivel ${data.level}`);

        // Atualizar pontuacao
        this.elements.scoreText.setText(data.score.toString());

        // Atualizar combo
        this.updateCombo(data.combo, data.multiplier);

        // Atualizar itens
        this.elements.itemsText.setText(`${data.items} itens`);
    }

    updateHearts(lives) {
        this.hearts.forEach((heart, index) => {
            if (index < lives) {
                heart.setAlpha(1);
                if (heart.setTint) heart.clearTint();
            } else {
                heart.setAlpha(0.3);
                if (heart.setTint) heart.setTint(0x333333);
            }
        });
    }

    updateCombo(combo, multiplier) {
        if (combo >= 3) {
            this.elements.comboText.setText(`COMBO x${multiplier}!`);
            this.elements.comboText.setVisible(true);

            // Cor baseada no multiplicador
            if (multiplier >= 3) {
                this.elements.comboText.setColor('#e74c3c');
            } else {
                this.elements.comboText.setColor('#f1c40f');
            }
        } else {
            this.elements.comboText.setVisible(false);
        }
    }

    /**
     * Animacao quando ganha pontos
     */
    animateScore() {
        this.scene.tweens.add({
            targets: this.elements.scoreText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true
        });
    }

    /**
     * Animacao quando perde vida
     */
    animateLifeLost(lifeIndex) {
        if (this.hearts[lifeIndex]) {
            this.scene.tweens.add({
                targets: this.hearts[lifeIndex],
                scaleX: 1.5,
                scaleY: 1.5,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    this.hearts[lifeIndex].setScale(1);
                }
            });
        }
    }

    /**
     * Mostrar texto flutuante de pontos
     */
    showFloatingText(text, x, y, color = '#2ecc71') {
        const floatText = this.scene.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial Black, Arial',
            color: color,
            stroke: '#000000',
            strokeThickness: 2
        });
        floatText.setOrigin(0.5);
        floatText.setDepth(200);

        // Tempo aumentado: ficar visivel por 1.5s antes de desaparecer
        this.scene.time.delayedCall(1500, () => {
            if (!floatText || !floatText.active) return;
            this.scene.tweens.add({
                targets: floatText,
                y: y - 50,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => floatText.destroy()
            });
        });
    }

    /**
     * Mostrar mensagem motivacional (com sistema anti-sobreposicao)
     */
    showMotivationalMessage() {
        // Ignorar se ja esta a mostrar uma mensagem
        if (this.isShowingMotivational) return;
        this.isShowingMotivational = true;

        // Destruir mensagem anterior se existir
        if (this.currentMotivationalText && this.currentMotivationalText.active) {
            this.currentMotivationalText.destroy();
        }

        const messages = [
            'Boa Carla! 🌱',
            'O planeta agradece!',
            'Reciclagem e vida!',
            'ISCTE mais verde!',
            'Eco-power! ♻️',
            'Fantastico!',
            'Continua assim!'
        ];

        const msg = Phaser.Utils.Array.GetRandom(messages);
        const width = this.scene.cameras.main.width;

        this.currentMotivationalText = this.scene.add.text(width / 2, 120, msg, {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.currentMotivationalText.setOrigin(0.5);
        this.currentMotivationalText.setScrollFactor(0);
        this.currentMotivationalText.setDepth(200);

        // Ficar visivel por 4 segundos antes de comecar a desaparecer (aumentado de 2s)
        this.scene.time.delayedCall(4000, () => {
            if (!this.currentMotivationalText || !this.currentMotivationalText.active) {
                this.isShowingMotivational = false;
                return;
            }

            this.scene.tweens.add({
                targets: this.currentMotivationalText,
                y: 100,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => {
                    if (this.currentMotivationalText) {
                        this.currentMotivationalText.destroy();
                        this.currentMotivationalText = null;
                    }
                    this.isShowingMotivational = false;
                }
            });
        });
    }

    /**
     * Esconder elementos que conflitam com o UI do boss (Level 3)
     */
    hideBossConflicts() {
        // Esconder levelText e itemsText no boss fight
        this.elements.levelText.setVisible(false);
        this.elements.itemsText.setVisible(false);
        // Mover combo para mais baixo para nao sobrepor a barra do boss
        this.elements.comboText.setY(50);
    }

    /**
     * Destruir HUD
     */
    destroy() {
        this.hearts.forEach(h => h.destroy());
        Object.values(this.elements).forEach(e => e.destroy());
    }
}
