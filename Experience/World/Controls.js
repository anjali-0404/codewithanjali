import * as THREE from "three";
import Experience from "../Experience.js";
import GSAP from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import ASScroll from "@ashthornton/asscroll";

export default class Controls {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.threejsElement = this.experience.world.threejsElement;

    GSAP.registerPlugin(ScrollTrigger);

    // Production Fix: Ensure overflow is released on both html and body
    const page = document.querySelector(".page");
    if (page) page.style.overflow = "visible";
    document.documentElement.style.overflow = "visible";
    document.body.style.overflow = "visible";

    if (
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      this.setSmoothScroll();
    }
    this.setScrollTrigger();
    this.setBackToTop();
  }

  setupASScroll() {
    const asscroll = new ASScroll({
      containerElement: document.querySelector("[asscroll-container]"),
      disableRaf: true,
    });

    GSAP.ticker.add(asscroll.update);

    ScrollTrigger.defaults({
      scroller: asscroll.containerElement,
    });

    ScrollTrigger.scrollerProxy(asscroll.containerElement, {
      scrollTop(value) {
        if (arguments.length) {
          asscroll.currentScrollPos = value;
          return;
        }
        return asscroll.currentScrollPos;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      fixedMarkers: true,
    });

    asscroll.on("update", ScrollTrigger.update);
    ScrollTrigger.addEventListener("refresh", asscroll.resize);

    // Ensure it's enabled after a small delay to allow DOM to settle
    setTimeout(() => {
      asscroll.enable({
        newScrollElements: document.querySelectorAll(
          ".gsap-marker-start, .gsap-marker-end, [asscroll]"
        ),
      });
    }, 100);

    return asscroll;
  }

  setSmoothScroll() {
    this.asscroll = this.setupASScroll();
  }

  setBackToTop() {
    const backButton = document.querySelector(".back-to-top-button");
    if (backButton) {
        backButton.addEventListener("click", () => {
            if (this.asscroll) {
                this.asscroll.scrollTo(0);
            } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }
  }

  setScrollTrigger() {
    ScrollTrigger.matchMedia({
      // Desktop
      "(min-width: 969px)": () => {
        if (this.threejsElement && this.threejsElement.element) {
            this.threejsElement.element.scale.set(1, 1, 1);
        }
        
        // Section Animations (Ensuring visibility on setup)
        document.querySelectorAll(".section").forEach((section) => {
            const children = section.querySelectorAll(".section-detail-wrapper, .section-intro-wrapper");
            GSAP.set(children, { opacity: 1, y: 0, visibility: "visible" });
        });

        // First Section
        this.firstMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".first-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        this.firstMoveTimeline.to(this.threejsElement.element.position, {
          x: () => { return this.sizes.width * 0.004; },
          y: 3
        }).to(this.threejsElement.element.rotation, {
            y: Math.PI / 2
        }, "same");

        // Second Section
        this.secondMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".second-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        this.secondMoveTimeline.to(this.threejsElement.element.position, {
          x: () => { return this.sizes.width * -0.004; },
          z: () => { return this.sizes.height * 0.004; },
          y: -3
        }, "same").to(this.threejsElement.element.scale, {
          x: 1.6, y: 1.6, z: 1.6,
        }, "same").to(this.threejsElement.element.rotation, {
            z: Math.PI / 6
        }, "same");

        // Third Section
        this.thirdMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".third-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        this.thirdMoveTimeline.to(this.camera.perspectiveCamera.position, {
          y: 20,
          x: -15,
        });

        // Fourth Section (Skills)
        this.fourthMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".fourth-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        this.fourthMoveTimeline.to(this.threejsElement.element.rotation, {
          x: Math.PI / 2,
          y: Math.PI / 4
        }).to(this.threejsElement.element.position, {
            x: 10,
            y: 5
        }, "same");

        // Fifth Section (Education)
        this.fifthMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".fifth-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        this.fifthMoveTimeline.to(this.threejsElement.element.scale, {
          x: 2, y: 2, z: 2
        }).to(this.threejsElement.element.position, {
          x: -10, y: -5
        }, "same");

        // Sixth Section (Visions)
        this.sixthMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".sixth-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        this.sixthMoveTimeline.to(this.threejsElement.element.rotation, {
          x: 0,
          y: Math.PI * 2,
          z: Math.PI / 2
        });

        // Seventh Section (Contact)
        this.seventhMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".seventh-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        this.seventhMoveTimeline.to(this.threejsElement.element.scale, {
          x: 1, y: 1, z: 1
        }).to(this.threejsElement.element.position, {
          x: 0, y: 0, z: 0
        }, "same");
      },

      // Mobile
      "(max-width: 968px)": () => {
        if (this.threejsElement && this.threejsElement.element) {
            this.threejsElement.element.scale.set(0.4, 0.4, 0.4);
        }

        // Section Animations for Mobile (Ensuring visibility on setup)
        document.querySelectorAll(".section").forEach((section) => {
            const children = section.querySelectorAll(".section-detail-wrapper, .section-intro-wrapper");
            GSAP.set(children, { opacity: 1, scale: 1, visibility: "visible" });
        });

        this.firstMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".first-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        }).to(this.threejsElement.element.scale, {
          x: 0.4, y: 0.4, z: 0.4,
        });

        this.secondMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".second-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        }).to(this.threejsElement.element.scale, {
          x: 0.4, y: 0.4, z: 0.4,
        }).to(this.threejsElement.element.position, {
          x: 1.5,
        }, "same");

        this.thirdMoveTimeline = new GSAP.timeline({
          scrollTrigger: {
            trigger: ".third-move",
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        }).to(this.threejsElement.element.rotation, {
          y: Math.PI / 2,
        });
      },

      all: () => {
        this.sections = document.querySelectorAll(".section");
        this.sections.forEach((section) => {
          this.progressWrapper = section.querySelector(".progress-wrapper");
          this.progressBar = section.querySelector(".progress-bar");

          if (this.progressBar) {
              if (section.classList.contains("right")) {
                GSAP.to(this.progressBar, {
                  scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "top top",
                    scrub: 0.6,
                  },
                  scaleY: 0,
                });
              } else {
                GSAP.from(this.progressBar, {
                  scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "top top",
                    scrub: 0.6,
                  },
                  scaleY: 0,
                });
              }
          }
        });
      },
    });

    // Refresh ScrollTrigger after setup
    ScrollTrigger.refresh();
  }

  resize() {}

  update() {}
}
