export class Menu extends Phaser.Scene {

    constructor() {
        super({key: 'Menu', active: true});
    }

    preload() {
        // menu background
        this.load.image('menuBG', 'assets/kenney_ui-pack/PNG/Yellow/Double/button_rectangle_line.png');
        this.load.image('menuWater', 'assets/water.png');

        // button images
        this.load.image('startButton', 'assets/kenney_ui-pack/PNG/Yellow/Double/button_rectangle_depth_flat.png');
        this.load.image('startButtonPress', 'assets/kenney_ui-pack/PNG/Yellow/Double/button_rectangle_flat.png');

        // demo spites
        this.load.image('playerBoatDemo', 'assets/kenney_tiny-battle/Tiles/tile_0177.png')
        this.load.image('playerProjectileDemo', 'assets/kenney_tiny-battle/Tiles/tile_0198.png');
        this.load.image('playerProjectileDemo', 'assets/kenney_tiny-battle/Tiles/tile_0198.png');

        // demo buttons
        this.load.image('wKey', 'assets/kenney_input-prompts_1.4/Keyboard & Mouse/Double/keyboard_w.png');
        this.load.image('wKeyPress', 'assets/kenney_input-prompts_1.4/Keyboard & Mouse/Double/keyboard_w_outline.png');
        this.load.image('upKey', 'assets/kenney_input-prompts_1.4/Keyboard & Mouse/Double/keyboard_arrow_up.png');
        this.load.image('upKeyPress', 'assets/kenney_input-prompts_1.4/Keyboard & Mouse/Double/keyboard_arrow_up_outline.png');
        this.load.image('sKey', 'assets/kenney_input-prompts_1.4/Keyboard & Mouse/Double/keyboard_s.png');
        this.load.image('sKeyPress', 'assets/kenney_input-prompts_1.4/Keyboard & Mouse/Double/keyboard_s_outline.png');
        this.load.image('downKey', 'assets/kenney_input-prompts_1.4/Keyboard & Mouse/Double/keyboard_arrow_down.png');
        this.load.image('downKeyPress', 'assets/kenney_input-prompts_1.4/Keyboard & Mouse/Double/keyboard_arrow_down_outline.png');
        this.load.image('spaceBar', 'assets/kenney_input-prompts_1.4/Keyboard & Mouse/Double/keyboard_space.png');
        this.load.image('spaceBarPress', 'assets/kenney_input-prompts_1.4/Keyboard & Mouse/Double/keyboard_space_outline.png');

        // click sound
        this.load.audio('clickSound', 'assets/kenney_interface-sounds/Audio/click_002.ogg');
    }

    create() {
        const {width, height} = this.scale;

        // grab reference to ui scene
        let uiScene = this.scene.get('UIScene');

        // menu group
        this.menuGroup = this.add.group("menuGroup");

        // menu background - put on back
        this.menuBG = this.add.nineslice(width / 2, height / 2, 'menuBG', 0, 1200, 640, 16, 16, 16, 16).setScale(1).setAlpha(0.9);
        this.menuGroup.add(this.menuBG);

        // water in menu for demo
        this.menuWater1 = this.add.image(width / 3 - 70, height / 2, 'menuWater').setScale(0.8, 0.5);
        this.menuWater2 = this.add.image(width * 2 / 3 + 70, height / 2, 'menuWater').setScale(0.8, 0.5);
        this.menuGroup.add(this.menuWater1);
        this.menuGroup.add(this.menuWater2);

        // objects for player demo
        this.playerDemoPath = this.add.path(width / 3 - 200, height / 2);
        this.playerDemoPath.lineTo(width / 3 - 200, height / 2 - 90);
        this.playerDemoPath.lineTo(width / 3 - 200, height / 2 + 90);
        this.playerDemoPath.lineTo(width / 3 - 200, height / 2);

        this.playerDemo1 = this.add.follower(this.playerDemoPath, width / 3 - 200, height / 2, 'playerBoat').setScale(3);
        this.playerDemo2 = this.add.image(width * 2 / 3 - 60, height / 2, 'playerBoat').setScale(3);
        this.menuGroup.add(this.playerDemo1);
        this.menuGroup.add(this.playerDemo2);

        this.movementTimer = 2000;

        this.playerProjectileDemo1 = this.add.image(-100, -100, 'playerProjectileDemo').setScale(1.5);
        this.playerProjectileDemo2 = this.add.image(-100, -100, 'playerProjectileDemo').setScale(1.5);
        this.menuGroup.add(this.playerProjectileDemo1);
        this.menuGroup.add(this.playerProjectileDemo2);

        this.playerProjectileDemo1.moving = false;
        this.playerProjectileDemo2.moving = false;
        this.projectileSpeed1 = 150;
        this.projectileSpeed2 = 150;
        this.projectileAcceleration = 300;
        this.projectileTimer = 3000;

        this.wDemo = this.add.image(width / 3 - 70, height / 2 - 50, 'wKey').setScale(0.75);
        this.upDemo = this.add.image(width / 3 + 20, height / 2 - 50, 'upKey').setScale(0.75);
        this.sDemo = this.add.image(width / 3 - 70, height / 2 + 50, 'sKey').setScale(0.75);
        this.downDemo = this.add.image(width / 3 + 20, height / 2 + 50, 'downKey').setScale(0.75);
        this.spaceDemo = this.add.image(width * 2 / 3 + 70, height / 2 + 70, 'spaceBar');
        this.menuGroup.add(this.wDemo);
        this.menuGroup.add(this.upDemo);
        this.menuGroup.add(this.sDemo);
        this.menuGroup.add(this.downDemo);
        this.menuGroup.add(this.spaceDemo);

        // menu button
        this.menuButton = this.add.image(width / 2, height / 2 + 220, 'startButton').setScale(0.75);
        this.menuButton.setInteractive();
        this.menuGroup.add(this.menuButton);

        this.clickSound = this.sound.add('clickSound');
        this.clickSound.setVolume(0.5);

        // text boxes
        this.header = this.add.text(width / 2 - 200, height / 6 - 40, 'Ready?');
        this.header.setAlign('center');
        this.header.setFontSize(120);
        this.header.setColor('#000000');
        this.menuGroup.add(this.header);

        this.buttonText = this.add.text(width / 2 - 110, height * 3 / 4 + 10, 'Start!');
        this.buttonText.setAlign('center');
        this.buttonText.setFontSize(64);
        this.buttonText.setColor('#000000');
        this.menuGroup.add(this.buttonText);

        this.menuButton.once('pointerdown', () =>
        {
            this.menuButton.setTexture('startButtonPress');
            this.menuButton.tint = 0xf2cd3a;
            this.clickSound.play();
        });

        this.menuButton.once('pointerup', () =>
        {
            this.menuButton.setTexture('startButton');
            this.menuButton.tint = 0xffffff;
            this.startGame();
        });

        // flag for checking if game started
        this.started = false;
        this.moveMenu = true;
        this.speed = 100;
        this.acceleration = 300;

        uiScene.events.on('resetGame', () =>
        {
            this.events.emit('startGame');
        }, this);
    }

