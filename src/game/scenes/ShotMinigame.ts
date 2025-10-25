import { EnumGameColor } from "../../constant/gameColor";
import { Game } from "./Game";

export class ShotMinigame {
  private g: Phaser.GameObjects.Graphics;
  private running = false;
  private t = 0;
  private dir = 1;
  private speed = 1.35;
  private okFrom = 0.4;
  private okTo = 0.6;

  constructor(private scene: Game) { }
  build() {
    this.g = this.scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(2000);
  }
  start() {
    this.running = true;
    this.t = Math.random();
    this.dir = Math.random() < 0.5 ? 1 : -1;
    const center = Phaser.Math.FloatBetween(0.35, 0.65);
    const half = Phaser.Math.FloatBetween(0.08, 0.14);
    this.okFrom = Phaser.Math.Clamp(center - half, 0.1, 0.8);
    this.okTo = Phaser.Math.Clamp(center + half, 0.2, 0.9);
  }
  stop(): { success: boolean; powerMul: number; angleJitter: number } {
    this.running = false;
    const inOk = this.t >= this.okFrom && this.t <= this.okTo;
    const c = (this.okFrom + this.okTo) * 0.5;
    const span = (this.okTo - this.okFrom) * 0.5;
    const dist = Math.min(1, Math.abs(this.t - c) / Math.max(0.0001, span));
    let powerMul = 0.6 + (1 - dist) * 1.0;
    powerMul *= inOk ? 1.10 : 0.85;
    const angleJitter = inOk ? 0 : Phaser.Math.FloatBetween(-Math.PI * 0.06, Math.PI * 0.06);
    this.g.clear();
    return { success: inOk, powerMul, angleJitter };
  }
  isActive() { return this.running; }
  update(dtSec: number) {
    if (!this.running) return;
    this.t += this.dir * dtSec * this.speed;
    if (this.t >= 1) { this.t = 1 - (this.t - 1); this.dir = -1; }
    if (this.t <= 0) { this.t = -this.t; this.dir = 1; }

    const w = 260, h = 40;
    const x = this.scene.cameras.main.width - w - 20;
    const y = this.scene.cameras.main.height - h - 20;

    this.g.clear();
    this.g.lineStyle(2, EnumGameColor.miniFrame, 1);
    this.g.strokeRect(x, y, w, h);
    this.g.fillStyle(EnumGameColor.miniOk, 0.25);
    this.g.fillRect(x + this.okFrom * w, y, (this.okTo - this.okFrom) * w, h);

    const mx = x + this.t * w;
    this.g.fillStyle(EnumGameColor.miniMarker, 1);
    this.g.fillRect(mx - 2, y, 4, h);
  }
}
