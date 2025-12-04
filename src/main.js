/**
 * EcoHero ISCTE - Salva o Campus
 * Um presente de Natal especial para Carla Farelo
 * Desenvolvido com Phaser.js 3
 */

import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import IntroScene from './scenes/IntroScene.js';
import MenuScene from './scenes/MenuScene.js';
import Level1Scene from './scenes/Level1Scene.js';
import Level2Scene from './scenes/Level2Scene.js';
import Level3Scene from './scenes/Level3Scene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';
import PauseScene from './scenes/PauseScene.js';
import UIScene from './scenes/UIScene.js';

// Configuracao do jogo Phaser
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: 'game-container',

    // Configuracao de fisica
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },

    // Pixel art mode para sprites nitidos
    pixelArt: true,

    // Cor de fundo padrao
    backgroundColor: '#1a1a2e',

    // Array de todas as cenas do jogo
    scene: [
        BootScene,
        IntroScene,
        MenuScene,
        Level1Scene,
        Level2Scene,
        Level3Scene,
        GameOverScene,
        VictoryScene,
        PauseScene,
        UIScene
    ],

    // Configuracoes de escala para responsividade
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 450,
        parent: 'game-container',
        fullscreenTarget: 'game-container',
        expandParent: false
    },

    // Suporte para multi-touch (importante para controlos mobile)
    input: {
        activePointers: 3 // Permite 3 toques simultaneos
    }
};

// Criar e iniciar o jogo
const game = new Phaser.Game(config);

// Exportar para uso global se necessario
export default game;
