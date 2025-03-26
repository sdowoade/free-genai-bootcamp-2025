class GameScene extends Scene {
    constructor(game, episodeId) {
        super(game);
        this.episodeId = episodeId;
        this.init();
    }

    init() {
        this.createBackground();
        this.createUI();
    }

    createBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(0x2c3e50);
        background.drawRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        background.endFill();
        this.addChild(background);
    }

    createUI() {
        // Create realm switch button
        const realmBtn = new PIXI.Text(`Switch to ${this.game.gameState.currentRealm === 'physical' ? 'Spirit' : 'Physical'} Realm`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff
        });
        realmBtn.position.set(20, 20);
        realmBtn.interactive = true;
        realmBtn.cursor = 'pointer';
        realmBtn.on('pointerdown', () => this.game.switchRealm());
        this.addChild(realmBtn);

        // Create episode info
        const episodeInfo = new PIXI.Text(`Episode ${this.episodeId}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff
        });
        episodeInfo.position.set(CONFIG.GAME_WIDTH - 150, 20);
        this.addChild(episodeInfo);

        // Create menu button
        const menuBtn = new PIXI.Text('Menu', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff
        });
        menuBtn.position.set(CONFIG.GAME_WIDTH - 100, CONFIG.GAME_HEIGHT - 40);
        menuBtn.interactive = true;
        menuBtn.cursor = 'pointer';
        menuBtn.on('pointerdown', () => this.game.showMainMenu());
        this.addChild(menuBtn);
    }

    update(delta) {
        // Update game logic
    }
}
