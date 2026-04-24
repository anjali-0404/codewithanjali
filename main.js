import './style.css'
import Experience from './Experience/Experience.js';

const experience = new Experience(document.querySelector(".experience-canvas"));

window.addEventListener("load", () => {
    setTimeout(() => {
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }
    }, 500);
});
