export class UIScene extends Phaser.Scene {

    constructor() {
        super({key: 'UIScene', active: true});
    }

    preload() {
        // ui assets
        this.load.image('progressBarEmpty', 'assets/kenney_ui-pack/PNG/Yellow/Double/slide_horizontal_grey.png');
        this.load.image('progressMarkFlag', 'assets/kenney_tiny-battle/Tiles/tile_0088.png');
        this.load.image('progressMarkCircle', 'assets/kenney_ui-pack/PNG/Yellow/Double/icon_outline_circle.png');

    }

    create() {
        const {width, height} = this.scale;

        // grab reference to Start scene
        let startScene = this.scene.get('Start');

        // hp bar
        this.hp = 5;

        // progress bar
        this.progressBarEmpty = this.add.sprite(width / 2, 64, 'progressBarEmpty');
        this.progressMarkFlag = this.add.sprite(width / 2 - 72, 40, 'progressMarkFlag').setScale(2);
        this.progressMarkCircle = this.add.sprite(width / 2 - 80, 64, 'progressMarkCircle');
        this.levelStart = -1;
        this.levelProgress = 0;
        this.levelLength = 30000;
        this.gameOver = false;

        startScene.events.on('waveStart', (timer) =>
        {
            console.log("Timer: " + timer); // debug
            this.startCurrentWave(timer);
        }, this);

        startScene.events.on('loseHP', () =>
        {
            if (this.hp > 0)
            {
                this.hp--;
            }
        }, this);

        startScene.events.on('regainHP', () =>
        {
            if (this.hp < 5)
            {
                this.hp++;
            }
        }, this);

        startScene.events.on('gameOver', () =>
        {
            this.gameOver = true;
        });
    }

    update(time, dTime) {
        // update UI (progress)
        if (this.levelStart > 0 && !this.gameOver)
        {
            this.levelProgress = Math.min((time - this.levelStart) / this.levelLength, 1);
            this.progressMarkFlag.x = 1280 / 2 - 72 + this.levelProgress * 160;
            this.progressMarkCircle.x = 1280 / 2 - 80 + this.levelProgress * 160;
        }
    }

    startCurrentWave(levelLength) {
        console.log("Starting Wave!"); // debug
        this.levelStart = this.time.now;
        this.levelLength = levelLength;
    }
}