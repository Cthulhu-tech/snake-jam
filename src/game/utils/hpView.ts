import { SPR } from "../../constant/gameImage";
import { Game } from "../scenes/Game";

export class HpView {
  private icons: Phaser.GameObjects.Sprite[] = [];
  constructor(private scene: Game) { }
  build(hp: number, maxHp: number) {
    this.icons.forEach(s => s.destroy());
    this.icons.length = 0;

    const baseX = 16;
    const baseY = 10;
    for (let i = 0; i < maxHp; i++) {
      const spr = this.scene.add.sprite(baseX + i * 32, baseY, SPR.hp, 1);
      spr.setScrollFactor(0).setDepth(1500).setOrigin(0, 0);
      this.icons.push(spr);
    }
    this.set(hp, maxHp);
  }
  set(hp: number, maxHp: number) {
    for (let i = 0; i < maxHp; i++) {
      const frame = i < hp ? 0 : 1;
      this.icons[i]?.setFrame(frame);
    }
  }
}
