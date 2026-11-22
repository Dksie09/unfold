// The wedding invite: one pop-up room per event, drawn with the same pen as the journal rooms.
// Each room has an invite card pinned on its right wall (clickable: it opens the details).

import type { Pt, Sketch } from "./sketch";
import { isoLayers, WHITE, type Iso } from "./iso";
import { look, tint } from "./style";
import type { Room } from "./rooms";
import { F, almondLeaf, cloud, fairyLights, flower, planks, scallopRug, soft, sparkle, tapedPhoto, tiles } from "./rooms";
import { WEDDING, fmtDay, fmtTime, getGuest, type WeddingEvent } from "./wedding";

const MARIGOLD = ["#f4a43b", "#f7c948", "#f08a3c"];
const LEAF = "#bfe0b0";
const GOLD = "#f0d48a";
const CREAM = "#fffaf0";

const ev = (key: string) => WEDDING.events.find((e) => e.key === key) as WeddingEvent;

// ---------------------------------------------------------------------------
// decorations

/** A string of marigolds sagging between two points. */
function garland(s: Sketch, x1: number, x2: number, y: number, sag = 0.05, r = 0.014) {
  const n = Math.max(6, Math.round((x2 - x1) / (r * 1.5)));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([x1 + (x2 - x1) * t, y + Math.sin(t * Math.PI) * sag]);
  }
  s.stroke(pts, { w: 1.4 });
  pts.forEach(([x, yy], i) => {
    const c = MARIGOLD[i % MARIGOLD.length];
    s.blob(x, yy, r, r * 0.9, tint(c), { w: 1.3 });
    s.circle(x, yy, r * 0.35, { w: 1, alpha: 0.6 });
  });
  almondLeaf(s, x1 + 0.012, y + 0.03, r * 1.6, 0.2, LEAF);
  almondLeaf(s, x2 - 0.012, y + 0.03, r * 1.6, -0.2, LEAF);
}

/** Vertical strands of marigolds (laris) hanging from y0, each ending in a little tassel. */
function laris(s: Sketch, xs: number[], y0: number, len: number, r = 0.013) {
  xs.forEach((x, k) => {
    const L = len * (0.8 + ((k * 37) % 5) * 0.06);
    s.line(x, y0, x, y0 + L, { w: 1.2 });
    for (let y = y0 + r; y < y0 + L; y += r * 1.7) s.blob(x, y, r, r * 0.85, tint(MARIGOLD[(k + Math.round(y * 97)) % 3]), { w: 1.2 });
    s.stroke(
      [
        [x - 0.008, y0 + L + 0.03],
        [x, y0 + L],
        [x + 0.008, y0 + L + 0.03],
      ],
      { w: 1.3 },
    );
  });
}

/** A row of mango leaves hanging from a cord (toran). */
function toran(s: Sketch, x1: number, x2: number, y: number) {
  s.line(x1, y, x2, y, { w: 2 });
  for (let x = x1 + 0.025; x < x2 - 0.01; x += 0.045) {
    almondLeaf(s, x, y + 0.035, 0.03, 0, LEAF);
    s.blob(x + 0.022, y + 0.01, 0.009, 0.009, tint(MARIGOLD[0]), { w: 1.1 });
  }
}

/** A small clay lamp with a flame. */
function diya(s: Sketch, x: number, y: number, w = 0.05) {
  if (look.color) s.glow(x, y - w * 0.6, w * 1.6, "#ffcf5a", 0.55);
  const bowl: Pt[] = [[x - w / 2, y - w * 0.2], ...s.ellipsePts(x, y - w * 0.2, w / 2, w * 0.35, 0, Math.PI, 12), [x + w / 2, y - w * 0.2]];
  s.sticker(bowl, 2, 0.12, tint("#e9a07c"));
  s.stroke(bowl, { closed: true, w: 1.7 });
  const flame: Pt[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = (i / 10) * Math.PI * 2;
    flame.push([x + Math.sin(t) * w * 0.16, y - w * 0.55 - Math.cos(t) * w * 0.32 - (Math.cos(t) < 0 ? w * 0.18 * -Math.cos(t) : 0)]);
  }
  s.sticker(flame, 1, 0, tint("#ffd56b"));
  s.stroke(flame, { closed: true, w: 1.4 });
}