    update(time, dTime) {
        // move menu after starting
        if (this.started && this.moveMenu)
        {
            this.menuBG.y += this.speed * dTime / 1000;
            this.speed -= this.acceleration * dTime / 1000;
        }

        // movement demo
        if (!this.started && time >= this.movementTimer)
        {
            this.moveDemo();
            this.movementTimer += 5000;
        }

        // projectile demo
        if (!this.started && time >= this.projectileTimer)
        {
            this.fireDemo();
            this.projectileTimer += 3000;
        }

        if (!this.started && this.playerProjectileDemo1.moving)
        {
            this.playerProjectileDemo1.x += this.projectileSpeed1 * dTime / 1000;
            this.projectileSpeed1 += this.acceleration * dTime / 1000;
        }

        if (!this.started && this.playerProjectileDemo2.moving)
        {
            this.playerProjectileDemo2.x += this.projectileSpeed2 * dTime / 1000;
            this.projectileSpeed2 += this.acceleration * dTime / 1000;
        }
    }

    fireDemo() {
        // space bar visual
        this.spaceDemo.setTexture('spaceBarPress');
        this.time.delayedCall(1200, () =>
        {
            this.spaceDemo.setTexture('spaceBar');
        })

        this.playerProjectileDemo1.x = this.playerDemo2.x + 24;
        this.playerProjectileDemo1.y = this.playerDemo2.y;
        this.playerProjectileDemo1.moving = true;
        
        // delay before second projectile
        this.time.delayedCall(500, () =>
        {
            this.playerProjectileDemo2.x = this.playerDemo2.x + 24;
            this.playerProjectileDemo2.y = this.playerDemo2.y;
            this.playerProjectileDemo2.moving = true;
        });

        // delay before removing first projectile
        this.time.delayedCall(1000, () =>
        {
            this.playerProjectileDemo1.x = -100;
            this.playerProjectileDemo1.y = -100;
            this.playerProjectileDemo1.moving = false;
            this.projectileSpeed1 = 150;
        });

        // delay before removing second projectile
        this.time.delayedCall(1500, () =>
        {
            this.playerProjectileDemo2.x = -100;
            this.playerProjectileDemo2.y = -100;
            this.playerProjectileDemo2.moving = false;
            this.projectileSpeed2 = 150;
        });
    }

    moveDemo() {
        // initial
        this.wDemo.setTexture('wKeyPress');
        this.upDemo.setTexture('upKeyPress');

        this.playerDemo1.startFollow({
            positionOnPath: true,
            duration: 3200,
            yoyo: false,
            rotateToPath: false
        });

        // go down
        this.time.delayedCall(800, () =>
        {
            this.wDemo.setTexture('wKey');
            this.upDemo.setTexture('upKey');
            this.sDemo.setTexture('sKeyPress');
            this.downDemo.setTexture('downKeyPress');
        });

        // go up again
        this.time.delayedCall(3 * 800, () =>
        {
            this.wDemo.setTexture('wKeyPress');
            this.upDemo.setTexture('upKeyPress');
            this.sDemo.setTexture('sKey');
            this.downDemo.setTexture('downKey');
        });

        //stop
        this.time.delayedCall(4 * 800, () =>
        {
            this.wDemo.setTexture('wKey');
            this.upDemo.setTexture('upKey');
        });
    }

    startGame() {
        if (!this.started)
        {
            this.menuGroup.toggleVisible();
            this.menuBG.setVisible(true);
            this.time.delayedCall(3000, () =>
            {
                this.events.emit('startGame');
            })
        }
        this.started = true;
        this.time.delayedCall(4000, () =>
        {
            this.moveMenu = false;
        });
    }
}