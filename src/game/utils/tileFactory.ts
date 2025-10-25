import { EnumGameColor } from "../../constant/gameColor";
import { SPR } from "../../constant/gameImage";
import { Game } from "../scenes/Game";
import { U } from "../scenes/U";
import { CFG } from "./config";

export class TileFactory {
  constructor(private scene: Game) { }

  floor(x: number, y: number) {
    const wx = CFG.PADDING + x * CFG.TILE + CFG.TILE / 2;
    const wy = CFG.PADDING + y * CFG.TILE + CFG.TILE / 2;

    if (U.hasTexture(this.scene, SPR.floor)) {
      const img = this.scene.add.image(wx, wy, SPR.floor);
      const scale = (CFG.TILE - 4) / Math.max(img.width, img.height);
      return img.setScale(scale);
    } else {
      return this.scene.add.rectangle(wx, wy, CFG.TILE - 4, CFG.TILE - 4,
        (x + y) % 2 === 0 ? EnumGameColor.bgA : EnumGameColor.bgB);
    }
  }

  wall(x: number, y: number, group: Phaser.Physics.Arcade.StaticGroup) {
    const wx = CFG.PADDING + x * CFG.TILE + CFG.TILE / 2;
    const wy = CFG.PADDING + y * CFG.TILE + CFG.TILE / 2;

    if (U.hasTexture(this.scene, SPR.wall)) {
      const img = this.scene.add.image(wx, wy, SPR.wall);
      const scale = (CFG.TILE * CFG.WALL_SIZE) / Math.max(img.width, img.height);
      img.setScale(scale);

      group.add(img);
      return img;
    } else {
      const rect = this.scene.add.rectangle(wx, wy, CFG.TILE * CFG.WALL_SIZE, CFG.TILE * CFG.WALL_SIZE, EnumGameColor.wallFill)
        .setStrokeStyle(2, EnumGameColor.wallStroke);
      this.scene.physics.add.existing(rect, true);
      group.add(rect);
      return rect;
    }
  }

  hole(pocket: Pt, group: Phaser.Physics.Arcade.StaticGroup) {
    const wx = CFG.PADDING + pocket.x * CFG.TILE + CFG.TILE / 2;
    const wy = CFG.PADDING + pocket.y * CFG.TILE + CFG.TILE / 2;

    if (U.hasTexture(this.scene, SPR.hole)) {
      const img = this.scene.add.image(wx, wy, SPR.hole).setDepth(1);
      const scale = (CFG.TILE * 0.64) / Math.max(img.width, img.height);
      img.setScale(scale);
    } else {
      this.scene.add.circle(wx, wy, CFG.TILE * 0.32, EnumGameColor.hole).setDepth(1);
    }
    const body = this.scene.physics.add.staticImage(wx, wy, "").setVisible(false);
    body.setCircle(CFG.TILE * 0.32);
    group.add(body);
  }

  snake(start: Pt): Phaser.Physics.Arcade.Image {
    const sx = CFG.PADDING + start.x * CFG.TILE + CFG.TILE / 2;
    const sy = CFG.PADDING + start.y * CFG.TILE + CFG.TILE / 2;

    if (U.hasTexture(this.scene, SPR.snake)) {
      const img = this.scene.physics.add.image(sx, sy, SPR.snake);
      const scale = (CFG.TILE * 0.7) / Math.max(img.width, img.height);
      img.setScale(scale);
      img.setCircle(CFG.TILE * CFG.BALL_RADIUS);
      return img;
    } else {
      const img = this.scene.physics.add.image(sx, sy, "").setTint(EnumGameColor.snake);
      img.setCircle(CFG.TILE * CFG.BALL_RADIUS);
      return img;
    }
  }
}