/** The invite card pinned on a wall; clicking it opens the details. */
function inviteCard(s: Sketch, e: WeddingEvent, x: number, y: number, w: number, h: number, accent: string) {
  const card = s.rectPts(x, y, w, h);
  s.sticker(card, 6, 0.24, tint(CREAM));
  s.mark("invite", card);
  s.stroke(card, { closed: true, w: 2.6 });
  s.fill(s.rectPts(x + 0.015, y + 0.015, w - 0.03, h - 0.03), tint(accent), { alpha: 0.35, jitter: 0 });
  s.rect(x + 0.015, y + 0.015, w - 0.03, h - 0.03, { w: 1.3 });
  for (const [cx, cy] of [
    [x + 0.015, y + 0.015],
    [x + w - 0.015, y + 0.015],
    [x + 0.015, y + h - 0.015],
    [x + w - 0.015, y + h - 0.015],
  ])
    flower(s, cx, cy, 0.01, accent);
  const cx = x + w / 2;
  s.text(e.name, cx, y + h * 0.2, 0.075);
  s.text(e.tagline, cx, y + h * 0.36, 0.03, { weight: 500 });
  s.line(cx - w * 0.25, y + h * 0.46, cx + w * 0.25, y + h * 0.455, { w: 1.4 });
  s.text(fmtDay(e.start), cx, y + h * 0.58, 0.046);
  s.text(fmtTime(e.start), cx, y + h * 0.7, 0.04, { weight: 500 });
  s.text(e.venue, cx, y + h * 0.84, 0.03, { weight: 500 });
  // little pin
  s.blob(cx, y + 0.005, 0.012, 0.012, tint("#f6a99a"), { w: 1.6 });
}

/** Framed photo of the couple (two little stick portraits). */
function couplePhoto(s: Sketch, x: number, y: number, w: number, h: number, rot = 0) {
  tapedPhoto(s, x, y, w, h, rot);
  s.stroke(s.ellipsePts(x + w * 0.34, y + h * 0.88, w * 0.16, h * 0.2, Math.PI, Math.PI * 2, 10), { w: 1.4 });
  s.circle(x + w * 0.34, y + h * 0.5, w * 0.09, { w: 1.3 });
  s.circle(x + w * 0.62, y + h * 0.42, w * 0.07, { w: 1.3 });
}

function wash(s: Sketch, c: string) {
  if (look.color) s.washAll(tint(c), 1);
}

/** Petals scattered over a floor. */
function petals(s: Sketch, n: number, colors = MARIGOLD) {
  for (let i = 0; i < n; i++) {
    const x = 0.08 + s.r() * 0.84;
    const y = 0.08 + s.r() * 0.84;
    const p = s.ellipsePts(x, y, 0.008, 0.005);
    s.sticker(p, 0.5, 0, tint(colors[i % colors.length]));
    s.stroke(p, { closed: true, w: 1 });
  }
}

/** Soft cushion seen from above as an iso box with rounded look. */
function cushion(iso: Iso, x: number, y: number, size: number, color: string) {
  iso.box(x, y, 0, size, size, 0.05, WHITE, { color });
  iso.at([x + size / 2, y + size / 2, 0.05], (s, [px, py], u) => s.circle(px, py, 0.008 * u, { w: 1.4, mask: true }));
}

// ---------------------------------------------------------------------------
// the rooms

const ROKA = { wall: "#fbe6e4", floor: "#f0dcc0", accent: "#f7ccd6", sofa: "#f3c5cf", glass: "#dcebfa" };

