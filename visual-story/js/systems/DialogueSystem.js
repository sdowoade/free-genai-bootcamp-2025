class DialogueSystem {
    constructor(scene) {
        this.scene = scene;
        this.dialogueContainer = new PIXI.Container();
        this.dialogueContainer.position.set(50, CONFIG.GAME_HEIGHT - 200);
        this.currentDialogue = null;
        this.currentOptions = null;
        this.onDialogueComplete = null;
        this.yorubaWords = new Map([
            ['hello', 'bawo'],
            ['elder', 'agba'],
            ['spirit', 'emi'],
            ['yes', 'beeni'],
            ['no', 'rara'],
            ['thank you', 'e se'],
            ['please', 'jowo'],
            ['goodbye', 'odabo'],
            ['thunder', 'ara'],
            ['river', 'odo']
        ]);
    }

    showDialogue(dialogue, translation = '', options = [], callback = null) {
        this.clearDialogue();
        this.onDialogueComplete = callback;

        // Create dialogue box background
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.8);
        background.drawRoundedRect(0, 0, CONFIG.GAME_WIDTH - 100, 180, 10);
        background.endFill();
        this.dialogueContainer.addChild(background);

        // Create dialogue text with word wrap
        const text = new PIXI.Text(dialogue, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff,
            wordWrap: true,
            wordWrapWidth: CONFIG.GAME_WIDTH - 140,
            align: 'left'
        });
        text.position.set(20, 20);
        this.dialogueContainer.addChild(text);
        this.currentDialogue = text;

        // Add response options if any
        if (options.length > 0) {
            this.showOptions(options);
        } else {
            // If no options, add continue button
            const continueBtn = new PIXI.Text('[Continue]', {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffff00
            });
            continueBtn.position.set(CONFIG.GAME_WIDTH - 250, 130);
            continueBtn.interactive = true;
            continueBtn.cursor = 'pointer';
            continueBtn.on('pointerdown', () => {
                this.clearDialogue();
                if (this.onDialogueComplete) this.onDialogueComplete();
            });
            this.dialogueContainer.addChild(continueBtn);
        }

        this.scene.addChild(this.dialogueContainer);
    }

    showOptions(options) {
        const optionsContainer = new PIXI.Container();
        optionsContainer.position.set(20, 80);

        options.forEach((option, index) => {
            const optionText = new PIXI.Text(`${index + 1}. ${option.text}`, {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0xffff00,
                wordWrap: true,
                wordWrapWidth: CONFIG.GAME_WIDTH - 180
            });
            optionText.position.set(0, index * 30);
            optionText.interactive = true;
            optionText.cursor = 'pointer';
            optionText.on('pointerdown', () => {
                this.clearDialogue();
                if (option.callback) option.callback();
            });
            optionsContainer.addChild(optionText);
        });

        this.dialogueContainer.addChild(optionsContainer);
        this.currentOptions = optionsContainer;
    }

    showYorubaTranslation(englishWord) {
        const yorubaWord = this.yorubaWords.get(englishWord.toLowerCase());
        if (yorubaWord) {
            const translationText = new PIXI.Text(`${englishWord}: ${yorubaWord}`, {
                fontFamily: 'Arial',
                fontSize: 20,
                fill: 0x00ff00,
                wordWrap: true,
                wordWrapWidth: 200
            });
            translationText.position.set(CONFIG.GAME_WIDTH - 250, 20);
            this.scene.addChild(translationText);
            setTimeout(() => {
                if (translationText.parent) {
                    translationText.parent.removeChild(translationText);
                }
            }, 3000);
        }
    }

    clearDialogue() {
        if (this.dialogueContainer.parent) {
            this.dialogueContainer.parent.removeChild(this.dialogueContainer);
        }
        this.dialogueContainer.removeChildren();
        this.currentDialogue = null;
        this.currentOptions = null;
    }
}
