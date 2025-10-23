import {Projectile} from '../gameobjects/projectile.js';
import {PowerUp} from '../gameobjects/powerup.js';
import {Enemy} from '../gameobjects/enemy.js';

// import {eventsCenter} from '../eventscenter.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        // bg assets
        this.load.image('background', 'assets/ocean.png');
        this.load.image('water', 'assets/water.png');

        // object assets (player)
        this.load.image('playerBoat', 'assets/kenney_tiny-battle/Tiles/tile_0177.png')
        this.load.image('playerProjectile', 'assets/kenney_tiny-battle/Tiles/tile_0198.png');
        this.load.image('attSpeedPower', 'assets/kenney_ui-pack/PNG/Yellow/Double/check_square_grey.png');
        this.load.image('damagePower', 'assets/kenney_ui-pack/PNG/Yellow/Double/check_square_grey.png');
        this.load.image('hpPower', 'assets/kenney_ui-pack/PNG/Yellow/Double/check_square_grey.png');
        this.load.image('projectilePower', 'assets/kenney_ui-pack/PNG/Yellow/Double/check_square_grey.png');

        // object assets (enemies)
        this.load.image('enemyBoat1', 'assets/kenney_tiny-battle/Tiles/tile_0157.png');
        this.load.image('enemyBoat2', 'assets/kenney_tiny-battle/Tiles/tile_0158.png');
        this.load.image('enemySub', 'assets/kenney_tiny-battle/Tiles/tile_0159.png');
        this.load.image('enemyProjectile', 'assets/kenney_tiny-battle/Tiles/tile_0199.png');

        // object assets (VFX)
        this.load.image('explosion', 'assets/kenney_ui-pack/PNG/Red/Default/check_round_color.png');

        // variables for button checks
        this.upPressed = 0;
        this.downPressed = 0;
    }

    create() {
        // grab reference to Menu scene
        let menuScene = this.scene.get('Menu');

        // set background tiles
        const {width, height} = this.scale;
        this.backgroundWater = this.add.tileSprite(0, 0, width, height, 'water').setScale(2);

        this.backgroundFar = this.add.tileSprite(240, 108, width * 2, 216, 'background');
        this.backgroundMid = this.add.tileSprite(240, 162, width * 2, 108, 'background');
        this.backgroundMid.tilePositionY = 108;
        this.backgroundNear = this.add.tileSprite(240, 186, width * 2, 60, 'background');
        this.backgroundNear.tilePositionY = 156;

        // set player sprite and properties
        this.player = this.add.sprite(128, height / 2 + 80, 'playerBoat').setScale(3);
        this.physics.add.existing(this.player);

        // these are reset every run
        this.player.velocityY = 0;
        this.player.cooldown = 500;
        this.player.damage = 3;
        this.player.hp = 5;
        this.player.maxhp = 5;
        this.player.projectileCount = 1;

        this.player.lastAttack = 0;
        this.disableControls = true;
        this.iframes = 1200;
        this.damaged = false;

        // add player projectiles group
        this.playerProjectiles = this.add.group("playerProjectiles");

        // add enemies group
        this.enemies = this.add.group("enemies");

        // add enemies projectiles group
        this.enemyProjectiles = this.add.group("enemyProjectiles");

        // add powerup group
        this.powerUps = this.add.group("powerUps");
        this.enemyPowerCount = 5;

        // game over flag
        this.gameOver = false;

        // paths for enemies to follow

        // straight line from right to left
        this.path1 = this.add.path(1350, height / 2 + 80);
        this.path1.lineTo(-300, height / 2 + 80);

        // starts right, goes left, pause, return right
        this.path2 = this.add.path(1350, height / 2 + 80);
        this.path2.lineTo(600, height / 2 + 80);
        this.path2.lineTo(1350, height / 2 + 80);

        menuScene.events.on('startGame', () =>
        {
            this.init_game();
            this.waveStart1(180000);
        }, this);
    }

    update(time, dTime) {
        // move background tiles
        this.backgroundFar.tilePositionX += 0.01 * dTime;
        this.backgroundMid.tilePositionX += 0.03 * dTime;
        this.backgroundNear.tilePositionX += 0.07 * dTime;

        if (this.gameOver)
        {
            this.player.x -= 0.08 * dTime;
            if (this.player.x <= -200)
            {
                this.player.x = -200;
            }
        }

        // check for movement input
        if (!this.disableControls && this.upPressed == 0 && (this.input.keyboard.addKey('W').isDown || this.input.keyboard.addKey('UP').isDown))
        {
            this.upPressed = 1;
        }
        else if (!this.disableControls && this.input.keyboard.addKey('W').isUp && this.input.keyboard.addKey('UP').isUp)
        {
            this.upPressed = 0;
        }

        if (!this.disableControls && this.downPressed == 0 && (this.input.keyboard.addKey('S').isDown || this.input.keyboard.addKey('DOWN').isDown))
        {
            this.downPressed = 1;
        }
        else if (!this.disableControls && this.input.keyboard.addKey('S').isUp && this.input.keyboard.addKey('DOWN').isUp)
        {
            this.downPressed = 0;
        }

        // move player sprite
        if (this.downPressed - this.upPressed == 0)
        {
            this.player.velocityY *= 0.05 ** (dTime / 1000);
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
        if (this.player.y < 220)
        {
            this.player.y = 220;
            this.player.velocityY = 0;
        }
        if (this.player.y > 680)
        {
            this.player.y = 680;
            this.player.velocityY = 0;
        }

        // check for projectile input
        if (!this.disableControls && time - this.player.lastAttack >= this.player.cooldown && this.input.keyboard.addKey('SPACE').isDown)
        {
            switch (this.player.projectileCount) {
                case 2:
                    let playerProjectile2_1 = new Projectile(this, this.player.x + 24, this.player.y + 8, 'playerProjectile', 0, 150, 300);
                    playerProjectile2_1.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile2_1);
                    let playerProjectile2_2 = new Projectile(this, this.player.x + 24, this.player.y - 8, 'playerProjectile', 0, 150, 300);
                    playerProjectile2_2.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile2_2);
                    break;
                case 3:
                    let playerProjectile3_1 = new Projectile(this, this.player.x + 24, this.player.y + 8, 'playerProjectile', 15, 150, 300);
                    playerProjectile3_1.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile3_1);
                    let playerProjectile3_2 = new Projectile(this, this.player.x + 24, this.player.y - 8, 'playerProjectile', -15, 150, 300);
                    playerProjectile3_2.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile3_2);
                    let playerProjectile3_3 = new Projectile(this, this.player.x + 24, this.player.y, 'playerProjectile', 0, 150, 300);
                    playerProjectile3_3.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile3_3);
                    break;
                case 4:
                    let playerProjectile4_1 = new Projectile(this, this.player.x + 16, this.player.y + 16, 'playerProjectile', 15, 150, 300);
                    playerProjectile4_1.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile4_1);
                    let playerProjectile4_2 = new Projectile(this, this.player.x + 16, this.player.y - 16, 'playerProjectile', -15, 150, 300);
                    playerProjectile4_2.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile4_2);
                    let playerProjectile4_3 = new Projectile(this, this.player.x + 24, this.player.y + 8, 'playerProjectile', 0, 150, 300);
                    playerProjectile4_3.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile4_3);
                    let playerProjectile4_4 = new Projectile(this, this.player.x + 24, this.player.y - 8, 'playerProjectile', 0, 150, 300);
                    playerProjectile4_4.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile4_4);
                    break;
                case 5:
                    let playerProjectile5_1 = new Projectile(this, this.player.x + 16, this.player.y + 16, 'playerProjectile', 15, 150, 300);
                    playerProjectile5_1.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile5_1);
                    let playerProjectile5_2 = new Projectile(this, this.player.x + 16, this.player.y - 16, 'playerProjectile', -15, 150, 300);
                    playerProjectile5_2.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile5_2);
                    let playerProjectile5_3 = new Projectile(this, this.player.x + 16, this.player.y + 12, 'playerProjectile', 0, 150, 300);
                    playerProjectile5_3.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile5_3);
                    let playerProjectile5_4 = new Projectile(this, this.player.x + 16, this.player.y - 12, 'playerProjectile', 0, 150, 300);
                    playerProjectile5_4.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile5_4);
                    let playerProjectile5_5 = new Projectile(this, this.player.x + 24, this.player.y, 'playerProjectile', 0, 150, 300);
                    playerProjectile5_5.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile5_5);
                    break;
                case 6:
                    let playerProjectile6_1 = new Projectile(this, this.player.x + 8, this.player.y + 24, 'playerProjectile', 15, 150, 300);
                    playerProjectile6_1.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile6_1);
                    let playerProjectile6_2 = new Projectile(this, this.player.x + 8, this.player.y - 24, 'playerProjectile', -15, 150, 300);
                    playerProjectile6_2.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile6_2);
                    let playerProjectile6_3 = new Projectile(this, this.player.x + 16, this.player.y + 16, 'playerProjectile', 15, 150, 300);
                    playerProjectile6_3.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile6_3);
                    let playerProjectile6_4 = new Projectile(this, this.player.x + 16, this.player.y - 16, 'playerProjectile', -15, 150, 300);
                    playerProjectile6_4.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile6_4);
                    let playerProjectile6_5 = new Projectile(this, this.player.x + 24, this.player.y + 8, 'playerProjectile', 0, 150, 300);
                    playerProjectile6_5.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile6_5);
                    let playerProjectile6_6 = new Projectile(this, this.player.x + 24, this.player.y - 8, 'playerProjectile', 0, 150, 300);
                    playerProjectile6_6.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile6_6);
                    break;
                case 7:
                    let playerProjectile7_1 = new Projectile(this, this.player.x + 8, this.player.y + 24, 'playerProjectile', 15, 150, 300);
                    playerProjectile7_1.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile7_1);
                    let playerProjectile7_2 = new Projectile(this, this.player.x + 8, this.player.y - 24, 'playerProjectile', -15, 150, 300);
                    playerProjectile7_2.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile7_2);
                    let playerProjectile7_3 = new Projectile(this, this.player.x + 16, this.player.y + 16, 'playerProjectile', 15, 150, 300);
                    playerProjectile7_3.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile7_3);
                    let playerProjectile7_4 = new Projectile(this, this.player.x + 16, this.player.y - 16, 'playerProjectile', -15, 150, 300);
                    playerProjectile7_4.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile7_4);
                    let playerProjectile7_5 = new Projectile(this, this.player.x + 16, this.player.y + 12, 'playerProjectile', 0, 150, 300);
                    playerProjectile7_5.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile7_5);
                    let playerProjectile7_6 = new Projectile(this, this.player.x + 16, this.player.y - 12, 'playerProjectile', 0, 150, 300);
                    playerProjectile7_6.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile7_6);
                    let playerProjectile7_7 = new Projectile(this, this.player.x + 24, this.player.y, 'playerProjectile', 0, 150, 300);
                    playerProjectile7_7.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile7_7);
                    break
                default: // projectileCount == 1
                    let playerProjectile = new Projectile(this, this.player.x + 24, this.player.y, 'playerProjectile', 0, 150, 300);
                    playerProjectile.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile);
            }
            this.player.lastAttack = time;
        }

        // check enemy + player projectile collision
        this.physics.world.overlap(this.playerProjectiles, this.enemies, (projectile, enemy) =>
        {
            enemy.hp -= this.player.damage;
            if (enemy.hp <= 0)
            {
                this.events.emit('scoreAdd', enemy.score);
                this.enemyPowerCount--;
                if (this.enemyPowerCount == 0)
                {
                    this.generatePowerUp(enemy.x, enemy.y, 'random');
                    this.enemyPowerCount = 5;
                }
                enemy.destroy(true);
            }
            else
            {
                enemy.tint = 0xff0000;
                this.time.delayedCall(200, () =>
                {
                    enemy.tint = 0xffffff;
                });
            }
            projectile.destroy(true);
        });

        // check player + enemy projectile collision
        this.physics.world.overlap(this.player, this.enemyProjectiles, (player, projectile) =>
        {
            if (!this.damaged)
            {
                this.damaged = true;
                player.hp --;
                this.events.emit('loseHP');
                if (player.hp <= 0 && !this.gameOver)
                {
                    this.gameOverFunction();
                }
                else
                {
                    this.player.tint = 0xff000;
                    this.time.delayedCall(this.iframes, () =>
                    {
                        this.damaged = false;
                        this.player.tint = 0xffffff;
                    });
                }
            }
            projectile.destroy(true);
        });

        // check player + enemy collision
        this.physics.world.overlap(this.player, this.enemies, (player, enemy) =>
        {
            if (!this.damaged)
            {
                this.damaged = true;
                player.hp--;
                this.events.emit('loseHP');
                if (player.hp <= 0 && !this.gameOver)
                {
                    this.gameOverFunction();
                }
                else
                {
                    this.player.tint = 0xff0000;
                    this.time.delayedCall(this.iframes, () =>
                    {
                        this.damaged = false;
                        this.player.tint = 0xffffff;
                    });
                }
            }
        });

        // picking up power ups
        this.physics.world.overlap(this.player, this.powerUps, (player, power) =>
        {
            switch (power.power) {
                case "attSpeed":
                    console.log("Attack Speed Up");
                    player.cooldown *= 0.8;
                    if (player.cooldown < 150)
                    {
                        player.cooldown = 150;
                    }
                    break;
                case "damage":
                    console.log("Damage Up");
                    if (player.damage > 15)
                    {
                        player.damage++;
                    }
                    else
                    {
                        player.damage += 2;
                    }
                    break;
                case "hp":
                    console.log("Regained HP");
                    if (player.hp < player.maxhp)
                    {
                        player.hp++;
                        this.events.emit('regainHP');
                    }
                    break;
                case "projectile":
                    console.log("Projectile Count Up");
                    if (player.projectileCount < 7)
                    {
                        player.projectileCount++;
                    }
                    break;
            }
            power.destroy(true);
        });
    }

    // initialize game
    init_game() {
        this.disableControls = false;
        this.damaged = false;

        this.enemies.clear(true, true);
        this.enemyProjectiles.clear(true, true);
        this.playerProjectiles.clear(true, true);

        this.player.x = 128;
        this.player.y = 360 + 80;

        this.player.velocityY = 0;
        this.player.cooldown = 500;
        this.player.damage = 3;
        this.player.hp = 5;
        this.player.maxhp = 5;
        this.player.projectileCount = 1;

        this.gameOver = false;

        this.events.emit('scoreReset');
    }

    // check game over state
    gameOverFunction() {
        this.disableControls = true;
        this.player.velocityY = 0;
        this.upPressed = 0;
        this.downPressed = 0;
        this.gameOver = true;
        this.events.emit('gameOver');
        console.log("Game over!"); //debug
    }

    // function to generate a power up - powerType can be 'attSpeed', 'damage', 'hp', 'projectile', or 'random'
    generatePowerUp(x, y, powerType) {
        let pickPower = powerType;
        if (powerType == 'random') {
            let pickPowerArr = ['damage'];
            if (this.player.cooldown > 150)
            {
                pickPowerArr.push('attSpeed');
            }
            if (this.player.hp < this.player.maxhp)
            {
                pickPowerArr.push('hp');
            }
            if (this.player.projectileCount < 7)
            {
                pickPowerArr.push('projectile');
            }
            pickPower = pickPowerArr[Math.floor(pickPowerArr.length * Math.random())];
        }
        let powerUp = new PowerUp(this, x, y, pickPower + 'Power', pickPower, this.time.now);
        powerUp.setScale(0.5);
        this.powerUps.add(powerUp);
    }

    // function to be called when wave 1 starts
    waveStart1(levelLength) {
        // random power up
        this.generatePowerUp(1380, 405 + 100 * Math.random(), 'random');
        this.events.emit('waveStart', levelLength, 1);
        console.log("Start.js has started wave 1"); // debug

        /* this.time.delayedCall(, () =>
        {

        }); */

        // let enemy# = new Enemy(this, this.path#, startingX, startingY [440 is half], 'enemySprite#', 'enemyProjectile', firingPattern, firingDelay in ms, hp, score, pathDuration).setScale(-3, 3);

        this.time.delayedCall(6000, () =>
        {
            let enemy1 = new Enemy(this, this.path1, 1325, 440 - 100, 'enemyBoat1', 'enemyProjectile', 0, 30000, 8, 10, 16000).setScale(-3, 3);
            this.enemies.add(enemy1);

            let enemy2 = new Enemy(this, this.path1, 1375, 440 + 100, 'enemyBoat1', 'enemyProjectile', 0, 30000, 8, 10, 16000).setScale(-3, 3);
            this.enemies.add(enemy2);
        });

        for (var i = 0; i < 5; i++)
        {
            this.time.delayedCall(9000 + 800 * i, (i) =>
            {
                let enemy3 = new Enemy(this, this.path1, 1350, 400 - 200 + 100 * i, 'enemyBoat1', 'enemyProjectile', 0, 30000, 8, 10, 16000).setScale(-3, 3);
                this.enemies.add(enemy3);
            }, [i]);
        }

        for (var i = 0; i < 5; i++)
        {
            this.time.delayedCall(18000 + 800 * i, (i) =>
            {
                let enemy4 = new Enemy(this, this.path1, 1350, 480 + 200 - 100 * i, 'enemyBoat1', 'enemyProjectile', 0, 30000, 8, 10, 16000).setScale(-3, 3);
                this.enemies.add(enemy4);
            }, [i]);
        }
    }

    // wave 2 function
    waveStart2(levelLength) {
        // random power up
        this.generatePowerUp(1380, 405 + 100 * Math.random(), 'random');
        this.events.emit('waveStart', levelLength, 2);
        console.log("Start.js has started wave 2"); // debug
    }

    // wave 3 function
    waveStart3(levelLength) {
        // random power up
        this.generatePowerUp(1380, 405 + 100 * Math.random(), 'random');
        this.events.emit('waveStart', levelLength, 3);
        console.log("Start.js has started wave 3"); // debug
    }

    bossStart() {
        // random power up
        this.generatePowerUp(1380, 405 + 100 * Math.random(), 'random');
        this.events.emit('bossStart');
        console.log("Start.js has started boss"); // debug
    }

    gameComplete() {
        // to do
        this.disableControls = true;
        this.player.velocityY = 0;
        this.upPressed = 0;
        this.downPressed = 0;
        this.events.emit('gameComplete');
    }
}
