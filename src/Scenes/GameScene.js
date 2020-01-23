import { demo } from "..";
import { Anchor } from "springroll";

export class GameScene extends Phaser.Scene {
    create() {
        this.resolutionArea = this.add.graphics();

        const max = { x: demo.resolutions.maxWidth, y: demo.resolutions.maxHeight };
        const min = { x: demo.resolutions.safeWidth, y: demo.resolutions.safeHeight };
        
        // Draw the min/max resolution areas.
        this.resolutionArea.lineStyle(2, 0xff0000);
        this.resolutionArea.strokeRect(1, 1, max.x - 2, max.y - 2);
        this.resolutionArea.lineStyle(2, 0x00ff00, 0.5);
        this.resolutionArea.strokeRect(1 + (max.x - min.x) / 2, 1 + (max.y - min.y) / 2, (min.x - 1) - 2, (min.y - 1) - 2);

        // Display the screen resolutions.
        this.resolutionDisplay = this.add.text(0, 0, this.getResolutionText(), { color: "#ffffff" });

        // Setup an anchor to the top left of the viewable game area.
        // This will be used to position the resolution text.
        this.textAnchor = new Anchor({
            position: { x: 10, y: 10 },
            direction: { x: -1, y: -1 },
            callback: this.onTextAnchorResize.bind(this)
        });

        demo.safeScale.addEntity(this.textAnchor);

        // Listen for destroy instead of shutdown because the demo destroys the game.
        this.events.on("destroy", this.destroy, this);
    }

    destroy() {
        demo.safeScale.removeEntity(this.textAnchor);

        this.resolutionDisplay = undefined;
        this.textAnchor = null;
    }

    onTextAnchorResize({ x, y }) {
        // Update the text position and the resolutions it shows.
        this.resolutionDisplay.x = x;
        this.resolutionDisplay.y = y;
        this.resolutionDisplay.text = this.getResolutionText();
    }

    getResolutionText() {
        return (
            `Game Width: ${demo.resolutions.maxWidth}\n` +
            `Game Height: ${demo.resolutions.maxHeight}\n\n` +
            `Safe Width: ${demo.resolutions.safeWidth}\n` +
            `Safe Height: ${demo.resolutions.safeHeight}\n\n` +
            `Window Width: ${window.innerWidth}\n` +
            `Window Height: ${window.innerHeight}\n`
        );
    }
}