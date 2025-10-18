import { Scene } from "phaser";
import { SpecialImage, UiImage } from "../../constant/gameImage";
import { Text } from "../../constant/gameConst";
import { EnumGameColor } from "../../constant/gameColor";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    this.load.setPath("assets");
    this.load.image(UiImage["menu-button"], UiImage["menu-button"]);
    this.load.image(SpecialImage["menu-logo"], SpecialImage["menu-logo"]);
    this.load.image(SpecialImage.github, SpecialImage.github);
    this.load.spritesheet(SpecialImage["sound-button"], SpecialImage["sound-button"], {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(SpecialImage["flag-Sheet"], SpecialImage["flag-Sheet"], {
      frameWidth: 800,
      frameHeight: 600,
    });
    this.load.font(Text.default, "font/Metadannye-Export.ttf");
    this.load.audio("snake-marsh", "audio/snake-marsh.mp3");
  }

  create() {
    this.add.rectangle(0, 0, 800, 600, EnumGameColor.backgroundMenuNumber).setOrigin(0, 0);
    if (this.sound.locked) {
      this.add.text(this.scale.width / 2, this.scale.height / 2,
        "Tap / Click to START COMMUNISSSM",
        {
            fontFamily: Text.default,
            fontSize: 38,
            color: EnumGameColor.textColorMenu,
            stroke: EnumGameColor.backgroundDescription,
            strokeThickness: 4,
        },
      ).setOrigin(0.5);

      this.input.once("pointerdown", () => {
        this.sound.unlock();
        this.scene.start("Menu");
      });
    } else {
      this.scene.start("Menu");
    }
  }
}
