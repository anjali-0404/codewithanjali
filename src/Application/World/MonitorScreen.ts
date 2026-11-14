/**
 * MonitorScreen.ts — Anjali Tripathi Portfolio
 *
 * CSS3D iframe screen displaying the interactive portfolio on the computer screen.
 */

import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import Application from '../Application';
import Resources from '../Utils/Resources';
import Sizes from '../Utils/Sizes';
import Camera, { CameraKey } from '../Camera/Camera';
import EventEmitter from '../Utils/EventEmitter';

const SCREEN_SIZE    = { w: 1280, h: 1024 };
const IFRAME_PADDING = 32;
const IFRAME_SIZE    = {
    w: SCREEN_SIZE.w - IFRAME_PADDING,
    h: SCREEN_SIZE.h - IFRAME_PADDING,
};

// ── Built-in full resume & portfolio shown on the computer monitor ────────────
export const PORTFOLIO_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<title>Anjali Tripathi — Full Stack &amp; AI/ML Engineer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --c:#00f5ff;--p:#bf00ff;--g:#00ff88;--gold:#ffd700;
  --bg:#020810;--bg2:#07111f;--bg3:#0c192c;
  --t:#dbe8f7;--t2:#8fa6c4;--b:rgba(0,245,255,.18);
  --mono:'Share Tech Mono',monospace;
  --sans:'Inter',system-ui,-apple-system,sans-serif;
}
html{scroll-behavior:smooth;height:100%}
body{background:var(--bg);color:var(--t);font:14px/1.65 var(--sans);overflow-x:hidden}
a{color:var(--c);text-decoration:none;transition:color .2s,text-shadow .2s}
a:hover{text-shadow:0 0 10px var(--c)}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:rgba(0,245,255,.3);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--c)}

/* NAV */
nav{position:sticky;top:0;z-index:99;background:rgba(2,8,16,.96);backdrop-filter:blur(18px);border-bottom:1px solid var(--b);display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:48px}
.nav-left{display:flex;align-items:center;gap:12px}
.brand{font-family:var(--mono);font-size:12px;letter-spacing:3px;color:var(--c);text-shadow:0 0 12px var(--c);font-weight:700}
.brand-sub{font-family:var(--mono);font-size:9px;color:var(--t2);letter-spacing:1px}
.links{display:flex;gap:2px;list-style:none}
.links a{font-family:var(--mono);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--t2);padding:6px 11px;border:1px solid transparent;border-radius:4px;transition:all .2s;display:block}
.links a:hover,.links a.on{color:var(--c);border-color:rgba(0,245,255,.35);background:rgba(0,245,255,.08);text-shadow:none}

