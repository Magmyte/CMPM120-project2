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
    }

    create() {
        const {width, height} = this.scale;

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
        this.playerDemo1 = this.add.image(width / 3 - 160, height / 2, 'playerBoat').setScale(3);
        this.playerDemo2 = this.add.image(width * 2 / 3 - 20, height / 2, 'playerBoat').setScale(3);
        this.menuGroup.add(this.playerDemo1);
        this.menuGroup.add(this.playerDemo2);

        this.playerProjectileDemo1 = this.add.image(-100, -100, 'playerProjectileDemo');
        this.playerProjectileDemo2 = this.add.image(-100, -100, 'playerProjectileDemo');
        this.menuGroup.add(this.playerProjectileDemo1);
        this.menuGroup.add(this.playerProjectileDemo2);

        this.playerProjectileDemo1.moving = false;
        this.playerProjectileDemo2.moving = false;
        this.projectileSpeed1 = 150;
        this.projectileSpeed2 = 150;
        this.projectileAcceleration = 300;

        // menu button
        this.menuButton = this.add.image(width / 2, height / 2 + 220, 'startButton').setScale(0.75);
        this.menuButton.setInteractive();
        this.menuGroup.add(this.menuButton);

        this.menuButton.once('pointerdown', () =>
        {
            this.menuButton.setTexture('startButtonPress');
            this.menuButton.tint = 0xf2cd3a;
        });

        this.menuButton.once('pointerup', () =>
        {
            this.menuButton.setTexture('startButton');
            this.menuButton.tint = 0xffffff;
            this.startGame(), this
        });

        // flag for checking if game started
        this.started = false;
        this.moveMenu = true;
        this.speed = 100;
        this.acceleration = 300;
    }

    update(time, dTime) {
        if (this.started && this.moveMenu)
        {
            this.menuBG.y += this.speed * dTime / 1000;
            this.speed -= this.acceleration * dTime / 1000;
        }

        if (this.playerProjectileDemo1.moving)
        {
            this.playerProjectileDemo1.x += this.projectileSpeed1 * dTime / 1000;
            this.projectileSpeed1 += this.acceleration * dTime / 1000;
        }

        if (this.playerProjectileDemo2.moving)
        {
            
        }
    }

    fireDemo() {
        this.playerProjectileDemo1.x = this.playerDemo2.x + 24;
        this.playerProjectileDemo1.y = this.playerDemo2.y;
        this.playerProjectileDemo1.moving = true;
    }

    startGame() {
        if (!this.started)
        {
            this.menuGroup.toggleVisible();
            this.menuBG.setVisible(true);
            this.time.delayedCall(5000, () =>
            {
                this.events.emit('startGame');
            })
        }
        this.started = true;
        this.time.delayedCall(7000, () =>
        {
            this.moveMenu = false;
        });
    }

}