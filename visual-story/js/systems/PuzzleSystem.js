class PuzzleSystem {
    constructor(scene) {
        this.scene = scene;
        this.puzzleContainer = new PIXI.Container();
        this.puzzleContainer.position.set(CONFIG.GAME_WIDTH / 2 - 200, CONFIG.GAME_HEIGHT / 2 - 150);
    }

    showProverbPuzzle(proverb, options, callback) {
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.9);
        background.drawRoundedRect(0, 0, 400, 300, 10);
        background.endFill();
        this.puzzleContainer.addChild(background);

        // Title
        const title = new PIXI.Text('Complete the Yoruba Proverb:', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff
        });
        title.position.set(20, 20);
        this.puzzleContainer.addChild(title);

        // Proverb text
        const proverbText = new PIXI.Text(proverb, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffff00,
            wordWrap: true,
            wordWrapWidth: 360
        });
        proverbText.position.set(20, 60);
        this.puzzleContainer.addChild(proverbText);

        // Options
        options.forEach((option, index) => {
            const optionText = new PIXI.Text(`${index + 1}. ${option.text}`, {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0xffffff
            });
            optionText.position.set(20, 120 + index * 40);
            optionText.interactive = true;
            optionText.cursor = 'pointer';
            optionText.on('pointerdown', () => {
                this.clearPuzzle();
                callback(option.correct);
            });
            this.puzzleContainer.addChild(optionText);
        });

        this.scene.addChild(this.puzzleContainer);
    }

    showRiddlePuzzle(riddle, callback) {
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.9);
        background.drawRoundedRect(0, 0, 400, 250, 10);
        background.endFill();
        this.puzzleContainer.addChild(background);

        // Title
        const title = new PIXI.Text('Solve the Riddle:', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff
        });
        title.position.set(20, 20);
        this.puzzleContainer.addChild(title);

        // Riddle text
        const riddleText = new PIXI.Text(riddle.question, {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0xffff00,
            wordWrap: true,
            wordWrapWidth: 360
        });
        riddleText.position.set(20, 60);
        this.puzzleContainer.addChild(riddleText);

        // Input field (simplified as options for this example)
        riddle.options.forEach((option, index) => {
            const optionText = new PIXI.Text(option, {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0xffffff
            });
            optionText.position.set(20, 120 + index * 40);
            optionText.interactive = true;
            optionText.cursor = 'pointer';
            optionText.on('pointerdown', () => {
                this.clearPuzzle();
                callback(option === riddle.answer);
            });
            this.puzzleContainer.addChild(optionText);
        });

        this.scene.addChild(this.puzzleContainer);
    }

    clearPuzzle() {
        if (this.puzzleContainer.parent) {
            this.puzzleContainer.parent.removeChild(this.puzzleContainer);
        }
        this.puzzleContainer.removeChildren();
    }
}
