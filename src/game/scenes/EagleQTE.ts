import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";
import { EnumGameColor } from "../../constant/gameColor";
import { Text } from "../../constant/gameConst";
import { SFX } from "../../constant/gameSound";
import { CFG } from "../utils/config";
import { Game } from "./Game";
import { U } from "./U";
import { SPR } from "../../constant/gameImage";

export class EagleQTE {
  private panelBG!: RoundRectangle;
  private panelFrame!: RoundRectangle
  private title!: Phaser.GameObjects.Text;
  private bigHint!: Phaser.GameObjects.Text;
  private lettersRow!: Phaser.GameObjects.Container;
  private progressG!: Phaser.GameObjects.Graphics;
  private eagleImg?: Phaser.GameObjects.Image;

  private keyBoxes: KeyBox[] = [];

  private active = false;
  private seq: string[] = [];
  private idx = 0;

  private timer?: Phaser.Time.TimerEvent;
  private keyDuration = CFG.QTE_TIMEOUT_PER_KEY;
  private keyDeadline = 0;

  private static LETTERS = "QWERTY";

  constructor(private scene: Game, private onFinish: (success: boolean) => void) {}

  build() {
    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.panelBG = this.scene.rexUI.add.roundRectangle(0, 0, 720, 280, 14, EnumGameColor.qteBg)
      .setDepth(3000).setScrollFactor(0);
    this.panelFrame = this.scene.rexUI.add.roundRectangle(0, 0, 720, 280, 14, 0)
      .setStrokeStyle(3, EnumGameColor.qteFrame)
      .setDepth(3000).setScrollFactor(0);

    this.title = this.scene.add.text(cx, cy - 110, "EAGLE ATTACK!", {
      fontFamily: Text.default,
      fontSize: "26px",
      color: EnumGameColor.textColorMenu,
      align: "center",
    })
      .setOrigin(0.5)
      .setDepth(3001)
      .setScrollFactor(0);


    this.eagleImg = this.scene.add.image(cx, cy - 60, SPR.eagle)
    .setDisplaySize(72, 72).setDepth(3001).setScrollFactor(0);

    this.bigHint = this.scene.add.text(cx, cy + 80, "", {
      fontFamily: Text.default,
      fontSize: "22px",
      color: EnumGameColor.textColorMenu,
      align: "center",
    })
      .setOrigin(0.5)
      .setStroke("#000", 6)
      .setDepth(3001)
      .setScrollFactor(0);

    this.lettersRow = this.scene.add.container(cx, cy, [])
      .setDepth(3001)
      .setScrollFactor(0);

    this.progressG = this.scene.add.graphics().setDepth(3002).setScrollFactor(0);

    this.panelBG.setPosition(cx, cy);
    this.panelFrame.setPosition(cx, cy);

    this.setVisible(false);
  }

  start() {
    if (this.active) return;
    this.active = true;

    const len = Phaser.Math.Between(CFG.QTE_LEN_MIN, CFG.QTE_LEN_MAX);
    this.seq = Array.from({ length: len }, () =>
      EagleQTE.LETTERS[Phaser.Math.Between(0, EagleQTE.LETTERS.length - 1)]
    );
    this.idx = 0;

    this.rebuildLetters();
    this.armKeyTimer();

    this.scene.sound.play(SFX.EagleAttack, { volume: 0.9 });

    this.scene.input.keyboard?.removeListener("keydown", this.onKeyDown, this);
    this.scene.input.keyboard?.on("keydown", this.onKeyDown, this);

    this.draw();
    this.setVisible(true);
  }

  private finish(success: boolean) {
    this.active = false;
    if (this.timer) this.timer.remove(false);
    this.scene.input.keyboard?.removeListener("keydown", this.onKeyDown, this);
    this.setVisible(false);
    this.onFinish(success);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (!this.active) return;
    const need = this.seq[this.idx];
    const got = e.key.toUpperCase();

    if (got === need) {
      this.idx++;
      if (this.timer) this.timer.remove(false);
      if (this.idx >= this.seq.length) {
        this.finish(true);
      } else {
        this.armKeyTimer();
        this.draw();
      }
    } else {
      if (this.timer) this.timer.remove(false);
      this.finish(false);
    }
  }