const roka: Room = {
  name: "roka",
  mood: ev("roka").tagline,
  left(s) {
    wash(s, ROKA.wall);
    // arched window with clouds, fairy lights and a garland
    const win: Pt[] = [[0.25, 0.62], ...s.ellipsePts(0.45, 0.32, 0.2, 0.14, Math.PI, Math.PI * 2, 18), [0.65, 0.62]];
    s.sticker(win, 7, 0.2, tint(ROKA.glass));
    s.stroke(win, { closed: true, w: 2.8 });
    s.line(0.45, 0.18, 0.45, 0.62, { w: 2.2 });
    s.line(0.25, 0.42, 0.65, 0.42, { w: 2.2 });
    cloud(s, 0.36, 0.3, 0.02);
    cloud(s, 0.55, 0.5, 0.024, true);
    garland(s, 0.22, 0.68, 0.17, 0.06);
    fairyLights(s, 0.05, 0.95, 0.06, 0.05);
    couplePhoto(s, 0.05, 0.38, 0.1, 0.12, -0.05);
    couplePhoto(s, 0.74, 0.3, 0.12, 0.14, 0.04);
  },
  right(s) {
    wash(s, ROKA.wall);
    garland(s, 0.02, 0.98, 0.06, 0.05);
    inviteCard(s, ev("roka"), 0.28, 0.16, 0.44, 0.46, ROKA.accent);
    sparkle(s, 0.18, 0.3, 0.03);
    sparkle(s, 0.84, 0.48, 0.022);
  },
  floor(s) {
    if (look.color) s.washAll(tint(ROKA.floor), 1);
    planks(s, tint(ROKA.floor), 8);
    s.shadow([F(0.03, 0.28), F(0.3, 0.28), F(0.3, 0.86), F(0.03, 0.86)], 0.24, 16);
    scallopRug(s, [F(0.36, 0.36), F(0.86, 0.36), F(0.86, 0.86), F(0.36, 0.86)], ROKA.accent, 12);
    petals(s, 18, ["#f7ccd6", "#f6a99a"]);
  },
  popups: isoLayers([
    (iso) => {
      // sofa against the left wall
      iso.box(0.03, 0.3, 0, 0.24, 0.56, 0.16, WHITE, { color: ROKA.sofa });
      iso.box(0.02, 0.3, 0.16, 0.07, 0.56, 0.2, WHITE, { color: ROKA.sofa });
      iso.box(0.03, 0.26, 0, 0.24, 0.05, 0.26, WHITE, { color: ROKA.sofa });
      iso.box(0.03, 0.85, 0, 0.24, 0.05, 0.26, WHITE, { color: ROKA.sofa });
      iso.box(0.09, 0.36, 0.16, 0.06, 0.12, 0.11, WHITE, { color: "#fff3b5" });
      iso.box(0.09, 0.66, 0.16, 0.06, 0.12, 0.11, WHITE, { color: "#dbe8fb" });
    },
    (iso) => {
      // coffee table with the ring box and a box of mithai
      for (const [a, b] of [
        [0.44, 0.48],
        [0.7, 0.48],
        [0.44, 0.7],
        [0.7, 0.7],
      ])
        iso.line([a, b, 0], [a, b, 0.17], { w: 2.4 });
      iso.box(0.42, 0.46, 0.17, 0.3, 0.26, 0.025, WHITE, { color: "#ead3b2" });
      const T = 0.195;
      iso.box(0.48, 0.52, T, 0.07, 0.07, 0.04, WHITE, { color: "#f6a99a" });
      iso.face(
        [
          [0.48, 0.52, T + 0.04],
          [0.55, 0.52, T + 0.04],
          [0.55, 0.52, T + 0.1],
          [0.48, 0.52, T + 0.1],
        ],
        tint("#f6a99a"),
        { w: 1.8 },
      );
      iso.at([0.515, 0.56, T + 0.05], (s, [x, y], u) => {
        s.circle(x, y - 0.012 * u, 0.012 * u, { w: 2, mask: true });
        s.blob(x, y - 0.026 * u, 0.006 * u, 0.006 * u, tint("#dbe8fb"), { w: 1.3, mask: true });
      });
      iso.box(0.6, 0.55, T, 0.12, 0.1, 0.035, WHITE, { color: GOLD });
      iso.at([0.66, 0.6, T + 0.035], (s, [x, y], u) => {
        for (const [dx, dy] of [
          [-0.025, 0],
          [0.0, -0.01],
          [0.025, 0],
        ])
          s.blob(x + dx * u, y + dy * u, 0.012 * u, 0.009 * u, tint("#fff3cf"), { w: 1.3, mask: true });
      });
    },
  ]),
};

const HALDI = { wall: "#fff1c2", floor: "#f7ead2", accent: "#f7d77a", wood: "#e2c49a", brass: "#f0cf6e", paste: "#f6c445" };

const haldi: Room = {
  name: "haldi",
  mood: ev("haldi").tagline,
  left(s) {
    wash(s, HALDI.wall);
    toran(s, 0.0, 1.0, 0.05);
    laris(s, [0.1, 0.18, 0.26, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9], 0.09, 0.32);
    // an arched niche with a diya
    const niche: Pt[] = [[0.38, 0.78], ...s.ellipsePts(0.48, 0.6, 0.1, 0.08, Math.PI, Math.PI * 2, 12), [0.58, 0.78]];
    s.sticker(niche, 4, 0.2, tint("#f7e2b0"));
    s.stroke(niche, { closed: true, w: 2.2 });
    diya(s, 0.48, 0.76, 0.06);
  },
  right(s) {
    wash(s, HALDI.wall);
    toran(s, 0.0, 1.0, 0.05);
    inviteCard(s, ev("haldi"), 0.28, 0.16, 0.44, 0.46, HALDI.accent);
    laris(s, [0.1, 0.18, 0.82, 0.9], 0.09, 0.4);
  },
  floor(s) {
    if (look.color) s.washAll(tint(HALDI.floor), 1);
    tiles(s, 8, 0.4);
    s.shadow(s.ellipsePts(...F(0.42, 0.42), 0.14, 0.12), 0.22, 14);
    petals(s, 40);
  },
  popups: isoLayers([
    (iso) => {
      // basket of marigolds by the wall
      iso.cyl(0.14, 0.14, 0, 0.08, 0.08, WHITE, { r2: 0.1, color: HALDI.wood });
      iso.at([0.14, 0.14, 0.08], (s, [x, y], u) => {
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2;
          s.blob(x + Math.cos(a) * 0.05 * u, y + Math.sin(a) * 0.025 * u - 0.012 * u, 0.02 * u, 0.017 * u, tint(MARIGOLD[k % 3]), { w: 1.3, mask: true });
        }
      });
    },
    (iso) => {
      // low wooden stool (patla) with brass bowls of haldi beside it
      iso.box(0.32, 0.32, 0.06, 0.22, 0.16, 0.04, WHITE, { color: HALDI.wood });
      for (const [a, b] of [
        [0.34, 0.34],
        [0.51, 0.34],
        [0.34, 0.45],
        [0.51, 0.45],
      ])
        iso.box(a, b, 0, 0.02, 0.02, 0.06, WHITE, { color: HALDI.wood });
      for (const [a, b, r] of [
        [0.62, 0.48, 0.06],
        [0.5, 0.62, 0.05],
      ] as const) {
        iso.cyl(a, b, 0, r * 0.6, 0.03, WHITE, { r2: r, color: HALDI.brass });
        iso.disc(a, b, 0.03, r * 0.8, tint(HALDI.paste), { w: 1.3 });
      }
      iso.cyl(0.66, 0.66, 0, 0.03, 0.06, WHITE, { r2: 0.035, color: HALDI.brass });
    },
  ]),
};

