export class PowerUp extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, sprite, powerType, timeStart){
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.power = powerType; // power types should be 'attSpeed', 'damage', 'hp', or 'projectile'
        this.timeStart = timeStart;
    }

    preUpdate(time, dTime)
    {
        this.x -= 0.08 * dTime;
        this.y += 0.2 * Math.cos((time - this.timeStart) / 200); // bobbing animation

        if (this.x < -100)
        {
            this.destroy();
        }
    }
}