/**
 * TouchControls - Controlos virtuais para dispositivos touch
 * Botoes semi-transparentes para mover e saltar
 */

export default class TouchControls {
    constructor(scene) {
        this.scene = scene;

        // Estado dos controlos
        this.isLeftPressed = false;
        this.isRightPressed = false;
        this.isJumpPressed = false;

        // Configuracoes dos botoes
        this.buttonSize = 60;
        this.buttonAlpha = 0.5;
        this.buttonAlphaPressed = 0.8;
        this.padding = 20;

        // Grupo para conter todos os elementos UI
        this.container = null;
        this.buttons = {};

        // Verificar se e dispositivo touch
        this.isTouchDevice = this.checkTouchDevice();

        // Criar controlos apenas em dispositivos touch
        if (this.isTouchDevice) {
            this.create();
        }
    }

    /**
     * Verifica se o dispositivo suporta touch
     */
    checkTouchDevice() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        );
    }

    /**
     * Criar os botoes de controlo
     */
    create() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Posicoes dos botoes
        const bottomY = height - this.padding - this.buttonSize / 2;
        const leftX = this.padding + this.buttonSize / 2;
        const rightX = leftX + this.buttonSize + 15;
        const jumpX = width - this.padding - this.buttonSize / 2;

        // Criar botao ESQUERDA
        this.buttons.left = this.createButton(
            leftX,
            bottomY,
            '<',
            () => { this.isLeftPressed = true; },
            () => { this.isLeftPressed = false; }
        );

        // Criar botao DIREITA
        this.buttons.right = this.createButton(
            rightX,
            bottomY,
            '>',
            () => { this.isRightPressed = true; },
            () => { this.isRightPressed = false; }
        );

        // Criar botao SALTAR
        this.buttons.jump = this.createButton(
            jumpX,
            bottomY,
            '^',
            () => { this.isJumpPressed = true; },
            () => { this.isJumpPressed = false; }
        );

        // Fazer os controlos acompanharem a camera (fixed to camera)
        this.setScrollFactor(0);

        // Definir depth alto para ficar sempre visivel
        this.setDepth(1000);
    }

    /**
     * Criar um botao individual
     */
    createButton(x, y, label, onDown, onUp) {
        // Fundo do botao (circulo)
        const bg = this.scene.add.circle(x, y, this.buttonSize / 2, 0x2ecc71, this.buttonAlpha);
        bg.setStrokeStyle(3, 0x27ae60, this.buttonAlpha + 0.2);
        bg.setInteractive();

        // Texto/simbolo do botao
        const text = this.scene.add.text(x, y, label, {
            fontSize: '28px',
            fontFamily: 'Arial Black, Arial',
            color: '#ffffff'
        });
        text.setOrigin(0.5);
        text.setAlpha(this.buttonAlpha + 0.3);

        // Eventos de toque
        bg.on('pointerdown', () => {
            bg.setFillStyle(0x27ae60, this.buttonAlphaPressed);
            bg.setScale(0.95);
            text.setScale(0.95);
            onDown();
        });

        bg.on('pointerup', () => {
            bg.setFillStyle(0x2ecc71, this.buttonAlpha);
            bg.setScale(1);
            text.setScale(1);
            onUp();
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x2ecc71, this.buttonAlpha);
            bg.setScale(1);
            text.setScale(1);
            onUp();
        });

        return { bg, text };
    }

    /**
     * Definir scroll factor para todos os botoes
     */
    setScrollFactor(factor) {
        Object.values(this.buttons).forEach(button => {
            button.bg.setScrollFactor(factor);
            button.text.setScrollFactor(factor);
        });
    }

    /**
     * Definir depth para todos os botoes
     */
    setDepth(depth) {
        Object.values(this.buttons).forEach(button => {
            button.bg.setDepth(depth);
            button.text.setDepth(depth + 1);
        });
    }

    /**
     * Mostrar ou esconder controlos
     */
    setVisible(visible) {
        Object.values(this.buttons).forEach(button => {
            button.bg.setVisible(visible);
            button.text.setVisible(visible);
        });
    }

    /**
     * Obter estado dos controlos (compativel com cursors do Phaser)
     * Permite usar touch e teclado em paralelo
     */
    getState(cursors) {
        return {
            left: { isDown: this.isLeftPressed || (cursors && cursors.left.isDown) },
            right: { isDown: this.isRightPressed || (cursors && cursors.right.isDown) },
            up: { isDown: this.isJumpPressed || (cursors && cursors.up.isDown) },
            space: { isDown: this.isJumpPressed || (cursors && cursors.space.isDown) }
        };
    }

    /**
     * Verificar se dispositivo e touch
     */
    isTouch() {
        return this.isTouchDevice;
    }

    /**
     * Destruir controlos
     */
    destroy() {
        Object.values(this.buttons).forEach(button => {
            button.bg.destroy();
            button.text.destroy();
        });
        this.buttons = {};
    }

    /**
     * Reposicionar botoes (util para resize)
     */
    resize() {
        if (!this.isTouchDevice) return;

        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        const bottomY = height - this.padding - this.buttonSize / 2;
        const leftX = this.padding + this.buttonSize / 2;
        const rightX = leftX + this.buttonSize + 15;
        const jumpX = width - this.padding - this.buttonSize / 2;

        if (this.buttons.left) {
            this.buttons.left.bg.setPosition(leftX, bottomY);
            this.buttons.left.text.setPosition(leftX, bottomY);
        }

        if (this.buttons.right) {
            this.buttons.right.bg.setPosition(rightX, bottomY);
            this.buttons.right.text.setPosition(rightX, bottomY);
        }

        if (this.buttons.jump) {
            this.buttons.jump.bg.setPosition(jumpX, bottomY);
            this.buttons.jump.text.setPosition(jumpX, bottomY);
        }
    }
}
