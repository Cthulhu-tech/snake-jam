import { ItemsImage } from "../../constant/gameImage";
import { Game } from "./Game";

export class U {
  static clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
  static farthestSideFrom(start: Pt, cols: number, rows: number): Side {
    const dists = [
      { side: "left" as Side, d: start.x },
      { side: "right" as Side, d: cols - 1 - start.x },
      { side: "top" as Side, d: start.y },
      { side: "bottom" as Side, d: rows - 1 - start.y },
    ];
    dists.sort((a, b) => b.d - a.d);
    return dists[0].side;
  }
  static hasTexture(scene: Game, key: string) {
    return scene.textures.exists(key);
  }
  static randItemKey(): string {
    const keys = Object.keys(ItemsImage ?? {});
    return keys.length ? keys[(Math.random() * keys.length) | 0] : "";
  }
}