const MEH = { wall: "#e3f2dc", floor: "#f2e6d6", accent: "#cfe8c4", rug: "#f7ccd6", umbrellas: ["#f7ccd6", "#f7d77a", "#cfe0f7", "#f6a99a"], rope: "#d9c3a0", seat: "#f3c5cf" };

function umbrella(s: Sketch, x: number, y: number, r: number, c: string) {
  const canopy: Pt[] = [[x - r, y], ...s.ellipsePts(x, y, r, r * 0.55, Math.PI, Math.PI * 2, 16), [x + r, y]];
  for (let i = 0; i <= 6; i++) canopy.push([x + r - (2 * r * i) / 6, y + (i % 2 ? 0.012 : 0)]);
  s.sticker(canopy, 3, 0.16, tint(c));
  s.stroke(canopy, { closed: true, w: 1.8 });
  for (const dx of [-0.5, 0, 0.5]) s.line(x, y - r * 0.55, x + dx * r, y, { w: 1, alpha: 0.6 });
  s.line(x, y - r * 0.55, x, y - r * 0.55 - 0.08, { w: 1.2 });
  s.stroke(
    [
      [x, y],
      [x, y + r * 0.6],
      [x + 0.012, y + r * 0.66],
    ],
    { w: 1.6 },
  );
}

const mehendi: Room = {
  name: "mehendi",
  mood: ev("mehendi").tagline,
  left(s) {
    wash(s, MEH.wall);
    umbrella(s, 0.2, 0.22, 0.07, MEH.umbrellas[0]);
    umbrella(s, 0.38, 0.16, 0.06, MEH.umbrellas[1]);
    umbrella(s, 0.56, 0.24, 0.075, MEH.umbrellas[2]);
    umbrella(s, 0.76, 0.17, 0.06, MEH.umbrellas[3]);
    garland(s, 0.05, 0.95, 0.42, 0.06, 0.012);
    // henna hand print
    const hx = 0.86;
    const hy = 0.58;
    s.sticker(s.ellipsePts(hx, hy, 0.05, 0.06), 3, 0.15, tint("#f7e6cf"));
    s.ellipse(hx, hy, 0.05, 0.06, { w: 1.6 });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      s.circle(hx + Math.cos(a) * 0.025, hy + Math.sin(a) * 0.025, 0.008, { w: 1.1 });
    }
    s.circle(hx, hy, 0.01, { w: 1.2 });
  },
  right(s) {
    wash(s, MEH.wall);
    garland(s, 0.02, 0.98, 0.06, 0.05);
    inviteCard(s, ev("mehendi"), 0.28, 0.16, 0.44, 0.46, MEH.accent);
    umbrella(s, 0.12, 0.24, 0.06, MEH.umbrellas[0]);
    umbrella(s, 0.86, 0.3, 0.06, MEH.umbrellas[2]);
  },
  floor(s) {
    if (look.color) s.washAll(tint(MEH.floor), 1);
    planks(s, tint(MEH.floor), 8, false);
    s.shadow(s.ellipsePts(...F(0.3, 0.5), 0.12, 0.08), 0.22, 14);
    scallopRug(s, [F(0.3, 0.3), F(0.88, 0.3), F(0.88, 0.88), F(0.3, 0.88)], MEH.rug, 12);
    petals(s, 14, ["#f7ccd6", "#cfe8c4"]);
  },
  popups: isoLayers([
    (iso) => {
      // jhoola: a swing hanging from the top, along the left wall
      const SA = 0.16;
      for (const b of [0.36, 0.68]) iso.line([SA, b, 0.98], [SA, b, 0.26], { w: 2 });
      iso.box(SA - 0.07, 0.34, 0.22, 0.14, 0.36, 0.04, WHITE, { color: MEH.rope });
      iso.box(SA - 0.07, 0.38, 0.26, 0.05, 0.12, 0.1, WHITE, { color: MEH.seat });
      iso.box(SA - 0.07, 0.54, 0.26, 0.05, 0.12, 0.1, WHITE, { color: "#fff3b5" });
      iso.at([SA, 0.52, 0.98], (s, [x, y], u) => {
        for (let k = 0; k < 6; k++) s.blob(x + (k - 2.5) * 0.04 * u, y + 0.01 * u, 0.012 * u, 0.012 * u, tint(MARIGOLD[k % 3]), { w: 1.2, mask: true });
      });
    },
    (iso) => {
      cushion(iso, 0.44, 0.44, 0.13, "#f7d77a");
      cushion(iso, 0.64, 0.56, 0.13, "#cfe0f7");
      // tray with henna cones
      iso.box(0.5, 0.66, 0, 0.14, 0.1, 0.02, WHITE, { color: GOLD });
      for (const [a, b] of [
        [0.54, 0.7],
        [0.6, 0.72],
      ])
        iso.line([a, b, 0.02], [a + 0.04, b - 0.01, 0.05], { w: 3.2 });
    },
  ]),
};

