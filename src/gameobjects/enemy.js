import { Projectile } from "./projectile.js";

export class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite, projectileSprite, attCooldown, hp, pathNum) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        this.scene = scene;
        this.projectileSprite = projectileSprite;
        this.cooldown = attCooldown;
        this.hp = hp;
        this.path = pathNum;
    }

    preUpdate(time, dTime)
    {
        if (this.x < -200 || this.x > 1480 || this.y < -200 || this.y > 920)
        {
            this.destroy();
        }
    }

    fireProjectile(direction, speed, acceleration, homing)
    {
        let enemyProjectile = new Projectile(this.scene, this.x - 16, this.y, this.projectileSprite, direction, speed, acceleration, homing);
        enemyProjectile.setScale(1.5);
        this.scene.enemyProjectiles.add(enemyProjectile);
    }
}