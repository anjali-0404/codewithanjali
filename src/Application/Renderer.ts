import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import Application from './Application';
import Sizes from './Utils/Sizes';
import Camera from './Camera/Camera';
// @ts-ignore
import screenVert from './Shaders/screen/vertex.glsl';
// @ts-ignore
import screenFrag from './Shaders/screen/fragment.glsl';
import Time from './Utils/Time';

export default class Renderer {
    application: Application;
    sizes:        Sizes;
    scene:        THREE.Scene;
    cssScene:     THREE.Scene;
    overlayScene: THREE.Scene;
    time:         Time;
    camera:       Camera;

    instance:        THREE.WebGLRenderer;   // z-index 2 — alpha canvas
    cssInstance:     CSS3DRenderer;         // z-index 1 — CSS3D (iframe)
    overlayInstance: THREE.WebGLRenderer;   // z-index 3 — vignette

    overlay:  THREE.Mesh;
    uniforms: { [uniform: string]: THREE.IUniform<any> };

    constructor() {
        this.application  = new Application();
        this.time         = this.application.time;
        this.sizes        = this.application.sizes;
        this.scene        = this.application.scene;
        this.cssScene     = this.application.cssScene;
        this.overlayScene = this.application.overlayScene;
        this.camera       = this.application.camera;

        this.setInstance();
    }

    setInstance() {
        // ── 1. CSS3DRenderer (z-index 1 — back layer, iframe visible here) ──
        this.cssInstance = new CSS3DRenderer();
        this.cssInstance.setSize(this.sizes.width, this.sizes.height);
        this.cssInstance.domElement.style.cssText =
            'position:absolute;top:0;left:0;width:100%;height:100%;';
        document.querySelector('#css')?.appendChild(this.cssInstance.domElement);

        // ── 2. Main WebGL renderer (z-index 2 — alpha:true so CSS3D shows through) ──
        this.instance = new THREE.WebGLRenderer({
            antialias: true,
            alpha:     true,          // ← CRITICAL: transparent background
            powerPreference: 'high-performance',
        });
        this.instance.outputEncoding = THREE.sRGBEncoding;
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
        this.instance.setClearColor(0x000000, 0);  // transparent clear color so CSS3D iframe shows cleanly through hole

        this.instance.domElement.style.cssText =
            'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';

        document.querySelector('#webgl')?.appendChild(this.instance.domElement);

        // ── 3. Overlay (soft-light vignette) ───────────────────────────────
        this.overlayInstance = new THREE.WebGLRenderer({ alpha: true });
        this.overlayInstance.setSize(this.sizes.width, this.sizes.height);
        this.overlayInstance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
        this.overlayInstance.domElement.style.cssText =
            'position:absolute;top:0;left:0;width:100%;height:100%;' +
            'mix-blend-mode:soft-light;opacity:0.1;pointer-events:none;';
        document.querySelector('#overlay')?.appendChild(this.overlayInstance.domElement);

        // ── Overlay fullscreen shader mesh ─────────────────────────────────
        this.uniforms = { u_time: { value: 1 } };
        this.overlay = new THREE.Mesh(
            new THREE.PlaneGeometry(10000, 10000),
            new THREE.ShaderMaterial({
                vertexShader:   screenVert,
                fragmentShader: screenFrag,
                uniforms:       this.uniforms,
                depthTest:  false,
                depthWrite: false,
            })
        );
        this.overlayScene.add(this.overlay);
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
        this.cssInstance.setSize(this.sizes.width, this.sizes.height);
        this.overlayInstance.setSize(this.sizes.width, this.sizes.height);
        this.overlayInstance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2));
    }

    update() {
        this.application.camera.instance.updateProjectionMatrix();
        if (this.uniforms) {
            this.uniforms.u_time.value = Math.sin(this.time.current * 0.01);
        }

        // Render order matters:
        //   1. GL scene (alpha canvas — the transparent "hole" mesh lets CSS3D show through)
        //   2. CSS3D scene (iframe behind the GL canvas, visible through the hole)
        //   3. Overlay vignette
        this.instance.render(this.scene, this.camera.instance);
        this.cssInstance.render(this.cssScene, this.camera.instance);
        this.overlayInstance.render(this.overlayScene, this.camera.instance);
        this.overlay.position.copy(this.camera.instance.position);
    }
}
