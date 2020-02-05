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
     * @param {Object} e 
     * @param {Object} e.data 
     * @param {number} e.data.maxWidth
     * @param {number} e.data.maxHeight
     * @param {number} e.data.safeWidth
     * @param {number} e.data.safeHeight
     * @param {Object} e.data.position
     * @param {number} e.data.position.x
     * @param {number} e.data.position.y
     * @param {Object} e.data.direction
     * @param {number} e.data.direction.x
     * @param {number} e.data.direction.y
     */
    onDemoVariableChange(e) {
        this.resolutions.maxWidth = getValue(e, "data.maxWidth", DEFAULTS.resolutions.maxWidth);
        this.resolutions.maxHeight = getValue(e, "data.maxHeight", DEFAULTS.resolutions.maxHeight);
        this.resolutions.safeWidth = getValue(e, "data.safeWidth", DEFAULTS.resolutions.safeWidth);
        this.resolutions.safeHeight = getValue(e, "data.safeHeight", DEFAULTS.resolutions.safeHeight);
        
        this.anchor.direction.x = getValue(e, "data.direction.x", DEFAULTS.anchor.direction.x);
        this.anchor.direction.y = getValue(e, "data.direction.y", DEFAULTS.anchor.direction.y);
        this.anchor.position.x = getValue(e, "data.position.x", DEFAULTS.anchor.position.x);
        this.anchor.position.y = getValue(e, "data.position.y", DEFAULTS.anchor.position.y);

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
     * @param {Object} e 
     * @param {Object} e.data 
     * @param {Object} e.data.position
     * @param {number} e.data.position.x
     * @param {number} e.data.position.y
     * @param {Object} e.data.direction
     * @param {number} e.data.direction.x
     * @param {number} e.data.direction.y
     */
    onDemoAnchorChange(e) {
        this.anchor.direction.x = getValue(e, "data.direction.x", DEFAULTS.anchor.direction.x);
        this.anchor.direction.y = getValue(e, "data.direction.y", DEFAULTS.anchor.direction.y);
        this.anchor.position.x = getValue(e, "data.position.x", DEFAULTS.anchor.position.x);
        this.anchor.position.y = getValue(e, "data.position.y", DEFAULTS.anchor.position.y);

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

function getValue(obj, pathToValue, defaultValue) {
    const exists = (val) => val !== undefined && val !== null;

    let i = obj;
    let j;

    pathToValue = pathToValue.split(".");
    while (pathToValue.length > 0) {
        j = pathToValue.shift();
        if (!exists(i) || !exists(j) || !exists(i[j])) {
            return defaultValue;
        }
        i = i[j];
    }
    return i;
}