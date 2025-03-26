class MainMenuScene extends Scene {
    constructor(game) {
        super(game);
        this.init();
    }

    init() {
        this.createBackground();
        this.createTitle();
        this.createButtons();
    }

    createBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(0x2c3e50);
        background.drawRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        background.endFill();
        this.addChild(background);
    }

    createTitle() {
        const title = new PIXI.Text("Orisha's Quest", {
            fontFamily: 'Arial',
            fontSize: 64,
            fill: 0xffffff,
            align: 'center'
        });
        title.anchor.set(0.5);
        title.position.set(CONFIG.GAME_WIDTH / 2, 150);
        this.addChild(title);
    }

    createButtons() {
        const buttonStyle = {
            fontFamily: 'Arial',
            fontSize: 32,
            fill: 0xffffff,
            align: 'center'
        };

        // New Game Button
        const newGameBtn = new PIXI.Text('New Game', buttonStyle);
        newGameBtn.anchor.set(0.5);
        newGameBtn.position.set(CONFIG.GAME_WIDTH / 2, 300);
        newGameBtn.interactive = true;
        newGameBtn.cursor = 'pointer';
        newGameBtn.on('pointerdown', () => this.game.startNewGame());
        this.addChild(newGameBtn);

        // Load Game Button
        const loadGameBtn = new PIXI.Text('Load Game', buttonStyle);
        loadGameBtn.anchor.set(0.5);
        loadGameBtn.position.set(CONFIG.GAME_WIDTH / 2, 400);
        loadGameBtn.interactive = true;
        loadGameBtn.cursor = 'pointer';
        loadGameBtn.on('pointerdown', () => this.game.loadGame());
        this.addChild(loadGameBtn);
    }
}
