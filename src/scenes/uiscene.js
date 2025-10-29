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
        this.load.image('hpEmpty', 'assets/kenney_ui-pack/PNG/Yellow/Double/arrow_decorative_e_gray.png');

        // progress bar
        this.load.image('progressBarEmpty', 'assets/kenney_ui-pack/PNG/Yellow/Double/slide_horizontal_grey.png');
        this.load.image('progressMarkFlag', 'assets/kenney_tiny-battle/Tiles/tile_0088.png');
        this.load.image('progressMarkCircle', 'assets/kenney_ui-pack/PNG/Yellow/Double/icon_outline_circle.png');

        // restart button
        this.load.image('restartButton', 'assets/kenney_ui-pack/PNG/Yellow/Double/button_rectangle_depth_flat.png');
        this.load.image('restartButtonPress', 'assets/kenney_ui-pack/PNG/Yellow/Double/button_rectangle_flat.png');

        // click sound
        this.load.audio('clickSound', 'assets/kenney_interface-sounds/Audio/click_002.ogg');
    }

    create() {
        const {width, height} = this.scale;

        // grab reference to Start scene
        let startScene = this.scene.get('Start');

        // score bar
        this.score = 0;
        this.scoreBar = this.add.nineslice(1030, 64, 'scoreBG', 0, 600, 120, 16, 16, 16, 16).setScale(0.75);
        this.scoreText = this.add.text(830, 45, 'Score: ' + this.score);
        this.scoreText.setFontSize(45);
        this.scoreText.setColor('#000000');

        // high score
        this.highScore = 0;
        this.highScoreText = this.add.text(width / 2 - 170, height / 2 + 10, 'High Score: ' + this.highScore);
        this.highScoreText.setFontSize(36);
        this.highScoreText.setVisible(false);

        // hp bar
        this.hp = 5;
        this.hpBar = [];
        for (var i = 0; i < this.hp; i++)
        {
            let hpTempIcon = this.add.image(48 + 72 * i, 48, 'hpFill');
            this.hpBar.push(hpTempIcon);
        }

        // progress bar
        this.pathProgressFlag = this.add.path(width / 2 - 72, 40);
        this.pathProgressFlag.lineTo(width / 2 - 72 + 160, 40);
        this.pathProgressCircle = this.add.path(width / 2 - 80, 64);
        this.pathProgressCircle.lineTo(width / 2 - 80 + 160, 64);

        this.progressBarEmpty = this.add.image(width / 2, 64, 'progressBarEmpty');
        this.progressMarkFlag = this.add.follower(this.pathProgressFlag, width / 2 - 72, 40, 'progressMarkFlag').setScale(2);
        this.progressMarkCircle = this.add.follower(this.pathProgressCircle, width / 2 - 80, 64, 'progressMarkCircle');
        
        this.gameOver = false;

        // text for wave alert
        this.waveText = this.add.text(width / 2 - 320, height + 50, 'Wave 1 Starting!');
        this.waveText.setFontSize(64);
        this.waveText.moving = false;
        this.waveText.speed = 100;
        this.waveText.acceleration = 300;
        this.waveText.flashing = false;
        this.waveText.color = false;

        // text for game over
        this.gameOverText = this.add.text(width / 5 - 45, height / 3, 'Game Over!');
        this.gameOverText.setFontSize(144);
        this.gameOverText.setVisible(false);

        // text for winning
        this.winningText = this.add.text(width / 4 - 30, height / 3, 'You Win!');
        this.winningText.setFontSize(144);
        this.winningText.setVisible(false);

        this.restartButton = this.add.image(width / 2, height / 2 + 100, 'restartButton').setScale(0.75);
        this.restartButton.setVisible(false);

        this.clickSound = this.sound.add('clickSound');
        this.clickSound.setVolume(0.5);

        this.restartButton.once('pointerdown', () =>
        {
            this.restartButton.setTexture('startButtonPress');
            this.restartButton.tint = 0xf2cd3a;
            this.clickSound.play();
        });

        this.restartButton.once('pointerup', () =>
        {
            this.hp = 5;
            for (var i = 0; i < this.hp; i++)
            {
                this.hpBar[i].setTexture('hpFill');
            }

            this.winningText.setVisible(false);
            this.gameOverText.setVisible(false);
            this.restartText.setVisible(false);
            this.highScoreText.setVisible(false);

            this.restartButton.setTexture('startButton');
            this.restartButton.tint = 0xffffff;
            this.restartButton.setVisible(false);
            this.restartButton.disableInteractive();

            this.progressMarkFlag.stop();
            this.progressMarkCircle.stop();

            this.progressMarkFlag.x = 640 - 72;
            this.progressMarkCircle.x = 640 - 80;

            this.events.emit('resetGame');
        }, this);

        // text for restart prompt
        this.restartText = this.add.text(width / 3 + 100, height / 2 + 80, 'Restart?');
        this.restartText.setColor('#000000');
        this.restartText.setFontSize(48);
        this.restartText.setVisible(false);

        // wave start listener
        startScene.events.on('waveStart', (timer, waveNum) =>
        {
            // moving progress flag
            this.time.delayedCall(5000, this.startCurrentWave(timer - 5000));

            // declaring wave start
            this.waveText.setText('Wave ' + waveNum + ' Starting!');
            this.waveText.setFontSize(64);

            this.time.delayedCall(500, () =>
            {
                this.waveText.moving = true;
                this.waveText.flashing = true;
            });

            this.time.delayedCall(1500, () =>
            {
                this.waveText.moving = false;
                this.waveText.speed = 100;
            });

            this.time.delayedCall(6000, () =>
            {
                this.waveText.flashing = false;
                this.waveText.y = height + 50;
            });
        }, this);

        // boss start listener
        startScene.events.on('bossStart', () =>
        {
            // declaring boss start
            this.waveText.setText('Incoming Boss!');
            this.waveText.setFontSize(76);

            this.time.delayedCall(500, () =>
            {
                this.waveText.moving = true;
                this.waveText.flashing = true;
            });

            this.time.delayedCall(1500, () =>
            {
                this.waveText.moving = false;
                this.waveText.speed = 100;
            });

            this.time.delayedCall(6000, () =>
            {
                this.waveText.flashing = false;
                this.waveText.y = height + 50;
            });
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
                    if (this.score > this.highScore)
                    {
                        this.highScore = this.score;
                        this.highScoreText.setText('High Score: ' + this.highScore);
                    }
                    this.highScoreText.setVisible(true);

                    this.gameOver = true;
                    this.gameOverText.setVisible(true);
                    this.restartButton.setVisible(true);
                    this.restartText.setVisible(true);
                    this.restartButton.setInteractive();
                }
            }
        }, this);

        // regaining hp listener
        startScene.events.on('regainHP', () =>
        {
            if (this.hp < 5)
            {
                this.hpBar[this.hp].setTexture('hpFill');
                this.hpBar[this.hp - 1].setScale(1);
                this.hp++;
            }
        }, this);

        // adding score listener
        startScene.events.on('scoreAdd', (scoreAdd) =>
        {
            this.scoreUpdate(scoreAdd);
        });

        startScene.events.on('scoreReset', () =>
        {
            this.score = 0;
            this.scoreText.setText("Score: " + this.score);
        });

        // game over listener
        startScene.events.on('gameOver', () =>
        {
            this.gameOver = true;

            this.progressMarkFlag.pauseFollow();
            this.progressMarkCircle.pauseFollow();
        });

        // game complete listener
        startScene.events.on('gameComplete', () =>
        {
            if (this.score > this.highScore)
            {
                this.highScore = this.score;
                this.highScoreText.setText('High Score: ' + this.highScore);
            }
            this.highScoreText.setVisible(true);

            this.winningText.setVisible(true);
            this.restartButton.setVisible(true);
            this.restartText.setVisible(true);
            this.restartButton.setInteractive();
        });
    }

    update(time, dTime) {
        // update UI (hp)
        if (this.hp > 0)
        {
            this.hpBar[this.hp - 1].setScale(1.05 + 0.05 * Math.sin(time / 150));
        }

        // move wave text
        if (this.waveText.moving)
        {
            this.waveText.y -= this.waveText.speed * dTime / 1000;
            this.waveText.speed += this.waveText.acceleration * dTime / 1000;
        }

        // flash wave text color
        if (this.waveText.flashing && !this.waveText.color)
        {
            this.waveText.color = true;
            this.waveText.setColor('#ff0000');
            this.time.delayedCall(500, () =>
            {
                this.waveText.setColor('#ffffff');
                this.time.delayedCall(500, () =>
                {
                    this.waveText.color = false;
                });
            });
        }
    }

    // update the score after enemy is defeated
    scoreUpdate(scoreValue) {
        if (!this.gameOver)
        {
            this.score += scoreValue;
        }
        this.scoreText.setText("Score: " + this.score);
    }

    // start moving progress bar
    startCurrentWave(levelLength) {

        this.time.delayedCall(5000, () =>
        {
            this.progressMarkFlag.startFollow({
                positionOnPath: true,
                duration: levelLength - 5000,
                yoyo: false,
                repeat: 0,
                rotateToPath: false
            });

            this.progressMarkCircle.startFollow({
                positionOnPath: true,
                duration: levelLength - 5000,
                yoyo: false,
                repeat: 0,
                rotateToPath: false
            });
        });

        this.gameOver = false;
    }
}