/**
 * CollectibleManager - Gere grupos de itens coletaveis
 */

import Collectible from '../entities/Collectible.js';
import gameState from './GameState.js';
import audioManager from './AudioManager.js';

export default class CollectibleManager {
    constructor(scene) {
        this.scene = scene;

        // Grupo de fisica para coletaveis - SEM gravidade para flutuar
        this.collectibles = scene.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // Contadores
        this.totalItems = 0;
        this.collectedItems = 0;
    }

    /**
     * Criar um unico coletavel
     */
    spawn(x, y, type = 'bottle') {
        const item = new Collectible(this.scene, x, y, type);
        this.collectibles.add(item);
        this.totalItems++;
        return item;
    }

    /**
     * Criar multiplos coletaveis de um array
     * @param {Array} positions - [{x, y, type}, ...]
     */
    spawnFromArray(positions) {
        positions.forEach(pos => {
            this.spawn(pos.x, pos.y, pos.type || 'bottle');
        });

        // Atualizar GameState
        gameState.setTotalItems(this.totalItems);
    }

    /**
     * Criar layout predefinido para um nivel
     */
    createLevelLayout(levelNumber) {
        const layouts = {
            1: this.getLevel1Layout(),
            2: this.getLevel2Layout(),
            3: this.getLevel3Layout()
        };

        const layout = layouts[levelNumber] || layouts[1];
        this.spawnFromArray(layout);
    }

    getLevel1Layout() {
        // Layout do Nivel 1: Cantina
        return [
            // Chao
            { x: 200, y: 400, type: 'bottle' },
            { x: 300, y: 400, type: 'can' },
            { x: 500, y: 400, type: 'bottle' },
            { x: 600, y: 400, type: 'paper' },
            { x: 700, y: 400, type: 'can' },

            // Plataforma esquerda baixa
            { x: 180, y: 300, type: 'bottle' },
            { x: 220, y: 300, type: 'can' },

            // Plataforma central
            { x: 420, y: 240, type: 'battery' },
            { x: 480, y: 240, type: 'bottle' },
            { x: 540, y: 240, type: 'can' },

            // Plataforma direita baixa
            { x: 680, y: 300, type: 'paper' },
            { x: 720, y: 300, type: 'bottle' },

            // Plataformas altas
            { x: 330, y: 140, type: 'star' },
            { x: 370, y: 140, type: 'battery' },
            { x: 580, y: 140, type: 'can' },
            { x: 620, y: 140, type: 'bottle' },
        ];
    }

    getLevel2Layout() {
        // Layout do Nivel 2: Jardim
        return [
            { x: 150, y: 380, type: 'bottle' },
            { x: 250, y: 350, type: 'can' },
            { x: 350, y: 300, type: 'paper' },
            { x: 450, y: 280, type: 'battery' },
            { x: 550, y: 300, type: 'bottle' },
            { x: 650, y: 350, type: 'can' },
            { x: 750, y: 380, type: 'paper' },
            { x: 300, y: 200, type: 'star' },
            { x: 400, y: 150, type: 'battery' },
            { x: 500, y: 200, type: 'star' },
            // ... mais itens
        ];
    }

    getLevel3Layout() {
        // Layout do Nivel 3: Telhado (menos itens, gerados pelo boss)
        return [
            { x: 100, y: 350, type: 'bottle' },
            { x: 200, y: 350, type: 'can' },
            { x: 600, y: 350, type: 'bottle' },
            { x: 700, y: 350, type: 'can' },
        ];
    }

    /**
     * Configurar colisao com jogador
     */
    setupCollision(player, callback) {
        this.scene.physics.add.overlap(
            player,
            this.collectibles,
            callback,
            null,
            this.scene
        );
    }

    /**
     * Handler padrao de coleta
     */
    handleCollect(player, item) {
        if (item.collected) return;

        // Coletar item
        const points = item.collect();

        if (points) {
            // Som de coleta
            audioManager.playCollect();

            // Adicionar pontos
            const result = gameState.addScore(points);
            gameState.collectItem();

            // Som de combo se aplicavel
            if (result.multiplier > 1) {
                audioManager.playCombo(result.multiplier);
            }

            // Mostrar pontos flutuantes
            if (this.scene.hud) {
                const text = result.multiplier > 1
                    ? `+${result.points} x${result.multiplier}`
                    : `+${result.points}`;
                this.scene.hud.showFloatingText(text, item.x, item.y);
                this.scene.hud.animateScore();

                // Mensagem motivacional ocasional
                if (Math.random() < 0.3 || item.type === 'star') {
                    this.scene.hud.showMotivationalMessage();
                }
            }

            // Efeito no jogador
            if (player.collect) {
                player.collect(item);
            }

            this.collectedItems++;
        }
    }

    /**
     * Obter grupo para colisoes externas
     */
    getGroup() {
        return this.collectibles;
    }

    /**
     * Verificar se todos os itens foram coletados
     */
    allCollected() {
        return this.collectedItems >= this.totalItems;
    }

    /**
     * Obter percentagem de itens coletados
     */
    getPercentage() {
        if (this.totalItems === 0) return 100;
        return Math.floor((this.collectedItems / this.totalItems) * 100);
    }

    /**
     * Destruir manager
     */
    destroy() {
        this.collectibles.destroy(true);
    }
}
