/**
 * Camera.ts — Anjali Tripathi Portfolio
 *
 * Smooth zoom flow:
 *   Loading  →(boot)→  Idle  →(scroll↑/click)→  Desk  →(scroll↑/click/hover)→  Monitor
 *
 * Smooth exit flow:
 *   Monitor  →(scroll↓/click Back/Escape)→  Desk  →(scroll↓/Escape)→  Idle
 */

import * as THREE from 'three';
import Application from '../Application';
import Sizes from '../Utils/Sizes';
import EventEmitter from '../Utils/EventEmitter';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from '@tweenjs/tween.js';
import Renderer from '../Renderer';
import Resources from '../Utils/Resources';
import UIEventBus from '../UI/EventBus';
import Time from '../Utils/Time';
import BezierEasing from 'bezier-easing';
import {
    CameraKeyframeInstance,
    MonitorKeyframe,
    IdleKeyframe,
    LoadingKeyframe,
    DeskKeyframe,
    OrbitControlsStart,
} from './CameraKeyframes';

export enum CameraKey {
    IDLE             = 'idle',
    MONITOR          = 'monitor',
    LOADING          = 'loading',
    DESK             = 'desk',
    ORBIT_CONTROLS_START = 'orbitControlsStart',
}

const SNAP = () => BezierEasing(0.13, 0.99, 0, 1);

export default class Camera extends EventEmitter {
    application: Application;
    sizes:       Sizes;
    scene:       THREE.Scene;
    instance:    THREE.PerspectiveCamera;
    renderer:    Renderer;
    resources:   Resources;
    time:        Time;

    position:   THREE.Vector3;
    focalPoint: THREE.Vector3;

    freeCam: boolean;
    orbitControls: OrbitControls;

    currentKeyframe: CameraKey | undefined;
    targetKeyframe:  CameraKey | undefined;
    keyframes: { [key in CameraKey]: CameraKeyframeInstance };

    constructor() {
        super();
        this.application = new Application();
        this.sizes       = this.application.sizes;
        this.scene       = this.application.scene;
        this.renderer    = this.application.renderer;
        this.resources   = this.application.resources;
        this.time        = this.application.time;

        this.position   = new THREE.Vector3();
        this.focalPoint = new THREE.Vector3();
        this.freeCam    = false;

        this.keyframes = {
            idle:               new IdleKeyframe(),
            monitor:            new MonitorKeyframe(),
            loading:            new LoadingKeyframe(),
            desk:               new DeskKeyframe(),
            orbitControlsStart: new OrbitControlsStart(),
        };

        this.setInstance();
        this.setPostLoadTransition();
        this.setScrollHandler();
        this.setClickHandler();
        this.setKeyboardHandler();
        this.setMonitorListeners();
        this.setFreeCamListeners();
    }

    // ── Boot → desk (lands in front of computer so resume is immediately visible) ──
    setPostLoadTransition() {
        UIEventBus.on('loadingScreenDone', () => {
            this.transition(CameraKey.DESK, 2200, TWEEN.Easing.Exponential.Out);
        });
    }

    // ── Scroll wheel — multi-stage zoom ────────────────────────────────────
    setScrollHandler() {
        document.addEventListener('wheel', (e) => {
            if (this.freeCam) return;

            // While in MONITOR mode, NEVER hijack scroll or trigger zoom-out.
            // Allow natural scrolling inside the iframe through all portfolio sections.
            if (this.at(CameraKey.MONITOR)) {
                return;
            }

            const up = e.deltaY < 0;

            if (up) {
                // idle → desk
                if (this.at(CameraKey.IDLE)) {
                    this.transition(CameraKey.DESK, 1400, SNAP());
                } else if (this.at(CameraKey.DESK)) {
                    // desk → monitor (zoom into screen!)
                    this.transition(CameraKey.MONITOR, 1500, SNAP());
                    UIEventBus.dispatch('enterMonitor', {});
                }
            } else {
                // desk → idle (only from desk; never zoom out from monitor on wheel)
                if (this.at(CameraKey.DESK)) {
                    this.transition(CameraKey.IDLE, 1600, SNAP());
                }
            }
        }, { passive: true });
    }

    // ── Click handler — idle → desk → monitor ──────────────────────────────
    setClickHandler() {
        document.addEventListener('mousedown', (e) => {
            const target = e.target as HTMLElement;
            // Ignore UI buttons, iframes, controls
            if (target.closest?.('iframe, #prevent-click, button, .mode-btn, a, input')) return;
            if (target.id === 'prevent-click') return;

            // While in MONITOR mode, do not trigger desk transitions on click
            if (this.at(CameraKey.MONITOR)) return;

            if (this.at(CameraKey.IDLE)) {
                this.transition(CameraKey.DESK, 1400, SNAP());
                return;
            }

            if (this.at(CameraKey.DESK)) {
                // Click at desk zooms squarely into the monitor screen!
                this.transition(CameraKey.MONITOR, 1500, SNAP());
                UIEventBus.dispatch('enterMonitor', {});
                return;
            }
        });
    }

