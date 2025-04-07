class ConversationLogScene extends Scene {
    constructor(game) {
        super(game);
        this.init();
    }

    init() {
        this.createBackground();
        this.createReturnButton();
        this.displayLog();
    }

    createBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(0x1a1a1a); // Darker background
        background.drawRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        background.endFill();
        this.addChild(background);
    }

    displayLog() {
        const logContainer = new PIXI.Container();
        let y = 80;

        this.game.gameState.conversationLog.forEach((item, index) => {
            const entryBox = new PIXI.Graphics();
            entryBox.beginFill(0x34495e, 0.8); // semi-transparent dark blue
            entryBox.drawRoundedRect(40, y, CONFIG.GAME_WIDTH - 80, 100, 12);
            entryBox.endFill();
            logContainer.addChild(entryBox);

            const originalText = new PIXI.Text(`🗣️ ${item.text}`, {
                fontFamily: 'Merriweather',
                fontSize: 20,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: CONFIG.GAME_WIDTH - 120
            });
            originalText.position.set(60, y + 10);
            logContainer.addChild(originalText);

            const translatedText = new PIXI.Text(`🔍 ${item.translation}`, {
                fontFamily: 'Merriweather',
                fontSize: 18,
                fill: 0xcccccc,
                fontStyle: 'italic',
                wordWrap: true,
                wordWrapWidth: CONFIG.GAME_WIDTH - 120
            });
            translatedText.position.set(60, y + 50);
            logContainer.addChild(translatedText);

            y += 120;
        });

        // Scrollbar support (optional improvement if content overflows)
        if (y > CONFIG.GAME_HEIGHT) {
            const mask = new PIXI.Graphics();
            mask.beginFill(0xffffff);
            mask.drawRect(0, 70, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT - 140);
            mask.endFill();
            logContainer.mask = mask;
            this.addChild(mask);

            logContainer.interactive = true;
            logContainer.on('wheel', (event) => {
                logContainer.y -= event.deltaY * 0.5;
                logContainer.y = Math.min(70, logContainer.y);
                logContainer.y = Math.max(CONFIG.GAME_HEIGHT - y - 70, logContainer.y);
            });
        }

        logContainer.y = 70;
        this.addChild(logContainer);
    }

    createReturnButton() {
        const btn = new PIXI.Container();
        const bg = new PIXI.Graphics();
        bg.beginFill(0x2980b9);
        bg.drawRoundedRect(0, 0, 200, 40, 10);
        bg.endFill();

        const text = new PIXI.Text('← Return to Game', {
            fontFamily: 'Raleway',
            fontSize: 18,
            fill: 0xffffff
        });
        text.anchor.set(0.5);
        text.x = 100;
        text.y = 20;

        btn.addChild(bg, text);
        btn.position.set(50, 20);
        btn.interactive = true;
        btn.buttonMode = true;

        btn.on('pointerdown', () => this.game.showMainMenu());

        this.addChild(btn);
    }
}
