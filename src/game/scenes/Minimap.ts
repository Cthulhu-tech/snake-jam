import { EnumGameColor } from "../../constant/gameColor";
import { CFG } from "../utils/config";
import { Game } from "./Game";

export class Minimap {
  private staticG!: Phaser.GameObjects.Graphics;
  private dynG!: Phaser.GameObjects.Graphics;
  constructor(private scene: Game, private map: Grid, private pocket: Pt) { }
  build() {
    const mmW = this.map[0].length * CFG.MM_TILE;
    const mmH = this.map.length * CFG.MM_TILE;
    const x = CFG.MM_PAD + mmW / 2;
    const y = this.scene.cameras.main.height - CFG.MM_PAD - mmH / 2;

    this.staticG = this.scene.add.graphics().setScrollFactor(0).setDepth(1000);
    this.staticG.x = x - mmW / 2; this.staticG.y = y - mmH / 2;

    for (let ty = 0; ty < this.map.length; ty++) {
      for (let tx = 0; tx < this.map[0].length; tx++) {
        const ch = this.map[ty][tx];
        const color = ch === "1" ? EnumGameColor.mmWall : EnumGameColor.mmFloor;
        this.staticG.fillStyle(color, 1);
        this.staticG.fillRect(tx * CFG.MM_TILE, ty * CFG.MM_TILE, CFG.MM_TILE, CFG.MM_TILE);
      }
    }
    this.staticG.fillStyle(EnumGameColor.hole, 1);
    this.staticG.fillCircle(
      this.pocket.x * CFG.MM_TILE + CFG.MM_TILE / 2,
      this.pocket.y * CFG.MM_TILE + CFG.MM_TILE / 2,
      Math.floor(CFG.MM_TILE * 0.45)
    );
    this.staticG.lineStyle(1, EnumGameColor.mmFrame, 0.9);
    this.staticG.strokeRect(0, 0, this.map[0].length * CFG.MM_TILE, this.map.length * CFG.MM_TILE);

    this.dynG = this.scene.add.graphics().setScrollFactor(0).setDepth(1001);
    this.dynG.x = this.staticG.x; this.dynG.y = this.staticG.y;
  }
  update(ball: Phaser.Math.Vector2) {
    const tx = Math.floor((ball.x - CFG.PADDING) / CFG.TILE);
    const ty = Math.floor((ball.y - CFG.PADDING) / CFG.TILE);
    this.dynG.clear();
    this.dynG.fillStyle(EnumGameColor.snake, 1);
    this.dynG.fillCircle(
      tx * CFG.MM_TILE + CFG.MM_TILE / 2,
      ty * CFG.MM_TILE + CFG.MM_TILE / 2,
      Math.max(2, Math.floor(CFG.MM_TILE * 0.35))
    );
  }
}
