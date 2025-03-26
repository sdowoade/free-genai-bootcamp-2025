class AssetGenerator {
    static generateLocationImage(color) {
        const canvas = document.createElement('canvas');
        canvas.width = CONFIG.GAME_WIDTH;
        canvas.height = CONFIG.GAME_HEIGHT;
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some visual elements
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 100 + 50;
            ctx.fillRect(x, y, size, size);
        }
        
        return canvas.toDataURL();
    }

    static generateAllLocationImages() {
        // Spirit realm locations
        PIXI.Assets.add('Ọbàtálá\'s Garden of Creation', this.generateLocationImage('#4a148c'));
        PIXI.Assets.add('Spirit Crossroads', this.generateLocationImage('#6a1b9a'));
        PIXI.Assets.add('Sàngó\'s Thunder Temple', this.generateLocationImage('#7b1fa2'));
        PIXI.Assets.add('Ọ̀ṣun\'s Sacred River', this.generateLocationImage('#8e24aa'));

        // Physical realm locations
        PIXI.Assets.add('Village Center', this.generateLocationImage('#1b5e20'));
        PIXI.Assets.add('Elder\'s Hut', this.generateLocationImage('#2e7d32'));
        PIXI.Assets.add('Marketplace', this.generateLocationImage('#388e3c'));
        PIXI.Assets.add('Ancient Shrine', this.generateLocationImage('#43a047'));
    }
}
