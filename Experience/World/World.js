import * as THREE from "three";
import Experience from "../Experience";

import ThreejsElement from "./ThreejsElement.js";
import Environment from "./Environment.js";
import Controls from "./Controls";
import Floor from "./Floor";
import EventEmitter from "events";

export default class World extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.canvas = this.experience.canvas;
    this.resources = this.experience.resources;
    this.theme = this.experience.theme;

    this.resources.on("ready", () => {
      this.environment = new Environment();
      this.floor = new Floor();
      this.threejsElement = new ThreejsElement();
      this.emit("worldReady");
    });

    this.theme.on("switch", (theme) => {
      this.switchTheme(theme);
    });
  }

  switchTheme(theme) {
    if (this.environment) {
      this.environment.switchTheme(theme);
    }
    if (this.threejsElement) {
      this.threejsElement.switchTheme(theme);
    }
  }

  resize() {}

  update() {
    if (this.threejsElement) {
      this.threejsElement.update();
    }

    if (this.controls) {
      this.controls.update();
    }
  }
}
