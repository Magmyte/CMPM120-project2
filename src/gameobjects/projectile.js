export class Projectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, which, direction, speed, acceleration){
        super(scene, x, y, which);
        scene.add.existing(this);
        this.direction = Phaser.Math.DegToRad(direction);
        this.speed = speed;
        this.acceleration = acceleration;
    }

    preUpdate(time, dTime)
    {
        this.x += this.speed * Math.cos(this.direction) * dTime / 1000;
        this.y += this.speed * Math.sin(this.direction) * dTime / 1000;
        this.speed += this.acceleration * dTime / 1000;
    }
}