import { Application, SafeScaleManager } from 'springroll';
import { GameScene } from './Scenes/GameScene';

const DEFAULTS = {
    resolutions: {
        maxWidth: 1320,
        maxHeight: 780,
        safeWidth: 1024,
        safeHeight: 660
    },
    anchor: {
        position: { x: 0, y: 0 },
        direction: { x: 0, y: 0 }
    }
}

export class Demo {
    constructor() {
        // Instance of Springroll.Appliction
        this.app = new Application();
        // Instance of a Springroll.SafeScaleManager
        this.safeScale = undefined;
        // Instance of Phaser.Game
        this.game = undefined;
        // Reference to the resolutions being used for the demo.
        this.resolutions = Object.assign({}, DEFAULTS.resolutions);
        // Reference to the demo anchor variables.
        this.anchor = Object.assign({}, DEFAULTS.anchor);

        // Listen for the application's ready event.
        this.app.state.ready.subscribe(this.onAppReady.bind(this));
    }

    /**
     * Handler for Springroll.Application's ready event.
     * @param {boolean} isReady 
     */
    onAppReady(isReady) {
        if (isReady) {
            // Listen for the applyChange event from the container.
            this.app.container.on("applyChanges", this.onDemoVariableChange.bind(this));
            // Listen for the updateAnchor event from the container
            this.app.container.on("updateAnchor", this.onDemoAnchorChange.bind(this));

            // First initialization of the game.
            this.initializeGame();

            // Create an instance of the Springroll.SafeScaleManager
            this.safeScale = new SafeScaleManager({
                width: this.resolutions.maxWidth,
                height: this.resolutions.maxHeight,
                safeWidth: this.resolutions.safeWidth,
                safeHeight: this.resolutions.safeHeight,
                callback: this.onSafeScaleResize.bind(this)
            });
        }
    }

    /**
     * Handler for when the demo variables are update in the container.
     * This event handler will destroy and reinitialize the Phaser.Game instance.
     * @param {Object.<string, number>} e 
     */
    onDemoVariableChange(e) {
        e = e || {};
        
        // Make sure there is data to work with.
        const data = e.data || Object.assign({}, DEFAULTS.resolutions);

        // Update references of the demo resolutions.
        this.resolutions.maxWidth = data.maxWidth || DEFAULTS.resolutions.maxWidth;
        this.resolutions.maxHeight = data.maxHeight || DEFAULTS.resolutions.maxHeight;
        this.resolutions.safeWidth = data.safeWidth || DEFAULTS.resolutions.safeWidth;
        this.resolutions.safeHeight = data.safeHeight || DEFAULTS.resolutions.safeHeight;

        // Update references to the demo anchor.
        this.anchor.direction = data.direction || DEFAULTS.anchor.direction;
        this.anchor.position = data.position || DEFAULTS.anchor.position;

        this.validateResolutions();

        // Update the SafeScaleManager's resolution variables.
        this.safeScale.gameWidth = this.resolutions.maxWidth;
        this.safeScale.gameHeight = this.resolutions.maxHeight;
        this.safeScale.safeWidth = this.resolutions.safeWidth;
        this.safeScale.safeHeight = this.resolutions.safeHeight;

        // Initialize a new game with the updated resolutions.
        this.initializeGame();
    }

    /**
     * Handler for when the demo anchor variables are update in the container.
     * This event handler will dispatch an updateAnchor event to the Phaser.Game instance.
     * @param {Object.<string, number>} e 
     */
    onDemoAnchorChange(e) {
        e = e || {};

        // Sanitize the data coming from the container.
        const data = e.data || Object.assign({}, DEFAULTS.anchor);

        data.direction = data.direction || DEFAULTS.anchor.direction;
        data.position = data.position || DEFAULTS.anchor.position;

        this.anchor.direction.x = data.direction.x || DEFAULTS.anchor.direction.x;
        this.anchor.direction.y = data.direction.y || DEFAULTS.anchor.direction.y;
        this.anchor.position.x = data.position.x || DEFAULTS.anchor.position.x;
        this.anchor.position.y = data.position.y || DEFAULTS.anchor.position.y;

        // If the game has been initialized, then forward the updateAnchor event.
        if (this.game !== undefined) {
            this.game.events.emit("updateAnchor");
            // Force a window resize event so the anchors refresh.
            window.dispatchEvent(new Event("resize"));
        }
    }

    /**
     * Handler for when the SafeScaleManager detects a resize event on the window.
     * @param {*} param0 
     */
    onSafeScaleResize({ scaleRatio }) {
        if (!this.game || !this.game.canvas) {
            return;
        }

        // Scale the size of the game canvas based off the ratio provided by the SafeScaleManager.
        this.game.canvas.style.width = `${this.resolutions.maxWidth * scaleRatio}px`;
        this.game.canvas.style.height = `${this.resolutions.maxHeight * scaleRatio}px`;
    }

    /**
     * Initializes a new Phaser.Game instance.
     */
    initializeGame() {
        if (this.game !== undefined) {
            this.game.destroy(true);
        }

        // Create a new game at the max resolution.
        this.game = new Phaser.Game({
            width: this.resolutions.maxWidth,
            height: this.resolutions.maxHeight,
            scene: GameScene
        });

        // Force a window resize event.
        window.dispatchEvent(new Event("resize"));
    }

    /**
     * Processes the changed demo resolutions to make sure the max resolution is larger than the safe resolution.
     */
    validateResolutions() {
        // Note: These min/max checks happen in the SafeScaleManager constructor.
        //       However because we don't create a new safe scale manager, we need to manually
        //       do these checks when the demo resolutions change.

        const maxWidth = Math.max(this.resolutions.maxWidth, this.resolutions.safeWidth);
        const maxHeight = Math.max(this.resolutions.maxHeight, this.resolutions.safeHeight);
        const minWidth = Math.min(this.resolutions.maxWidth, this.resolutions.safeWidth);
        const minHeight = Math.min(this.resolutions.maxHeight, this.resolutions.safeHeight);

        this.resolutions.maxWidth = maxWidth;
        this.resolutions.maxHeight = maxHeight;
        this.resolutions.safeWidth = minWidth;
        this.resolutions.safeHeight = minHeight;
    }
}