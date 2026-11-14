/**
 * RobotCompanion.ts — Anjali Tripathi Portfolio
 *
 * Implements the custom 3D Robot model (Robot.obj + textures/Robot.png)
 * inside the 3D cyberpunk scene as an interactive AI Companion.
 *
 * Placed on a high-tech illuminated cyber pedestal on the right side of the desk,
 * with idle floating/breathing animation, head mouse-tracking, glowing cyber rings,
 * energy battery reactor, floating holographic status badge, and click interaction.
 */

import * as THREE from 'three';
import Application from '../Application';
import Resources from '../Utils/Resources';
import Time from '../Utils/Time';
import Mouse from '../Utils/Mouse';
import Sizes from '../Utils/Sizes';
import UIEventBus from '../UI/EventBus';

const CYAN   = 0x00f5ff;
const PURPLE = 0xbf00ff;
const GOLD   = 0xffd700;
const GREEN  = 0x00ff88;

export default class RobotCompanion {
    app:       Application;
    scene:     THREE.Scene;
    resources: Resources;
    time:      Time;
    mouse:     Mouse;
    sizes:     Sizes;

    group:      THREE.Group;
    modelGroup: THREE.Group;
    pedestalGroup: THREE.Group;

    // Model parts
    head:      THREE.Object3D | null = null;
    body:      THREE.Object3D | null = null;
    rightArm:  THREE.Object3D | null = null;
    leftArm:   THREE.Object3D | null = null;

    // Animated elements
    hologramBadge: THREE.Mesh | null = null;
    pedestalLight: THREE.PointLight | null = null;
    glowRing:      THREE.Mesh | null = null;
    batteryMesh:   THREE.Mesh | null = null;

    baseY: number = 40;
    clickSpin: number = 0;
    isHovered: boolean = false;

    // Raycasting
    raycaster: THREE.Raycaster;
    clickableMeshes: THREE.Mesh[] = [];

    constructor() {
        this.app       = new Application();
        this.scene     = this.app.scene;
        this.resources = this.app.resources;
        this.time      = this.app.time;
        this.mouse     = this.app.mouse;
        this.sizes     = this.app.sizes;

        this.group         = new THREE.Group();
        this.modelGroup    = new THREE.Group();
        this.pedestalGroup = new THREE.Group();
        this.raycaster     = new THREE.Raycaster();

        // Place on right side of desk: desk width 9600, top surface Y=0, depth 4200 (Z centered at 300)
        this.group.position.set(2850, 0, 750);
        this.group.rotation.y = -22 * THREE.MathUtils.DEG2RAD; // Faces towards viewer / chair

        this.buildPedestal();
        this.loadRobotModel();
        this.buildHologramBadge();

        this.group.add(this.pedestalGroup);
        this.group.add(this.modelGroup);
        this.scene.add(this.group);

        this.setupInteractivity();
    }