const SAN = { wall: "#a3a7e0", wallSoft: "#5960a8", floor: "#9296d2", tile: "#b3b6e8", accent: "#c8c4f3", speaker: "#3b3b52", drum: "#f3c5cf" };

const sangeet: Room = {
  name: "sangeet",
  mood: ev("sangeet").tagline,
  left(s) {
    if (look.color) s.washAll(tint(SAN.wall, "#ffffff"), 1);
    // stage backdrop of fairy-light strands
    for (let x = 0.08; x < 0.95; x += 0.06) {
      s.line(x, 0.04, x, 0.66, { w: 1, alpha: 0.6 });
      for (let y = 0.08; y < 0.66; y += 0.06) {
        if (look.color) s.glow(x, y, 0.03, "#ffd56b", 0.5);
        s.blob(x, y, 0.006, 0.008, tint("#fff1b0"), { w: 1 });
      }
    }
    // banner
    const banner = s.rectPts(0.2, 0.26, 0.6, 0.14);
    s.sticker(banner, 5, 0.25, tint("#f7ccd6"));
    s.stroke(banner, { closed: true, w: 2.4 });
    s.text("let's dance", 0.5, 0.33, 0.08);
    // music notes
    for (const [x, y] of [
      [0.12, 0.76],
      [0.85, 0.72],
    ]) {
      s.blob(x, y, 0.015, 0.012, tint("#fff1b0"), { w: 1.5 });
      s.line(x + 0.014, y, x + 0.014, y - 0.07, { w: 1.6 });
      s.line(x + 0.014, y - 0.07, x + 0.04, y - 0.055, { w: 1.6 });
    }
  },
  right(s) {
    if (look.color) s.washAll(tint(SAN.wall, "#ffffff"), 1);
    fairyLights(s, 0.02, 0.98, 0.06, 0.06);
    inviteCard(s, ev("sangeet"), 0.28, 0.16, 0.44, 0.46, SAN.accent);
    for (const [x, y] of [
      [0.14, 0.2],
      [0.86, 0.36],
      [0.12, 0.6],
    ])
      sparkle(s, x, y, 0.025);
  },
  floor(s) {
    if (look.color) s.washAll(tint(SAN.floor, "#ffffff"), 1);
    const n = 6;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if ((i + j) % 2) {
          const sq = [F(i / n, j / n), F((i + 1) / n, j / n), F((i + 1) / n, (j + 1) / n), F(i / n, (j + 1) / n)];
          if (look.color) s.fill(sq, tint(SAN.tile, "#ffffff"), { alpha: 1, jitter: 0.2 });
          else s.hatch(sq, 0.02, -0.8, 1, 0.22);
        }
    tiles(s, n, 0.5);
    if (look.color) {
      s.glow(...F(0.5, 0.5), 0.35, "#ffd56b", 0.25);
      s.glow(...F(0.3, 0.7), 0.2, "#f7ccd6", 0.3);
    }
  },
  popups: isoLayers([
    (iso) => {
      // speakers in the corner and a dholak
      iso.box(0.04, 0.04, 0, 0.12, 0.12, 0.34, WHITE, { color: SAN.speaker });
      iso.at([0.1, 0.16, 0.24], (s, [x, y], u) => {
        s.circle(x, y, 0.035 * u, { w: 1.8, mask: true });
        s.circle(x, y, 0.012 * u, { w: 1.4, mask: true });
      });
      iso.at([0.1, 0.16, 0.1], (s, [x, y], u) => s.circle(x, y, 0.025 * u, { w: 1.6, mask: true }));
      iso.box(0.7, 0.04, 0, 0.12, 0.12, 0.3, WHITE, { color: SAN.speaker });
      iso.at([0.76, 0.16, 0.2], (s, [x, y], u) => s.circle(x, y, 0.035 * u, { w: 1.8, mask: true }));
    },
    (iso) => {
      // mic stand
      iso.disc(0.42, 0.36, 0, 0.04, tint("#cfcfd8"), { w: 1.6 });
      iso.line([0.42, 0.36, 0], [0.42, 0.36, 0.42], { w: 2.4 });
      iso.line([0.42, 0.36, 0.42], [0.46, 0.4, 0.46], { w: 2.4 });
      iso.at([0.47, 0.41, 0.47], (s, [x, y], u) => s.blob(x, y, 0.016 * u, 0.02 * u, tint("#cfcfd8"), { w: 1.6, mask: true }));
      // dholak on the floor
      iso.cyl(0.62, 0.5, 0, 0.06, 0.14, WHITE, { color: SAN.drum });
      iso.at([0.62, 0.5, 0.07], (s, [x, y], u) => {
        for (let k = -2; k <= 2; k++) s.line(x + k * 0.02 * u, y - 0.06 * u, x + k * 0.025 * u, y + 0.06 * u, { w: 1, mask: true });
      });
    },
  ]),
};

