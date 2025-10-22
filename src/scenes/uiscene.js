export class UIScene extends Phaser.Scene {

    constructor() {
        super({key: 'UIScene', active: true});
    }

    preload() {
        // ui assets

        // score elements
        this.load.image('scoreBG', 'assets/kenney_ui-pack/PNG/Yellow/Double/button_rectangle_border.png');

        // hp elements
        this.load.image('hpFill', 'assets/kenney_ui-pack/PNG/Yellow/Double/arrow_decorative_e.png');
        this.load.image('hpEmpty', 'assets/kenney_ui-pack/PNG/Yellow/Double/arrow_decorative_e.png');

        // progress bar
        this.load.image('progressBarEmpty', 'assets/kenney_ui-pack/PNG/Yellow/Double/slide_horizontal_grey.png');
        this.load.image('progressMarkFlag', 'assets/kenney_tiny-battle/Tiles/tile_0088.png');
        this.load.image('progressMarkCircle', 'assets/kenney_ui-pack/PNG/Yellow/Double/icon_outline_circle.png');
    }

    create() {
        const {width, height} = this.scale;

        // grab reference to Start scene
        let startScene = this.scene.get('Start');

        // score bar
        this.score = 0;
        this.scoreBar = this.add.nineslice(1075, 64, 'scoreBG', 0, 500, 120, 16, 16, 16, 16).setScale(0.75);
        this.scoreText = this.add.text(910, 45, 'Score: ' + this.score);
        this.scoreText.setFontSize(48);
        this.scoreText.setColor('#000000');

        // hp bar
        this.hp = 5;
        this.hpBar = [];
        for (var i = 0; i < this.hp; i++)
        {
            let hpTempIcon = this.add.image(48 + 72 * i, 48, 'hpFill');
            this.hpBar.push(hpTempIcon);
        }

        // progress bar
        this.progressBarEmpty = this.add.image(width / 2, 64, 'progressBarEmpty');
        this.progressMarkFlag = this.add.image(width / 2 - 72, 40, 'progressMarkFlag').setScale(2);
        this.progressMarkCircle = this.add.image(width / 2 - 80, 64, 'progressMarkCircle');
        this.levelStart = -1;
        this.levelProgress = 0;
        this.levelLength = 30000;
        this.gameOver = false;

        // wave start listener
        startScene.events.on('waveStart', (timer) =>
        {
            console.log("Timer: " + timer); // debug
            this.time.delayedCall(5000, this.startCurrentWave(timer));
        }, this);

        // taking damage listener
        startScene.events.on('loseHP', () =>
        {
            if (this.hp > 0)
            {
                this.hp--;
                this.hpBar[this.hp].setTexture('hpEmpty');
                this.hpBar[this.hp].setScale(1);
                if (this.hp <= 0)
                {
                    this.gameOver = true;
                }
            }
        }, this);

        // regaining hp listener
        startScene.events.on('regainHP', () =>
        {
            if (this.hp < 5)
            {
                this.hpBar[this.hp].setTexture('hpFIll');
                this.hpBar[this.hp - 1].setScale(1);
                this.hp++;
            }
        }, this);

        // adding score listener
        startScene.events.on('scoreAdd', (scoreAdd) =>
        {
            this.scoreUpdate(scoreAdd);
        });

        // game over listener
        startScene.events.on('gameOver', () =>
        {
            this.gameOver = true;
        });
    }

    update(time, dTime) {
        // update UI (hp)
        if (this.hp > 0)
        {
            this.hpBar[this.hp - 1].setScale(1.05 + 0.05 * Math.sin(time / 150));
        }

        // update UI (progress)
        if (this.levelStart > 0 && !this.gameOver)
        {
            this.levelProgress = Math.min((time - this.levelStart) / this.levelLength, 1);
            this.progressMarkFlag.x = 1280 / 2 - 72 + this.levelProgress * 160;
            this.progressMarkCircle.x = 1280 / 2 - 80 + this.levelProgress * 160;
        }
    }

    scoreUpdate(scoreValue) {
        this.score += scoreValue;
        this.scoreText.setText("Score: " + this.score);
    }

    startCurrentWave(levelLength) {
        console.log("Starting Wave!"); // debug
        this.levelStart = this.time.now;
        this.levelLength = levelLength;
    }
}