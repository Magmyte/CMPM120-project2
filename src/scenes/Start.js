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
        this.load.image('attSpeedPower', 'assets/kenney_ui-pack/PNG/Yellow/Double/check_square_grey_projectile_speed.png');
        this.load.image('damagePower', 'assets/kenney_ui-pack/PNG/Yellow/Double/check_square_grey_damage.png');
        this.load.image('hpPower', 'assets/kenney_ui-pack/PNG/Yellow/Double/check_square_grey_plus.png');
        this.load.image('projectilePower', 'assets/kenney_ui-pack/PNG/Yellow/Double/check_square_grey_projectile_plus.png');

        // object assets (enemies)
        this.load.image('enemyBoat1', 'assets/kenney_tiny-battle/Tiles/tile_0157.png');
        this.load.image('enemyBoat2', 'assets/kenney_tiny-battle/Tiles/tile_0158.png');
        this.load.image('enemySub', 'assets/kenney_tiny-battle/Tiles/tile_0159.png');
        this.load.image('enemyPlane', 'assets/kenney_tiny-battle/Tiles/tile_0154.png');
        this.load.image('enemyProjectile', 'assets/kenney_tiny-battle/Tiles/tile_0199.png');

        // object assets (VFX)
        this.load.image('explosion', 'assets/kenney_ui-pack/PNG/Red/Default/check_round_color.png');

        // sound assets
        this.load.audio('playerProjectileSound', 'assets/kenney_interface-sounds/Audio/select_005.ogg');
        this.load.audio('collisionSound', 'assets/kenney_impact-sounds/Audio/footstep_snow_000.ogg');
        this.load.audio('scoreSound', 'assets/kenney_interface-sounds/Audio/maximize_007.ogg');

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

        // set sounds
        this.playerProjectileSound = this.sound.add('playerProjectileSound');
        this.playerProjectileSound.setVolume(0.2);
        this.playerProjectileSound.setRate(0.2);

        this.collisionSound = this.sound.add('collisionSound');
        this.collisionSound.setVolume(0.4);
        this.collisionSound.setRate(0.5);

        this.scoreSound = this.sound.add('scoreSound');
        this.scoreSound.setVolume(0.5);

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

        // starts top right, curves down, ends down left
        this.path3 = this.add.path(1500, height / 2 + 80 - 210);
        this.path3.lineTo(1100, height / 2 + 80 - 210);
        this.path3.quadraticBezierTo(900, height / 2 + 80, 1000, height / 2 + 80 - 210);
        this.path3.quadraticBezierTo(700, height / 2 + 80 + 210, 800, height / 2 + 80 + 210);
        this.path3.lineTo(-300, height / 2 + 80 + 210);

        // starts down right, curves up, ends up left
        this.path4 = this.add.path(1500, height / 2 + 80 + 210);
        this.path4.lineTo(1100, height / 2 + 80 + 210);
        this.path4.quadraticBezierTo(900, height / 2 + 80, 1000, height / 2 + 80 + 210);
        this.path4.quadraticBezierTo(700, height / 2 + 80 - 210, 800, height / 2 + 80 - 210);
        this.path4.lineTo(-300, height / 2 + 80 - 210);

        // starts top right, straight diagonal line down left
        this.path5 = this.add.path(1500, height / 2 - 210);
        this.path5.lineTo(-200, height / 2 + 80 + 210);

        // starts down right, straight diagonal line top right
        this.path6 = this.add.path(1500, height / 2 + 210);
        this.path6.lineTo(-200, height / 2 + 80 - 210);

        // starts top right, goes left, then down, then right
        this.path7 = this.add.path(1600, height / 2 + 80 - 180);
        this.path7.lineTo(780, height / 2 + 80 - 180);
        this.path7.quadraticBezierTo(600, height / 2 + 80, 600, height / 2 + 80 - 180);
        this.path7.quadraticBezierTo(780, height / 2 + 80 + 180, 600, height / 2 + 80 + 180);
        this.path7.lineTo(1600, height / 2 + 80 + 180);

        // starts down right, goes left, then up, then right
        this.path8 = this.add.path(1600, height / 2 + 80 + 180);
        this.path8.lineTo(780, height / 2 + 80 + 180);
        this.path8.quadraticBezierTo(600, height / 2 + 80, 600, height / 2 + 80 + 180);
        this.path8.quadraticBezierTo(780, height / 2 + 80 - 180, 600, height / 2 + 80 - 180);
        this.path8.lineTo(1600, height / 2 + 80 - 180);

        // starts right, ends left - boss path
        this.pathBoss = this.add.path(1400, height / 2 + 80);
        this.pathBoss.lineTo(1100, height / 2 + 80);

        menuScene.events.on('startGame', () =>
        {
            this.init_game();
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
                    break;
                default: // projectileCount == 1
                    let playerProjectile = new Projectile(this, this.player.x + 24, this.player.y, 'playerProjectile', 0, 150, 300);
                    playerProjectile.setScale(1.5);
                    this.playerProjectiles.add(playerProjectile);
            }
            this.playerProjectileSound.play();
            this.player.lastAttack = time;
        }

        // check enemy + player projectile collision
        this.physics.world.overlap(this.playerProjectiles, this.enemies, (projectile, enemy) =>
        {
            enemy.hp -= this.player.damage;
            this.collisionSound.play();

            if (enemy.hp <= 0)
            {
                this.events.emit('scoreAdd', enemy.score);
                this.enemyPowerCount--;
                if (this.enemyPowerCount == 0)
                {
                    this.generatePowerUp(enemy.x, enemy.y, 'random');
                    this.enemyPowerCount = 5;
                }
                this.scoreSound.play();
                enemy.destroy(true);
            }
            else
            {
                enemy.tint = 0xff0000;
                this.time.delayedCall(200, () =>
                {
                    enemy.tint = 0xffffff;
                }, this);
            }
            projectile.destroy(true);
        });

        // check player + enemy projectile collision
        this.physics.world.overlap(this.player, this.enemyProjectiles, (player, projectile) =>
        {
            this.playerDamaged();
            projectile.destroy(true);
        });

        // check player + enemy collision
        this.physics.world.overlap(this.player, this.enemies, (player, enemy) =>
        {
            this.playerDamaged();
        });

        // picking up power ups
        this.physics.world.overlap(this.player, this.powerUps, (player, power) =>
        {
            switch (power.power) {
                case "attSpeed":
                    player.cooldown *= 0.9;
                    if (player.cooldown < 150)
                    {
                        player.cooldown = 150;
                    }
                    break;
                case "damage":
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
                    if (player.hp < player.maxhp)
                    {
                        player.hp++;
                        this.events.emit('regainHP');
                    }
                    break;
                case "projectile":
                    if (player.projectileCount < 7)
                    {
                        player.projectileCount++;
                    }
                    break;
            }
            power.destroy(true);
        });

        // check for homing - defunct, doesn't work
        /* this.enemyProjectiles.children.each((projectile) =>
        {
            if (projectile.homing > 0)
            {
                projectile.homingTurn(this.player.x, this.player.y, dTime);
            }
        }); */
    }

    // initialize game
    init_game() {
        this.disableControls = false;
        this.damaged = false;

        this.enemies.clear(true, true);
        this.enemyProjectiles.clear(true, true);
        this.playerProjectiles.clear(true, true);
        this.powerUps.clear(true, true);

        this.player.x = 128;
        this.player.y = 360 + 80;

        this.player.velocityY = 0;
        this.player.cooldown = 500;
        this.player.damage = 3;
        this.player.hp = 5;
        this.player.maxhp = 5;
        this.player.projectileCount = 1;

        this.gameOver = false;

        // clear pending timers
        this.time.removeAllEvents();

        this.events.emit('scoreReset');
        this.waveStart1(98000); // length of first wave
        // this.waveStart2(102000); // testing purposes
        // this.waveStart3(90000); // testing purposes
        // this.bossStart(); // testing purposes
    }

    // check game over state
    gameOverFunction() {
        this.disableControls = true;
        this.player.velocityY = 0;
        this.upPressed = 0;
        this.downPressed = 0;
        this.gameOver = true;
        
        this.events.emit('gameOver');
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

    // function to be called when player should be damaged
    playerDamaged() {
        if (!this.damaged)
        {
            this.damaged = true;
            this.player.hp--;
            this.events.emit('loseHP');
            this.collisionSound.play();

            if (this.player.hp <= 0 && !this.gameOver)
            {
                this.gameOverFunction();
            }
            else
            {
                this.player.tint = 0xff0000;
                this.tweens.chain({
                    targets: this.player,
                    tweens: [{
                        duration: this.iframes / 10,
                        ease: "sine",
                        yoyo: true,
                        angle: {from: 0, to: 25}
                        },
                        {
                        duration: this.iframes / 10,
                        ease: "sine",
                        yoyo: true,
                        angle: {from: 0, to: -25}
                        },
                        {
                        duration: this.iframes / 10,
                        ease: "sine",
                        yoyo: true,
                        angle: {from: 0, to: 25}
                        }
                    ]
                });
                this.time.delayedCall(this.iframes, () =>
                {
                    this.damaged = false;
                    this.player.tint = 0xffffff;
                }, this);
            }
        }
    }

    // function to be called when wave 1 starts
    waveStart1(levelLength) {
        this.events.emit('waveStart', levelLength, 1);
        console.log("Start.js has started wave 1"); // debug

        this.time.delayedCall(levelLength, () =>
        {
            if (!this.gameOver)
            {
                this.waveStart2(102000); // length of second wave
            }
        }, this);

        /* this.time.delayedCall(, () =>
        {

        }); */

        // let enemy# = new Enemy(this, this.path#, startingX, startingY [440 is half], 'enemySprite#', 'enemyProjectile', firingPattern, firingDelay in ms, hp, score, pathDuration).setScale(3);

        this.time.delayedCall(8000, () =>
        {
            let enemy1 = new Enemy(this, this.path1, 1300, 440 - 100, 'enemyBoat1', 'enemyProjectile', 0, 30000, 8, 10, 16000).setScale(3);
            this.enemies.add(enemy1);

            let enemy2 = new Enemy(this, this.path1, 1400, 440 + 100, 'enemyBoat1', 'enemyProjectile', 0, 30000, 8, 10, 16000).setScale(3);
            this.enemies.add(enemy2);
        });

        for (var i = 0; i < 5; i++)
        {
            this.time.delayedCall(12000 + 1200 * i, (i) =>
            {
                let enemy3 = new Enemy(this, this.path1, 1350, 420 - 200 + 100 * i, 'enemyBoat1', 'enemyProjectile', 0, 30000, 8, 10, 16000).setScale(3);
                this.enemies.add(enemy3);
            }, [i]);
        }

        for (var i = 0; i < 5; i++)
        {
            this.time.delayedCall(20000 + 1200 * i, (i) =>
            {
                let enemy4 = new Enemy(this, this.path1, 1350, 460 + 200 - 100 * i, 'enemyBoat1', 'enemyProjectile', 0, 30000, 8, 10, 16000).setScale(3);
                this.enemies.add(enemy4);
            }, [i]);
        }

        this.time.delayedCall(30000, () =>
        {
            let enemy5 = new Enemy(this, this.path1, 1350, 440 - 150, 'enemyBoat2', 'enemyProjectile', 1, 2000, 15, 20, 16000).setScale(3);
            this.enemies.add(enemy5);

            let enemy6 = new Enemy(this, this.path1, 1350, 440 + 150, 'enemyBoat2', 'enemyProjectile', 1, 2000, 15, 20, 16000).setScale(3);
            this.enemies.add(enemy6);
        });

        this.time.delayedCall(36000, () =>
        {
            let enemy7 = new Enemy(this, this.path2, 1500, 440 - 50, 'enemyBoat2', 'enemyProjectile', 2, 2000, 15, 20, 10000, 5000, 10000).setScale(3);
            this.enemies.add(enemy7);

            let enemy8 = new Enemy(this, this.path2, 1500, 440 + 50, 'enemyBoat2', 'enemyProjectile', 2, 2000, 15, 20, 10000, 5000, 10000).setScale(3);
            this.enemies.add(enemy8);

            this.time.delayedCall(2000, () =>
            {
                let enemy9 = new Enemy(this, this.path2, 1650, 440 - 120, 'enemyBoat2', 'enemyProjectile', 2, 2500, 15, 20, 10000, 5000, 10000).setScale(3);
                this.enemies.add(enemy9);

                let enemy10 = new Enemy(this, this.path2, 1650, 440 + 120, 'enemyBoat2', 'enemyProjectile', 2, 2500, 15, 20, 10000, 5000, 10000).setScale(3);
                this.enemies.add(enemy10);
            });

            this.time.delayedCall(4000, () =>
            {
                let enemy11 = new Enemy(this, this.path2, 1800, 440 - 190, 'enemyBoat2', 'enemyProjectile', 2, 3000, 15, 20, 10000, 5000, 10000).setScale(3);
                this.enemies.add(enemy11);

                let enemy12 = new Enemy(this, this.path2, 1800, 440 + 190, 'enemyBoat2', 'enemyProjectile', 2, 3000, 15, 20, 10000, 5000, 10000).setScale(3);
                this.enemies.add(enemy12);
            });
        });

        for (var i = 0; i < 5; i++)
        {
            this.time.delayedCall(48000 + 1200 * i, (i) =>
            {
                let enemy13 = new Enemy(this, this.path3, 1400 + 50 * i, 440 - 210, 'enemyBoat1', 'enemyProjectile', 0, 30000, 8, 10, 10000).setScale(3);
                this.enemies.add(enemy13);
            }, [i]);
        }

        for (var i = 0; i < 5; i++)
        {
            this.time.delayedCall(55000 + 1200 * i, (i) =>
            {
                let enemy14 = new Enemy(this, this.path4, 1400 + 50 * i, 440 + 210, 'enemyBoat1', 'enemyProjectile', 0, 30000, 8, 10, 10000).setScale(3);
                this.enemies.add(enemy14);
            }, [i]);
        }

        for (var i = 0; i < 5; i++)
        {
            this.time.delayedCall(65000 + 1000 * i, (i) =>
            {
                let enemy15 = new Enemy(this, this.path6, 1400 + 50 * i, 440 + 210, 'enemyBoat2', 'enemyProjectile', 3, 3000 + 500 * i, 15, 25, 14000).setScale(3);
                this.enemies.add(enemy15);
            }, [i]);
        }

        for (var i = 0; i < 5; i++)
        {
            this.time.delayedCall(70000 + 1000 * i, (i) =>
            {
                let enemy16 = new Enemy(this, this.path5, 1400 + 50 * i, 440 - 210, 'enemyBoat2', 'enemyProjectile', 3, 3000 + 500 * i, 15, 25, 14000).setScale(3);
                this.enemies.add(enemy16);
            }, [i]);
        }

        this.time.delayedCall(78000, () =>
        {
            let enemy17 = new Enemy(this, this.path1, 1400, 440, 'enemyBoat2', 'enemyProjectile', 5, 3000, 20, 30, 16000).setScale(3);
            this.enemies.add(enemy17);

            this.time.delayedCall(2000, () =>
            {
                let enemy18 = new Enemy(this, this.path1, 1400, 440 - 70, 'enemyBoat2', 'enemyProjectile', 5, 3000, 20, 30, 16000).setScale(3);
                this.enemies.add(enemy18);

                let enemy19 = new Enemy(this, this.path1, 1400, 440 + 70, 'enemyBoat2', 'enemyProjectile', 5, 3000, 20, 30, 16000).setScale(3);
                this.enemies.add(enemy19);
            });

            this.time.delayedCall(4000, () =>
            {
                let enemy20 = new Enemy(this, this.path1, 1400, 440 - 140, 'enemyBoat2', 'enemyProjectile', 5, 3000, 20, 30, 16000).setScale(3);
                this.enemies.add(enemy20);

                let enemy21 = new Enemy(this, this.path1, 1400, 440 + 140, 'enemyBoat2', 'enemyProjectile', 5, 3000, 20, 30, 16000).setScale(3);
                this.enemies.add(enemy21);
            });
        }, this);
    }

    // wave 2 function
    waveStart2(levelLength) {
        // random power up
        this.generatePowerUp(1380, 405 + 100 * Math.random(), 'random');
        this.events.emit('waveStart', levelLength, 2);
        console.log("Start.js has started wave 2"); // debug

        this.time.delayedCall(levelLength, () =>
        {
            if (!this.gameOver)
            {
                // this.waveStart3(60000); // length of third wave
                this.gameComplete();
            }
        }, this);

        // plane flying out of bounds
        this.time.delayedCall(1000, () =>
        {
            let enemy22 = new Enemy(this, this.path1, 1400, 120, 'enemyPlane', 'enemyProjectile', 0, 30000, 5, 0, 3000).setScale(3);
        }, this);

        this.time.delayedCall(4000, () =>
        {
            let enemy23 = new Enemy(this, this.path7, 1900, 440 - 180, 'enemySub', 'enemyProjectile', 6, 3900, 30, 50, 16000, 8000 + 1000, 16000).setScale(3);
            this.enemies.add(enemy23);

            this.time.delayedCall(800, () =>
            {
                let enemy24 = new Enemy(this, this.path7, 2000, 440 - 180, 'enemySub', 'enemyProjectile', 6, 3900, 30, 50, 16000, 8000, 16000).setScale(3);
                this.enemies.add(enemy24);
            });

            this.time.delayedCall(1600, () =>
            {
                let enemy25 = new Enemy(this, this.path7, 2100, 440 - 180, 'enemySub', 'enemyProjectile', 6, 3900, 30, 50, 16000, 8000 - 1000, 16000).setScale(3);
                this.enemies.add(enemy25);
            });
        }, this);

        for (var i = 0; i < 5; i++)
        {
            this.time.delayedCall(20000 + 1600 * i, (i) =>
            {
                let enemy26 = new Enemy(this, this.path4, 1600 - 70 * i, 440 + 190, 'enemyBoat2', 'enemyProjectile', 2, 2000 + 300 * i, 20, 30, 12000).setScale(3);
                this.enemies.add(enemy26);
            }, [i]);
        }

        for (var i = 0; i < 5; i++)
        {
            this.time.delayedCall(27500 + 1600 * i, (i) =>
            {
                let enemy26 = new Enemy(this, this.path5, 1400, 440 - 190, 'enemyBoat2', 'enemyProjectile', 2, 2050 + 300 * i, 20, 30, 10000).setScale(3);
                this.enemies.add(enemy26);
            }, [i]);
        }

        for (var i = 0; i < 3; i++)
        {
            this.time.delayedCall(36000 + 2500 * i, (i) =>
            {
                let enemy27 = new Enemy(this, this.path6, 1400, 440 - 200 + 200 * i, 'enemyPlane', 'enemyProjectile', 0, 30000, 20, 40, 5000).setScale(3);
                this.enemies.add(enemy27);
            }, [i]);
        }

        for (var i = 0; i < 6; i++)
        {
            this.time.delayedCall(41000 + 1500 * i, (i) =>
            {
                let enemy28 = new Enemy(this, this.path3, 1600 - 70 * i, 440 - 190, 'enemyBoat2', 'enemyProjectile', 2, 2050 + 300 * i, 20, 30, 12000).setScale(3);
                this.enemies.add(enemy28);
            }, [i]);
        }

        for (var i = 0; i < 3; i++)
        {
            this.time.delayedCall(52000 + 2500 * i, (i) =>
            {
                let enemy29 = new Enemy(this, this.path5, 1400, 440 - 270 + 150 * i, 'enemyPlane', 'enemyProjectile', 0, 30000, 20, 40, 5000).setScale(3);
                this.enemies.add(enemy29);
            }, [i]);
        }

        for (var i = 0; i < 6; i++)
        {
            this.time.delayedCall(56000 + 1000 * i, (i) =>
            {
                let enemy30 = new Enemy(this, this.path1, 1500, 440 - 50 + 30 * (-1) ** i, 'enemyBoat1', 'enemyProjectile', 0, 30000, 20, 30, 16000).setScale(3);
                this.enemies.add(enemy30);

                let enemy31 = new Enemy(this, this.path1, 1500, 440 + 50 + 30 * (-1) ** i, 'enemyBoat1', 'enemyProjectile', 0, 30000, 20, 30, 16000).setScale(3);
                this.enemies.add(enemy31);

                this.time.delayedCall(3500, () =>
                {
                    let enemy32 = new Enemy(this, this.path1, 1500, 440 - 120 + 30 * (-1) ** i, 'enemyBoat1', 'enemyProjectile', 0, 30000, 20, 30, 16000).setScale(3);
                    this.enemies.add(enemy32);

                    let enemy33 = new Enemy(this, this.path1, 1500, 440 + 120 + 30 * (-1) ** i, 'enemyBoat1', 'enemyProjectile', 0, 30000, 20, 30, 16000).setScale(3);
                    this.enemies.add(enemy33);
                });

                this.time.delayedCall(7000, () =>
                {
                    let enemy34 = new Enemy(this, this.path1, 1500, 440 - 190 + 30 * (-1) ** i, 'enemyBoat1', 'enemyProjectile', 0, 30000, 20, 30, 16000).setScale(3);
                    this.enemies.add(enemy34);

                    let enemy35 = new Enemy(this, this.path1, 1500, 440 + 190 + 30 * (-1) ** i, 'enemyBoat1', 'enemyProjectile', 0, 30000, 20, 30, 16000).setScale(3);
                    this.enemies.add(enemy35);
                });
            }, [i]);
        }

        this.time.delayedCall(64000, () =>
        {
            let enemy36 = new Enemy(this, this.path2, 1400, 440 - 50, 'enemyBoat2', 'enemyProjectile', 4, 2000, 20, 50, 18000, 9000, 19000).setScale(3);
            this.enemies.add(enemy36);

            let enemy37 = new Enemy(this, this.path2, 1400, 440 + 50, 'enemyBoat2', 'enemyProjectile', 4, 2000, 20, 50, 18000, 9000, 19000).setScale(3);
            this.enemies.add(enemy37);

            this.time.delayedCall(1500, () =>
            {
                let enemy38 = new Enemy(this, this.path2, 1550, 440 - 140, 'enemyBoat2', 'enemyProjectile', 4, 2000, 20, 50, 19000, 9500, 19500).setScale(3);
                this.enemies.add(enemy38);

                let enemy39 = new Enemy(this, this.path2, 1550, 440 + 140, 'enemyBoat2', 'enemyProjectile', 4, 2000, 20, 50, 19000, 9500, 19500).setScale(3);
                this.enemies.add(enemy39);
            });

            this.time.delayedCall(3000, () =>
            {
                let enemy40 = new Enemy(this, this.path2, 1700, 440 - 230, 'enemyBoat2', 'enemyProjectile', 4, 2000, 20, 50, 20000, 10000, 20000).setScale(3);
                this.enemies.add(enemy40);

                let enemy41 = new Enemy(this, this.path2, 1700, 440 + 230, 'enemyBoat2', 'enemyProjectile', 4, 2000, 20, 50, 20000, 10000, 20000).setScale(3);
                this.enemies.add(enemy41);
            });
        });

        this.time.delayedCall(84000, () =>
        {
            let enemy42 = new Enemy(this, this.path1, 1400, 440, 'enemySub', 'enemyProjectile', 0, 30000, 1000, 1000, 20000).setScale(12);
            this.enemies.add(enemy42);
        }, this);
    }

    // wave 3 function - incomplete
    waveStart3(levelLength) {
        // random power up
        this.generatePowerUp(1380, 405 + 100 * Math.random(), 'random');
        this.events.emit('waveStart', levelLength, 3);
        console.log("Start.js has started wave 3"); // debug

        this.time.delayedCall(levelLength, () =>
        {
            if (!this.gameOver)
            {
                this.bossStart();
            }
        });
    }

    // incomplete
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
