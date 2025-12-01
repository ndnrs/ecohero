/**
 * GameState - Singleton para gerir estado global do jogo
 * Guarda pontuacao, vidas, nivel atual, etc.
 */

class GameState {
    constructor() {
        // Estado inicial
        this.reset();

        // Carregar high score do localStorage
        this.loadHighScore();
    }

    /**
     * Resetar estado para novo jogo
     */
    reset() {
        this.score = 0;
        this.lives = 3;
        this.currentLevel = 1;
        this.itemsCollected = 0;
        this.totalItems = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lastCollectTime = 0;
    }

    /**
     * Adicionar pontos
     */
    addScore(points) {
        // Aplicar multiplicador de combo
        const multiplier = this.getComboMultiplier();
        const finalPoints = Math.floor(points * multiplier);

        this.score += finalPoints;

        // Atualizar combo
        const now = Date.now();
        if (now - this.lastCollectTime < 3000) {
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
        } else {
            this.combo = 1;
        }
        this.lastCollectTime = now;

        // Verificar high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        return { points: finalPoints, multiplier };
    }

    /**
     * Obter multiplicador de combo atual
     */
    getComboMultiplier() {
        if (this.combo >= 5) return 3;
        if (this.combo >= 3) return 2;
        return 1;
    }

    /**
     * Resetar combo (ao levar dano ou tempo)
     */
    resetCombo() {
        this.combo = 0;
    }

    /**
     * Perder uma vida
     */
    loseLife() {
        this.lives--;
        this.resetCombo();
        return this.lives;
    }

    /**
     * Ganhar uma vida extra
     */
    gainLife() {
        this.lives++;
        if (this.lives > 5) this.lives = 5; // Max 5 vidas
        return this.lives;
    }

    /**
     * Verificar se jogo acabou
     */
    isGameOver() {
        return this.lives <= 0;
    }

    /**
     * Avancar para proximo nivel
     */
    nextLevel() {
        this.currentLevel++;
        this.itemsCollected = 0;
        this.totalItems = 0;
        return this.currentLevel;
    }

    /**
     * Registar item coletado
     */
    collectItem() {
        this.itemsCollected++;
    }

    /**
     * Definir total de itens no nivel
     */
    setTotalItems(total) {
        this.totalItems = total;
    }

    /**
     * Obter percentagem de itens coletados
     */
    getCollectionPercentage() {
        if (this.totalItems === 0) return 0;
        return Math.floor((this.itemsCollected / this.totalItems) * 100);
    }

    /**
     * Calcular estrelas baseado em performance
     */
    getStars() {
        const percentage = this.getCollectionPercentage();
        if (percentage >= 90) return 3;
        if (percentage >= 50) return 2;
        return 1;
    }

    /**
     * Guardar high score no localStorage
     */
    saveHighScore() {
        try {
            localStorage.setItem('ecohero_highscore', this.highScore.toString());
        } catch (e) {
            // localStorage pode nao estar disponivel
            console.warn('Nao foi possivel guardar high score');
        }
    }

    /**
     * Carregar high score do localStorage
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('ecohero_highscore');
            this.highScore = saved ? parseInt(saved, 10) : 0;
        } catch (e) {
            this.highScore = 0;
        }
    }

    /**
     * Obter dados para mostrar no HUD
     */
    getHUDData() {
        return {
            score: this.score,
            lives: this.lives,
            level: this.currentLevel,
            combo: this.combo,
            multiplier: this.getComboMultiplier(),
            items: `${this.itemsCollected}/${this.totalItems}`
        };
    }

    /**
     * Obter dados para ecra de fim
     */
    getEndScreenData() {
        return {
            score: this.score,
            highScore: this.highScore,
            stars: this.getStars(),
            itemsCollected: this.itemsCollected,
            totalItems: this.totalItems,
            percentage: this.getCollectionPercentage(),
            maxCombo: this.maxCombo
        };
    }
}

// Singleton - uma unica instancia partilhada
const gameState = new GameState();
export default gameState;