.exit-btn{
  font-family:var(--mono);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;
  color:#fff;background:rgba(255,50,80,.15);border:1px solid rgba(255,50,80,.4);
  padding:5px 12px;border-radius:4px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;
}
.exit-btn:hover{background:rgba(255,50,80,.35);border-color:#ff3355;box-shadow:0 0 14px rgba(255,50,80,.4)}

/* SECTIONS */
section{padding:54px 36px 48px;max-width:1100px;margin:0 auto}
.sec-wrap{width:100%}
.sec-wrap:nth-child(even){background:var(--bg2)}
.lbl{font-family:var(--mono);font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--c);margin-bottom:6px}
.ttl{font-size:26px;font-weight:800;color:#fff;margin-bottom:28px;position:relative;display:inline-block;letter-spacing:-.5px}
.ttl::after{content:'';position:absolute;bottom:-6px;left:0;width:100%;height:2px;background:linear-gradient(90deg,var(--c),var(--p),transparent)}

/* HERO */
#hero{min-height:calc(100vh - 48px);display:flex;flex-direction:column;justify-content:center;position:relative}
.grid-bg{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(0,245,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,.03) 1px,transparent 1px);background-size:48px 48px}
.hero-c{position:relative;z-index:1}
.badge{display:inline-flex;align-items:center;gap:8px;background:rgba(0,255,136,.08);border:1px solid rgba(0,255,136,.3);border-radius:24px;padding:5px 14px;margin-bottom:20px}
.dot{width:7px;height:7px;border-radius:50%;background:var(--g);box-shadow:0 0 8px var(--g);animation:pu 1.8s infinite}
@keyframes pu{50%{box-shadow:0 0 16px var(--g),0 0 26px rgba(0,255,136,.5)}}
.badge-t{font-family:var(--mono);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--g);font-weight:600}
h1{font-size:52px;font-weight:800;line-height:1.02;margin-bottom:12px;letter-spacing:-1px}
h1 span{color:var(--c);text-shadow:0 0 30px rgba(0,245,255,.5)}
.role{font-size:15px;color:var(--t2);margin-bottom:28px;font-weight:500}
.bio{font-size:14px;color:var(--t);max-width:760px;margin-bottom:28px;line-height:1.7}
.stats{display:flex;flex-wrap:wrap;gap:24px;margin-bottom:34px}
.stat b{display:block;font-size:28px;font-weight:800;color:var(--c);text-shadow:0 0 14px rgba(0,245,255,.45);line-height:1}
.stat span{font-size:10px;color:var(--t2);letter-spacing:1.5px;font-family:var(--mono);text-transform:uppercase}
.sdiv{width:1px;background:var(--b)}
.cta{display:flex;flex-wrap:wrap;gap:12px}
.btn{font-family:var(--mono);font-size:10px;letter-spacing:2.5px;text-transform:uppercase;padding:10px 22px;border:1px solid;border-radius:4px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;font-weight:600}
.bp{color:var(--bg);background:var(--c);border-color:var(--c);box-shadow:0 0 20px rgba(0,245,255,.35)}
.bp:hover{box-shadow:0 0 32px rgba(0,245,255,.65);transform:translateY(-1px)}
.bo{color:var(--c);background:rgba(0,245,255,.04);border-color:rgba(0,245,255,.4)}
.bo:hover{background:rgba(0,245,255,.12);border-color:var(--c);transform:translateY(-1px)}
.bp2{color:#fff;background:rgba(191,0,255,.2);border-color:rgba(191,0,255,.5)}
.bp2:hover{background:rgba(191,0,255,.4);box-shadow:0 0 20px rgba(191,0,255,.4);transform:translateY(-1px)}

/* SKILLS */
.scat{margin-bottom:24px}
.cat{font-family:var(--mono);font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--p);margin-bottom:10px;font-weight:700}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{font-family:var(--mono);font-size:10px;letter-spacing:1px;color:var(--c);background:rgba(0,245,255,.06);border:1px solid rgba(0,245,255,.22);border-radius:4px;padding:5px 12px;cursor:default;transition:all .2s}
.chip:hover{background:rgba(0,245,255,.16);border-color:var(--c);box-shadow:0 0 12px rgba(0,245,255,.25);transform:translateY(-1px)}

