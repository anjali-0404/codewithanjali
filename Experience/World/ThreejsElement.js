import * as THREE from "three";
import Experience from "../Experience.js";
import GSAP from "gsap";

export default class ThreejsElement {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.camera = this.experience.camera.perspectiveCamera;
    this.sizes = this.experience.sizes;
    
    this.element = new THREE.Group();
    this.scene.add(this.element);

    // Grid density (amount x amount)
    this.amount = 80;
    this.count = Math.pow(this.amount, 2);
    this.dummy = new THREE.Object3D();
    
    this.seeds = [];
    this.baseColors = [];
    this.colors = [
      new THREE.Color(0x00ffff),
      new THREE.Color(0xffff00),
      new THREE.Color(0xff00ff)
    ];
    
    this.animation = { t: 0 };
    this.currentColorIndex = 0;
    this.nextColorIndex = 1;
    this.maxDistance = 60; // Slightly tighter for color propagation

    this.setModel();
    this.startColorTransition();
    this.setEnvironment();
  }

  setEnvironment() {
    // Set background color to match the example's light blue
    if (this.experience.theme.actualTheme === "light") {
        this.scene.background = new THREE.Color(0xadd8e6);
    }
  }

  setModel() {
    // Smaller, more numerous cubes for that "Cubescape" feel
    const geometry = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const material = new THREE.MeshStandardMaterial({
      metalness: 0.5,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9
    });

    this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.element.add(this.mesh);

    const offset = (this.amount - 1) / 2;
    const color = new THREE.Color();

    let i = 0;
    for (let x = 0; x < this.amount; x++) {
      for (let z = 0; z < this.amount; z++) {
        // Grid position
        this.dummy.position.set(offset - x, 0, offset - z);
        this.dummy.scale.set(1, 2, 1);
        this.dummy.updateMatrix();

        // Random HSL for base variation
        color.setHSL(Math.random(), 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5);
        this.baseColors.push(color.clone());

        this.mesh.setMatrixAt(i, this.dummy.matrix);
        
        // Initial color blend
        const initialColor = color.clone().multiply(this.colors[0]);
        this.mesh.setColorAt(i, initialColor);

        this.seeds.push(Math.random());
        i++;
      }
    }
    
    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true;
    }
  }

  startColorTransition() {
    // Mimic the setInterval behavior from the example but with GSAP
    const loopTransition = () => {
      GSAP.to(this.animation, {
        t: 1,
        duration: 2,
        delay: 1,
        ease: "sine.inOut",
        onComplete: () => {
          this.animation.t = 0;
          this.currentColorIndex = this.nextColorIndex;
          this.nextColorIndex = (this.nextColorIndex + 1) % this.colors.length;
          loopTransition(); // Re-trigger the loop
        }
      });
    };
    
    loopTransition();
  }

  update() {
    const time = this.time.elapsed * 0.001;
    const color = new THREE.Color();

    for (let i = 0; i < this.count; i++) {
      this.mesh.getMatrixAt(i, this.dummy.matrix);
      this.dummy.matrix.decompose(this.dummy.position, this.dummy.quaternion, this.dummy.scale);

      // Y-axis animation (Cubescape style)
      // Slightly more subtle height for portfolio balance
      this.dummy.position.y = Math.abs(Math.sin((time + this.seeds[i]) * 1.5 + this.seeds[i])) * 3;

      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);

      // Dynamic Color blending based on distance and animation state
      if (this.animation.t > 0) {
        const currentColor = this.colors[this.currentColorIndex];
        const nextColor = this.colors[this.nextColorIndex];
        
        // Use position length to determine color spread distance
        const f = this.dummy.position.length() / this.maxDistance;

        if (f <= this.animation.t) {
          color.copy(this.baseColors[i]).multiply(nextColor);
        } else {
          color.copy(this.baseColors[i]).multiply(currentColor);
        }
        this.mesh.setColorAt(i, color);
      }
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true;
    }
  }

  switchTheme(theme) {
    if (this.scene) {
        this.scene.background = theme === "dark" ? new THREE.Color(0x111111) : new THREE.Color(0xadd8e6);
    }
    if (this.mesh) {
      this.mesh.material.opacity = theme === "dark" ? 1 : 0.8;
    }
  }
}
