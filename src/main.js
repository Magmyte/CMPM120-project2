import { Start } from './scenes/Start.js';
import { UIScene } from './scenes/uiscene.js';

const config = {
    type: Phaser.AUTO,
    title: 'CMPM 120 Project Skeleton',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade'
    },
    pixelArt: false,
    scene: [
        Start, UIScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            