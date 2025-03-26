class Game {
    constructor() {
        // Remove any existing canvas elements
        const existingCanvas = document.getElementById('gameCanvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        this.app = new PIXI.Application({
            width: CONFIG.GAME_WIDTH,
            height: CONFIG.GAME_HEIGHT,
            backgroundColor: 0x1a1a1a,
            resolution: window.devicePixelRatio || 1,
            antialias: true
        });
        document.body.appendChild(this.app.view);
        this.app.view.id = 'gameCanvas';
        
        this.currentScene = null;
        this.mapSystem = new MapSystem(this);
        this.gameState = {
            currentEpisode: 1,
            episodes: [...CONFIG.EPISODES],
            currentRealm: 'spirit',
            currentLocation: 'obatalas-garden',
            inventory: [],
            yorubaWords: new Set(),
            questProgress: {}
        };

        // Generate placeholder assets
        AssetGenerator.generateAllLocationImages();

        // Initialize game
        this.init();
    }

    destroy() {
        // Cleanup PIXI application
        if (this.app) {
            this.app.destroy(true, { children: true, texture: true, baseTexture: true });
        }
        // Remove canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.remove();
        }
    }

    init() {
        this.showMainMenu();
    }

    switchScene(newScene) {
        // Remove all children from stage
        while(this.app.stage.children.length > 0) {
            const child = this.app.stage.children[0];
            child.destroy({children: true, texture: true, baseTexture: true});
            this.app.stage.removeChild(child);
        }

        // Clear the stage
        this.app.stage.removeChildren();

        // Add new scene
        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
    }

    showMainMenu() {
        const menuScene = new MainMenuScene(this);
        this.switchScene(menuScene);
    }

    startNewGame() {
        this.gameState = {
            currentEpisode: 1,
            episodes: [...CONFIG.EPISODES],
            currentRealm: 'spirit',
            currentLocation: 'obatalas-garden',
            inventory: [],
            yorubaWords: new Set(),
            questProgress: {}
        };
        this.saveGame();
        this.loadLocation('spirit', 'obatalas-garden');
    }

    loadGame() {
        const savedState = localStorage.getItem(CONFIG.SAVE_KEY);
        if (savedState) {
            this.gameState = JSON.parse(savedState);
            this.loadLocation(this.gameState.currentRealm, this.gameState.currentLocation);
        } else {
            this.startNewGame();
        }
    }

    saveGame() {
        localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(this.gameState));
    }

    loadLocation(realm, locationId) {
        this.gameState.currentRealm = realm;
        this.gameState.currentLocation = locationId;
        
        const newScene = realm === 'physical' 
            ? new PhysicalRealmScene(this, this.gameState.currentEpisode)
            : new SpiritRealmScene(this, this.gameState.currentEpisode);
        
        this.switchScene(newScene);
        this.saveGame();
    }

    switchRealm() {
        const newRealm = this.gameState.currentRealm === 'physical' ? 'spirit' : 'physical';
        const defaultLocation = newRealm === 'physical' ? 'village-center' : 'obatalas-garden';
        this.loadLocation(newRealm, defaultLocation);
    }

    completeEpisode(episodeId) {
        const episode = this.gameState.episodes.find(ep => ep.id === episodeId);
        if (episode) {
            episode.completed = true;
            // Unlock next episode if it exists
            const nextEpisode = this.gameState.episodes.find(ep => ep.id === episodeId + 1);
            if (nextEpisode) {
                nextEpisode.unlocked = true;
            }
            this.saveGame();
        }
    }

    learnYorubaWord(word) {
        this.gameState.yorubaWords.add(word);
        this.saveGame();
    }

    updateQuestProgress(questId, progress) {
        this.gameState.questProgress[questId] = progress;
        this.saveGame();
    }
}
