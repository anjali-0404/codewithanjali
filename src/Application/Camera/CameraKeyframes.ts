import * as THREE from 'three';
import { CameraKey } from './Camera';
import Time from '../Utils/Time';
import Application from '../Application';
import Mouse from '../Utils/Mouse';
import Sizes from '../Utils/Sizes';

export class CameraKeyframeInstance {
    position:   THREE.Vector3;
    focalPoint: THREE.Vector3;
    constructor(kf: CameraKeyframe) {
        this.position   = kf.position.clone();
        this.focalPoint = kf.focalPoint.clone();
    }
    update() {}
}

// ── Monitor center is at world (0, 950, 255) ──────────────────────────────
export const MON = new THREE.Vector3(0, 950, 255);
export const MON_TILT_RAD = 3 * THREE.MathUtils.DEG2RAD;

const keys: { [key in CameraKey]: CameraKeyframe } = {
    // Far-out cinematic intro view
    loading: {
        position:   new THREE.Vector3(-35000, 35000, 35000),
        focalPoint: new THREE.Vector3(0, -5000, 0),
    },

    // Orbiting idle — floating, wide-angle room view
    idle: {
        position:   new THREE.Vector3(-18000, 11000, 18000),
        focalPoint: new THREE.Vector3(0, 0, 0),
    },

    // Desk view — in front of monitor, focused on screen
    desk: {
        position:   new THREE.Vector3(0, 1500, 4600),
        focalPoint: MON.clone(),
    },

    // Full-screen monitor view — camera perpendicular & centered, screen covers 100% of viewport
    monitor: {
        position:   new THREE.Vector3(0, 950 + 1150 * Math.sin(MON_TILT_RAD), 255 + 1150 * Math.cos(MON_TILT_RAD)),
        focalPoint: MON.clone(),
    },

    // Free-cam orbit start
    orbitControlsStart: {
        position:   new THREE.Vector3(-15000, 10000, 15000),
        focalPoint: new THREE.Vector3(0, 500, 0),
    },
};

// ════════════════════════════════════════════════════════════════════════════
// Idle — slow sinusoidal float, always faces the desk/monitor
export class IdleKeyframe extends CameraKeyframeInstance {
    private origin: THREE.Vector3;
    private time: Time;
    constructor() {
        super(keys.idle);
        this.origin = keys.idle.position.clone();
        this.time   = new Time();
    }
    update() {
        const t = this.time.elapsed;
        this.position.x = Math.sin((t + 19000) * 0.00007) * this.origin.x;
        this.position.y = Math.sin((t +  1000) * 0.000005) * 3000 + this.origin.y;
    }
}

// ════════════════════════════════════════════════════════════════════════════
// Desk — slight mouse-parallax, always focused on the monitor
export class DeskKeyframe extends CameraKeyframeInstance {
    private origin: THREE.Vector3;
    private mouse:  Mouse;
    private sizes:  Sizes;
    private tp: THREE.Vector3;
    private tf: THREE.Vector3;

    constructor() {
        super(keys.desk);
        const app    = new Application();
        this.mouse   = app.mouse;
        this.sizes   = app.sizes;
        this.origin  = keys.desk.position.clone();
        this.tp      = keys.desk.position.clone();
        this.tf      = MON.clone();
    }

    update() {
        const { x: mx, y: my } = this.mouse;
        const { width: W, height: H } = this.sizes;

        // Subtle parallax
        const px = (mx - W / 2) / W;
        const py = (my - H / 2) / H;

        this.tp.x += (this.origin.x + px * 350 - this.tp.x) * 0.04;
        this.tp.y += (this.origin.y - py * 180 - this.tp.y) * 0.04;

        // Aspect-based z so monitor is well framed on any display
        const aspect = H / W;
        this.tp.z = this.origin.z + aspect * 1600;

        this.position.copy(this.tp);
        this.focalPoint.copy(MON);
    }
}

// ════════════════════════════════════════════════════════════════════════════
// Monitor — dynamic fit so ONLY the screen is seen, perfectly centered and perpendicular
export class MonitorKeyframe extends CameraKeyframeInstance {
    private sizes: Sizes;
    private tp:    THREE.Vector3;

    constructor() {
        super(keys.monitor);
        this.sizes = new Application().sizes;
        this.tp    = keys.monitor.position.clone();
    }

    update() {
        const { width: W, height: H } = this.sizes;
        const aspect = W / H;

        // Perspective camera FOV is 35 deg
        const halfFovRad = (35 / 2) * THREE.MathUtils.DEG2RAD;
        const tanHalfFov = Math.tan(halfFovRad);

        // Screen size is 1280 x 1024
        const SCREEN_W = 1280;
        const SCREEN_H = 1024;

        // Distance required so screen fills viewport height
        const distH = SCREEN_H / (2 * tanHalfFov);
        // Distance required so screen fills viewport width
        const distW = SCREEN_W / (2 * tanHalfFov * aspect);

        // Use Math.max with 1.04 multiplier so the camera backs away far enough
        // to fit the entire screen inside the viewport with a clean 4% border margin.
        // No edges, navigation bars, or content are ever cut off on any aspect ratio.
        const dist = Math.max(distH, distW) * 1.04;

        // Normal vector points along (0, sin(3°), cos(3°))
        this.tp.set(
            0,
            MON.y + dist * Math.sin(MON_TILT_RAD),
            MON.z + dist * Math.cos(MON_TILT_RAD)
        );

        this.position.copy(this.tp);
        this.focalPoint.copy(MON);
    }
}

// ════════════════════════════════════════════════════════════════════════════
export class LoadingKeyframe extends CameraKeyframeInstance {
    constructor() { super(keys.loading); }
}

export class OrbitControlsStart extends CameraKeyframeInstance {
    constructor() { super(keys.orbitControlsStart); }
}
