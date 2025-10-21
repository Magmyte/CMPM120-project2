export class Menu extends Phaser.Scene {

    constructor() {
        super({key: 'Menu', active: true});
    }

    preload() {
        // menu background
        this.load.image('menuBG', 'assets/kenney_ui-pack/PNG/Yellow/Double/button_rectangle_line.png');

        // button images
        this.load.image('startButton', 'assets/kenney_ui-pack/PNG/Yellow/Double/button_rectangle_depth_flat.png');
        this.load.image('startButtonPress', 'assets/kenney_ui-pack/PNG/Yellow/Double/button_rectangle_flat.png');
    }

    create() {
        const {width, height} = this.scale;

        // menu group
        this.menuGroup = this.add.group("menuGroup");

        // menu background - put on back
        this.menuBG = this.add.nineslice(width / 2, height / 2, 'menuBG', 0, 1200, 640, 16, 16, 16, 16).setScale(1).setAlpha(0.9);
        this.menuGroup.add(this.menuBG);

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