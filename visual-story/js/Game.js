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
        this.gameState = {
            currentEpisode: "prologue.json",
            episodes: [...CONFIG.EPISODES],
            conversationLog: [],
            score: 0
        };


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
            currentEpisode: "prologue.json",
            episodes: [...CONFIG.EPISODES],
            conversationLog: [],
            score: 0
        };
        this.saveGame();
        this.loadEpisode('prologue.json');
    }

    loadGame() {
        const savedState = localStorage.getItem(CONFIG.SAVE_KEY);
        if (savedState) {
            this.gameState = JSON.parse(savedState);
            this.loadEpisode(this.gameState.currentEpisode);
        } else {
            this.startNewGame();
        }
    }

    saveGame() {
        console.log("saving game", this.gameState);
        localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(this.gameState));
    }

    async loadEpisode(episodeId) {
        console.log("loading episode", episodeId);
        this.gameState.currentEpisode = episodeId;
        this.saveGame();

        this.data = await this.loadLocationContent(episodeId);
        let scene = this.data.dialog[this.data.start];

        const newScene = this.loadScene(scene);

        this.switchScene(newScene);
    }

    loadLocationContent(path) {
        // Load the dialogue from the JSON file
        return fetch(`./js/stories/${path}`)
            .then(response => response.json())
            .catch(error => {
                console.error("Error loading location content:", error);
                return null;
            });
    }


    async loadScene(scene) {
        this.app.stage.removeChildren();

        //        const audio = document.getElementById('backgroundAudio');
        // audio.src = `./assets/audio/bg.mp3`;
        // audio.play();
        // Crossfade Effect
        let overlay = new PIXI.Graphics();
        overlay.beginFill(0x000000);
        overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        overlay.endFill();
        overlay.alpha = 1;
        this.app.stage.addChild(overlay);

        this.app.ticker.add(() => {
            if (overlay.alpha > 0) overlay.alpha -= 0.05;
        });

        // Play Sound Effect
        // if (scene.scene_audio) {
        // console.log(PIXI, "sound");
        // PIXI.sound.stopAll();
        // PIXI.sound.add('sceneAudio', `./assets/audio/${scene.scene_audio}`);
        // PIXI.sound.play('sceneAudio', { loop: false });
        //     const audio = document.getElementById('sceneAudio');
        //     audio.src = `./assets/audio/${scene.scene_audio}`;
        //     audio.play();
        // }

        // Background Image
        let bgSprite = PIXI.Sprite.from(`./assets/images/${scene.scene_image}`);
        // bgSprite.width = this.app.screen.width;
        //bgSprite.height = this.app.screen.height;
        bgSprite.anchor.set(0);
        this.app.stage.addChild(bgSprite);

        // Logs Button
        let logsButton = this.createLogButton();
        this.app.stage.addChild(logsButton);

        // Score Display
        let scoreText = new PIXI.Text(`Score: ${this.gameState.score}`, new PIXI.TextStyle({
            fontFamily: "Raleway",
            fontSize: 20,
            fill: "#FFFFFF"
        }));
        scoreText.x = this.app.screen.width - 150;
        scoreText.y = 25;
        this.app.stage.addChild(scoreText);



        // Text Box UI
        let textBox = new PIXI.Graphics();
        textBox.beginFill(0x1e1e1e, 0.85);
        textBox.drawRoundedRect(50, 400, 924, 150, 20);
        textBox.endFill();
        this.app.stage.addChild(textBox);

        // Speaker Name
        let speakerText = new PIXI.Text(scene.speaker, new PIXI.TextStyle({
            fontFamily: "Raleway",
            fontSize: 28,
            fill: "#FFD700",
            fontWeight: "bold"
        }));
        speakerText.x = 60;
        speakerText.y = 380;
        this.app.stage.addChild(speakerText);

        // Dialogue Text with Typewriter Effect
        let dialogueText = new PIXI.Text("", new PIXI.TextStyle({
            fontFamily: "Merriweather",
            fontSize: 22,
            fill: "#FFFFFF",
            wordWrap: true,
            wordWrapWidth: 900,
            lineHeight: 30
        }));
        dialogueText.x = 60;
        dialogueText.y = 420;
        this.app.stage.addChild(dialogueText);

        // Typewriter Effect
        this.isTyping = true;
        this.skipText = false;
        if (Array.isArray(scene.text)) {
            this.typeText(scene.text, dialogueText, true);
        } else {
            this.typeText(scene.text, dialogueText, false);
            this.gameState.conversationLog.push({
                text: scene.text,
                translation: scene.translation
            });
        }

        if (scene.life_spirit_hint) {
            let hintText = new PIXI.Text(`💡 ${scene.life_spirit_hint}`, new PIXI.TextStyle({
                fontFamily: "Merriweather",
                fontSize: 18,
                fill: "#00FFD5",
                wordWrap: true,
                wordWrapWidth: 900,
                fontStyle: "italic"
            }));
            hintText.x = 60;
            hintText.y = 90;
            this.app.stage.addChild(hintText);
        }


        scoreText.text = `Score: ${this.gameState.score}`;

        // Handle Choices
        if (scene.options) {
            let buttonY = 560;
            scene.options.forEach((option, index) => {
                let btn = this.createButton(option.text, 60, buttonY + index * 50, () => this.goToNext(option));
                this.app.stage.addChild(btn);
            });
        } else {
            // Click or Press Key to Continue
            textBox.interactive = true;
            textBox.buttonMode = true;
            textBox.on("pointerdown", () => {
                this.goToNext(scene);
            });
        }
    }

    goToNext(option) {
        if (this.isTyping) {
            return;
        }
        if (option.score) {
            this.gameState.score += option.score;
        }
        if (option.text && option.translation) {
            this.gameState.conversationLog.push({
                text: option.text,
                translation: option.translation
            });
        }
        if (!option.next && option.goto) {
            this.loadEpisode(option.goto);
        } else if (this.data.dialog[option.next]) {
            this.loadScene(this.data.dialog[option.next]);
        }
    }

    // Typewriter Effect Function
    typeText(fullText, textElement, isArray) {
        clearInterval(this.typingInterval);

        let i = 0;
        textElement.text = "";
        if (isArray) {
            let arrLen = fullText.length - 1;
            let arrIndex = 0
            this.typingInterval = setInterval(async () => {
                textElement.text += fullText[arrIndex][i];
                if (i % 3 === 0) {
                    // let textAudio = new Audio('./assets/audio/textBlip.mp3');
                    // textAudio.play();
                }
                i++;
                if (i >= fullText[arrIndex].length) {
                    arrIndex++;
                    i = 0;
                    if (arrIndex >= arrLen) {
                        this.isTyping = false;
                        clearInterval(this.typingInterval);
                    } else {
                        textElement.text = "";
                    }
                }
            }, 100);
        } else {
            this.typingInterval = setInterval(() => {
                if (this.skipText) {
                    textElement.text = fullText;
                    clearInterval(this.typingInterval);
                    this.isTyping = false;
                    return;
                }

                textElement.text += fullText[i];
                if (i % 3 === 0) {
                    // let textAudio = new Audio('./assets/audio/textBlip.mp3');
                    // textAudio.play();
                }
                i++;

                if (i >= fullText.length) {
                    this.isTyping = false;

                    clearInterval(this.typingInterval);
                }
            }, 100);
        }
    }

    // Create Button with Hover Effects
    createButton(label, x, y, onClick) {
        let button = new PIXI.Container();
        let background = new PIXI.Graphics();
        background.beginFill(0x222222);
        background.drawRoundedRect(0, 0, 500, 40, 10);
        background.endFill();

        let text = new PIXI.Text(label, new PIXI.TextStyle({
            fontFamily: "Raleway",
            fontSize: 20,
            fill: "white"
        }));
        text.anchor.set(0.5);
        text.x = 250;
        text.y = 20;

        button.addChild(background, text);
        button.x = x;
        button.y = y;
        button.interactive = true;
        button.buttonMode = true;

        button.on("pointerdown", onClick);
        button.on("pointerover", () => {
            background.tint = 0x444444;
            button.scale.set(1.05);
        });
        button.on("pointerout", () => {
            background.tint = 0x222222;
            button.scale.set(1);
        });

        return button;
    }

    createLogButton() {
        const logButton = new PIXI.Container();

        // Button background
        const buttonBg = new PIXI.Graphics();
        buttonBg.beginFill(0x000000);
        buttonBg.lineStyle(2, 0xffffff);
        buttonBg.drawRoundedRect(0, 0, 120, 60, 10);
        buttonBg.endFill();
        logButton.addChild(buttonBg);

        // Button text
        const buttonText = new PIXI.Text("Dialogue Log", {
            fontFamily: "Arial",
            fontSize: 18,
            fill: 0xffffff,
        });
        buttonText.anchor.set(0.5);
        buttonText.position.set(60, 30);
        logButton.addChild(buttonText);

        // Make button interactive
        logButton.interactive = true;
        logButton.cursor = "pointer";
        logButton.on("pointerdown", () => this.displayLog());
        logButton.on("pointerover", () => {
            buttonText.tint = 0xffffff;
        });
        logButton.on("pointerout", () => {
            buttonText.tint = 0xffffff;
        });

        return logButton;
    }

    displayLog() {
        const logScene = new ConversationLogScene(this);
        this.switchScene(logScene);
    }
}
