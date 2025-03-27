class MapSystem {
    constructor(game) {
        this.game = game;
        this.currentLocation = null;
        this.locations = {
            spirit: {
                // Episode 1 Locations
                'obatalas-garden': {
                    name: 'Ọbàtálá\'s Garden of Creation',
                    image: 'Obatalas Garden of Creation',
                    unlocked: true,
                    episode: 1,
                    position: { x: CONFIG.GAME_WIDTH * 0.2, y: CONFIG.GAME_HEIGHT * 0.3 },
                    description: 'A serene garden where the divine creator Ọbàtálá resides'
                },
                'spirit-crossroads': {
                    name: 'Spirit Crossroads',
                    image: 'Spirit Crossroads',
                    unlocked: false,
                    episode: 1,
                    position: { x: CONFIG.GAME_WIDTH * 0.4, y: CONFIG.GAME_HEIGHT * 0.3 },
                    description: 'A mystical intersection where different spiritual paths meet'
                },
                // Episode 2 Locations
                'sango-temple': {
                    name: 'Sàngó\'s Thunder Temple',
                    image: 'Sàngó\'s Thunder Temple',
                    unlocked: false,
                    episode: 2,
                    position: { x: CONFIG.GAME_WIDTH * 0.6, y: CONFIG.GAME_HEIGHT * 0.2 },
                    description: 'The mighty temple of Sàngó, where thunder and justice reign'
                },
                'osun-river': {
                    name: 'Ọ̀ṣun\'s Sacred River',
                    image: 'Ọ̀ṣun\'s Sacred River',
                    unlocked: false,
                    episode: 2,
                    position: { x: CONFIG.GAME_WIDTH * 0.6, y: CONFIG.GAME_HEIGHT * 0.4 },
                    description: 'The blessed waters of Ọ̀ṣun, source of life and healing'
                },
                // Episode 3 Locations
                'esu-crossroads': {
                    name: 'Èṣù\'s Trickster Grove',
                    image: 'Èṣù\'s Trickster Grove',
                    unlocked: false,
                    episode: 3,
                    position: { x: CONFIG.GAME_WIDTH * 0.8, y: CONFIG.GAME_HEIGHT * 0.3 },
                    description: 'A mysterious grove where Èṣù tests the wisdom of visitors'
                }
            },
            physical: {
                // Episode 1 Locations
                'adewales-palace': {
                    name: 'Adewale\'s Palace',
                    image: 'Adewale\'s Palace',
                    unlocked: false,
                    episode: 1,
                    position: { x: CONFIG.GAME_WIDTH * 0.2, y: CONFIG.GAME_HEIGHT * 0.7 },
                    description: 'The palace of the king of the village'
                },
                'elder-hut': {
                    name: 'Elder\'s Hut',
                    image: 'Elder\'s Hut',
                    unlocked: false,
                    episode: 1,
                    position: { x: CONFIG.GAME_WIDTH * 0.4, y: CONFIG.GAME_HEIGHT * 0.6 },
                    description: 'Home of the village elder, keeper of ancient wisdom'
                },
                // Episode 2 Locations
                'market': {
                    name: 'Marketplace',
                    image: 'Marketplace',
                    unlocked: false,
                    episode: 2,
                    position: { x: CONFIG.GAME_WIDTH * 0.4, y: CONFIG.GAME_HEIGHT * 0.8 },
                    description: 'A bustling marketplace where traders share stories and goods'
                },
                'ancient-shrine': {
                    name: 'Ancient Shrine',
                    image: 'Ancient Shrine',
                    unlocked: false,
                    episode: 2,
                    position: { x: CONFIG.GAME_WIDTH * 0.6, y: CONFIG.GAME_HEIGHT * 0.7 },
                    description: 'A sacred shrine holding secrets of the ancestors'
                },
                // Episode 3 Locations
                'sacred-grove': {
                    name: 'Sacred Grove',
                    image: 'Sacred Grove',
                    unlocked: false,
                    episode: 3,
                    position: { x: CONFIG.GAME_WIDTH * 0.8, y: CONFIG.GAME_HEIGHT * 0.7 },
                    description: 'A mystical forest where the physical and spirit realms intertwine'
                }
            }
        };
    }

    createMapView(realm) {
        const mapContainer = new PIXI.Container();
        
        // Create map background with gradient
        const background = new PIXI.Graphics();
        background.beginFill(realm === 'spirit' ? 0x2c0a4a : 0x0a2c0a);
        background.drawRect(0, 0, CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT);
        background.endFill();
        mapContainer.addChild(background);

        // Add decorative elements
        this.addDecorations(mapContainer, realm);

        // Add realm title
        const title = new PIXI.Text(realm === 'spirit' ? 'Spirit Realm' : 'Physical Realm', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xffffff,
            align: 'center'
        });
        title.anchor.set(0.5, 0);
        title.position.set(CONFIG.GAME_WIDTH / 2, 30);
        mapContainer.addChild(title);

        // Create location markers
        Object.entries(this.locations[realm]).forEach(([id, location]) => {
            const marker = this.createLocationMarker(id, location, realm);
            mapContainer.addChild(marker);
        });

        // Add realm switch button
        const switchButton = new PIXI.Text(`Switch to ${realm === 'spirit' ? 'Physical' : 'Spirit'} Realm`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffff00
        });
        switchButton.anchor.set(0.5);
        switchButton.position.set(CONFIG.GAME_WIDTH - 150, CONFIG.GAME_HEIGHT - 30);
        switchButton.interactive = true;
        switchButton.cursor = 'pointer';
        switchButton.on('pointerdown', () => this.game.switchRealm());
        mapContainer.addChild(switchButton);

        return mapContainer;
    }

    createLocationMarker(id, location, realm) {
        const marker = new PIXI.Container();
        marker.position.set(location.position.x, location.position.y);

        // Create marker background
        const circle = new PIXI.Graphics();
        if (location.unlocked) {
            circle.lineStyle(3, 0xffffff);
            circle.beginFill(realm === 'spirit' ? 0x4a0099 : 0x006400);
        } else {
            circle.lineStyle(2, 0x666666);
            circle.beginFill(0x333333);
        }
        circle.drawCircle(0, 0, 20);
        circle.endFill();

        // Add episode number
        const episodeText = new PIXI.Text(location.episode.toString(), {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: location.unlocked ? 0xffffff : 0x666666
        });
        episodeText.anchor.set(0.5);

        // Create location name text
        const nameText = new PIXI.Text(location.name, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: location.unlocked ? 0xffffff : 0x666666,
            align: 'center'
        });
        nameText.anchor.set(0.5);
        nameText.position.set(0, -35);

        // Create description text (only visible when unlocked)
        if (location.unlocked) {
            const descText = new PIXI.Text(location.description, {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: 0xcccccc,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: 150
            });
            descText.anchor.set(0.5);
            descText.position.set(0, 50);
            marker.addChild(descText);
        }

        marker.addChild(circle);
        marker.addChild(episodeText);
        marker.addChild(nameText);

        if (location.unlocked) {
            marker.interactive = true;
            marker.cursor = 'pointer';
            marker.on('pointerdown', () => this.onLocationSelected(realm, id));
            
            // Add hover effects
            marker.on('pointerover', () => {
                circle.tint = 0xffff00;
                nameText.style.fill = 0xffff00;
            });
            marker.on('pointerout', () => {
                circle.tint = 0xffffff;
                nameText.style.fill = 0xffffff;
            });
        }

        return marker;
    }

    addDecorations(container, realm) {
        // Add realm-specific decorative elements
        const graphics = new PIXI.Graphics();
        
        if (realm === 'spirit') {
            // Add mystical patterns for spirit realm
            for (let i = 0; i < 15; i++) {
                graphics.lineStyle(2, 0x4a0099, 0.3);
                // Create pentagon-like shape for mystical effect
                const centerX = Math.random() * CONFIG.GAME_WIDTH;
                const centerY = Math.random() * CONFIG.GAME_HEIGHT;
                const radius = Math.random() * 20 + 10;
                const points = 5;
                
                graphics.moveTo(
                    centerX + radius * Math.cos(0),
                    centerY + radius * Math.sin(0)
                );
                
                for (let j = 1; j <= points; j++) {
                    const angle = (j * 2 * Math.PI) / points;
                    graphics.lineTo(
                        centerX + radius * Math.cos(angle),
                        centerY + radius * Math.sin(angle)
                    );
                }
                graphics.closePath();
            }
        } else {
            // Add natural patterns for physical realm
            for (let i = 0; i < 15; i++) {
                graphics.lineStyle(2, 0x006400, 0.3);
                // Create leaf-like shapes
                const centerX = Math.random() * CONFIG.GAME_WIDTH;
                const centerY = Math.random() * CONFIG.GAME_HEIGHT;
                const radius = Math.random() * 30 + 10;
                
                graphics.beginFill(0x006400, 0.1);
                graphics.arc(centerX, centerY, radius, 0, Math.PI * 0.8);
                graphics.endFill();
                
                graphics.beginFill(0x006400, 0.1);
                graphics.arc(centerX, centerY, radius, Math.PI, Math.PI * 1.8);
                graphics.endFill();
            }
        }
        
        container.addChild(graphics);
    }

    onLocationSelected(realm, locationId) {
        const location = this.locations[realm][locationId];
        if (location && location.unlocked) {
            this.currentLocation = locationId;
            this.game.loadLocation(realm, locationId);
        }
    }

    unlockLocation(realm, locationId) {
        if (this.locations[realm][locationId]) {
            this.locations[realm][locationId].unlocked = true;
            // Save progress
            this.game.saveGame();
        }
    }

    getCurrentLocation() {
        return this.currentLocation;
    }

    getLocationData(realm, locationId) {
        return this.locations[realm][locationId];
    }
}