  private armKeyTimer() {
    this.keyDuration = CFG.QTE_TIMEOUT_PER_KEY;

    this.timer?.remove(false);
    this.timer = this.scene.time.addEvent({
      delay: this.keyDuration,
      loop: false,
      callback: () => this.finish(false),
    });

    this.keyDeadline = this.scene.time.now + this.keyDuration;
  }

  private rebuildLetters() {
    this.keyBoxes.forEach(k => {
      k.rect.destroy();
      k.label.destroy();
    });
    this.keyBoxes = [];
    this.lettersRow.removeAll(true);

    const boxW = 64, boxH = 64, gap = 10;
    const totalW = this.seq.length * boxW + (this.seq.length - 1) * gap;
    let x = -totalW / 2 + boxW / 2;

    for (let i = 0; i < this.seq.length; i++) {
      const ch = this.seq[i];

      const rect = this.scene.add.rectangle(0, 0, boxW, boxH, EnumGameColor.mmWall, 1)
        .setStrokeStyle(2, EnumGameColor.mmFrame)
        .setDepth(3001).setScrollFactor(0);

      const label = this.scene.add.text(0, 0, ch, {
        fontFamily: Text.default,
        fontSize: "34px",
        color: EnumGameColor.textColorMenu,
      }).setOrigin(0.5).setDepth(3001).setScrollFactor(0);

      rect.setPosition(x, 0);
      label.setPosition(x, 0);

      this.lettersRow.add([rect, label]);
      this.keyBoxes.push({ rect, label });

      x += boxW + gap;
    }
  }

  private styleBox(i: number, state: "default" | "current" | "done") {
    const kb = this.keyBoxes[i]; if (!kb) return;

    if (state === "default") {
      kb.rect.setFillStyle(EnumGameColor.mmWall, 1).setStrokeStyle(2, EnumGameColor.mmFrame);
      kb.label.setColor(EnumGameColor.textColorMenu);
      kb.rect.setScale(1); kb.label.setScale(1);
    } else if (state === "current") {
      kb.rect.setFillStyle(EnumGameColor.backgroundDescriptionNumber, 1).setStrokeStyle(3, EnumGameColor.aimLine);
      kb.label.setColor(EnumGameColor.textColorMenu);
      kb.rect.setScale(1.1); kb.label.setScale(1.1);
    } else {
      kb.rect.setFillStyle(EnumGameColor.miniOk, 1).setStrokeStyle(2, EnumGameColor.miniOk);
      kb.label.setColor(EnumGameColor.backgroundDescription);
      kb.rect.setScale(1); kb.label.setScale(1);
    }
  }

  private drawProgress() {
    this.progressG.clear();
    if (!this.active) return;

    const cam = this.scene.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    const w = 560, h = 14;
    const x = cx - w / 2;
    const y = cy + 110;

    let left = 1;
    const t = this.timer;
    if (t && typeof t.getProgress === "function") {
      left = 1 - t.getProgress();
    } else {
      left = U.clamp((this.keyDeadline - this.scene.time.now) / this.keyDuration, 0, 1);
    }

    this.progressG.lineStyle(2, EnumGameColor.qteFrame, 1);
    this.progressG.strokeRect(x, y, w, h);

    this.progressG.fillStyle(EnumGameColor.miniOk, 1);
    this.progressG.fillRect(x + 1, y + 1, Math.max(0, (w - 2) * left), h - 2);
  }

  private draw() {
    for (let i = 0; i < this.seq.length; i++) {
      const st = i < this.idx ? "done" : (i === this.idx ? "current" : "default");
      this.styleBox(i, st);
    }

    const cur = this.seq[this.idx] ?? "";
    this.bigHint.setText(cur ? `PRESS: [ ${cur} ]` : "GOOD!");
    this.drawProgress();
  }

  update(_: number) {
    if (!this.active) return;
    this.drawProgress();
  }

  private setVisible(v: boolean) {
    this.panelBG?.setVisible(v);
    this.panelFrame?.setVisible(v);
    this.title?.setVisible(v);
    this.bigHint?.setVisible(v);
    this.lettersRow?.setVisible(v);
    this.progressG?.setVisible(v);
    this.eagleImg?.setVisible(v);
  }

  isActive() { return this.active; }
}
