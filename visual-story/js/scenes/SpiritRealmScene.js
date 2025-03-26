class SpiritRealmScene extends PIXI.Container {
    constructor(game, episode) {
        super();
        this.game = game;
        this.episode = episode;
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
        background.beginFill(0x2a0a3a); // Dark purple background for spirit realm
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
        buttonBg.beginFill(0x4a0a8a);
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
            buttonBg.tint = 0xaa88ff;
            buttonText.tint = 0x000000;
        });
        mapButton.on('pointerout', () => {
            buttonBg.tint = 0xffffff;
            buttonText.tint = 0xffffff;
        });

        uiContainer.addChild(mapButton);

        // Create realm switch button
        const realmSwitchBtn = new PIXI.Text('Switch to Physical Realm', {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xffff00
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
        const mapContainer = this.game.mapSystem.createMapView('spirit');
        this.addChild(mapContainer);
    }

    loadLocationContent() {
        const locationId = this.game.mapSystem.getCurrentLocation();
        const location = this.game.mapSystem.getLocationData('spirit', locationId);
        
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
            case 'obatalas-garden':
                if (this.episode === 1) {
                    const obatala = this.createCharacter('Ọbàtálá', CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2);
                    obatala.on('pointerdown', () => {
                        this.dialogueSystem.showDialogue(
                            'Ẹ ku abọ, ọmọ. Mo jẹ Ọbàtálá, baba gbogbo èdá. Olódùmarè fi mí ṣe alágbára.',
                            [
                                {
                                    text: 'Tani iwọ?',
                                    callback: () => {
                                        this.dialogueSystem.showDialogue(
                                            'Mo jẹ Ọbàtálá, olùdá ayé, baba ìmọ̀lè. Ṣugbọn ayé ti yà. Àwọn Orisha kò le wọ ayé mọ́. Ṣé o loye?',
                                            [
                                                {
                                                    text: 'Ṣé Orisha ti sọnu?',
                                                    callback: () => {
                                                        this.dialogueSystem.showDialogue(
                                                            'Beeni',
                                                            [
                                                                {
                                                                    text: '....',
                                                                    callback: () => {
                                                                        this.dialogueSystem.showDialogue(
                                                                            'Mo ní iṣẹ́ kan fún ọ. Ṣé o setán?',
                                                                            [
                                                                                {
                                                                                    text: 'Kí ni iṣẹ́ yìí?',
                                                                                    callback: () => {
                                                                                        this.dialogueSystem.showDialogue(
                                                                                            'Ọba Adéwálé ni olórí ìjọba ayé. Ó gbọ̀dọ̀ mọ pé ayé àti ẹ̀mí kò le sọ̀rọ̀ mọ́. Gbé ifiranṣẹ mi lọ sí i.',
                                                                                            [],
                                                                                            () => {
                                                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                },
                                                                                {
                                                                                    text: 'Mo yóò gbìyànjú.',
                                                                                    callback: () => {
                                                                                        this.dialogueSystem.showDialogue(
                                                                                            'Ó dára! Ṣọ́ra, má ṣe ṣàṣìṣe pẹ̀lú àwọn ọ̀rọ̀ mi. Ayé ti ń rẹwà. \n Ọba Adéwálé ni olórí ìjọba ayé. Ó gbọ̀dọ̀ mọ pé ayé àti ẹ̀mí kò le sọ̀rọ̀ mọ́. Gbé ifiranṣẹ mi lọ sí i.',
                                                                                            [],
                                                                                            () => {
                                                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                }

                                                                            ],
                                                                            () => {
                                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                                            }
                                                                        );
                                                                    }
                                                                }

                                                            ],
                                                            () => {
                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                            }
                                                        );
                                                    }
                                                },
                                                {
                                                    text: 'Kí ni mo le ṣe?',
                                                    callback: () => {
                                                        this.dialogueSystem.showDialogue(
                                                            'Àwọn òrìṣà ti yà kúrò ní ayé. Ṣùgbọ́n, ìwọ, o le bá wọn sọ̀rọ̀. Ìyẹn ni ìdí tí mo fi pe ọ. \n Ọba Adéwálé ni olórí ìjọba ayé. Ó gbọ̀dọ̀ mọ pé ayé àti ẹ̀mí kò le sọ̀rọ̀ mọ́. Gbé ifiranṣẹ mi lọ sí i.',
                                                            [
                                                                {
                                                                    text: '....',
                                                                    callback: () => {
                                                                        this.dialogueSystem.showDialogue(
                                                                            'Ṣaaju ki o to lọ, o gbọ̀dọ̀ mọ ibi tí o ń lọ. Ọba Adéwálé jẹ́ alákòóso ìlú. Ṣùgbọ́n àwọn ẹlòmíì sì wà tí ń fi ìpo náà ṣàkóbá.',
                                                                            [
                                                                                {
                                                                                    text: 'Ṣé mo gbọ̀dọ̀ gbèjà fún ọba?',
                                                                                    callback: () => {
                                                                                        this.dialogueSystem.showDialogue(
                                                                                            'Ṣé ìwọ ni aláṣẹ ayé? O ní láti gbọ́ gbogbo ẹgbẹ́ ṣaaju kí o to ṣe ipinnu.',
                                                                                            [],
                                                                                            () => {
                                                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                },
                                                                                {
                                                                                    text: 'Tani àwọn ẹlòmíì yìí?',
                                                                                    callback: () => {
                                                                                        this.dialogueSystem.showDialogue(
                                                                                            'Àwọn aláfọ̀bẹ́ ti rí wípé àwọn Orisha kò le wọ ayé. Wọ́n ń gbìyànjú láti gba àṣẹ láti ọwọ́ ọba.',
                                                                                            [],
                                                                                            () => {
                                                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                },
                                                                                {
                                                                                    text: 'Mo máa lọ bá a.',
                                                                                    callback: () => {
                                                                                        this.dialogueSystem.showDialogue(
                                                                                            'Ó dára. Má gbàgbé, ọrọ̀ jẹ́ okun.',
                                                                                            [],
                                                                                            () => {
                                                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                }

                                                                            ],
                                                                            () => {
                                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                                            }
                                                                        );
                                                                    }
                                                                }

                                                            ],
                                                            () => {
                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                            }
                                                        );
                                                    }
                                                },
                                            ],
                                            () => {
                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                            }
                                        );
                                    }
                                },
                                {
                                    text: 'Nibo ni mo wà?',
                                    callback: () => {
                                        this.dialogueSystem.showDialogue(
                                            'O wà ní àárín ayé àti ẹ̀mí, ibi tí àwọn Orisha fi ń gbìyànjú láti bá ayé sọ̀rọ̀. Ṣugbọn ohun kan wà tó jẹ́ kí àwọn ẹ̀mí má le wọ ayé.',
                                            [
                                                {
                                                    text: 'Kí ló ṣẹlẹ̀?',
                                                    callback: () => {
                                                        this.dialogueSystem.showDialogue(
                                                            'Àwọn òrìṣà ti yà kúrò ní ayé. Ṣùgbọ́n, ìwọ, o le bá wọn sọ̀rọ̀. Ìyẹn ni ìdí tí mo fi pe ọ.',
                                                            [],
                                                            () => {
                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                            }
                                                        );
                                                    }
                                                },
                                                {
                                                    text: 'Ṣé mo le bá wọn rò?',
                                                    callback: () => {
                                                        this.dialogueSystem.showDialogue(
                                                            'Àwọn òrìṣà ti yà kúrò ní ayé. Ṣùgbọ́n, ìwọ, o le bá wọn sọ̀rọ̀. Ìyẹn ni ìdí tí mo fi pe ọ.',
                                                            [],
                                                            () => {
                                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                                            }
                                                        );
                                                    }
                                                },
                                            ],
                                            () => {
                                                this.game.mapSystem.unlockLocation('spirit', 'spirit-crossroads');
                                                this.dialogueSystem.showYorubaTranslation('spirit');
                                            }
                                        );
                                    }
                                }

                            ]
                        );
                    });
                }
                break;

            case 'spirit-crossroads':
                if (this.episode === 1) {
                    const guide = this.createCharacter('Spirit Guide', CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2);
                    guide.on('pointerdown', () => {
                        this.dialogueSystem.showDialogue(
                            'The paths to Sàngó and Ọ̀ṣun await. Which will you seek first?',
                            [
                                {
                                    text: 'Path to Sàngó',
                                    callback: () => {
                                        this.dialogueSystem.showDialogue(
                                            'The Thunder God\'s temple lies ahead. Prepare yourself for his trials.',
                                            [],
                                            () => {
                                                this.game.mapSystem.unlockLocation('spirit', 'sango-temple');
                                                this.dialogueSystem.showYorubaTranslation('thunder');
                                            }
                                        );
                                    }
                                },
                                {
                                    text: 'Path to Ọ̀ṣun',
                                    callback: () => {
                                        this.dialogueSystem.showDialogue(
                                            'The Sacred River flows with ancient wisdom.',
                                            [],
                                            () => {
                                                this.game.mapSystem.unlockLocation('spirit', 'osun-river');
                                                this.dialogueSystem.showYorubaTranslation('river');
                                            }
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
        const character = new PIXI.Text(name, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff
        });
        character.anchor.set(0.5);
        character.position.set(x, y);
        character.interactive = true;
        character.cursor = 'pointer';
        
        this.addChild(character);
        return character;
    }
}
