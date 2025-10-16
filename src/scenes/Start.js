export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/bg.png');

    }

    create() {
        this.background = this.add.sprite(640, 320, 'background');
        this.last_time = 0;
    }

    update(time, dTime) {
        
    }
    
}