/* TIMELINE */
.tl{position:relative;padding-left:26px}
.tl::before{content:'';position:absolute;left:7px;top:4px;bottom:4px;width:2px;background:linear-gradient(180deg,var(--c),var(--p),transparent)}
.job{position:relative;margin-bottom:26px;padding:18px 20px;background:rgba(0,245,255,.03);border:1px solid var(--b);border-radius:6px;transition:border-color .2s,box-shadow .2s}
.job:hover{border-color:rgba(0,245,255,.4);box-shadow:0 0 20px rgba(0,245,255,.08)}
.job::before{content:'';position:absolute;left:-32px;top:22px;width:12px;height:12px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c);border:2px solid var(--bg)}
.jr{font-size:15px;font-weight:700;color:#fff;margin-bottom:3px}
.jc{color:var(--c);font-size:12px;margin-bottom:2px;font-weight:600}
.jd{font-family:var(--mono);font-size:9px;letter-spacing:1px;color:var(--t2);margin-bottom:8px}
.jt{color:var(--t2);font-size:12.5px;line-height:1.6}

/* PROJECTS */
.pn-link{display:inline-flex;align-items:center;gap:8px;text-decoration:none;cursor:pointer;margin-bottom:4px}
.pn-link:hover .pn{color:var(--c);text-shadow:0 0 12px var(--c)}
.pn-link:hover .p-ext{background:var(--c);color:var(--bg);box-shadow:0 0 10px var(--c)}
.p-ext{font-family:var(--mono);font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--c);background:rgba(0,245,255,.08);border:1px solid rgba(0,245,255,.35);border-radius:3px;padding:2px 7px;transition:all .2s;vertical-align:middle}
.pgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.pc{padding:22px;background:rgba(0,245,255,.03);border:1px solid var(--b);border-radius:8px;transition:all .25s;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between}
.pc::before{content:'';position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,var(--c),var(--p));opacity:0;transition:opacity .2s}
.pc:hover{border-color:rgba(0,245,255,.45);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,245,255,.1)}
.pc:hover::before{opacity:1}
.pn{font-size:16px;font-weight:700;color:#fff;margin-bottom:4px}
.ps{color:var(--c);font-size:10px;font-family:var(--mono);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px}
.pd{color:var(--t2);font-size:12px;line-height:1.6;margin-bottom:14px}
.ptags{display:flex;flex-wrap:wrap;gap:6px}
.ptag{font-family:var(--mono);font-size:9px;letter-spacing:1px;color:var(--p);background:rgba(191,0,255,.09);border:1px solid rgba(191,0,255,.25);border-radius:3px;padding:3px 8px}

/* EDUCATION */
.edugrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.educard{padding:20px;background:rgba(0,245,255,.03);border:1px solid var(--b);border-radius:6px;transition:all .2s}
.educard:hover{border-color:rgba(0,245,255,.35);box-shadow:0 0 16px rgba(0,245,255,.07)}
.edudeg{font-size:14px;font-weight:700;color:#fff;margin-bottom:3px}
.eduinst{color:var(--c);font-size:12px;margin-bottom:4px}
.eduscore{font-family:var(--mono);font-size:11px;color:var(--g);font-weight:700;margin-bottom:4px}
.edudesc{font-size:11.5px;color:var(--t2)}

/* ACHIEVEMENTS */
.agrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.ac{background:rgba(255,215,0,.04);border:1px solid rgba(255,215,0,.2);border-radius:6px;padding:16px;transition:all .2s}
.ac:hover{border-color:rgba(255,215,0,.5);box-shadow:0 0 16px rgba(255,215,0,.15);transform:translateY(-2px)}
.ai{font-size:24px;margin-bottom:8px}
.at{font-size:13px;font-weight:700;color:var(--gold);margin-bottom:4px}
.as{font-size:11px;color:var(--t2)}

/* CONTACT */
.cgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cl{display:flex;align-items:center;gap:14px;background:rgba(0,245,255,.03);border:1px solid var(--b);border-radius:6px;padding:15px 18px;text-decoration:none;color:var(--t);transition:all .2s}
.cl:hover{border-color:rgba(0,245,255,.45);transform:translateX(3px);box-shadow:0 0 16px rgba(0,245,255,.1)}
.ci{font-size:20px;flex-shrink:0}
.clb{font-family:var(--mono);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--t2);display:block;margin-bottom:2px}
.cv{font-size:12px;color:var(--c);font-weight:600}

/* FOOTER */
footer{background:var(--bg);border-top:1px solid var(--b);padding:20px 36px;display:flex;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto}
.fc{font-family:var(--mono);font-size:10px;color:rgba(200,214,229,.4);letter-spacing:1px}
.ftags{display:flex;gap:6px}
.ft{font-family:var(--mono);font-size:9px;color:rgba(0,245,255,.5);background:rgba(0,245,255,.06);border:1px solid rgba(0,245,255,.15);border-radius:3px;padding:3px 8px}

@media(max-width:768px){
  section{padding:36px 20px}
  h1{font-size:36px}
  .pgrid,.cgrid,.edugrid{grid-template-columns:1fr}
  .agrid{grid-template-columns:1fr 1fr}
}
</style>
</head>
<body>

<nav>
  <div class="nav-left">
    <span class="brand">ANJALI.SYS</span>
    <span class="brand-sub">PORTFOLIO v2.0</span>
  </div>
  <ul class="links">
    <li><a href="#hero" class="nl on" data-s="hero">Home</a></li>
    <li><a href="#skills" class="nl" data-s="skills">Skills</a></li>
    <li><a href="#exp" class="nl" data-s="exp">Experience</a></li>
    <li><a href="#projects" class="nl" data-s="projects">Projects</a></li>
    <li><a href="#edu" class="nl" data-s="edu">Education</a></li>
    <li><a href="#wins" class="nl" data-s="wins">Awards</a></li>
    <li><a href="#contact" class="nl" data-s="contact">Contact</a></li>
  </ul>
  <button class="exit-btn" id="exit-screen-btn" title="Exit full-screen monitor (Esc)">
    <span>&#x21A9;</span> Exit Screen
  </button>
</nav>

<!-- HERO -->
<div class="sec-wrap">
<section id="hero">
  <div class="grid-bg"></div>
  <div class="hero-c">
    <div class="badge"><div class="dot"></div><span class="badge-t">Winner, HackX 2025 &bull; Available for Hire</span></div>
    <h1>Anjali<br><span>Tripathi</span></h1>
    <p class="role">Full Stack Developer &bull; AI/ML Engineer &bull; 3D Web</p>
    <p class="bio">
      Full Stack Developer specializing in the MERN stack, Next.js, REST APIs, MongoDB, and AI/ML model integration.
      I build scalable web applications, backend services, and intelligent automation systems, and ship them to production.
    </p>
    <div class="stats">
      <div class="stat"><b>5+</b><span>Internships</span></div><div class="sdiv"></div>
      <div class="stat"><b>4+</b><span>AI Projects</span></div><div class="sdiv"></div>
      <div class="stat"><b>6</b><span>Internships</span></div><div class="sdiv"></div>
      <div class="stat"><b>4</b><span>Hackathons</span></div>
    </div>
    <div class="cta">
      <a href="#exp" class="btn bp">View Experience</a>
      <a href="#projects" class="btn bo">View Projects</a>
      <a href="#contact" class="btn bp2">Get in Touch</a>
    </div>
  </div>
</section>
</div>

<!-- SKILLS -->
<div class="sec-wrap">
<section id="skills">
  <p class="lbl">02 / Capabilities</p>
  <h2 class="ttl">Technical Skills</h2>
  <div class="scat">
    <p class="cat">Languages</p>
    <div class="chips">
      <span class="chip">JavaScript</span><span class="chip">TypeScript</span><span class="chip">Python</span><span class="chip">C++</span><span class="chip">C</span><span class="chip">PHP</span><span class="chip">MySQL</span><span class="chip">SQL</span>
    </div>
  </div>
  <div class="scat">
    <p class="cat">Frontend</p>
    <div class="chips">
      <span class="chip">React.js</span><span class="chip">Next.js</span><span class="chip">Three.js</span><span class="chip">Tailwind CSS</span><span class="chip">HTML5</span><span class="chip">CSS3</span><span class="chip">WebGL</span><span class="chip">Redux</span>
    </div>
  </div>
  <div class="scat">
    <p class="cat">Backend &amp; Databases</p>
    <div class="chips">
      <span class="chip">Node.js</span><span class="chip">Express.js</span><span class="chip">Flask</span><span class="chip">REST APIs</span><span class="chip">MVC Architecture</span><span class="chip">MongoDB</span><span class="chip">MySQL</span><span class="chip">SQLite</span>
    </div>
  </div>
  <div class="scat">
    <p class="cat">AI / Machine Learning</p>
    <div class="chips">
      <span class="chip">TensorFlow</span><span class="chip">PyTorch</span><span class="chip">Scikit-learn</span><span class="chip">Keras</span><span class="chip">OpenCV</span><span class="chip">XGBoost</span><span class="chip">NLTK</span><span class="chip">Pandas</span><span class="chip">NumPy</span>
    </div>
  </div>
  <div class="scat">
    <p class="cat">Tools &amp; DevOps</p>
    <div class="chips">
      <span class="chip">Git</span><span class="chip">GitHub</span><span class="chip">Postman</span><span class="chip">Google AutoML</span><span class="chip">Docker</span><span class="chip">Linux</span><span class="chip">VS Code</span>
    </div>
  </div>
</section>
</div>

<!-- EXPERIENCE -->
<div class="sec-wrap">
<section id="exp">
  <p class="lbl">03 / Career</p>
  <h2 class="ttl">Work Experience</h2>
  <div class="tl">
    <div class="job">
      <div class="jr">AI Intern</div>
      <div class="jc">Web Access Pro</div>
      <div class="jd">Sep 2026 &mdash; Nov 2026</div>
      <p class="jt">Engineered high-accessibility, responsive web applications following WCAG standards; enhanced cross-browser performance, UI responsiveness, and component modularity.</p>
    </div>
    <div class="job">
      <div class="jr">AI ML Intern</div>
      <div class="jc">xIoTz Pvt Ltd</div>
      <div class="jd">Apr 2026 &mdash; May 2026</div>
      <p class="jt">Built and integrated machine learning models in Python for real-world AI applications; handled end-to-end data preprocessing, model training, accuracy evaluation, and cloud deployment.</p>
    </div>
    <div class="job">
      <div class="jr">Web Developer Intern</div>
      <div class="jc">Lirion Technologies</div>
      <div class="jd">May 2025 &mdash; Jun 2025</div>
      <p class="jt">Developed immersive 3D web experiences using Next.js and Tailwind CSS; optimized frontend rendering performance and ensured seamless responsive design across devices.</p>
    </div>
    <div class="job">
      <div class="jr">Full Stack Developer Intern</div>
      <div class="jc">CodeWebX Technologies</div>
      <div class="jd">Jan 2025 &mdash; Mar 2025</div>
      <p class="jt">Engineered MERN applications with scalable backend and secure RESTful APIs; actively participated in sprint features, unit testing, debugging, and production deployments.</p>
    </div>
    <div class="job">
      <div class="jr">AI &amp; XR Intern</div>
      <div class="jc">Flaunch</div>
      <div class="jd">Oct 2024 &mdash; Dec 2024</div>
      <p class="jt">Integrated computer vision models into Extended Reality (XR) applications; created low-latency real-time video processing pipelines with Python and ML frameworks.</p>
    </div>
    <div class="job">
      <div class="jr">Web Development Intern</div>
      <div class="jc">Tech Elecon Pvt Ltd</div>
      <div class="jd">Jun 2024 &mdash; Aug 2024</div>
      <p class="jt">Built robust REST APIs using Node.js and Express.js; developed MongoDB-backed full-stack applications adhering strictly to MVC architecture.</p>
    </div>
  </div>
</section>
</div>

<!-- PROJECTS -->
<div class="sec-wrap">
<section id="projects">
  <p class="lbl">04 / Selected Work</p>
  <h2 class="ttl">Featured Projects</h2>
  <div class="pgrid">
    <div class="pc">
      <div>
        <a href="https://codetrust.vercel.app/" target="_blank" rel="noopener" class="pn-link"><span class="pn">CodeTrust</span><span class="p-ext">&#x2197; Live Demo</span></a>
        <div class="ps">AI Hallucination &amp; Vulnerability Detector</div>
        <p class="pd">Automated scanner detecting hallucinations, syntax flaws, and security vulnerabilities in AI-generated code with automated validation and risk reporting.</p>
      </div>
      <div class="ptags"><span class="ptag">Python</span><span class="ptag">AI/ML</span><span class="ptag">FastAPI</span><span class="ptag">React</span><span class="ptag">AST</span></div>
    </div>
    <div class="pc">
      <div>
        <a href="https://format-hub.onrender.com/" target="_blank" rel="noopener" class="pn-link"><span class="pn">Format Hub</span><span class="p-ext">&#x2197; Live Demo</span></a>
        <div class="ps">Universal File Conversion Platform</div>
        <p class="pd">Full-stack document conversion platform: CSV to Excel, PDF, SQL, and SQLite with file validation, column mapping, split, and merge tools.</p>
      </div>
      <div class="ptags"><span class="ptag">Node.js</span><span class="ptag">React</span><span class="ptag">Express</span><span class="ptag">MongoDB</span><span class="ptag">Multer</span></div>
    </div>
    <div class="pc">
      <div>
        <a href="https://room-mate-match-izrf.vercel.app/" target="_blank" rel="noopener" class="pn-link"><span class="pn">AI Roommate Matching</span><span class="p-ext">&#x2197; Live Demo</span></a>
        <div class="ps">Intelligent Recommendation System</div>
        <p class="pd">AI-powered multi-factor preference matching with compatibility scoring to optimize roommate pairing and living habit alignment.</p>
      </div>
      <div class="ptags"><span class="ptag">MERN</span><span class="ptag">Machine Learning</span><span class="ptag">REST API</span><span class="ptag">Socket.io</span></div>
    </div>
    <div class="pc">
      <div>
        <a href="https://sangyanshield.aurocode.in/" target="_blank" rel="noopener" class="pn-link"><span class="pn">Sangyaan Shield</span><span class="p-ext">&#x2197; Live Demo</span></a>
        <div class="ps">Digital Fraud Resilience &amp; Preemptive Defense</div>
        <p class="pd">Digital Fraud Resilience &mdash; Preemptive Defense, addressing real-world threats such as fake SEBI registration numbers, deepfakes, misleading financial claims, and fraudulent investment groups.</p>
      </div>
      <div class="ptags"><span class="ptag">AI/ML</span><span class="ptag">Cybersecurity</span><span class="ptag">Deepfake Detection</span><span class="ptag">Python</span><span class="ptag">NLP</span></div>
    </div>
  </div>
</section>
</div>

<!-- EDUCATION -->
<div class="sec-wrap">
<section id="edu">
  <p class="lbl">05 / Academics</p>
  <h2 class="ttl">Education</h2>
  <div class="edugrid">
    <div class="educard">
      <div class="edudeg">B.Tech in Computer Engineering</div>
      <div class="eduinst">Madhuben and Bhanubhai Patel Institute of Technology, Anand (CVMU)</div>
            <p class="edudesc">2022 &mdash; 2026 &bull; Relevant Coursework: Data Structures, Algorithms, Machine Learning, DBMS, Web Engineering, Computer Networks.</p>
    </div>
    <div class="educard">
      <div class="edudeg">Higher Secondary &amp; Secondary School</div>
      <div class="eduinst">Gujarat Secondary and Higher Secondary Education Board</div>
      <div class="eduscore">Class XII: 84% &bull; Class X: 94%</div>
      <p class="edudesc">Excellence in Mathematics, Computer Science, and Physics with top percentile rankings.</p>
    </div>
  </div>
</section>
</div>

<!-- ACHIEVEMENTS -->
<div class="sec-wrap">
<section id="wins">
  <p class="lbl">06 / Recognition</p>
  <h2 class="ttl">Achievements &amp; Certifications</h2>
  <div class="agrid">
    <div class="ac"><div class="ai">&#x1F3C6;</div><div class="at">HackX 2025 &mdash; Winner</div><div class="as">National-Level 36-Hour Hackathon</div></div>
    <div class="ac"><div class="ai">&#x1F948;</div><div class="at">CVMU Hackathon 3.0</div><div class="as">Finalist &bull; State-Level</div></div>
    <div class="ac"><div class="ai">&#x1F916;</div><div class="at">AIML Hackathon</div><div class="as">Finalist &bull; Parul University</div></div>
    <div class="ac"><div class="ai">&#x1F469;&#x200D;&#x1F4BB;</div><div class="at">SheBuilds Hackathon</div><div class="as">Finalist &bull; Women in Tech</div></div>
    <div class="ac"><div class="ai">&#x1F4BB;</div><div class="at">6+ Tech Internships</div><div class="as">AI/ML &bull; Full Stack &bull; Web</div></div>
    <div class="ac"><div class="ai">&#x1F4DC;</div><div class="at">Google AutoML Certified</div><div class="as">ML Foundations &bull; Full Stack</div></div>
  </div>
</section>
</div>

<!-- CONTACT -->
<div class="sec-wrap">
<section id="contact">
  <p class="lbl">07 / Connect</p>
  <h2 class="ttl">Get In Touch</h2>
  <div class="cgrid">
    <a class="cl" href="mailto:tripathianjali760@gmail.com"><span class="ci">&#x2709;</span><div><span class="clb">Email</span><span class="cv">tripathianjali760@gmail.com</span></div></a>
    <a class="cl" href="tel:+918347994864"><span class="ci">&#x1F4F1;</span><div><span class="clb">Phone</span><span class="cv">+91 83479 94864</span></div></a>
    <a class="cl" href="https://github.com/anjali-0404" target="_blank" rel="noopener"><span class="ci">&#x1F419;</span><div><span class="clb">GitHub</span><span class="cv">github.com/anjali-0404</span></div></a>
    <a class="cl" href="https://linkedin.com/in/anjali-tripathi" target="_blank" rel="noopener"><span class="ci">&#x1F4BC;</span><div><span class="clb">LinkedIn</span><span class="cv">linkedin.com/in/anjali-tripathi</span></div></a>
  </div>
</section>
</div>

<footer>
  <span class="fc">&copy; 2026 Anjali Tripathi &bull; All Rights Reserved</span>
  <div class="ftags"><span class="ft">Three.js</span><span class="ft">React</span><span class="ft">TypeScript</span><span class="ft">WebGL</span><span class="ft">AI/ML</span></div>
</footer>

<script>
// Active nav on scroll
var obs = new IntersectionObserver(function(es) {
  es.forEach(function(e) {
    if (e.isIntersecting) {
      document.querySelectorAll('.nl').forEach(function(a) { a.classList.remove('on'); });
      var a = document.querySelector('.nl[data-s="' + e.target.id + '"]');
      if (a) a.classList.add('on');
    }
  });
}, { threshold: 0.25 });
document.querySelectorAll('section[id]').forEach(function(s) { obs.observe(s); });

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// Exit button
var exitBtn = document.getElementById('exit-screen-btn');
if (exitBtn) {
  exitBtn.addEventListener('click', function() {
    window.parent.postMessage({ type: 'exit' }, '*');
  });
}

// Bridge: mouse events & keydown back to parent
document.addEventListener('mousemove', function(e) {
  window.parent.postMessage({ type: 'mousemove', clientX: e.clientX, clientY: e.clientY }, '*');
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    window.parent.postMessage({ type: 'exit' }, '*');
  }
  window.parent.postMessage({ type: 'keydown', key: e.key }, '*');
});
</script>
</body>
</html>`;

export default class MonitorScreen extends EventEmitter {
    application: Application;
    scene:       THREE.Scene;
    cssScene:    THREE.Scene;
    resources:   Resources;
    sizes:       Sizes;
    camera:      Camera;

    screenSize: THREE.Vector2;
    position:   THREE.Vector3;
    rotation:   THREE.Euler;

    // hover-state tracking
    private inComputer  = false;
    private mouseDown   = false;
    private exitPending = false;

    constructor() {
        super();
        this.application = new Application();
        this.scene       = this.application.scene;
        this.cssScene    = this.application.cssScene;
        this.sizes       = this.application.sizes;
        this.resources   = this.application.resources;
        this.camera      = this.application.camera;

        this.screenSize = new THREE.Vector2(SCREEN_SIZE.w, SCREEN_SIZE.h);
        this.position   = new THREE.Vector3(0, 950, 255);
        this.rotation   = new THREE.Euler(-3 * THREE.MathUtils.DEG2RAD, 0, 0);

        this.createScreen();
        this.createEnclosingPlanes(10);
        this.initGlobalListeners();
    }

    // ── Build iframe + CSS3D object ───────────────────────────────────────────
    createScreen() {
        const container = document.createElement('div');
        container.style.cssText =
            `width:${this.screenSize.width}px;height:${this.screenSize.height}px;` +
            `background:#020810;pointer-events:auto;overflow:hidden;border-radius:4px;`;

        const iframe = document.createElement('iframe');
        iframe.id    = 'computer-screen';
        iframe.title = 'AnjaliOS';
        iframe.style.cssText =
            `width:${this.screenSize.width}px;height:${this.screenSize.height}px;` +
            `padding:0;box-sizing:border-box;border:0;background:#020810;display:block;`;

        // Pure self-contained srcdoc loading - zero external network dependencies
        iframe.srcdoc = PORTFOLIO_HTML;

        // ── Interaction detection ─────────────────────────────────────────────
        container.addEventListener('mouseenter', () => this.enterMonitor());
        // Note: Do NOT exit on mouseleave; exit monitor mode ONLY via Zoom Out button or Escape

        // ── Bridge messages from inside iframe ───────────────────────────────
        window.addEventListener('message', (ev) => {
            if (ev.source !== iframe.contentWindow) return;
            const d = ev.data;
            if (!d || typeof d !== 'object') return;

            if (d.type === 'exit') { this.leaveMonitor(); return; }

            if (d.type === 'mousemove') {
                const r = iframe.getBoundingClientRect();
                const x = r.left + (d.clientX + IFRAME_PADDING) * r.width  / SCREEN_SIZE.w;
                const y = r.top  + (d.clientY + IFRAME_PADDING) * r.height / SCREEN_SIZE.h;
                this.application.mouse.trigger('mousemove', [{ clientX: x, clientY: y }]);
                this.enterMonitor();
            }

            if (d.type === 'keydown') {
                if (d.key === 'Escape') {
                    this.leaveMonitor();
                    return;
                }
                const evt = new CustomEvent('keydown', { bubbles: true, cancelable: false });
                // @ts-ignore
                evt.key = d.key;
                iframe.dispatchEvent(evt);
            }
        });

        container.appendChild(iframe);
        this.createCssPlane(container);
    }

    private enterMonitor() {
        if (this.inComputer) return;
        this.inComputer = true;
        document.body.classList.add('in-monitor');
        this.camera.trigger('enterMonitor');
    }

    private leaveMonitor() {
        if (!this.inComputer) return;
        this.inComputer  = false;
        this.exitPending = false;
        document.body.classList.remove('in-monitor');
        this.camera.trigger('leftMonitor');
    }

    // ── Global pointer listeners ──────────────────────────────────────────────
    initGlobalListeners() {
        document.addEventListener('pointerdown', () => { this.mouseDown = true; });
        document.addEventListener('pointerup',   () => { this.mouseDown = false; });
        this.camera.on('leftMonitor', () => {
            this.inComputer = false;
            document.body.classList.remove('in-monitor');
        });
    }

    // ── CSS3D + GL hole ───────────────────────────────────────────────────────
    createCssPlane(element: HTMLElement) {
        const css3d = new CSS3DObject(element);
        css3d.position.copy(this.position);
        css3d.rotation.copy(this.rotation);
        this.cssScene.add(css3d);

        // Transparent GL mesh punches hole in WebGL canvas so CSS3D is visible
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(this.screenSize.width, this.screenSize.height),
            new THREE.MeshBasicMaterial({
                opacity: 0, transparent: true, blending: THREE.NoBlending, side: THREE.DoubleSide,
            })
        );
        mesh.position.copy(css3d.position);
        mesh.rotation.copy(css3d.rotation);
        mesh.scale.copy(css3d.scale);
        this.scene.add(mesh);
    }

    // ── Enclosing planes (monitor bezel depth) ────────────────────────────────
    createEnclosingPlanes(depth: number) {
        const W = this.screenSize.width, H = this.screenSize.height;
        const bezelColor = 0x0a0f1a;
        const planes: { size: THREE.Vector2; dx: number; dy: number; dz: number; ry: number; rx: number }[] = [
            { size: new THREE.Vector2(depth, H), dx: -W / 2, dy: 0,      dz: depth / 2, ry: Math.PI / 2, rx: 0 },
            { size: new THREE.Vector2(depth, H), dx:  W / 2, dy: 0,      dz: depth / 2, ry: Math.PI / 2, rx: 0 },
            { size: new THREE.Vector2(W, depth), dx: 0,      dy:  H / 2, dz: depth / 2, ry: 0, rx: Math.PI / 2 },
            { size: new THREE.Vector2(W, depth), dx: 0,      dy: -H / 2, dz: depth / 2, ry: 0, rx: Math.PI / 2 },
        ];
        for (const p of planes) {
            const mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(p.size.x, p.size.y),
                new THREE.MeshBasicMaterial({ color: bezelColor, side: THREE.DoubleSide })
            );
            const off = new THREE.Vector3(p.dx, p.dy, p.dz);
            mesh.position.copy(new THREE.Vector3().copy(this.position).add(off));
            mesh.rotation.set(p.rx, p.ry, 0);
            this.scene.add(mesh);
        }
    }

    update() {}
}
