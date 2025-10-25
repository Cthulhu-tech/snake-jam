export class CFG {
  static readonly TILE = 84;
  static readonly PADDING = 40;

  static readonly BALL_RADIUS = 0.22;
  static readonly BOUNCE = 1.0;
  static readonly DRAG_XY = 80;
  static readonly MAX_VEL = 1600;

  static readonly BASE_POWER = 260;
  static readonly SHOT_FORCE = 2.0;

  static readonly SNAP_SPEED_SQ = 900;
  static readonly FRAME_DAMP = 1.01;

  static readonly WALL_SIZE = 0.90;

  static readonly BORN = [4, 5, 6, 7, 8, 9, 10, 11];
  static readonly SURVIVE = [2, 3, 4, 5];
  static readonly SMOOTH = 5;
  static readonly RANDOM_FILL = 0.5;

  static readonly MM_TILE = 6;
  static readonly MM_PAD = 8;

  static readonly BASE_COLS = 10;
  static readonly BASE_ROWS = 10;

  static readonly AIM_FIXED_LEN = 120;

  static readonly QTE_TURN_STEP = 3;
  static readonly QTE_LEN_MIN = 2;
  static readonly QTE_LEN_MAX = 5;
  static readonly QTE_TIMEOUT_PER_KEY = 2000;

  static readonly MAX_HP = 3;

  static readonly GAME_OVER_DELAY = 1200;
}
