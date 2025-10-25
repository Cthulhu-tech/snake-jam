import Phaser, { Scene } from "phaser";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin";
import { EnumGameColor } from "../../constant/gameColor";
import { SFX } from "../../constant/gameSound";
import { GameDepth, Text } from "../../constant/gameConst";
import Label from "phaser3-rex-plugins/templates/ui/label/Label";
import { CFG } from "../utils/config";
import { Minimap } from "./Minimap";
import { ShotMinigame } from "./ShotMinigame";
import { EagleQTE } from "./EagleQTE";
import { HpView } from "../utils/hpView";
import { U } from "./U";
import { TileFactory } from "../utils/tileFactory";
import { CaveGen } from "./CaveGen";
import { ItemsImage } from "../../constant/gameImage";

const rr = (scene: Game, w: number, h: number, color: number, radius = 12) => {
  return scene.rexUI.add.roundRectangle(0, 0, w, h, radius, color);
}

export class Game extends Scene {
  rexUI: UIPlugin;

  private snake!: Phaser.Physics.Arcade.Image;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private hole!: Phaser.Physics.Arcade.StaticGroup;
  private junk!: Phaser.Physics.Arcade.StaticGroup;

  private canShoot = true;
  private aimStart?: Phaser.Math.Vector2;
  private movedOnce = false;

  private aimLine!: Phaser.GameObjects.Graphics;
  private hudText!: Phaser.GameObjects.Text;
  private hud!: Label;
  private minimap!: Minimap;
  private mini!: ShotMinigame;
  private qte!: EagleQTE;
  private hpView!: HpView;

  private turns = 0;
  private level = 1;
  private cols = CFG.BASE_COLS;
  private rows = CFG.BASE_ROWS;

  private hp = CFG.MAX_HP;

  private pendingDir?: Phaser.Math.Vector2;

  constructor(key = "Game") { super(key); }

  init(data: { level?: number; hp?: number } = {}) {
    if (typeof data.level === "number") this.level = data.level;
    this.cols = CFG.BASE_COLS + (this.level - 1);
    this.rows = CFG.BASE_ROWS + (this.level - 1);
    if (typeof data.hp === "number") this.hp = data.hp;
  }

  create() {
    this.cameras.main.setBackgroundColor(EnumGameColor.bgA);
    this.buildLevel();
  }