    // ── Build Cyber Docking Pedestal ─────────────────────────────────
    buildPedestal() {
        // Main beveled cylindrical platform
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x0e1726,
            roughness: 0.4,
            metalness: 0.6,
        });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(520, 560, 36, 32), baseMat);
        base.position.y = 18;
        this.pedestalGroup.add(base);

        // Outer glowing cyber ring
        const outerRingMat = new THREE.MeshStandardMaterial({
            color: CYAN,
            emissive: CYAN,
            emissiveIntensity: 1.2,
            roughness: 0.3,
            metalness: 0.1,
        });
        const outerRing = new THREE.Mesh(new THREE.TorusGeometry(540, 8, 16, 48), outerRingMat);
        outerRing.rotation.x = Math.PI / 2;
        outerRing.position.y = 35;
        this.pedestalGroup.add(outerRing);

        // Inner glowing purple ring
        const innerRingMat = new THREE.MeshStandardMaterial({
            color: PURPLE,
            emissive: PURPLE,
            emissiveIntensity: 0.9,
            roughness: 0.3,
            metalness: 0.1,
        });
        const innerRing = new THREE.Mesh(new THREE.TorusGeometry(380, 6, 16, 48), innerRingMat);
        innerRing.rotation.x = Math.PI / 2;
        innerRing.position.y = 36;
        this.pedestalGroup.add(innerRing);
        this.glowRing = innerRing;

        // Cyber energy canister / battery reactor prop (using batteryTexture)
        const batteryTex = this.resources.items.texture.batteryTexture;
        const battMat = new THREE.MeshStandardMaterial({
            map: batteryTex || null,
            color: batteryTex ? 0xffffff : 0x00f5ff,
            roughness: 0.35,
            metalness: 0.4,
            emissive: CYAN,
            emissiveIntensity: 0.2,
        });
        const battery = new THREE.Mesh(new THREE.CylinderGeometry(55, 55, 140, 24), battMat);
        battery.position.set(380, 88, 160);
        this.pedestalGroup.add(battery);
        this.batteryMesh = battery;

        // Glowing battery cap
        const capMat = new THREE.MeshStandardMaterial({
            color: CYAN,
            emissive: CYAN,
            emissiveIntensity: 1.6,
        });
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(40, 40, 16, 24), capMat);
        cap.position.set(380, 162, 160);
        this.pedestalGroup.add(cap);

        // Dedicated neon accent point light for the robot
        const pl = new THREE.PointLight(CYAN, 0.9, 3200);
        pl.position.set(0, 450, 250);
        this.pedestalGroup.add(pl);
        this.pedestalLight = pl;
    }

    // ── Load & Style the 3D Robot Model ──────────────────────────────
    loadRobotModel() {
        const rawModel = this.resources.items.objModel?.robotModel;
        const texture  = this.resources.items.texture?.robotTexture;

        if (!rawModel) {
            console.warn('[RobotCompanion] robotModel source not found, creating procedural placeholder.');
            this.buildProceduralFallback();
            return;
        }

        // Clone so original resource remains pristine
        const robot = rawModel.clone();

        // Ensure texture settings
        if (texture) {
            texture.encoding = THREE.sRGBEncoding;
            texture.flipY = true;
        }

        const robotMat = new THREE.MeshStandardMaterial({
            map: texture || null,
            color: 0xffffff,
            roughness: 0.42,
            metalness: 0.32,
        });

        // Glowing eye/core material
        const eyeMat = new THREE.MeshStandardMaterial({
            color: CYAN,
            emissive: CYAN,
            emissiveIntensity: 1.5,
            roughness: 0.2,
            metalness: 0.1,
        });

        // Apply materials and locate animation bones/meshes
        robot.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow    = true;
                mesh.receiveShadow = true;
                mesh.material      = robotMat;
                this.clickableMeshes.push(mesh);

                const name = mesh.name.toLowerCase();
                if (name.includes('head')) {
                    this.head = mesh;
                } else if (name.includes('body')) {
                    this.body = mesh;
                } else if (name.includes('upperarm.001') || name.includes('leftarm')) {
                    this.leftArm = mesh;
                } else if (name.includes('upperarm') || name.includes('rightarm')) {
                    this.rightArm = mesh;
                }
            }
        });

        // Robot original bounds: X[-1.09, 1.10], Y[-4.38, 0.53], Z[-1.04, 0.80]
        // Center x and z, shift Y so feet (y=-4.3825) rest at 0
        const innerGroup = new THREE.Group();
        robot.position.set(-0.0045, 4.3825, 0.1177);
        innerGroup.add(robot);

        // Add eye glow visors onto the head
        const eyeVisor = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.14, 0.08),
            eyeMat
        );
        eyeVisor.position.set(0, 0.05, 0.65);
        if (this.head) {
            this.head.add(eyeVisor);
        }

        // Add glowing chest arc reactor on the body
        const reactor = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 0.05, 24),
            new THREE.MeshStandardMaterial({
                color: CYAN,
                emissive: CYAN,
                emissiveIntensity: 2.2,
            })
        );
        reactor.rotation.x = Math.PI / 2;
        reactor.position.set(0, -1.2, 0.58);
        if (this.body) {
            this.body.add(reactor);
        }

        // Scale to ~1050 units height (4.91 * 215 = 1055 units)
        const SCALE = 215;
        this.modelGroup.scale.set(SCALE, SCALE, SCALE);
        this.modelGroup.position.set(0, this.baseY, 0);
        this.modelGroup.add(innerGroup);
    }

    // ── Procedural Fallback if OBJ is missing ─────────────────────────
    buildProceduralFallback() {
        const mat = new THREE.MeshStandardMaterial({ color: 0x1b2838, roughness: 0.4, metalness: 0.6 });
        const glow = new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 1.5 });
        const head = new THREE.Mesh(new THREE.BoxGeometry(260, 260, 260), mat);
        head.position.y = 800;
        const visor = new THREE.Mesh(new THREE.BoxGeometry(200, 60, 30), glow);
        visor.position.set(0, 20, 135);
        head.add(visor);
        const body = new THREE.Mesh(new THREE.BoxGeometry(340, 440, 240), mat);
        body.position.y = 440;
        this.modelGroup.add(head);
        this.modelGroup.add(body);
        this.head = head;
        this.body = body;
    }

    // ── Floating Holographic HUD Badge ───────────────────────────────
    buildHologramBadge() {
        const canvas = document.createElement('canvas');
        canvas.width  = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;

        // Cyber HUD gradient background
        ctx.fillStyle = 'rgba(2, 8, 16, 0.88)';
        ctx.fillRect(0, 0, 512, 128);

        // Border & brackets
        ctx.strokeStyle = '#00f5ff';
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, 500, 116);

        // Corner accents
        ctx.fillStyle = '#00f5ff';
        ctx.fillRect(0, 0, 20, 6);
        ctx.fillRect(0, 0, 6, 20);
        ctx.fillRect(492, 0, 20, 6);
        ctx.fillRect(506, 0, 6, 20);
        ctx.fillRect(0, 122, 20, 6);
        ctx.fillRect(0, 108, 6, 20);
        ctx.fillRect(492, 122, 20, 6);
        ctx.fillRect(506, 108, 6, 20);

        // Text
        ctx.fillStyle = '#00f5ff';
        ctx.font = 'bold 26px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ANJALI TRIPATHI', 256, 48);

        ctx.fillStyle = '#00ff88';
        ctx.font = '16px "Share Tech Mono", monospace';
        ctx.fillText('â— AI COMPANION â€¢ MODEL ACTIVE', 256, 82);

        ctx.fillStyle = '#bf00ff';
        ctx.font = '13px monospace';
        ctx.fillText('[ CLICK TO INTERACT ]', 256, 108);

        const tex = new THREE.CanvasTexture(canvas);
        const badgeMat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            opacity: 0.92,
            side: THREE.DoubleSide,
        });

        const badge = new THREE.Mesh(new THREE.PlaneGeometry(620, 155), badgeMat);
        badge.position.set(0, 1280, 0);
        this.group.add(badge);
        this.hologramBadge = badge;
    }

    // ── Mouse & Click Interactivity ──────────────────────────────────
    setupInteractivity() {
        window.addEventListener('click', (e) => {
            const mouseNDC = new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            );
            this.raycaster.setFromCamera(mouseNDC, this.app.camera.instance);
            const hits = this.raycaster.intersectObjects(this.clickableMeshes);
            if (hits.length > 0) {
                this.triggerClickAction();
            }
        });
    }

    triggerClickAction() {
        // Cheerful spin and celebration jump
        this.clickSpin = Math.PI * 4;

        // Play feedback sound
        const audio = this.resources.items.audio?.ccType || this.resources.items.audio?.startup;
        if (audio && (this.app as any).audioManager) {
            try {
                const ctx = THREE.AudioContext.getContext();
                const src = ctx.createBufferSource();
                src.buffer = audio;
                src.connect(ctx.destination);
                src.start();
            } catch (err) {}
        }

        // Dispatch UI notification
        UIEventBus.dispatch('notification', {
            text: '🤖 Robot Companion: Anjali Tripathi — MERN & AI/ML Specialist!',
        });
    }

    // ── Frame Update Loop ────────────────────────────────────────────
    update() {
        const t = this.time.elapsed;

        // 1. Idle breathing / hovering bob
        const floatOffset = Math.sin(t * 0.0024) * 18;
        this.modelGroup.position.y = this.baseY + floatOffset;

        // 2. Interactive Head Mouse-Tracking
        if (this.head) {
            const targetRotY = ((this.mouse.x - this.sizes.width / 2) / this.sizes.width) * 0.65;
            const targetRotX = ((this.mouse.y - this.sizes.height / 2) / this.sizes.height) * 0.35;
            this.head.rotation.y += (targetRotY - this.head.rotation.y) * 0.06;
            this.head.rotation.x += (targetRotX - this.head.rotation.x) * 0.06;
        }

        // 3. Gentle arm swaying
        if (this.rightArm) {
            this.rightArm.rotation.x = Math.sin(t * 0.002) * 0.09;
        }
        if (this.leftArm) {
            this.leftArm.rotation.x = -Math.sin(t * 0.002) * 0.09;
        }

        // 4. Click spin animation decay
        if (this.clickSpin > 0) {
            const step = Math.min(this.clickSpin, 0.18);
            this.modelGroup.rotation.y += step;
            this.clickSpin -= step;
        }

        // 5. Battery and light pulse
        if (this.pedestalLight) {
            this.pedestalLight.intensity = 0.85 + 0.35 * Math.sin(t * 0.0035);
        }
        if (this.glowRing) {
            this.glowRing.rotation.z = t * 0.0008;
        }
        if (this.batteryMesh) {
            (this.batteryMesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
                0.3 + 0.25 * Math.sin(t * 0.003);
        }

        // 6. Hologram badge float & face camera
        if (this.hologramBadge) {
            this.hologramBadge.position.y = 1260 + Math.sin(t * 0.002 + 1) * 12;
            // Billboard towards camera
            this.hologramBadge.lookAt(this.app.camera.instance.position);
        }
    }
}
