/**
 * Player - Classe do jogador EcoHero
 * Suporta controlos de teclado E touch em paralelo
 */

import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'hero-idle');

        // Adicionar ao jogo
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Referencia a cena
        this.scene = scene;

        // Propriedades de movimento
        this.speed = 200;
        this.jumpForce = -380;

        // Estado do jogador
        this.isJumping = false;
        this.isInvincible = false;
        this.canDoubleJump = false;
        this.facingRight = true;

        // Configurar fisica
        this.setupPhysics();

        // Configurar animacoes
        this.setupAnimations();
    }

    setupPhysics() {
        // Bounce leve
        this.setBounce(0.1);

        // Nao sair dos limites do ecra
        this.setCollideWorldBounds(true);

        // Hitbox mais pequena que sprite (para colisoes mais justas)
        this.body.setSize(20, 40);
        this.body.setOffset(6, 8);

        // Gravidade personalizada (opcional)
        // this.body.setGravityY(100);

        // Drag para movimento mais suave
        this.setDragX(800);
    }

    setupAnimations() {
        // As animacoes sao criadas no BootScene
        // Aqui apenas definimos a animacao inicial
        if (this.scene.anims.exists('hero-idle-anim')) {
            this.play('hero-idle-anim');
        }
    }

    /**
     * Atualiza o jogador - chamado a cada frame
     * @param {Object} controls - Estado dos controlos (touch + teclado combinados)
     */
    update(controls) {
        if (!controls) return;

        // Verificar se esta no chao
        const onGround = this.body.blocked.down || this.body.touching.down;

        // Resetar salto quando toca no chao
        if (onGround && this.isJumping) {
            this.isJumping = false;
        }

        // Movimento horizontal
        this.handleMovement(controls, onGround);

        // Salto
        this.handleJump(controls, onGround);

        // Atualizar animacoes
        this.updateAnimations(onGround);
    }

    handleMovement(controls, onGround) {
        // Mover para a esquerda
        if (controls.left.isDown) {
            this.setVelocityX(-this.speed);
            this.facingRight = false;
            this.setFlipX(true);
        }
        // Mover para a direita
        else if (controls.right.isDown) {
            this.setVelocityX(this.speed);
            this.facingRight = true;
            this.setFlipX(false);
        }
        // Parar (com drag suave)
        else {
            // O drag cuida da desaceleracao
        }
    }

    handleJump(controls, onGround) {
        // Saltar apenas se no chao e tecla premida
        const jumpPressed = controls.up.isDown || controls.space.isDown;

        if (jumpPressed && onGround && !this.isJumping) {
            this.setVelocityY(this.jumpForce);
            this.isJumping = true;

            // Efeito de particulas ao saltar
            this.emitJumpParticles();
        }

        // Double jump (se ativado por power-up)
        if (jumpPressed && !onGround && this.canDoubleJump && this.body.velocity.y > 0) {
            this.setVelocityY(this.jumpForce * 0.8);
            this.canDoubleJump = false;
            this.emitJumpParticles();
        }
    }

    updateAnimations(onGround) {
        // No ar
        if (!onGround) {
            if (this.scene.anims.exists('hero-jump-anim')) {
                this.play('hero-jump-anim', true);
            }
        }
        // A andar
        else if (Math.abs(this.body.velocity.x) > 10) {
            if (this.scene.anims.exists('hero-walk-anim')) {
                this.play('hero-walk-anim', true);
            }
        }
        // Parado
        else {
            if (this.scene.anims.exists('hero-idle-anim')) {
                this.play('hero-idle-anim', true);
            }
        }
    }

    /**
     * Jogador apanha um item
     */
    collect(item) {
        // Efeito visual
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });
    }

    /**
     * Jogador leva dano
     */
    hit() {
        // Ignorar se invencivel
        if (this.isInvincible) return false;

        // Ativar invencibilidade
        this.isInvincible = true;

        // Efeito de knockback
        const knockbackDir = this.facingRight ? -1 : 1;
        this.setVelocityX(knockbackDir * 150);
        this.setVelocityY(-200);

        // Efeito de piscar
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 8,
            onComplete: () => {
                this.isInvincible = false;
                this.alpha = 1;
            }
        });

        // Camera shake
        this.scene.cameras.main.shake(200, 0.01);

        // Tint vermelho momentaneo
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });

        return true; // Dano aplicado
    }

    /**
     * Jogador morre
     */
    die() {
        // Desativar fisica
        this.body.enable = false;

        // Animacao de morte
        this.scene.tweens.add({
            targets: this,
            y: this.y - 50,
            alpha: 0,
            angle: 360,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    /**
     * Emitir particulas ao saltar
     */
    emitJumpParticles() {
        // Criar algumas particulas de poeira
        if (this.scene.textures.exists('particle-dust')) {
            for (let i = 0; i < 5; i++) {
                const particle = this.scene.add.image(
                    this.x + Phaser.Math.Between(-10, 10),
                    this.y + 20,
                    'particle-dust'
                );
                particle.setAlpha(0.6);
                particle.setScale(0.5);

                this.scene.tweens.add({
                    targets: particle,
                    y: particle.y + 20,
                    alpha: 0,
                    scale: 0,
                    duration: 300,
                    onComplete: () => particle.destroy()
                });
            }
        }
    }

    /**
     * Ativar power-up de double jump
     */
    enableDoubleJump() {
        this.canDoubleJump = true;

        // Efeito visual
        this.setTint(0x00ff00);
        this.scene.time.delayedCall(200, () => {
            this.clearTint();
        });
    }

    /**
     * Resetar estado do jogador
     */
    reset(x, y) {
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.isJumping = false;
        this.isInvincible = false;
        this.alpha = 1;
        this.body.enable = true;
        this.clearTint();
    }
}
