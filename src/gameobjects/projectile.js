export class Projectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite, direction, speed, acceleration, homing){
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene = scene;
        this.direction = Phaser.Math.DegToRad(direction);
        this.rotation = this.direction;
        this.speed = speed;
        this.acceleration = acceleration;
        if (homing > 0)
        {
            this.homing = Phaser.Math.DegToRad(homing); // homing is degrees of rotation per second
        }
        else
        {
            this.homing = 0;
        }
    }

    preUpdate(time, dTime)
    {
        this.x += this.speed * Math.cos(this.direction) * dTime / 1000;
        this.y += this.speed * Math.sin(this.direction) * dTime / 1000;
        this.speed += this.acceleration * dTime / 1000;

        if (this.x < -100 || this.x > 1380 || this.y < 190 || this.y > 820)
        {
            this.destroy();
        }
    }

    // defunct - doesn't work
    homingTurn(playerX, playerY, dTime) {
        let targetAngle = Math.atan2(playerY - this.y, playerX - this.x);
        if (Phaser.Math.Angle.ShortestBetween(targetAngle, this.direction) < 0)
        {
            this.direction += Math.min(this.homing * dTime / 1000, Phaser.Math.Angle.ShortestBetween(this.direction, targetAngle));
        }
        else
        {
            this.direction -= Math.min(this.homing * dTime / 1000, Phaser.Math.Angle.ShortestBetween(this.direction, targetAngle));
        }

        this.rotation = this.direction;
    }
}