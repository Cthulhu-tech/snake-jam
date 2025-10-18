
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";
import { Scene } from "phaser";

export class Game extends Scene {
  rexUI: UIPlugin;

  constructor(key = "Game") {
    super(key);
  }

  preload() {
    this.load.setPath("assets");
  }

  create() {

  }
}