const WED = { wall: "#f9e1dc", drape: "#e8857e", drape2: "#f5c7a9", floor: "#f2e2cc", accent: "#f6b7aa", pillar: GOLD, seat: "#e8857e" };

/** Draped fabric hanging in swags across the top of a wall. */
function swags(s: Sketch, x1: number, x2: number, y: number, n: number, c: string) {
  const w = (x2 - x1) / n;
  for (let i = 0; i < n; i++) {
    const a = x1 + i * w;
    const swag: Pt[] = [[a, y], [a + w, y], ...s.ellipsePts(a + w / 2, y, w / 2, w * 0.35, 0, Math.PI, 12)];
    s.sticker(swag, 3, 0.16, tint(c));
    s.stroke(swag, { closed: true, w: 1.8 });
    s.stroke(s.ellipsePts(a + w / 2, y, w * 0.35, w * 0.2, 0.2, Math.PI - 0.2, 10), { w: 1, alpha: 0.6 });
  }
  for (let i = 0; i <= n; i++) s.blob(x1 + i * w, y, 0.014, 0.014, tint(MARIGOLD[0]), { w: 1.4 });
}

function drapePanel(s: Sketch, x: number, top: number, w: number, c: string) {
  const pts: Pt[] = [
    [x, top],
    [x + w, top],
    [x + w * 0.8, 0.5],
    [x + w * 1.05, 0.98],
    [x - w * 0.05, 0.98],
    [x + w * 0.2, 0.5],
  ];
  s.sticker(soft(pts, 2), 3, 0.18, tint(c));
  s.stroke(soft(pts, 2), { closed: true, w: 2 });
  s.line(x + w * 0.5, top + 0.02, x + w * 0.5, 0.95, { w: 1, alpha: 0.6 });
}

