import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";
import { SpecialImage, UiImage } from "../../constant/gameImage";
import { Scene } from "phaser";
import { GameDepth, Text } from "../../constant/gameConst";
import { EnumGameColor } from "../../constant/gameColor";
import { MarqueeLabel } from "../utils/marqueeLabel";

export class Menu extends Scene {
  rexUI: UIPlugin;
  private isMuted: boolean = false;

  constructor(key = "Menu") {
    super(key);
  }

  create() {
    this.sound.add('snake-marsh')
      .play({ loop: true, volume: 0.6 });
    this.anims.create({
      key: "bg-flag",
      frames: this.anims.generateFrameNumbers(SpecialImage["flag-Sheet"], { start: 0, end: 15 }),
      frameRate: 16,
      repeat: -1,
    });
    const backgroundAnim = this.add
      .sprite(0, 0, SpecialImage["flag-Sheet"], 0)
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height)
      .setScrollFactor(0);

    backgroundAnim.play("bg-flag");
    this.rexUI.add.imageBox(540, 380, UiImage["menu-button"], "", {
      width: 192,
      height: 128,
    }).setDepth(GameDepth.UI);

    this.rexUI.add.label({
      x: 540,
      y: 375,
      text: this.add.text(0, 0, "START COMUNISSSM", {
        fontFamily: Text.default,
        fontSize: 24,
        color: EnumGameColor.textColorMenu,
        padding: {
          left: 30,
          right: 15,
          top: 15,
          bottom: 20,
        }
      }),
    })
      .setDepth(GameDepth.UI)
      .layout()
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => {
        this.sound.get('snake-marsh').stop();
        this.scene.start('Game');
      });

    const imageSnake = this.rexUI.add.imageBox(0, 0, SpecialImage["menu-logo"], "", {
      width: 128,
      height: 128,
    }).setDepth(GameDepth.UpperObject);


    const githubBtn = this.rexUI.add.imageBox(
      this.scale.width - 32,
      this.scale.height - 32,
      SpecialImage.github,
      '',
      { width: 32, height: 32 }
    )
      .setDepth(GameDepth.UpperObject)

    githubBtn
      .setInteractive(
        new Phaser.Geom.Rectangle(0, 0, githubBtn.width, githubBtn.height),
        Phaser.Geom.Rectangle.Contains
      )
      .on('pointerover', () => githubBtn.setAlpha(0.85))
      .on('pointerout',  () => githubBtn.setAlpha(1))
      .on('pointerup',   () => {

        if (typeof window !== 'undefined') {
          window.open('https://github.com/Cthulhu-tech', '_blank');
        }
      });

    const btn = this.add
      .sprite(this.scale.width - 72, this.scale.height - 32, SpecialImage["sound-button"], this.isMuted ? 1 : 0)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(GameDepth.UI);

    btn.on("pointerover", () => btn.setAlpha(0.85));
    btn.on("pointerout",  () => btn.setAlpha(1));
    btn.on("pointerup", () => {
      this.mutHandle();
      btn.setFrame(this.isMuted ? 1 : 0);
    });

    const gameName = this.rexUI.add.label({
      text: this.add
        .text(200, 170, "The supreme cosmic communisssst snake", {
          fontFamily: Text.default,
          fontSize: 32,
          color: EnumGameColor.textColorMenu,
          stroke: EnumGameColor.backgroundDescription,
          strokeThickness: 4,
        })
        .setShadow(2, 2, EnumGameColor.backgroundDescription, 4, true, true)
        .setDepth(GameDepth.UpperObject),
    });

    new MarqueeLabel(
      this,
      "slitherssssheroically out of the grasp of a pssssychedelic interplanetary eagle, who had kidnapped it to abandon the galaxy and turn daily life upsssside down—just because it was loitering ssssusssspiciously near the nesssst.",
      0,
      this.scale.width / 2,
      226,
      GameDepth.UpperObject,
    );
    new MarqueeLabel(
      this,
      "Орёл глядит — змея не дрожит!",
      45,
      120,
      (this.scale.height / 2) + 120
    );
    new MarqueeLabel(
      this,
      "План — пятилетка за один укусccc!",
      24,
      180,
      (this.scale.height / 2) + 190
    );
    new MarqueeLabel(
      this,
      "Каждой чешуйке — по звезде!",
      284,
      300,
      (this.scale.height / 2) + 10
    );
    new MarqueeLabel(
      this,
      "Сcccкользи вперёд, товарищ хвоcccст!",
      30,
      600,
      20 
    );
    new MarqueeLabel(
      this,
      "Змеи — объединяйтесcccь!",
      60,
      650,
      20 
    );

    this.rexUI
      .add.gridSizer({
        x: this.scale.width / 2,
        y: this.scale.height / 2,
        width: this.scale.width,
        height: this.scale.height,
        column: 1,
        row: 1,
        columnProportions: [0],
        rowProportions: [0],
      })
      .add(imageSnake, 0, 0, "left-top", { left: 220, top: 50 })
      .add(gameName, 0, 0)
      .layout();
  }

  mutHandle() {
    this.isMuted = !this.sound.mute;
    this.sound.mute = this.isMuted;
  }
}
