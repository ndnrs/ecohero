/**
 * IntroScene - Cena de historia introdutoria
 * Conta a historia do vilao Ricardo Gois vs a heroina Carla Farelo
 */

import Phaser from 'phaser';
import audioManager from '../managers/AudioManager.js';

export default class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fundo escuro
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        // Indice do slide atual
        this.currentSlide = 0;

        // Definir todos os slides da historia
        this.slides = this.createStorySlides();

        // Container para elementos do slide atual
        this.slideContainer = this.add.container(0, 0);

        // Mostrar primeiro slide
        this.showSlide(0);

        // Input para avancar
        this.input.on('pointerdown', () => this.nextSlide());
        this.input.keyboard.on('keydown-SPACE', () => this.nextSlide());
        this.input.keyboard.on('keydown-ENTER', () => this.nextSlide());

        // Texto de instrucao
        this.skipText = this.add.text(width - 20, height - 20, 'Clica ou ESPAÇO para continuar...', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#7f8c8d'
        }).setOrigin(1, 1);

        // Piscar o texto
        this.tweens.add({
            targets: this.skipText,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Fade in
        this.cameras.main.fadeIn(500);
    }

    createStorySlides() {
        return [
            // Slide 1: Introducao
            {
                background: 0x2c3e50,
                backgroundImage: 'iscte-photo',
                title: 'Campus do ISCTE...',
                subtitle: 'Um dia aparentemente normal numa tarde de sol...',
                character: null,
                dialogues: []
            },

            // Slide 2: O Vilao aparece
            {
                background: 0x4a0000,
                title: null,
                subtitle: null,
                character: 'ricardo',
                characterName: 'SOTOR',
                characterEmoji: '🦹',
                characterTitle: 'O Vilao das 6 Camadas de roupa',
                dialogues: [
                    'HAHAHAHA! Finalmente chegou o meu momento!',
                    'Vou destruir TODOS os ares condicionados do ISCTE! AHAHAH'
                ]
            },

            // Slide 3: Plano malvado
            {
                background: 0x4a0000,
                title: null,
                subtitle: null,
                character: 'ricardo',
                characterName: 'SOTOR',
                characterEmoji: '🦹',
                characterTitle: null,
                photoVersion: 2,
                dialogues: [
                    'Desliga o AC! Ja estou com farfalheira! (a fazer os movimentos com as maos no peito)',
                    'Preciso das papas de linhaca para ter energia...'
                ]
            },

            // Slide 4: Mais vilania
            {
                background: 0x4a0000,
                title: null,
                subtitle: null,
                character: 'ricardo',
                characterName: 'SOTOR',
                characterEmoji: '🦹',
                characterTitle: null,
                photoVersion: 2,
                dialogues: [
                    'Odeio correntes de ar!',
                    'Este campus vai ARDER de calor! MUUAHAHA!'
                ]
            },

            // Slide 5: A heroina descobre
            {
                background: 0x1a5c1a,
                title: 'Entretanto, na sala da Sustentabilidade...',
                subtitle: null,
                character: 'carla',
                characterName: 'CARLA FARELO',
                characterEmoji: '🦸‍♀️',
                characterTitle: '♻️ Coordenadora da Sustentabilidade',
                dialogues: [
                    'O QUÊ?! O Sotor quer destruir os ACs?!',
                    'Isto não pode acontecer! Está na HORA da ECO-HERO entrar em ação'
                ]
            },

            // Slide 6: Transformacao
            {
                background: 0x27ae60,
                title: '⚡ TRANSFORMAÇÃO ⚡',
                subtitle: null,
                character: 'carla',
                characterName: 'ECO-HERO CARLA',
                characterEmoji: '🦸‍♀️',
                characterTitle: '🦸‍♀️ Super-Heroína da Sustentabilidade',
                photoVersion: 2,
                dialogues: [
                    'Está na hora de vestir o meu fato!',
                    'Pelo poder da sustentabilidade... TRANSFORMAAAAAR!'
                ],
                showHeroSuit: true
            },

            // Slide 7: Poderes e ameacas
            {
                background: 0x27ae60,
                title: null,
                subtitle: null,
                character: 'carla',
                characterName: 'ECO-HERO CARLA',
                characterEmoji: '🦸‍♀️',
                characterTitle: null,
                photoVersion: 2,
                dialogues: [
                    'Vou arrancar-te essa camisola para te constipares!',
                    'Vais ficar sem o teu umidificador!'
                ]
            },

            // Slide 8: Inicio da missao
            {
                background: 0x16a085,
                title: '🌬️ COM O PODER DO VENTO FRIO 🌬️',
                subtitle: 'Super-heroina da Sustentabilidade parte para a missão!',
                character: 'carla',
                characterName: null,
                characterEmoji: '🦸‍♀️',
                characterTitle: null,
                photoVersion: 2,
                dialogues: [],
                showPlayButton: true
            }
        ];
    }

    showSlide(index) {
        // Limpar slide anterior
        this.slideContainer.removeAll(true);

        const slide = this.slides[index];
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fundo do slide
        const bg = this.add.rectangle(width / 2, height / 2, width, height, slide.background);
        this.slideContainer.add(bg);

        // Imagem de fundo se existir
        if (slide.backgroundImage && this.textures.exists(slide.backgroundImage)) {
            const bgImage = this.add.image(width / 2, height / 2, slide.backgroundImage);
            // Ajustar para cobrir o ecra mantendo proporcao
            const scaleX = width / bgImage.width;
            const scaleY = height / bgImage.height;
            const scale = Math.max(scaleX, scaleY);
            bgImage.setScale(scale);
            bgImage.setAlpha(0.4); // Semi-transparente para o texto ser legivel
            this.slideContainer.add(bgImage);
        }

        // Titulo se existir
        if (slide.title) {
            const title = this.add.text(width / 2, 50, slide.title, {
                fontSize: '28px',
                fontFamily: 'Arial Black',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);
            this.slideContainer.add(title);

            // Animacao do titulo
            title.setScale(0);
            this.tweens.add({
                targets: title,
                scale: 1,
                duration: 400,
                ease: 'Back.easeOut'
            });
        }

        // Subtitulo se existir
        if (slide.subtitle) {
            const subtitle = this.add.text(width / 2, 90, slide.subtitle, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ecf0f1',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            this.slideContainer.add(subtitle);
        }

        // Personagem com foto
        if (slide.character) {
            this.showCharacter(slide);
        }

        // Dialogos
        if (slide.dialogues && slide.dialogues.length > 0) {
            this.showDialogues(slide);
        }

        // Botao de jogar no ultimo slide
        if (slide.showPlayButton) {
            this.showPlayButton();
        }

        // Indicador de slide
        this.showSlideIndicator(index);
    }

    showCharacter(slide) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const isVillain = slide.character === 'ricardo';

        // Posicao do personagem
        const charX = isVillain ? 150 : width - 150;
        const charY = height / 2 - 20;

        // Tamanhos da moldura e foto (maiores para vilao)
        const frameSize = isVillain ? 180 : 140;
        const maxSize = isVillain ? 170 : 130;

        // Moldura colorida
        const frameColor = isVillain ? 0xe74c3c : 0x2ecc71;
        const frame = this.add.rectangle(charX, charY, frameSize, frameSize, frameColor);
        frame.setStrokeStyle(4, isVillain ? 0xc0392b : 0x27ae60);
        this.slideContainer.add(frame);

        // Tentar usar foto real, senao usar placeholder
        // Usa foto 2 para slides com photoVersion: 2 (apos transformacao)
        const photoSuffix = slide.photoVersion === 2 ? '-2' : '';
        const photoKey = isVillain ? `ricardo-photo${photoSuffix}` : `carla-photo${photoSuffix}`;

        if (this.textures.exists(photoKey)) {
            const photo = this.add.image(charX, charY, photoKey);
            // Ajustar escala para caber na moldura
            const scale = Math.min(maxSize / photo.width, maxSize / photo.height);
            photo.setScale(scale);
            this.slideContainer.add(photo);
        } else {
            // Placeholder com inicial
            const initial = isVillain ? 'R' : 'C';
            const placeholder = this.add.text(charX, charY, initial, {
                fontSize: '64px',
                fontFamily: 'Arial Black',
                color: '#ffffff'
            }).setOrigin(0.5);
            this.slideContainer.add(placeholder);
        }

        // Offset para posicoes do nome e titulo (maior para vilao por causa da moldura maior)
        const nameOffset = isVillain ? 110 : 90;
        const titleOffset = isVillain ? 132 : 112;
        const emojiOffset = isVillain ? -120 : -100;

        // Emoji grande do personagem (acima do nome)
        if (slide.characterEmoji) {
            const emoji = this.add.text(charX, charY + emojiOffset, slide.characterEmoji, {
                fontSize: '64px'
            }).setOrigin(0.5);
            this.slideContainer.add(emoji);

            // Animacao bounce
            this.tweens.add({
                targets: emoji,
                y: charY + emojiOffset - 10,
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Nome do personagem
        if (slide.characterName) {
            const nameColor = isVillain ? '#e74c3c' : '#2ecc71';
            const name = this.add.text(charX, charY + nameOffset, slide.characterName, {
                fontSize: '16px',
                fontFamily: 'Arial Black',
                color: nameColor,
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            this.slideContainer.add(name);
        }

        // Titulo do personagem
        if (slide.characterTitle) {
            const title = this.add.text(charX, charY + titleOffset, slide.characterTitle, {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#bdc3c7'
            }).setOrigin(0.5);
            this.slideContainer.add(title);
        }

        // Efeito de entrada
        frame.setScale(0);
        this.tweens.add({
            targets: frame,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        // Fato de super-heroina
        if (slide.showHeroSuit) {
            this.showHeroSuit(charX, charY + 160);
        }
    }

    showHeroSuit(x, y) {
        // Desenhar fato tipo Superman mas verde (simplificado)
        const suit = this.add.container(x, y);

        // Corpo do fato
        const body = this.add.rectangle(0, 0, 50, 60, 0x27ae60);
        body.setStrokeStyle(2, 0x1e8449);
        suit.add(body);

        // Simbolo de reciclagem no peito (icone ecologico)
        const recycleIcon = this.add.text(0, 0, '♻️', {
            fontSize: '32px'
        }).setOrigin(0.5);
        suit.add(recycleIcon);

        this.slideContainer.add(suit);

        // Animacao de brilho
        this.tweens.add({
            targets: recycleIcon,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    showDialogues(slide) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const isVillain = slide.character === 'ricardo';

        // Posicao dos baloes (lado oposto ao personagem)
        const bubbleX = isVillain ? width / 2 + 100 : width / 2 - 100;
        let bubbleY = height / 2 - 60;

        slide.dialogues.forEach((text, index) => {
            const y = bubbleY + (index * 80);

            // Balao de fala
            const bubbleWidth = 350;
            const bubbleHeight = 60;
            const bubbleColor = isVillain ? 0x2c2c2c : 0xffffff;

            const bubble = this.add.rectangle(bubbleX, y, bubbleWidth, bubbleHeight, bubbleColor);
            bubble.setStrokeStyle(3, isVillain ? 0xe74c3c : 0x2ecc71);

            // Seta do balao
            const arrowX = isVillain ? bubbleX - bubbleWidth / 2 - 10 : bubbleX + bubbleWidth / 2 + 10;
            const arrow = this.add.triangle(
                arrowX, y,
                0, 0,
                isVillain ? 20 : -20, -10,
                isVillain ? 20 : -20, 10,
                bubbleColor
            );

            // Texto do dialogo
            const textColor = isVillain ? '#ffffff' : '#2c3e50';
            const dialogue = this.add.text(bubbleX, y, text, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: textColor,
                fontStyle: 'bold',
                wordWrap: { width: bubbleWidth - 30 },
                align: 'center'
            }).setOrigin(0.5);

            this.slideContainer.add(bubble);
            this.slideContainer.add(arrow);
            this.slideContainer.add(dialogue);

            // Animacao de entrada
            bubble.setScale(0);
            arrow.setScale(0);
            dialogue.setAlpha(0);

            this.tweens.add({
                targets: [bubble, arrow],
                scale: 1,
                duration: 300,
                delay: index * 400,
                ease: 'Back.easeOut'
            });

            this.tweens.add({
                targets: dialogue,
                alpha: 1,
                duration: 200,
                delay: index * 400 + 200
            });
        });
    }

    showPlayButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Botao grande de jogar
        const buttonY = height - 80;

        const buttonBg = this.add.rectangle(width / 2, buttonY, 200, 50, 0x27ae60);
        buttonBg.setStrokeStyle(3, 0x1e8449);
        buttonBg.setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(width / 2, buttonY, '🎮 JOGAR!', {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.slideContainer.add(buttonBg);
        this.slideContainer.add(buttonText);

        // Hover effects
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x2ecc71);
            buttonBg.setScale(1.05);
            buttonText.setScale(1.05);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x27ae60);
            buttonBg.setScale(1);
            buttonText.setScale(1);
        });

        buttonBg.on('pointerdown', () => {
            this.startGame();
        });

        // Animacao pulsante
        this.tweens.add({
            targets: [buttonBg, buttonText],
            scale: 1.05,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        // Esconder texto de "clica para continuar"
        this.skipText.setVisible(false);
    }

    showSlideIndicator(currentIndex) {
        const width = this.cameras.main.width;
        const totalSlides = this.slides.length;
        const dotSize = 8;
        const spacing = 20;
        const startX = width / 2 - ((totalSlides - 1) * spacing) / 2;

        for (let i = 0; i < totalSlides; i++) {
            const x = startX + i * spacing;
            const color = i === currentIndex ? 0x2ecc71 : 0x7f8c8d;
            const dot = this.add.circle(x, 30, dotSize / 2, color);
            this.slideContainer.add(dot);
        }
    }

    nextSlide() {
        // Se tem botao de jogar, nao avancar com clique normal
        if (this.slides[this.currentSlide].showPlayButton) {
            return;
        }

        this.currentSlide++;

        if (this.currentSlide >= this.slides.length) {
            this.startGame();
        } else {
            // Transicao
            this.cameras.main.fadeOut(200, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.showSlide(this.currentSlide);
                this.cameras.main.fadeIn(200);
            });
        }
    }

    startGame() {
        // Iniciar audio
        audioManager.init();
        audioManager.playGameStart();

        // Transicao para o menu
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
        });
    }
}
