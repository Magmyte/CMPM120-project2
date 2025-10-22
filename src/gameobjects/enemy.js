import { Projectile } from "./projectile.js";

export class Enemy extends Phaser.GameObjects.Pathfollower {
    constructor(scene, path, x, y, sprite, projectileSprite, firePattern, attCooldown, hp, score, pathDuration, delayF, resumeF) {
        super(scene, path, x, y, sprite);
        scene.add.existing(this);
        this.scene = scene;
        this.path = path;
        this.projectileSprite = projectileSprite;
        this.firePattern = firePattern;
        this.cooldown = attCooldown;
        this.lastAttack = this.time.now;
        this.hp = hp;
        this.score = score;
        this.pathDuration = pathDuration;
        this.startPath = this.time.now;
        
        this.startFollow({
            duration: this.pathDuration,
            repeat: 1,
            yoyo: false;
            rotateToPath: false
        });

        if (delayF > 0)
        {
            this.time.delayedCall(delayF, () =>
            {
                this.pauseFollow();
            });
            this.time.delayedCall(resumeF, () =>
            {
                this.resumeFollow();
            });
        }
    }

    preUpdate(time, dTime)
    {
        super.preUpdate(time, dTime);

        // destroy enemy if it leaves bounds
        if (time - this.startPath > this.pathDuration)
        {
            this.destroy();
        }

        // fire projectile on delay
        if (time - this.lastAttack >= this.cooldown)
        {
            // check for firePattern
            switch (this.firePattern) {
                case 1: // basic fire forward
                    this.fireProjectile(180, 250, 0);
                    break;
                case 2: // double fire
                    this.fireProjectile(180, 250, 0);
                    this.time.delayedCall(200, () =>
                    {
                        this.fireProjectile(180, 250, 0);
                    });
                default:
                    console.log("Oops, this enemy's projectile broke.");
            }
            this.lastAttack = time;
        }
    }

    fireProjectile(direction, speed, acceleration, homing)
    {
        let enemyProjectile = new Projectile(this.scene, this.x - 16, this.y, this.projectileSprite, direction, speed, acceleration, homing);
        enemyProjectile.setScale(1.5);
        this.scene.enemyProjectiles.add(enemyProjectile);
    }
}