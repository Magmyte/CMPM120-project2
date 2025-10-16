export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        // assets
        this.load.image('background', 'assets/ocean.png');
        this.load.image('water', 'assets/water.png');
        this.load.image('playerBoat', 'assets/kenney_tiny-battle/Tiles/tile_0177.png')

        // variables for button checks
        this.upPressed = 0;
        this.downPressed = 0;
    }

    create() {
        // set background tiles
        const {width, height} = this.scale;
        this.backgroundWater = this.add.tileSprite(0, 0, width, height, 'water').setScale(2);

        this.backgroundFar = this.add.tileSprite(240, 108, width * 2, 216, 'background');
        this.backgroundMid = this.add.tileSprite(240, 162, width * 2, 108, 'background');
        this.backgroundMid.tilePositionY = 108;
        this.backgroundNear = this.add.tileSprite(240, 186, width * 2, 60, 'background');
        this.backgroundNear.tilePositionY = 156;
        this.last_time = 0;

        // set player sprite and properties
        this.player = this.add.sprite(128, height / 2 + 80, 'playerBoat').setScale(3);
        this.player.velocityY = 0;
        this.player.cooldown = 600;
        this.player.timer = 0;

        // set UI
    }

    update(time, dTime) {
        // move background tiles
        this.backgroundFar.tilePositionX += 0.01 * dTime;
        this.backgroundMid.tilePositionX += 0.03 * dTime;
        this.backgroundNear.tilePositionX += 0.07 * dTime;

        // check for movement input
        if (this.upPressed == 0 && (this.input.keyboard.addKey('W').isDown || this.input.keyboard.addKey('UP').isDown))
        {
            this.upPressed = 1;
        }
        else if (this.input.keyboard.addKey('W').isUp && this.input.keyboard.addKey('UP').isUp)
        {
            this.upPressed = 0;
        }

        if (this.downPressed == 0 && (this.input.keyboard.addKey('S').isDown || this.input.keyboard.addKey('DOWN').isDown))
        {
            this.downPressed = 1;
        }
        else if (this.input.keyboard.addKey('S').isUp && this.input.keyboard.addKey('DOWN').isUp)
        {
            this.downPressed = 0;
        }

        // move player sprite
        if (this.downPressed - this.upPressed == 0)
        {
            this.player.velocityY *= 0.05 ** (dTime/1000);
        }
        else
        {
            this.player.velocityY += (this.downPressed - this.upPressed) * 0.02;
            if (this.player.velocityY > 0.3)
            {
                this.player.velocityY = 0.3;
            }
            else if (this.player.velocityY < -0.3)
            {
                this.player.velocityY = -0.3;
            }
        }

        this.player.y += this.player.velocityY * dTime;

        // limits to player y position
        if (this.player.y < 230)
        {
            this.player.y = 230;
            this.player.velocityY = 0;
        }
        if (this.player.y > 680)
        {
            this.player.y = 680;
            this.player.velocityY = 0;
        }

        // check for projectile input
        if (this.player.timer <= 0 && this.input.keyboard.addKey('SPACE').isDown)
        {
            console.log('Bam!'); // needs implementation
            this.player.timer = this.player.cooldown;
        }
        if (this.player.timer > 0)
        {
            this.player.timer -= dTime;
        }
        if (this.player.timer < 0)
        {
            this.player.timer = 0;
        }
    }
    
}
