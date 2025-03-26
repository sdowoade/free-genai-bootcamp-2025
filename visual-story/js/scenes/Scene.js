class Scene extends PIXI.Container {
    constructor(game) {
        super();
        this.game = game;
    }

    init() {
        // Initialize scene
    }

    update(delta) {
        // Update scene logic
    }

    destroy() {
        super.destroy({ children: true });
    }
}
