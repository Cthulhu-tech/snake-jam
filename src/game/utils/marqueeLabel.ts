import { Scene } from "phaser";
import { EnumGameColor } from "../../constant/gameColor";
import { GameDepth, Text } from "../../constant/gameConst";

export class MarqueeLabel {
  public readonly view: Phaser.GameObjects.Container;

  private readonly speedPxPerSec = 100;
  private readonly gap = 32;
  private readonly bandW: number;
  private readonly bandH = 40;

  private readonly texts: Phaser.GameObjects.Text[] = [];
  private readonly maskGfx: Phaser.GameObjects.Graphics;
  private readonly onUpdate = (_: number, delta: number) => this.update(delta / 1000);

  constructor(scene: Scene, text: string, angleDeg: number, x: number, y: number, depth = GameDepth.BackGround) {
    this.bandW = scene.scale.width;

    this.view = scene.add.container(x, y).setSize(this.bandW, this.bandH);
    this.view.setAngle(angleDeg);
    this.view.setDepth(depth);
    this.view.setScrollFactor(0);

    const bandColor: number =
      EnumGameColor.backgroundDescriptionNumber;

    const bandFill = scene.add.graphics();
    bandFill.fillStyle(bandColor, 1);
    bandFill.fillRect(-this.bandW / 2, -this.bandH / 2, this.bandW, this.bandH);
    this.view.add(bandFill);

    this.maskGfx = scene.make.graphics({ x, y });
    this.maskGfx.fillRect(-this.bandW / 2, -this.bandH / 2, this.bandW, this.bandH);
    this.maskGfx.rotation = Phaser.Math.DegToRad(angleDeg);

    const geomMask = new Phaser.Display.Masks.GeometryMask(scene, this.maskGfx);

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: Text.default,
      fontSize: 32,
      color: EnumGameColor.textColorMenu,
      stroke: EnumGameColor.backgroundDescription,
      strokeThickness: 4,
    };

    const proto = scene.add.text(0, 0, text, style)
      .setOrigin(0, 0.5)
      .setShadow(2, 2, EnumGameColor.backgroundDescription, 4, true, true)
      .setMask(geomMask);
    this.view.add(proto);
    this.texts.push(proto);

    const unit = Math.max(1, proto.width) + this.gap;
    const needed = Math.ceil(this.bandW / unit) + 2;
    const count = Math.max(3, needed);

    for (let i = 1; i < count; i++) {
      const t = scene.add.text(0, 0, text, style)
        .setOrigin(0, 0.5)
        .setShadow(2, 2, EnumGameColor.backgroundDescription, 4, true, true)
        .setMask(geomMask);
      this.view.add(t);
      this.texts.push(t);
    }

    this.texts.forEach(t => this.view.bringToTop(t));

    const leftEdge = -this.bandW / 2;
    for (let i = 0; i < this.texts.length; i++) {
      const t = this.texts[i];
      t.x = leftEdge + i * unit;
      t.y = 0;
    }

    scene.events.on("update", this.onUpdate);

    this.view.once(Phaser.GameObjects.Events.DESTROY, () => {
      scene.events.off("update", this.onUpdate);
      this.texts.forEach(t => t.destroy());
      this.maskGfx.destroy();
      bandFill.destroy();
    });
  }

  private update(dt: number) {
    this.maskGfx.x = this.view.x;
    this.maskGfx.y = this.view.y;
    this.maskGfx.rotation = this.view.rotation;

    const move = -this.speedPxPerSec * dt;
    const leftEdge = -this.bandW / 2;

    for (const t of this.texts) t.x += move;

    let maxRight = Number.NEGATIVE_INFINITY;
    for (const t of this.texts) {
      const r = t.x + t.width;
      if (r > maxRight) maxRight = r;
    }
    for (const t of this.texts) {
      if (t.x + t.width <= leftEdge) {
        t.x = maxRight + this.gap;
        maxRight = t.x + t.width;
      }
    }
  }
}
