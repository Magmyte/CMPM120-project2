import { Projectile } from "./projectile.js";

export class Enemy extends Phaser.GameObjects.PathFollower {
    constructor(scene, path, x, y, sprite, projectileSprite, firePattern, attCooldown, hp, score, pathDuration, delayF, resumeF) {
        super(scene, path, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.path = path;
        this.projectileSprite = projectileSprite;
        this.firePattern = firePattern;
        this.cooldown = attCooldown;
        this.lastAttack = this.scene.time.now;
        this.hp = hp;
        this.score = score;
        this.pathDuration = pathDuration;
        this.destroyTime = pathDuration;
        this.startPath = this.scene.time.now;
        this.destroyAtEnd = true;

        // account for delay in following path - resumeF is time after start
        if (delayF > 0)
        {
            this.destroyTime += resumeF - delayF;
        }

        // flag for not destroying self at end of path - used for boss
        if (delayF == -1)
        {
            this.destroyAtEnd = false;
        }
        
        this.startFollow({
            duration: this.pathDuration,
            repeat: 1,
            yoyo: false,
            rotateToPath: false
        });

        // automatically pause follow at delayF ms, resume at resumeF
        if (delayF > 0)
        {
            this.scene.time.delayedCall(delayF, () =>
            {
                this.pauseFollow();
            }, this);
            this.scene.time.delayedCall(resumeF, () =>
            {
                this.resumeFollow();
            }, this);
        }

        if (this.destroyAtEnd)
        {
            this.scene.time.delayedCall(this.destroyTime, () =>
            {
                this.destroy();
            }, this);
        }

        // enemy projectile sound
        /* this.scene.load.audio('enemyProjectileSound', 'assets/kenney_interface-sounds/Audio/error_006.ogg');
        this.enemyProjectileSound = this.scene.sound.add('enemyProjectileSound');
        this.enemyProjectileSound.setVolume(0.3);
        this.enemyProjectileSound.setRate(0.2); */
    }

    preUpdate(time, dTime)
    {
        super.preUpdate(time, dTime);

        // fire projectile on delay
        if (time - this.lastAttack >= this.cooldown)
        {
            // check for firePattern
            switch (this.firePattern) {
                case 0: // does not fire
                    break;
                case 1: // basic fire forward
                    this.fireProjectile(180, 250, 100, 5);
                    break;
                case 2: // double fire
                    this.fireProjectile(180, 250, 100);
                    this.scene.time.delayedCall(200, () =>
                    {
                        this.fireProjectile(180, 250, 100);
                        // this.enemyProjectileSound.play();
                    }, this);
                    break;
                case 3: // v shot
                    this.fireProjectile(165, 250, 100);
                    this.fireProjectile(195, 250, 100);
                    break;
                case 4: // v shot, double
                    this.fireProjectile(165, 250, 100);
                    this.fireProjectile(195, 250, 100);
                    this.scene.time.delayedCall(200, () =>
                    {
                        this.fireProjectile(165, 250, 100);
                        this.fireProjectile(195, 250, 100);
                        // this.enemyProjectileSound.play();
                    }, this);
                    break;
                case 5: // tri shot
                    this.fireProjectile(165, 250, 100);
                    this.fireProjectile(180, 250, 100);
                    this.fireProjectile(195, 250, 100);
                    break;
                case 6: // tri shot, double
                    this.fireProjectile(165, 250, 100);
                    this.fireProjectile(180, 250, 100);
                    this.fireProjectile(195, 250, 100);
                    this.scene.time.delayedCall(200, () =>
                    {
                        this.fireProjectile(165, 250, 100);
                        this.fireProjectile(180, 250, 100);
                        this.fireProjectile(195, 250, 100);
                        // this.enemyProjectileSound.play();
                    }, this);
                    break;
                default:
                    console.log("Oops, this enemy's projectile broke."); // debug
            }
            // this.enemyProjectileSound.play();
            this.lastAttack = time;
        }
    }

    fireProjectile(direction, speed, acceleration, homing)
    {
        let enemyProjectile = new Projectile(this.scene, this.x - 16, this.y, this.projectileSprite, direction, speed, acceleration, homing);
        enemyProjectile.setScale(1.5);
        this.scene.enemyProjectiles.add(enemyProjectile);
        this.scene.physics.add.existing(enemyProjectile);
    }
}