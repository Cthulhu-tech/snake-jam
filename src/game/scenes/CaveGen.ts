import { CFG } from "../utils/config";
import * as ROT from "rot-js";
import { U } from "./U";

export class CaveGen {
  constructor(private cols: number, private rows: number) { }
  private inBounds(x: number, y: number) { return x >= 0 && x < this.cols && y >= 0 && y < this.rows; }

  generate(): { map: Grid; start: Pt; pocket: Pt } {
    let best: { map: Grid; start: Pt; pocket: Pt } | null = null;
    let bestScore = -Infinity;

    for (let attempt = 0; attempt < 8; attempt++) {
      const res = this.tryOnce();
      const flat = res.map.join("");
      const floors = flat.split("").filter(c => c === "0" || c === "o").length;
      const ratio = floors / flat.length;
      const score = -Math.abs(ratio - 0.5);
      if (score > bestScore) { best = res; bestScore = score; }
      if (ratio > 0.30 && ratio < 0.70) return res;
    }
    return best!;
  }

  private tryOnce(): { map: Grid; start: Pt; pocket: Pt } {
    const m = new ROT.Map.Cellular(this.cols, this.rows, {
      topology: 4,
      born: CFG.BORN,
      survive: CFG.SURVIVE,
    });
    m.randomize(CFG.RANDOM_FILL);
    for (let i = 0; i < CFG.SMOOTH; i++) m.create();

    const raw: number[][] = Array.from({ length: this.rows }, () => Array(this.cols).fill(1));

    m.connect(
      (x: number, y: number, value: number) => {
        if (this.inBounds(x, y)) raw[y][x] = value;
        },
      0,
      (x: number, y: number) => {
        if (this.inBounds(x, y)) raw[y][x] = 0;
        }
    );

    for (let x = 0; x < this.cols; x++) { raw[0][x] = 1; raw[this.rows - 1][x] = 1; }
    for (let y = 0; y < this.rows; y++) { raw[y][0] = 1; raw[y][this.cols - 1] = 1; }

    let map: Grid = raw.map(row => row.map(v => (v ? "1" : "0")).join(""));

    const floors: Pt[] = [];
    for (let y = 1; y < this.rows - 1; y++)
      for (let x = 1; x < this.cols - 1; x++)
        if (map[y][x] === "0") floors.push({ x, y });
    if (!floors.length) {
      const cx = Math.floor(this.cols / 2), cy = Math.floor(this.rows / 2);
      const r = map[cy].split(""); r[cx] = "0"; map[cy] = r.join("");
      floors.push({ x: cx, y: cy });
    }
    Phaser.Utils.Array.Shuffle(floors);
    const start = floors[0];

    const side = U.farthestSideFrom(start, this.cols, this.rows);
    const edge: Pt[] = [];
    if (side === "left") for (let y = 0; y < this.rows; y++) edge.push({ x: 0, y });
    if (side === "right") for (let y = 0; y < this.rows; y++) edge.push({ x: this.cols - 1, y });
    if (side === "top") for (let x = 0; x < this.cols; x++) edge.push({ x, y: 0 });
    if (side === "bottom") for (let x = 0; x < this.cols; x++) edge.push({ x, y: this.rows - 1 });

    let border = edge.filter(p => map[p.y][p.x] === "0");
    if (!border.length) {
      if (side === "left") for (let y = 0; y < this.rows; y++) if (map[y][1] === "0") border.push({ x: 1, y });
      if (side === "right") for (let y = 0; y < this.rows; y++) if (map[y][this.cols - 2] === "0") border.push({ x: this.cols - 2, y });
      if (side === "top") for (let x = 0; x < this.cols; x++) if (map[1][x] === "0") border.push({ x, y: 1 });
      if (side === "bottom") for (let x = 0; x < this.cols; x++) if (map[this.rows - 2][x] === "0") border.push({ x, y: this.rows - 2 });
    }

    const passable = (x: number, y: number) => map[y]?.[x] === "0";
    let best: { p: Pt; len: number } | null = null;
    for (const p of border) {
      const path: Pt[] = [];
      new ROT.Path.AStar(p.x, p.y, passable, { topology: 4 })
        .compute(start.x, start.y, (x, y) => path.push({ x, y }));
      if (path.length > 0 && (!best || path.length > best.len)) best = { p, len: path.length };
    }
    const pocket = best ? best.p : floors[0];

    const row = map[start.y].split(""); row[start.x] = "o"; map[start.y] = row.join("");
    return { map, start, pocket };
  }
}
