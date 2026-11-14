/**
 * GameRoom.ts — Anjali Tripathi Portfolio
 *
 * Full scene ported from index(6).html, extended with neon cyber aesthetic.
 * Procedural Three.js geometry — no external model files needed.
 *
 * Coordinate origin: centre of desk, floor at y ≈ −3210.
 * Monitor sits at (0, 950, 255) matching MonitorScreen.ts.
 */

import * as THREE from 'three';
import Application from '../Application';

// ── Colour constants ───────────────────────────────────────────────────────
const CYAN   = 0x00f5ff;
const PURPLE = 0xbf00ff;
const GREEN  = 0x00ff88;
const GOLD   = 0xffd700;

// ── Material helpers ───────────────────────────────────────────────────────
const std = (c: number, r = 0.7, m = 0.1) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });

const neon = (c: number, i = 1.0) =>
    new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4, metalness: 0.1 });

const basic = (c: number) => new THREE.MeshBasicMaterial({ color: c });

// ── Geometry builders ──────────────────────────────────────────────────────
function box(
    w: number, h: number, d: number, mat: THREE.Material,
    x = 0, y = 0, z = 0,
    rx = 0, ry = 0, rz = 0,
    parent?: THREE.Object3D
): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    if (parent) parent.add(m);
    return m;
}

function cyl(
    rt: number, rb: number, h: number, mat: THREE.Material,
    x = 0, y = 0, z = 0,
    rx = 0, ry = 0, rz = 0,
    segs = 32,
    parent?: THREE.Object3D
): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    if (parent) parent.add(m);
    return m;
}

// ── Keyboard canvas texture (from index6) ─────────────────────────────────
function makeKeyboardTexture(): THREE.CanvasTexture {
    const kc = document.createElement('canvas');
    kc.width = 900; kc.height = 280;
    const kx = kc.getContext('2d')!;
    kx.fillStyle = '#0d121d';
    kx.fillRect(0, 0, 900, 280);
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 15; c++) {
            kx.fillStyle = (r * 15 + c) % 11 === 0 ? '#1d4a63' : '#1a2234';
            kx.strokeStyle = 'rgba(0,245,255,0.33)';
            kx.lineWidth = 1.5;
            kx.beginPath();
            kx.rect(12 + c * 58, 12 + r * 52, 52, 44);
            kx.fill();
            kx.stroke();
        }
    }
    return new THREE.CanvasTexture(kc);
}

// ── Scanline glass texture (from index6) ──────────────────────────────────
function makeScanlineTexture(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 1; c.height = 4;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    ctx.fillRect(0, 0, 1, 1);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 256);
    return t;
}

// ════════════════════════════════════════════════════════════════════════════
export default class GameRoom {
    app:   Application;
    scene: THREE.Scene;
    group: THREE.Group;

    // animated objects
    floatingPanels: THREE.Mesh[] = [];
    lights:         THREE.Light[]  = [];
    glass:          THREE.Mesh | null = null;
    t = 0;

    // monitor wrapper div — used for hover detection (from index6)
    monitorWrap: HTMLElement | null = null;

    constructor() {
        this.app   = new Application();
        this.scene = this.app.scene;
        this.group = new THREE.Group();

        this.buildScene();
        this.scene.add(this.group);
    }

    // ── Build everything ───────────────────────────────────────────────────
    buildScene() {
        this.buildRoom();
        this.buildDesk();
        this.buildMonitorBody();
        this.buildKeyboard();
        this.buildMouse();
        this.buildMug();
        this.buildSpeakers();
        this.buildLamp();
        this.buildPCTower();
        this.buildChair();
        this.buildShelves();
        this.buildFloorGrid();
        this.buildWallAccents();
        this.buildFloatingPanels();
        this.buildLighting();
    }

    // ── ROOM SHELL ─────────────────────────────────────────────────────────
    buildRoom() {
        const W = 30000, H = 15000, D = 20000;
        const FLOOR_Y = -3210;

        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(90000, 90000),
            std(0x070a12, 0.9, 0.0)
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = FLOOR_Y;
        this.group.add(floor);

        // Back wall
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(90000, 30000),
            std(0x0a1020, 1.0, 0.0)
        );
        wall.position.set(0, 9000, -2700);
        this.group.add(wall);

