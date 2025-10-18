import { Game as MainGame } from './scenes/Game';
import { AUTO, Game } from 'phaser';

import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { Menu } from './scenes/Menu';
import { Preloader } from './scenes/Preload';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: 'game-container',
    backgroundColor: '#000',
    antialiasGL: false,
    pixelArt: true,
    preserveDrawingBuffer: true,
    roundPixels: false,
    antialias: false,
    autoRound: true,
    scale: {
        width: 800,
        height: 600,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: 1,
    },
    fps: {
        target: 120,
        min: 30,
        smoothStep: true,
    },
    scene: [
        Preloader,
        Menu,
        MainGame,
    ],
    plugins: {
        scene: [
            {
                key: 'rexUI',
                plugin: UIPlugin,
                mapping: 'rexUI',
            },
        ],
    },
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