const wedding: Room = {
  name: "wedding",
  mood: ev("wedding").tagline,
  left(s) {
    wash(s, WED.wall);
    swags(s, 0.0, 1.0, 0.04, 5, WED.drape);
    drapePanel(s, 0.08, 0.06, 0.1, WED.drape2);
    drapePanel(s, 0.82, 0.06, 0.1, WED.drape2);
    laris(s, [0.3, 0.38, 0.46, 0.54, 0.62, 0.7], 0.12, 0.3);
    // a shelf of diyas
    s.sticker(s.rectPts(0.28, 0.66, 0.46, 0.025), 3, 0.18, tint("#e2c49a"));
    s.box(0.28, 0.66, 0.46, 0.025, null, { w: 2 });
    for (const x of [0.33, 0.43, 0.53, 0.63]) diya(s, x, 0.66, 0.045);
  },
  right(s) {
    wash(s, WED.wall);
    swags(s, 0.0, 1.0, 0.04, 5, WED.drape);
    inviteCard(s, ev("wedding"), 0.28, 0.16, 0.44, 0.46, WED.accent);
    drapePanel(s, 0.08, 0.06, 0.1, WED.drape2);
    drapePanel(s, 0.82, 0.06, 0.1, WED.drape2);
  },
  floor(s) {
    if (look.color) s.washAll(tint(WED.floor), 1);
    tiles(s, 6, 0.35);
    // rangoli under the mandap
    const [cx, cy] = F(0.47, 0.47);
    for (const [r, n, c] of [
      [0.2, 16, MARIGOLD[0]],
      [0.15, 12, "#f6b7aa"],
      [0.1, 10, "#f7d77a"],
    ] as const) {
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const pts = s.ellipsePts(0, 0, r * 0.18, r * 0.42).map(([px, py]) => [cx + Math.cos(a) * r * 0.62 + px * Math.cos(a) - py * Math.sin(a), cy + Math.sin(a) * r * 0.62 + px * Math.sin(a) + py * Math.cos(a)] as Pt);
        s.sticker(pts, 1, 0.05, tint(c));
        s.stroke(pts, { closed: true, w: 1.2 });
      }
    }
    s.circle(cx, cy, 0.035, { w: 1.6 });
  },
  popups: isoLayers([
    (iso) => {
      // mandap: three pillars at the back and a frame on top hung with marigolds
      const H = 0.72;
      const P = [
        [0.24, 0.24],
        [0.72, 0.24],
        [0.24, 0.72],
      ];
      for (const [a, b] of P) {
        iso.box(a - 0.025, b - 0.025, 0, 0.05, 0.05, 0.04, WHITE, { color: WED.pillar });
        iso.box(a - 0.015, b - 0.015, 0.04, 0.03, 0.03, H - 0.04, WHITE, { color: WED.pillar });
      }
      for (const [a0, b0, a1, b1] of [
        [0.24, 0.24, 0.72, 0.24],
        [0.24, 0.24, 0.24, 0.72],
        [0.72, 0.24, 0.72, 0.72],
        [0.24, 0.72, 0.72, 0.72],
      ]) {
        iso.line([a0, b0, H], [a1, b1, H], { w: 3 });
        for (let t = 0.1; t < 1; t += 0.2) {
          const a = a0 + (a1 - a0) * t;
          const b = b0 + (b1 - b0) * t;
          iso.at([a, b, H], (s, [x, y], u) => {
            s.line(x, y, x, y + 0.1 * u, { w: 1, mask: true });
            for (let k = 0; k < 4; k++) s.blob(x, y + (0.02 + k * 0.022) * u, 0.01 * u, 0.009 * u, tint(MARIGOLD[k % 3]), { w: 1, mask: true });
          });
        }
      }
    },
    (iso) => {
      // the sacred fire (havan kund) and two low seats
      iso.box(0.4, 0.4, 0, 0.14, 0.14, 0.04, WHITE, { color: "#e2c49a" });
      iso.box(0.42, 0.42, 0.04, 0.1, 0.1, 0.04, WHITE, { color: "#e2c49a" });
      iso.at([0.47, 0.47, 0.08], (s, [x, y], u) => {
        if (look.color) s.glow(x, y - 0.1 * u, 0.22 * u, "#ffb347", 0.65);
        const flame = soft(
          [
            [x - 0.07 * u, y],
            [x - 0.04 * u, y - 0.12 * u],
            [x - 0.01 * u, y - 0.22 * u],
            [x + 0.03 * u, y - 0.11 * u],
            [x + 0.07 * u, y],
          ],
          2,
        );
        s.shape(flame, tint("#ffcf5a"), { mask: true, w: 1.6 });
        s.shape(
          soft(
            [
              [x - 0.035 * u, y],
              [x, y - 0.11 * u],
              [x + 0.035 * u, y],
            ],
            2,
          ),
          tint("#f6a99a"),
          { mask: true, w: 1.2 },
        );
      });
      cushion(iso, 0.58, 0.36, 0.11, WED.seat);
      cushion(iso, 0.36, 0.58, 0.11, WED.seat);
    },
    (iso) => {
      // the front pillar
      iso.box(0.695, 0.695, 0, 0.05, 0.05, 0.04, WHITE, { color: WED.pillar });
      iso.box(0.705, 0.705, 0.04, 0.03, 0.03, 0.68, WHITE, { color: WED.pillar });
    },
  ]),
};

const REC = { wall: "#f6f1e7", floor: "#e9e1d3", accent: "#efe2c4", cloth: "#fffaf0", cake: "#fbefd9", glass: "#dcebfa" };

function chandelier(s: Sketch, x: number, y: number, w: number) {
  s.line(x, 0, x, y, { w: 1.6 });
  if (look.color) s.glow(x, y + w * 0.3, w * 1.4, "#ffe39a", 0.5);
  const arms: Pt[] = [...s.ellipsePts(x, y + w * 0.2, w, w * 0.28, 0, Math.PI, 14)];
  s.stroke(arms, { w: 2 });
  s.stroke(s.ellipsePts(x, y + w * 0.05, w * 0.6, w * 0.18, 0, Math.PI, 12), { w: 1.6 });
  for (const t of [-1, -0.5, 0, 0.5, 1]) {
    const cx = x + t * w;
    const cy = y + w * 0.2 + Math.sqrt(Math.max(0, 1 - t * t)) * w * 0.28;
    s.rect(cx - 0.006, cy - 0.04, 0.012, 0.04, { w: 1.2 });
    s.blob(cx, cy - 0.052, 0.006, 0.01, tint("#ffd56b"), { w: 1 });
    for (let k = 0; k < 2; k++) s.blob(cx, cy + 0.015 + k * 0.018, 0.005, 0.008, tint(REC.glass), { w: 1 });
  }
}

