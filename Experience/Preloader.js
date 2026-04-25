import EventEmitter from "events";
import * as THREE from "three";
import Experience from "./Experience";
import GSAP from "gsap";
import convert from "./Utils/convertDivsToSpans.js";

export default class Preloader extends EventEmitter {
  constructor() {
    super();

    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.world = this.experience.world;
    this.device = this.sizes.device;

    this.sizes.on("switchdevice", (device) => {
      this.device = device;
    });

    this.world.on("worldReady", () => {
      this.setAssets();
      this.playIntro();
    });
  }

  setAssets() {
    convert(document.querySelector(".intro-text"));
    convert(document.querySelector(".hero-main-title"));
    convert(document.querySelector(".hero-main-description"));
    convert(document.querySelector(".hero-second-subheading"));
    convert(document.querySelector(".hero-second-description"));
    
    if (this.experience.world.threejsElement) {
        this.threejsElement = this.experience.world.threejsElement.element;
    }
  }

  firstIntro() {
    return new Promise((resolve) => {
      this.timeline = new GSAP.timeline();
      this.timeline.set(".animate", { y: 0, yPercent: 100 });
      this.timeline.to(".preloader", {
        opacity: 0,
        delay: 1,
        onComplete: () => {
          document.querySelector(".preloader").classList.add("hidden");
        },
      });

      if (this.device === "desktop") {
        this.timeline
          .to(this.threejsElement.scale, {
            x: 1,
            y: 1,
            z: 1,
            ease: "back.out(2.5)",
            duration: 1,
          })
          .to(this.threejsElement.position, {
            x: () => {
              return this.sizes.width * -0.002;
            },
            ease: "power1.out",
            duration: 0.7,
          });
      } else {
        this.timeline
          .to(this.threejsElement.scale, {
            x: 0.4,
            y: 0.4,
            z: 0.4,
            ease: "back.out(2.5)",
            duration: 1,
          })
          .to(this.threejsElement.position, {
            z: () => {
              return this.sizes.height * -0.0025;
            },
            ease: "power1.out",
            duration: 0.7,
          });
      }

      this.timeline
        .to(".intro-text .animate", {
          yPercent: 0,
          stagger: 0.05,
          ease: "back.out(1.7)",
        })
        .to(
          ".arrow-wrapper",
          {
            opacity: 1,
          },
          "same"
        )
        .to(
          ".toggle-bar",
          {
            opacity: 1,
            onComplete: resolve,
          },
          "same"
        );
    });
  }

  secondIntro() {
    return new Promise((resolve) => {
      this.secondTimeline = new GSAP.timeline();

      this.secondTimeline
        .to(
          ".intro-text .animate",
          {
            yPercent: 100,
            stagger: {
              each: 0.03,
              from: "end",
            },
            ease: "back.in(2)",
          },
          "fadeout"
        )
        .to(
          ".arrow-wrapper",
          {
            opacity: 0,
          },
          "fadeout"
        )
        .to(
          ".hero-main-title .animate",
          {
            yPercent: 0,
            stagger: 0.03,
            ease: "back.out(1.7)",
          },
          "hero-text"
        )
        .to(
          ".hero-main-description .animate",
          {
            yPercent: 0,
            stagger: 0.01,
            ease: "back.out(1.7)",
          },
          "hero-text"
        )
        .to(
          ".hero-second-subheading .animate",
          {
            yPercent: 0,
            stagger: 0.03,
            ease: "back.out(1.7)",
          },
          "hero-text"
        )
        .to(
          ".hero-second-description .animate",
          {
            yPercent: 0,
            stagger: 0.03,
            ease: "back.out(1.7)",
          },
          "hero-text"
        )
        .to(
          this.threejsElement.position,
          {
            x: 0,
            y: 0,
            z: 0,
            ease: "power1.out",
          },
          "hero-text"
        )
        .to(
          this.threejsElement.scale,
          {
            x: this.device === "desktop" ? 1 : 0.4,
            y: this.device === "desktop" ? 1 : 0.4,
            z: this.device === "desktop" ? 1 : 0.4,
            ease: "back.out(2.5)",
            onComplete: resolve
          },
          "same"
        )
        .to(".arrow-wrapper", {
          opacity: 1,
          onComplete: resolve,
        });
    });
  }

  onScroll(e) {
    if (e.deltaY > 0) {
      this.removeEventListeners();
      this.playSecondIntro();
    }
  }

  onTouch(e) {
    this.initialY = e.touches[0].clientY;
  }

  onTouchMove(e) {
    let currentY = e.touches[0].clientY;
    let difference = this.initialY - currentY;
    if (difference > 0) {
      this.removeEventListeners();
      this.playSecondIntro();
    }
    this.initialY = null;
  }

  removeEventListeners() {
    window.removeEventListener("wheel", this.scrollOnceEvent);
    window.removeEventListener("touchstart", this.touchStart);
    window.removeEventListener("touchmove", this.touchMove);
  }

  move() {
    if (this.device === "desktop") {
      this.threejsElement.position.x = this.sizes.width * -0.002;
      this.threejsElement.position.y = 0;
      this.threejsElement.position.z = 0;
    } else {
      this.threejsElement.position.x = 0;
      this.threejsElement.position.y = 0;
      this.threejsElement.position.z = this.sizes.height * -0.0025;
    }
  }

  scale() {
    if (this.device === "desktop") {
      this.threejsElement.scale.set(1, 1, 1);
    } else {
      this.threejsElement.scale.set(0.4, 0.4, 0.4);
    }
  }

  async playIntro() {
    // Safeguard: Hide preloader after 5 seconds no matter what
    setTimeout(() => {
        const preloader = document.querySelector(".preloader");
        if (preloader && !preloader.classList.contains("hidden")) {
            preloader.classList.add("hidden");
            this.emit("enablecontrols");
        }
    }, 5000);

    await this.firstIntro();
    this.moveFlag = true;
    this.scrollOnceEvent = this.onScroll.bind(this);
    this.touchStart = this.onTouch.bind(this);
    this.touchMove = this.onTouchMove.bind(this);
    window.addEventListener("wheel", this.scrollOnceEvent);
    window.addEventListener("touchstart", this.touchStart);
    window.addEventListener("touchmove", this.touchMove);
  }

  async playSecondIntro() {
    this.moveFlag = false;
    this.scaleFlag = true;
    await this.secondIntro();
    this.scaleFlag = false;
    this.emit("enablecontrols");
  }

  update() {
    if (this.moveFlag) {
      this.move();
    }

    if (this.scaleFlag) {
      this.scale();
    }
  }
}