        // Side walls (thin boxes for occlusion)
        this.group.add(box(60, H, D, std(0x080b10), -W / 2, H / 2, 0));
        this.group.add(box(60, H, D, std(0x080b10),  W / 2, H / 2, 0));

        // Ceiling
        this.group.add(box(W, 60, D, std(0x060810),  0, H, 0));
    }

    // ── DESK ───────────────────────────────────────────────────────────────
    buildDesk() {
        const wood = std(0x1a2236, 0.65, 0.05);
        const dark = std(0x10151f, 0.80, 0.05);

        // Desktop surface (matches index6 scale)
        this.group.add(box(9600, 140, 4200, wood, 0, -70, 300));

        // Legs
        const legY = -70 - 140 / 2;
        const legH = legY - (-3210) + 160;
        [[-4600, -1700], [4600, -1700], [-4600, 2200], [4600, 2200]].forEach(([x, z]) => {
            this.group.add(box(160, legH, 160, dark, x, legY - legH / 2, z));
        });

        // Cable LED strip under desk front edge
        this.group.add(box(9200, 20, 20, neon(CYAN, 0.4), 0, legY - 20, 300 + 4200 / 2 - 200));

        // Mousepad
        this.group.add(box(1900, 8, 1500, std(0x0b1a2c, 0.9), 1500, -70 + 140 / 2 + 4, 400));
    }

    // ── MONITOR BODY (index6 style) ────────────────────────────────────────
    buildMonitorBody() {
        const SCREEN_W = 1280, SCREEN_H = 1024;
        const T = 150, depth = 120;
        const body = std(0x161b29, 0.6, 0.3);

        // Monitor group shares the screen's pose so local +z faces viewer
        const mon = new THREE.Group();
        mon.position.set(0, 950, 255);
        mon.rotation.x = -3 * THREE.MathUtils.DEG2RAD;
        this.group.add(mon);

        // Bezel panels
        box(SCREEN_W + 2 * T, T, depth, body, 0,  SCREEN_H / 2 + T / 2, depth / 2 - 20, 0, 0, 0, mon);
        box(SCREEN_W + 2 * T, T, depth, body, 0, -SCREEN_H / 2 - T / 2, depth / 2 - 20, 0, 0, 0, mon);
        box(T, SCREEN_H, depth, body, -SCREEN_W / 2 - T / 2, 0, depth / 2 - 20, 0, 0, 0, mon);
        box(T, SCREEN_H, depth, body,  SCREEN_W / 2 + T / 2, 0, depth / 2 - 20, 0, 0, 0, mon);

        // Back body + neck + stand
        box(SCREEN_W + 2 * T - 80, SCREEN_H + 2 * T - 80, 1000, body, 0, 0, -540, 0, 0, 0, mon);
        box(1000, 860, 520, body, 0, 0, -1300, 0, 0, 0, mon);
        box(900, 320, 800, std(0x10151f), 0, 160, -300, 0, 0, 0, mon);
        cyl(520, 620, 40, std(0x10151f), 0, 20, -300, 0, 0, 0, 32, mon);

        // Power LED
        box(60, 24, 10, neon(GREEN, 2.0), SCREEN_W / 2 - 60, -SCREEN_H / 2 - T / 2, depth - 18, 0, 0, 0, mon);

        // Scanline glass overlay (disabled to ensure monitor content is crystal clear)
        // const glass = new THREE.Mesh(
        //     new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
        //     new THREE.MeshBasicMaterial({ map: makeScanlineTexture(), transparent: true })
        // );
        // glass.position.z = 40;
        // mon.add(glass);
        // this.glass = glass;
    }

    // ── KEYBOARD ───────────────────────────────────────────────────────────
    buildKeyboard() {
        const dark = std(0x0d1520, 0.7, 0.3);

        // Body
        const kb = box(1900, 60, 640, dark, 0, 30, 1250, 0.04, 0, 0);
        this.group.add(kb);

        // Canvas key texture plane
        const kt = new THREE.Mesh(
            new THREE.PlaneGeometry(1800, 560),
            new THREE.MeshBasicMaterial({ map: makeKeyboardTexture() })
        );
        kt.rotation.x = -Math.PI / 2 + 0.04;
        kt.position.set(0, 63, 1250);
        this.group.add(kt);
    }

    // ── MOUSE ──────────────────────────────────────────────────────────────
    buildMouse() {
        const ms = new THREE.Mesh(
            new THREE.SphereGeometry(1, 24, 16),
            std(0x1c2438, 0.6, 0.2)
        );
        ms.scale.set(130, 55, 210);
        ms.position.set(1500, 40, 1250);
        this.group.add(ms);
        // Mousepad
        this.group.add(box(900, 10, 800, std(0x0b1a2c, 0.9), 1500, 5, 1230));
    }

    // ── MUG ────────────────────────────────────────────────────────────────
    buildMug() {
        cyl(130, 110, 230, std(0xdfe9f5, 0.4, 0.2), -1900, 115, 800, 0, 0, 0, 32, this.group);
        // Neon rim glow
        const rim = cyl(136, 136, 10, neon(CYAN, 0.5), -1900, 232, 800, 0, 0, 0, 32);
        this.group.add(rim);
    }

    // ── SPEAKERS ───────────────────────────────────────────────────────────
    buildSpeakers() {
        const dark = std(0x0d151f, 0.7, 0.3);
        [-2000, 2000].forEach(x => {
            box(520, 920, 520, dark, x, 460, -100, 0, 0, 0, this.group);
            // Driver cone
            cyl(170, 170, 20, std(0x050810, 0.6), x, 460, 165, 0, Math.PI / 2, 0, 32, this.group);
            // Neon accent
            box(500, 8, 8, neon(x < 0 ? CYAN : PURPLE, 0.5), x, 850, -100, 0, 0, 0, this.group);
        });
    }

    // ── LAMP ───────────────────────────────────────────────────────────────
    buildLamp() {
        const dark = std(0x1a2535, 0.5, 0.6);
        // Base
        cyl(300, 340, 40, dark, -3300, 20, -500, 0, 0, 0, 32, this.group);
        // Pole
        cyl(28, 28, 1400, dark, -3300, 720, -500, 0, 0, 0, 16, this.group);
        // Shade (ConeGeometry open, from index6)
        const head = new THREE.Mesh(
            new THREE.ConeGeometry(260, 360, 32, 1, true),
            new THREE.MeshBasicMaterial({ color: 0xffd9a0, side: THREE.DoubleSide })
        );
        head.position.set(-3300, 1450, -500);
        this.group.add(head);
        // Point light
        const pl = new THREE.PointLight(0xffc880, 0.65, 7000);
        pl.position.set(-3300, 1250, -300);
        this.scene.add(pl);
        this.lights.push(pl);
    }

    // ── PC TOWER ───────────────────────────────────────────────────────────
    buildPCTower() {
        const TX = -2800, TZ = -400;
        const pc = std(0x0c1420, 0.6, 0.4);

        box(900, 2200, 500, pc, TX, 1100, TZ, 0, 0, 0, this.group);

        for (let i = 0; i < 4; i++) {
            box(840, 10, 10, neon(CYAN, 0.6), TX, 400 + i * 500, TZ - 240, 0, 0, 0, this.group);
        }
        box(80, 80, 20, neon(CYAN, 2.5), TX + 300, 1900, TZ - 245, 0, 0, 0, this.group);
        for (let r = 0; r < 3; r++) {
            box(300, 300, 10, neon(PURPLE, 0.3), TX - 100, 800 + r * 500, TZ - 245, 0, 0, 0, this.group);
        }
    }

    // ── CHAIR ──────────────────────────────────────────────────────────────
    buildChair() {
        const CX = 0, CZ = 2600;
        const pad  = std(0x1a2535, 0.8);
        const dark = std(0x0e1520, 0.7, 0.3);

        box(1400, 100, 1400, pad,  CX,  500, CZ, 0, 0, 0, this.group);
        box(1400, 2000, 100, pad,  CX, 1550, CZ + 650, 0, 0, 0, this.group);
        box(80, 500, 1300, dark,  700,  900, CZ, 0, 0, 0, this.group);
        box(80, 500, 1300, dark, -700,  900, CZ, 0, 0, 0, this.group);
        box(80,  50, 1300, pad,   700, 1150, CZ, 0, 0, 0, this.group);
        box(80,  50, 1300, pad,  -700, 1150, CZ, 0, 0, 0, this.group);
        box(120, 500, 120, dark,   CX,  250, CZ, 0, 0, 0, this.group);

        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            box(700, 40, 100, dark, CX + Math.cos(a) * 350, 20, CZ + Math.sin(a) * 350, 0, -a, 0, this.group);
        }
        box(1200, 15, 15, neon(PURPLE, 0.7), CX, 2600, CZ + 650, 0, 0, 0, this.group);
    }

    // ── SHELVES ────────────────────────────────────────────────────────────
    buildShelves() {
        const SX = -8500, SZ = -7000;
        const shelfY = [2000, 3600, 5200];
        const bookColors = [CYAN, PURPLE, GREEN, GOLD, 0xff4466, 0x4488ff];

        shelfY.forEach(y => {
            box(3600, 60, 400, std(0x0f1622, 0.6, 0.2), SX, y, SZ, 0, 0, 0, this.group);
            box(3600, 10, 10, neon(CYAN, 0.4), SX, y + 35, SZ - 190, 0, 0, 0, this.group);
        });

        shelfY.forEach((y, si) => {
            for (let b = 0; b < 7; b++) {
                const c = bookColors[(si * 7 + b) % bookColors.length];
                const bw = 160 + Math.random() * 120;
                box(bw, 400 + Math.random() * 300, 300, std(c, 0.6),
                    SX - 1500 + b * 460 + bw / 2, y + 260, SZ, 0, 0, 0, this.group);
                box(6, 380 + Math.random() * 280, 6, neon(c, 0.5),
                    SX - 1500 + b * 460 + bw / 2, y + 260, SZ - 145, 0, 0, 0, this.group);
            }
        });

        // Trophy (HackX 2025)
        box(300, 600, 300, neon(GOLD, 1.4), SX + 1400, shelfY[2] + 360, SZ, 0, 0, 0, this.group);
        box(80,  80,  80,  neon(GOLD, 2.2), SX + 1400, shelfY[2] + 695, SZ, 0, 0, 0, this.group);
    }

    // ── FLOOR GRID ─────────────────────────────────────────────────────────
    buildFloorGrid() {
        const grid = new THREE.GridHelper(
            90000, 60,
            new THREE.Color(CYAN).multiplyScalar(0.35),
            new THREE.Color(CYAN).multiplyScalar(0.12)
        );
        (grid.material as THREE.Material & { opacity: number; transparent: boolean }).opacity = 0.35;
        (grid.material as THREE.Material & { transparent: boolean }).transparent = true;
        grid.position.y = -3205;
        this.group.add(grid);
    }

    // ── WALL ACCENTS ───────────────────────────────────────────────────────
    buildWallAccents() {
        // Two horizontal neon lines on back wall (from index6)
        box(30000, 60, 40, neon(CYAN,   0.6), 0, 4200, -2660, 0, 0, 0, this.group);
        box(30000, 60, 40, neon(PURPLE, 0.5), 0, 3700, -2660, 0, 0, 0, this.group);

        // Corner pillar strips
        const pillars: [number, number][] = [
            [-11800, -9800], [11800, -9800], [-11800, 9800], [11800, 9800],
        ];
        pillars.forEach(([x, z]) => {
            box(60, 9800, 60, neon(PURPLE, 0.35), x, 4900, z, 0, 0, 0, this.group);
        });

        // Floor approach arrows
        for (let i = 0; i < 5; i++) {
            box(300, 6, 300, neon(CYAN, 0.18 - i * 0.025),
                0, -3204, -4000 + i * 700, 0, 0, 0, this.group);
        }
    }

    // ── FLOATING HOLOGRAPHIC PANELS ────────────────────────────────────────
    buildFloatingPanels() {
        const panels = [
            { color: CYAN,   x:  7500, y: 3000, z: -1000 },
            { color: PURPLE, x:  9800, y: 4500, z: -2000 },
            { color: GREEN,  x:  7000, y: 5800, z: -3000 },
            { color: GOLD,   x:  9200, y: 2000, z: -3500 },
        ];
        const W = 2800, H = 1600;

        panels.forEach(pd => {
            const glassMesh = new THREE.Mesh(
                new THREE.PlaneGeometry(W, H),
                new THREE.MeshStandardMaterial({
                    color: pd.color, emissive: pd.color, emissiveIntensity: 0.07,
                    roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.12,
                    side: THREE.DoubleSide,
                })
            );
            glassMesh.position.set(pd.x, pd.y, pd.z);
            glassMesh.rotation.y = -0.3;
            this.group.add(glassMesh);
            this.floatingPanels.push(glassMesh);

            const em = neon(pd.color, 0.8);
            [
                box(W,  20, 20, em, pd.x, pd.y + H / 2, pd.z),
                box(W,  20, 20, em, pd.x, pd.y - H / 2, pd.z),
                box(20, H,  20, em, pd.x - W / 2, pd.y, pd.z),
                box(20, H,  20, em, pd.x + W / 2, pd.y, pd.z),
            ].forEach(e => { e.rotation.y = -0.3; this.group.add(e); });

            const hdr = box(W, 120, 20, neon(pd.color, 0.4), pd.x, pd.y + H / 2 - 60, pd.z);
            hdr.rotation.y = -0.3; this.group.add(hdr);

            [0.9, 0.7, 0.85, 0.6, 0.75, 0.5].forEach((w, i) => {
                const bar = box(W * 0.85 * w, 50, 10, neon(pd.color, 0.25 + w * 0.1),
                    pd.x - W * 0.085 * (1 - w), pd.y + H / 2 - 220 - i * 160, pd.z);
                bar.rotation.y = -0.3; this.group.add(bar);
            });

            const pl = new THREE.PointLight(pd.color, 0.15, 5000);
            pl.position.set(pd.x, pd.y, pd.z + 400);
            this.scene.add(pl);
            this.lights.push(pl);
        });
    }

    // ── LIGHTING (blend of index6 + previous setup) ────────────────────────
    buildLighting() {
        // Ambient (index6 value)
        const amb = new THREE.AmbientLight(0x7788bb, 0.65);
        this.scene.add(amb); this.lights.push(amb);

        // Sun / key light (index6)
        const sun = new THREE.DirectionalLight(0xffffff, 0.7);
        sun.position.set(-5000, 12000, 8000);
        this.scene.add(sun); this.lights.push(sun);

        // Monitor cyan spill (index6)
        const spill = new THREE.PointLight(CYAN, 1.1, 9000);
        spill.position.set(0, 1300, 2300);
        this.scene.add(spill); this.lights.push(spill);

        // Purple fill (index6)
        const vio = new THREE.PointLight(PURPLE, 0.6, 16000);
        vio.position.set(4000, 3500, -1500);
        this.scene.add(vio); this.lights.push(vio);

        // PC tower glow
        const pcGlow = new THREE.PointLight(CYAN, 0.3, 4000);
        pcGlow.position.set(-2800, 1200, -400);
        this.scene.add(pcGlow); this.lights.push(pcGlow);
    }

    // ── UPDATE ─────────────────────────────────────────────────────────────
    update() {
        this.t += 0.001;

        if (this.glass) {
            const isMon =
                this.app.camera.currentKeyframe === 'monitor' ||
                this.app.camera.targetKeyframe === 'monitor';
            this.glass.visible = !isMon;
        }

        // Drift floating panels
        this.floatingPanels.forEach((panel, i) => {
            panel.position.y += Math.sin(this.t * 0.8 + i * 1.2) * 0.4;
            panel.rotation.y = -0.3 + Math.sin(this.t * 0.5 + i) * 0.03;
        });

        // Pulse monitor spill
        const spill = this.lights.find(
            l => l instanceof THREE.PointLight && Math.abs(l.position.z - 2300) < 50
        ) as THREE.PointLight | undefined;
        if (spill) spill.intensity = 1.1 + Math.sin(this.t * 1.5) * 0.15;
    }
}