    // ── Keyboard ───────────────────────────────────────────────────────────
    setKeyboardHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.at(CameraKey.MONITOR)) {
                    document.body.classList.remove('in-monitor');
                    this.transition(CameraKey.DESK, 1000, SNAP());
                    UIEventBus.dispatch('leftMonitor', {});
                } else if (this.at(CameraKey.DESK)) {
                    this.transition(CameraKey.IDLE, 1400, SNAP());
                }
            }
        });

        // Bridge postMessage from inside iframe (e.g. exit button or Escape inside iframe)
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'exit') {
                if (this.at(CameraKey.MONITOR)) {
                    document.body.classList.remove('in-monitor');
                    this.transition(CameraKey.DESK, 1000, SNAP());
                    UIEventBus.dispatch('leftMonitor', {});
                }
            }
        });
    }

    // ── Monitor hover / UI bus listeners ───────────────────────────────────
    setMonitorListeners() {
        this.on('enterMonitor', () => {
            document.body.classList.add('in-monitor');
            if (!this.at(CameraKey.MONITOR)) {
                this.transition(CameraKey.MONITOR, 1500, SNAP());
                UIEventBus.dispatch('enterMonitor', {});
            }
        });
        this.on('leftMonitor', () => {
            document.body.classList.remove('in-monitor');
            if (this.at(CameraKey.MONITOR)) {
                this.transition(CameraKey.DESK, 1000, SNAP());
                UIEventBus.dispatch('leftMonitor', {});
            }
        });

        UIEventBus.on('enterMonitor', () => {
            document.body.classList.add('in-monitor');
            if (!this.at(CameraKey.MONITOR)) {
                this.transition(CameraKey.MONITOR, 1500, SNAP());
            }
        });
        UIEventBus.on('leftMonitor', () => {
            document.body.classList.remove('in-monitor');
            if (this.at(CameraKey.MONITOR)) {
                this.transition(CameraKey.DESK, 1000, SNAP());
            }
        });
    }

    // ── Free cam (orbit controls) ──────────────────────────────────────────
    setFreeCamListeners() {
        UIEventBus.on('freeCamToggle', (on: boolean) => {
            if (on) {
                this.transition(CameraKey.ORBIT_CONTROLS_START, 750, SNAP(), () => {
                    this.instance.position.copy(this.keyframes.orbitControlsStart.position);
                    this.orbitControls.update();
                    this.freeCam = true;
                });
                const webgl = document.getElementById('webgl');
                if (webgl) webgl.style.pointerEvents = 'auto';
            } else {
                this.freeCam = false;
                this.transition(CameraKey.IDLE, 4000, TWEEN.Easing.Exponential.Out);
                const webgl = document.getElementById('webgl');
                if (webgl) webgl.style.pointerEvents = 'none';
            }
        });
    }

    // ── Helper: are we at or transitioning to this key? ───────────────────
    at(key: CameraKey): boolean {
        return this.currentKeyframe === key || this.targetKeyframe === key;
    }

    // ── Smooth TWEEN transition between keyframes ──────────────────────────
    transition(key: CameraKey, duration = 1000, easing?: any, callback?: () => void) {
        if (this.currentKeyframe === key) return;
        if (this.targetKeyframe)  TWEEN.removeAll();

        this.currentKeyframe = undefined;
        this.targetKeyframe  = key;

        const kf = this.keyframes[key];
        // Ensure keyframe has latest responsive math
        kf.update();

        new TWEEN.Tween(this.position)
            .to(kf.position, duration)
            .easing(easing || TWEEN.Easing.Quintic.InOut)
            .onComplete(() => {
                this.currentKeyframe = key;
                this.targetKeyframe  = undefined;
                if (callback) callback();
            })
            .start();

        new TWEEN.Tween(this.focalPoint)
            .to(kf.focalPoint, duration)
            .easing(easing || TWEEN.Easing.Quintic.InOut)
            .start();
    }

    // ── Init camera instance ───────────────────────────────────────────────
    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            35,
            this.sizes.width / this.sizes.height,
            10,
            900000
        );
        this.currentKeyframe = CameraKey.LOADING;
        this.scene.add(this.instance);
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    createControls() {
        this.renderer = this.application.renderer;
        this.orbitControls = new OrbitControls(
            this.instance,
            this.renderer.instance.domElement
        );
        const { x, y, z } = this.keyframes.orbitControlsStart.focalPoint;
        this.orbitControls.target.set(x, y, z);
        this.orbitControls.enablePan      = false;
        this.orbitControls.enableDamping  = true;
        this.orbitControls.dampingFactor  = 0.05;
        this.orbitControls.maxPolarAngle  = Math.PI / 2;
        this.orbitControls.minDistance    = 4000;
        this.orbitControls.maxDistance    = 29000;
        this.orbitControls.object.position.copy(this.keyframes.orbitControlsStart.position);
        this.orbitControls.update();
    }

    update() {
        TWEEN.update();

        if (this.freeCam && this.orbitControls) {
            this.position.copy(this.orbitControls.object.position);
            this.focalPoint.copy(this.orbitControls.target);
            this.orbitControls.update();
            return;
        }

        // Update live keyframes (parallax, float, aspect correction)
        for (const key in this.keyframes) {
            this.keyframes[key as CameraKey].update();
        }

        // If settled on a keyframe, track its live position
        if (this.currentKeyframe) {
            const kf = this.keyframes[this.currentKeyframe];
            this.position.copy(kf.position);
            this.focalPoint.copy(kf.focalPoint);
        }

        this.instance.position.copy(this.position);
        this.instance.lookAt(this.focalPoint);
    }
}
