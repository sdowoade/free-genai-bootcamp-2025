class PhysicalRealmScene extends PIXI.Container {
    constructor(game, episodeId) {
        super();
        this.game = game;
        this.episodeId = episodeId;
        this.dialogueSystem = new DialogueSystem(this);
        this.init();
    }

    init() {
        this.createBackground();
        this.createUI();
        this.loadLocationContent();
    }

    createBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(0x1a472a); // Dark green background for physical realm
        background.drawRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        background.endFill();
        this.addChild(background);
    }

    createUI() {
        // Create UI container for buttons
        const uiContainer = new PIXI.Container();
        uiContainer.position.set(10, 10);

        // Create map button
        const mapButton = new PIXI.Container();
        
        // Button background
        const buttonBg = new PIXI.Graphics();
        buttonBg.beginFill(0x2c5338);
        buttonBg.lineStyle(2, 0xffffff);
        buttonBg.drawRoundedRect(0, 0, 120, 40, 10);
        buttonBg.endFill();
        mapButton.addChild(buttonBg);

        // Button text
        const buttonText = new PIXI.Text('View Map', {
            fontFamily: 'Arial',
            fontSize: 18,
            fill: 0xffffff
        });
        buttonText.anchor.set(0.5);
        buttonText.position.set(60, 20);
        mapButton.addChild(buttonText);

        // Make button interactive
        mapButton.interactive = true;
        mapButton.cursor = 'pointer';
        mapButton.on('pointerdown', () => this.showMap());
        mapButton.on('pointerover', () => {
            buttonBg.tint = 0xaaffaa;
            buttonText.tint = 0x000000;
        });
        mapButton.on('pointerout', () => {
            buttonBg.tint = 0xffffff;
            buttonText.tint = 0xffffff;
        });

        uiContainer.addChild(mapButton);

        // Create realm switch button
        const realmSwitchBtn = new PIXI.Text('Switch to Spirit Realm', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffffff
        });
        realmSwitchBtn.position.set(10, 60);
        realmSwitchBtn.interactive = true;
        realmSwitchBtn.cursor = 'pointer';
        realmSwitchBtn.on('pointerdown', () => this.game.switchRealm());
        uiContainer.addChild(realmSwitchBtn);

        this.addChild(uiContainer);
    }

    showMap() {
        // Create a map container
        const mapContainer = this.game.mapSystem.createMapView('physical');
        this.addChild(mapContainer);
    }

    loadLocationContent() {
        const locationId = this.game.gameState.currentLocation;
        const location = this.game.mapSystem.getLocationData('physical', locationId);
        
        if (location) {
            // Create location title
            const title = new PIXI.Text(location.name, {
                fontFamily: 'Arial',
                fontSize: 32,
                fill: 0xffffff
            });
            title.position.set(CONFIG.GAME_WIDTH / 2, 100);
            title.anchor.set(0.5);
            this.addChild(title);

            // Create location description
            const description = new PIXI.Text(location.description, {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: 0xcccccc,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: CONFIG.GAME_WIDTH - 200
            });
            description.position.set(CONFIG.GAME_WIDTH / 2, 150);
            description.anchor.set(0.5, 0);
            this.addChild(description);

            // Add location-specific interactions based on episode
            this.setupLocationInteractions(locationId);
        }
    }

    setupLocationInteractions(locationId) {
        switch(locationId) {
            case 'village-center':
                if (this.episodeId === 1) {
                    const villager = this.createCharacter('Village Elder', CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2);
                    villager.on('pointerdown', () => {
                        this.dialogueSystem.showDialogue(
                            'Welcome, young one. Our village has been experiencing strange occurrences since the Orishas became distant.',
                            [
                                { 
                                    text: 'Tell me more',
                                    callback: () => {
                                        this.dialogueSystem.showDialogue(
                                            'The elders gather at my hut to discuss these matters. You should join us.',
                                            [
                                                {
                                                    text: 'I will come',
                                                    callback: () => {
                                                        this.dialogueSystem.showDialogue(
                                                            'Excellent. You can find my hut to the northeast.',
                                                            [],
                                                            () => {
                                                                this.game.mapSystem.unlockLocation('physical', 'elder-hut');
                                                                this.game.updateQuestProgress('ep1_elder_meeting', 'completed');
                                                            }
                                                        );
                                                    }
                                                }
                                            ]
                                        );
                                    }
                                }
                            ]
                        );
                    });
                }
                break;

            case 'elder-hut':
                if (this.episodeId === 1) {
                    const elder = this.createCharacter('Chief Elder', CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2);
                    elder.on('pointerdown', () => {
                        this.dialogueSystem.showDialogue(
                            'The ancient shrine may hold answers to the Orishas\' silence. But the path is guarded by riddles.',
                            [
                                {
                                    text: 'I will solve them',
                                    callback: () => {
                                        this.dialogueSystem.showDialogue(
                                            'First, you should visit the market. The merchant there trades in ancient artifacts.',
                                            [],
                                            () => {
                                                this.game.mapSystem.unlockLocation('physical', 'market');
                                                this.dialogueSystem.showYorubaTranslation('elder');
                                            }
                                        );
                                    }
                                }
                            ]
                        );
                    });
                }
                break;

            case 'market':
                if (this.episodeId === 1) {
                    const merchant = this.createCharacter('Merchant', CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2);
                    merchant.on('pointerdown', () => {
                        this.dialogueSystem.showDialogue(
                            'Ah, seeking ancient wisdom? I have something that might help...',
                            [
                                {
                                    text: 'Show me',
                                    callback: () => {
                                        this.dialogueSystem.showDialogue(
                                            'This map leads to the ancient shrine. But first, a test: What does "agba" mean?',
                                            [
                                                {
                                                    text: 'Elder',
                                                    callback: () => {
                                                        this.dialogueSystem.showDialogue(
                                                            'Correct! You know our language well. The shrine awaits.',
                                                            [],
                                                            () => {
                                                                this.game.mapSystem.unlockLocation('physical', 'ancient-shrine');
                                                                this.game.updateQuestProgress('ep1_merchant_test', 'completed');
                                                            }
                                                        );
                                                    }
                                                },
                                                {
                                                    text: 'Child',
                                                    callback: () => {
                                                        this.dialogueSystem.showDialogue(
                                                            'No, no. Study more and return.');
                                                    }
                                                }
                                            ]
                                        );
                                    }
                                }
                            ]
                        );
                    });
                }
                break;
        }
    }

    createCharacter(name, x, y) {
        const character = new PIXI.Container();
        
        // Create character sprite (placeholder circle)
        const sprite = new PIXI.Graphics();
        sprite.beginFill(0x3498db);
        sprite.drawCircle(0, 0, 30);
        sprite.endFill();
        
        // Add name text
        const text = new PIXI.Text(name, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffffff
        });
        text.anchor.set(0.5);
        text.y = -45;
        
        character.addChild(sprite);
        character.addChild(text);
        character.position.set(x, y);
        character.interactive = true;
        character.cursor = 'pointer';
        
        this.addChild(character);
        return character;
    }
}
