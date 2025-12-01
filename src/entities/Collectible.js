/**
 * Collectible - Classe base para itens coletaveis
 * Garrafas, latas, pilhas, papel, estrelas
 */

import Phaser from 'phaser';

export default class Collectible extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'bottle') {
        // Mapear tipo para textura
        const textureMap = {
            'bottle': 'item-bottle',
            'can': 'item-can',
            'battery': 'item-battery',
            'paper': 'item-paper',
            'star': 'item-star'
        };

        const texture = textureMap[type] || 'item-bottle';
        super(scene, x, y, texture);

        // Adicionar ao jogo
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Propriedades do item
        this.type = type;
        this.points = this.getPointsForType(type);
        this.collected = false;

        // Configurar fisica
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        // Hitbox
        this.body.setSize(24, 24);
        this.body.setOffset(4, 4);

        // Animacao de flutuacao
        this.startFloatAnimation();

        // Brilho/piscar
        this.startGlowAnimation();
    }

    getPointsForType(type) {
        const pointsMap = {
            'bottle': 10,
            'can': 15,
            'paper': 10,
            'battery': 25,
            'star': 50
        };
        return pointsMap[type] || 10;
    }

    startFloatAnimation() {
        // Movimento sinusoidal suave
        this.scene.tweens.add({
            targets: this,
            y: this.y - 8,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    startGlowAnimation() {
        // Piscar suave para chamar atencao
        this.scene.tweens.add({
            targets: this,
            alpha: 0.7,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Rotacao leve para estrelas
        if (this.type === 'star') {
            this.scene.tweens.add({
                targets: this,
                angle: 15,
                duration: 800,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }

    /**
     * Coletar o item - chamado quando jogador toca
     */
    collect() {
        if (this.collected) return null;
        this.collected = true;

        // Parar animacoes
        this.scene.tweens.killTweensOf(this);

        // Animacao de coleta
        this.scene.tweens.add({
            targets: this,
            y: this.y - 30,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });

        // Criar particulas
        this.emitCollectParticles();

        return this.points;
    }

    emitCollectParticles() {
        // Particulas coloridas baseadas no tipo
        const colors = {
            'bottle': 0x3498db,
            'can': 0xbdc3c7,
            'battery': 0xe74c3c,
            'paper': 0xecf0f1,
            'star': 0xf1c40f
        };

        const color = colors[this.type] || 0x2ecc71;

        // Criar particulas simples
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = this.scene.add.circle(
                this.x,
                this.y,
                4,
                color
            );

            this.scene.tweens.add({
                targets: particle,
                x: this.x + Math.cos(angle) * 40,
                y: this.y + Math.sin(angle) * 40,
                alpha: 0,
                scale: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }
}
