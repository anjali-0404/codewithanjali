import * as THREE from 'three';
import Application from '../Application';
import Resources from '../Utils/Resources';
import Time from '../Utils/Time';

// @ts-ignore
import fragmentShader from '../Shaders/coffee/fragment.glsl';
// @ts-ignore
import vertexShader from '../Shaders/coffee/vertex.glsl';

export default class CoffeeSteam {
    model: any;
    application: Application;
    resources: Resources;
    scene: THREE.Scene;
    time: Time;

    constructor() {
        this.application = new Application();
        this.resources = this.application.resources;
        this.scene = this.application.scene;
        this.time = this.application.time;

        this.setModel();
    }

    setModel() {
        this.model = {};

        this.model.color = '#00f5ff';

        // Material
        this.model.material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uTimeFrequency: { value: 0.001 },
                uUvFrequency: { value: new THREE.Vector2(3, 5) },
                uColor: { value: new THREE.Color(this.model.color) },
            },
        });

        this.model.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(180, 500),
            this.model.material
        );

        // Position over a mug on the desk (desk top y≈370, mug height ≈200)
        this.model.mesh.position.copy(new THREE.Vector3(-1600, 700, 350));

        this.scene.add(this.model.mesh);
    }

    update() {
        this.model.material.uniforms.uTime.value = this.time.elapsed;
    }
}