  private buildLevel() {
    this.children.removeAll(true);

    const gen = new CaveGen(this.cols, this.rows);
    const { map, start, pocket } = gen.generate();

    const W = map[0].length * CFG.TILE;
    const H = map.length * CFG.TILE;
    this.physics.world.setBounds(CFG.PADDING, CFG.PADDING, W, H);

    this.walls = this.physics.add.staticGroup();
    this.hole = this.physics.add.staticGroup();
    this.junk = this.physics.add.staticGroup();

    const tf = new TileFactory(this);

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        tf.floor(x, y);
        if (map[y][x] === "1") tf.wall(x, y, this.walls);
      }
    }

    tf.hole(pocket, this.hole);

    this.snake = tf.snake(start);
    this.snake.setBounce(CFG.BOUNCE);
    this.snake.setCollideWorldBounds(true);
    this.snake.setMaxVelocity(CFG.MAX_VEL);
    this.snake.setDrag(CFG.DRAG_XY, CFG.DRAG_XY);

    this.physics.add.collider(this.snake, this.walls, () => this.cameras.main.shake(18, 0.0025));
    this.physics.add.collider(this.snake, this.junk, (_ball, obj) => {
      const b = this.snake.body as Phaser.Physics.Arcade.Body;
      this.snake.setVelocity(b.velocity.x * 0.92, b.velocity.y * 0.92);
      obj.destroy();
      this.cameras.main.shake(22, 0.0035);
    });
    this.physics.add.overlap(this.snake, this.hole, () => this.checkWin(), undefined, this);

    this.aimLine = this.add.graphics().setDepth(100).setScrollFactor(1);
    this.hudText = this.add.text(0, 0, "", { fontFamily: Text.default, fontSize: 24, color: EnumGameColor.textColorMenu });

    this.hud = this.rexUI.add.label({
      x: this.cameras.main.width - 20,
      y: 20,
      background: rr(this, 10, 10, EnumGameColor.backgroundDescriptionNumber, 8).setAlpha(0.25),
      text: this.hudText,
      align: "right",
      space: { left: 10, right: 10, top: 6, bottom: 6 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1200);
    this.updateHUD();

    this.minimap = new Minimap(this, map, pocket); this.minimap.build();

    this.mini = new ShotMinigame(this);
    this.mini.build();
    this.qte = new EagleQTE(this, (success) => this.onQteFinish(success));
    this.qte.build();

    this.hpView = new HpView(this);
    this.hpView.build(this.hp, CFG.MAX_HP);

    this.input.removeAllListeners();
    this.input.on("pointerdown", (p) => this.onPointerDown(p));
    this.input.on("pointermove", (p) => this.onPointerMove(p));
    this.input.on("pointerup", (p) => this.onPointerUp(p));

    this.input.keyboard?.removeAllListeners("keydown-SPACE");
    this.input.keyboard?.on("keydown-SPACE", () => this.onSpace());

    this.cameras.main.setBounds(0, 0, CFG.PADDING * 2 + map[0].length * CFG.TILE, CFG.PADDING * 2 + map.length * CFG.TILE);
    this.cameras.main.startFollow(this.snake, true, 0.14, 0.14);

    this.turns = 0;
    this.canShoot = true;
    this.movedOnce = false;
    this.pendingDir = undefined;
  }

  update(_: number, delta: number) {
    this.mini.update(delta / 1000);
    this.qte.update(delta / 1000);

    if (!this.canShoot) {
      const b = this.snake.body as Phaser.Physics.Arcade.Body;
      if (b.velocity.lengthSq() > 1) this.movedOnce = true;
      this.snake.setVelocity(b.velocity.x / CFG.FRAME_DAMP, b.velocity.y / CFG.FRAME_DAMP);
      if (b.velocity.lengthSq() < CFG.SNAP_SPEED_SQ) {
        b.setVelocity(0, 0);
        this.afterStop();
      }
    }
    this.minimap.update(new Phaser.Math.Vector2(this.snake.x, this.snake.y));
  }

  private onPointerDown(p: Phaser.Input.Pointer) {
    if (!this.canShoot || this.mini.isActive() || this.qte.isActive()) return;
    this.aimStart = new Phaser.Math.Vector2(p.worldX, p.worldY);
  }

  private onPointerMove(p: Phaser.Input.Pointer) {
    if (!this.canShoot || !this.aimStart || this.mini.isActive() || this.qte.isActive()) return;

    const v = new Phaser.Math.Vector2(p.worldX - this.snake.x, p.worldY - this.snake.y);
    if (v.lengthSq() < 1) return;
    const dir = v.normalize();

    const ax = this.snake.x, ay = this.snake.y;
    this.aimLine.clear();
    this.aimLine.lineStyle(3, EnumGameColor.aimLine, 0.95);

    const bx = ax + dir.x * CFG.AIM_FIXED_LEN;
    const by = ay + dir.y * CFG.AIM_FIXED_LEN;

    this.aimLine.beginPath();
    this.aimLine.moveTo(ax, ay);
    this.aimLine.lineTo(bx, by);
    this.aimLine.strokePath();
  }

  private onPointerUp(p: Phaser.Input.Pointer) {
    if (!this.canShoot || !this.aimStart || this.mini.isActive() || this.qte.isActive()) return;
    const v = new Phaser.Math.Vector2(p.worldX - this.snake.x, p.worldY - this.snake.y);
    if (v.lengthSq() < 16) {
      this.aimLine.clear();
      this.aimStart = undefined; return;
    }

    this.pendingDir = v.normalize();
    this.aimStart = undefined;

    this.mini.start();

    const ax = this.snake.x, ay = this.snake.y;
    const bx = ax + this.pendingDir.x * CFG.AIM_FIXED_LEN;
    const by = ay + this.pendingDir.y * CFG.AIM_FIXED_LEN;
    this.aimLine.clear();
    this.aimLine.lineStyle(2, EnumGameColor.aimLine, 0.7);
    this.aimLine.beginPath();
    this.aimLine.moveTo(ax, ay);
    this.aimLine.lineTo(bx, by);
    this.aimLine.strokePath();

    this.updateHUD();
  }

  private onSpace() {
    if (!this.pendingDir || !this.mini.isActive() || this.qte.isActive()) return;

    const { powerMul, angleJitter } = this.mini.stop();
    const dir = this.pendingDir.clone().rotate(angleJitter).normalize();

    this.sound.play(SFX.EagleHat, { volume: 0.9 });

    const force = CFG.BASE_POWER * CFG.SHOT_FORCE * powerMul;
    this.snake.setVelocity(dir.x * force, dir.y * force);
    this.canShoot = false;
    this.movedOnce = false;

    this.pendingDir = undefined;
    this.aimLine.clear();
    this.updateHUD();
  }

  private afterStop() {
    this.canShoot = true;
    this.turns++;
    this.spawnJunk();
    this.updateHUD();

    if (this.turns % CFG.QTE_TURN_STEP === 0 && !this.qte.isActive()) {
      this.canShoot = false;
      this.qte.start();
    }
  }

  private onQteFinish(success: boolean) {
    if (!success) {
      this.cameras.main.shake(150, 0.05);
      this.hp = Math.max(0, this.hp - 1);
      this.hpView.set(this.hp, CFG.MAX_HP);
      if (this.hp <= 0) {
        this.gameOver(); return;
      }
    }
    this.canShoot = true;
    this.updateHUD();
  }

  private gameOver() {


    this.rexUI.add.label({
      x: 0,
      y: 0,
      background: this.rexUI.add
        .roundRectangle(this.scale.width / 2, this.scale.height / 2, 520, 180, 12, EnumGameColor.gameOverBg)
        .setDepth(GameDepth.UI),
      text: this.add.text((this.scale.width / 2) - 100, (this.scale.height / 2) - 30, "GAME OVER\nThe Eagle pecked your pride.", {
        fontFamily: Text.default,
        fontSize: "24px",
        color: EnumGameColor.textColorMenu,
        align: "center",
      }),
      space: { left: 16, right: 16, top: 16, bottom: 16 },
      align: "center"
    })
      .setScrollFactor(0)
      .setDepth(GameDepth.UI);
    this.canShoot = false;

    this.time.delayedCall(CFG.GAME_OVER_DELAY, () => {
      this.level = 1;
      this.scene.restart({ level: 1, hp: CFG.MAX_HP });
    });
  }

  private spawnJunk() {
    const cols = Math.floor((this.physics.world.bounds.width - CFG.PADDING * 2) / CFG.TILE);
    const rows = Math.floor((this.physics.world.bounds.height - CFG.PADDING * 2) / CFG.TILE);
    const free: { wx: number; wy: number }[] = [];

    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const wx = CFG.PADDING + x * CFG.TILE + CFG.TILE / 2;
      const wy = CFG.PADDING + y * CFG.TILE + CFG.TILE / 2;

      const nearSnake = Phaser.Math.Distance.Between(this.snake.x, this.snake.y, wx, wy) < CFG.TILE * 0.9;
      if (nearSnake) continue;
      const nearHole = this.hole.getChildren().some(h => Phaser.Math.Distance.Between((h as any).x, (h as any).y, wx, wy) < CFG.TILE * 0.55);
      if (nearHole) continue;
      const nearWall = this.walls.getChildren().some(w => Phaser.Math.Distance.Between((w as any).x, (w as any).y, wx, wy) < CFG.TILE * 0.48);
      if (nearWall) continue;
      const onJunk = this.junk.getChildren().some(j => Phaser.Math.Distance.Between((j as any).x, (j as any).y, wx, wy) < 2);
      if (onJunk) continue;

      free.push({ wx, wy });
    }

    if (!free.length) return;
    Phaser.Utils.Array.Shuffle(free);
    const dropCount = Phaser.Math.Between(1, 2);
    for (let i = 0; i < dropCount && i < free.length; i++) {
      const { wx, wy } = free[i];

      const key = U.randItemKey();

      const img = this.physics.add.staticImage(wx, wy, ItemsImage[key]);
      const tex = this.textures.get(ItemsImage[key]).getSourceImage();
      const scale = (CFG.TILE * 0.55) / Math.max(tex.width, tex.height);
      img.setScale(scale).refreshBody();
      this.junk.add(img);
    }
  }

  private updateHUD() {
    const toQte = CFG.QTE_TURN_STEP - (this.turns % CFG.QTE_TURN_STEP || 0);
    this.hudText?.setText(
      `Lvl ${this.level}  |  Turns: ${this.turns}  |  Next eagle Attack in: ${toQte === CFG.QTE_TURN_STEP ? CFG.QTE_TURN_STEP : toQte}`
    );
    this.hud?.layout?.();
  }

  private checkWin() {
    if (!this.movedOnce) return;
    this.sound.play(SFX.SnakeWin, { volume: 0.9 });
    this.level += 1;
    this.scene.restart({ level: this.level, hp: this.hp });
  }
}