const reception: Room = {
  name: "reception",
  mood: ev("reception").tagline,
  left(s) {
    wash(s, REC.wall);
    chandelier(s, 0.5, 0.18, 0.14);
    for (const x of [0.12, 0.72]) {
      const win: Pt[] = [[x, 0.86], [x, 0.42], ...s.ellipsePts(x + 0.08, 0.42, 0.08, 0.1, Math.PI, Math.PI * 2, 10), [x + 0.16, 0.86]];
      s.sticker(win, 5, 0.18, tint(REC.glass));
      s.stroke(win, { closed: true, w: 2.4 });
      s.line(x + 0.08, 0.34, x + 0.08, 0.86, { w: 1.6 });
      s.line(x, 0.6, x + 0.16, 0.6, { w: 1.6 });
    }
  },
  right(s) {
    wash(s, REC.wall);
    fairyLights(s, 0.02, 0.98, 0.06, 0.05);
    inviteCard(s, ev("reception"), 0.28, 0.16, 0.44, 0.46, REC.accent);
    couplePhoto(s, 0.06, 0.3, 0.13, 0.16, -0.03);
    couplePhoto(s, 0.8, 0.34, 0.12, 0.14, 0.05);
  },
  floor(s) {
    if (look.color) s.washAll(tint(REC.floor), 1);
    tiles(s, 5, 0.4);
    for (let i = 0; i < 20; i++) {
      const x = s.r();
      const y = s.r();
      s.line(x, y, x + 0.05, y + 0.02, { w: 1, alpha: 0.25 });
    }
    s.shadow(s.ellipsePts(...F(0.18, 0.2), 0.12, 0.1), 0.22, 14);
    s.shadow(s.ellipsePts(...F(0.56, 0.56), 0.18, 0.15), 0.22, 16);
  },
  popups: isoLayers([
    (iso) => {
      // cake table in the corner with a three-tier cake
      iso.cyl(0.18, 0.18, 0, 0.12, 0.2, WHITE, { color: REC.cloth });
      iso.cyl(0.18, 0.18, 0.2, 0.08, 0.07, WHITE, { color: REC.cake });
      iso.cyl(0.18, 0.18, 0.27, 0.06, 0.06, WHITE, { color: REC.cake });
      iso.cyl(0.18, 0.18, 0.33, 0.04, 0.05, WHITE, { color: REC.cake });
      iso.at([0.18, 0.18, 0.38], (s, [x, y], u) => {
        s.blob(x - 0.01 * u, y - 0.012 * u, 0.012 * u, 0.012 * u, tint("#f6b7aa"), { w: 1.3, mask: true });
        s.blob(x + 0.012 * u, y - 0.008 * u, 0.01 * u, 0.01 * u, tint("#f7ccd6"), { w: 1.3, mask: true });
      });
    },
    (iso) => {
      // round dinner table with a long cloth, plates and a centrepiece
      iso.cyl(0.56, 0.56, 0, 0.16, 0.26, WHITE, { r2: 0.15, color: REC.cloth });
      for (const a of [0.4, 1.9, 3.4, 4.9]) {
        const px = 0.56 + Math.cos(a) * 0.1;
        const py = 0.56 + Math.sin(a) * 0.1;
        iso.disc(px, py, 0.262, 0.03, WHITE, { w: 1.3 });
      }
      iso.cyl(0.56, 0.56, 0.26, 0.02, 0.06, WHITE, { color: REC.glass });
      iso.at([0.56, 0.56, 0.32], (s, [x, y], u) => {
        for (const [dx, dy] of [
          [-0.025, 0],
          [0.025, -0.005],
          [0, -0.025],
        ])
          flower(s, x + dx * u, y + dy * u, 0.01 * u, "#f7ccd6", true);
      });
    },
  ]),
};

export const ROOMS: Room[] = [roka, haldi, mehendi, sangeet, wedding, reception];

// ---------------------------------------------------------------------------
// covers

export function drawFrontCover(s: Sketch) {
  if (look.color) s.washAll(tint("#fbe9e1"), 1);
  s.rect(0.06, 0.06, 0.88, 0.88, { w: 3 });
  s.rect(0.09, 0.09, 0.82, 0.82, { w: 1.4, alpha: 0.8 });
  for (const [x, y] of [
    [0.09, 0.09],
    [0.91, 0.09],
    [0.09, 0.91],
    [0.91, 0.91],
  ])
    flower(s, x, y, 0.016, MARIGOLD[0]);
  garland(s, 0.14, 0.86, 0.12, 0.07, 0.013);
  s.text(WEDDING.hosts, 0.5, 0.3, 0.035, { weight: 500 });
  s.text(WEDDING.couple[0], 0.5, 0.42, 0.11);
  s.text("&", 0.5, 0.52, 0.06, { weight: 500 });
  s.text(WEDDING.couple[1], 0.5, 0.62, 0.11);
  const first = WEDDING.events[0].start;
  const last = WEDDING.events[WEDDING.events.length - 1].start;
  s.text(`${fmtDay(first).split(" ").slice(1).join(" ")} – ${fmtDay(last).split(" ").slice(1).join(" ")} · ${WEDDING.city}`, 0.5, 0.72, 0.035, { weight: 500 });
  const g = getGuest();
  if (g) {
    s.line(0.3, 0.8, 0.7, 0.795, { w: 1.2 });
    s.text(`for ${g}`, 0.5, 0.84, 0.042);
  }
}

export function drawBackCover(s: Sketch) {
  if (look.color) s.washAll(tint("#fbe9e1"), 1);
  s.rect(0.06, 0.06, 0.88, 0.88, { w: 3 });
  s.text("with love", 0.5, 0.5, 0.06, { weight: 500 });
}
