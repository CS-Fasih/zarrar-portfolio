// Content lives here so adding a screenshot means adding one path.
// Lab screenshots go in assets/labs/ (e.g. assets/labs/bridgelab-01.webp).

const lab = (slug, n) => Array.from({ length: n }, (_, i) => `assets/labs/${slug}-0${i + 1}.webp`);
const labs = [
  { name: "RC SiteLab", text: "Reinforced-concrete construction site: formwork, rebar placement and pour sequence.", images: lab("rc-sitelab", 3) },
  { name: "BridgeLab VR", text: "Bridge types and how load travels through each structure.", images: lab("bridgelab", 2) },
  { name: "Seismic Shake Table", text: "Buildings on a virtual shake table under different earthquake inputs.", images: lab("shaketable", 2) },
  { name: "Hydraulics & Dam Safety", text: "Dam components, spillway flow and failure scenarios.", images: lab("hydraulics", 2) },
  { name: "Engine Lab VR", text: "Internal-combustion engine assembly and the four-stroke cycle.", images: lab("engine-lab", 2) },
  { name: "SuperCar Demo", text: "Real-time vehicle visualisation and interaction in Vizard.", images: lab("supercar", 2) }
];

const models = [
  ["truck-art-transport-truck", "Truck-Art Transport Truck"],
  ["traditional-auto-rickshaw", "Traditional Auto Rickshaw"],
  ["cnc-milling-machine-5-axis", "CNC Milling Machine, 5-Axis"],
  ["complete-dental-operatory", "Dental Operatory Unit"],
  ["islamic-geometric-minaret-dome", "Minaret and Dome Kit"],
  ["counterbalance-diesel-forklift", "Diesel Forklift"],
  ["trinocular-camera-microscope", "Trinocular Microscope"],
  ["samovar", "Brass Tea Samovar"],
  ["inspection-hexacopter", "Inspection Hexacopter"],
  ["hospital-anesthesia-machine", "Anesthesia Machine"],
  ["electric-site-concrete-mixer", "Site Concrete Mixer"],
  ["air-fryer", "Smart Air Fryer"]
];
document.getElementById("model-grid").innerHTML = models.map(([s, n]) =>
  `<figure class="model reveal"><img src="assets/models/${s}.webp" alt="${n}, 3D model by Zarrar Abbas" loading="lazy" width="1200" height="675"><figcaption>${n}</figcaption></figure>`).join("");

const f = (n) => `assets/fyp/${n}.webp`;
const modules = [
  { code: "COAL", name: "Computer Organization", text: "RISC pipeline, stepped one clock cycle at a time.", images: [f("coal-01"), f("coal-02")], video: "gBxr_ZjLvDE" },
  { code: "DBS", name: "Database Systems", text: "A SQL query through parser, optimizer and execution.", images: ["dbs-01","dbs-02","dbs-03","dbs-04","dbs-05","dbs-06"].map(f), video: "QxVq_sVmHbk" },
  { code: "AP", name: "Applied Physics", text: "Projectiles and solenoid field lines you can toggle.", images: ["ap-01","ap-02","ap-03","ap-04","ap-05","ap-06","ap-07","ap-08"].map(f), video: "Ppt5mqVKQus" },
  { code: "AI", name: "Artificial Intelligence", text: "An XOR neural network with visible weights and signals.", images: ["ai-01","ai-02","ai-03","ai-04"].map(f), video: "fv0zxbgd9Ts" },
  { code: "BE", name: "Basic Electronics", text: "Ohm's law, breadboard circuits, PN junction bias.", images: ["be-01","be-02","be-03","be-04","be-05","be-06"].map(f), video: "c3FQG-gDJTU" },
  { code: "DSA", name: "Data Structures", text: "Linked lists, BST traversal, Dijkstra's shortest path.", images: [f("dsa-01"), f("dsa-02")] },
  { code: "DAA", name: "Algorithms", text: "Frequency-count analysis of algorithms, step by step.", images: ["daa-01","daa-02","daa-03","daa-04"].map(f), video: "btvhPx6pNEY" },
  { code: "OS", name: "Operating Systems", text: "Round Robin and SJF scheduling as moving queues.", images: [f("os-01"), f("os-02"), f("os-03")], video: "bViSNzEl70g" },
  { code: "DCN", name: "Networking", text: "Caesar cipher encryption between client and server.", images: [f("dcn-01"), f("dcn-02"), f("dcn-03")] },
  { code: "DLD", name: "Digital Logic", text: "Logic gates and circuits built interactively.", images: [f("dld-01"), f("dld-02")], video: "hK88lqn72bc" }
];

const galleries = {
  mazar: { name: "Mazar-e-Quaid digital twin", images: ["assets/fyp/mazar-e-quaid/mazar-01.png", "assets/fyp/mazar-e-quaid/mazar-02.png"] },
  fire: { name: "Fire extinguisher training", images: ["assets/fyp/fire-extinguisher/fire-01.png", "assets/fyp/fire-extinguisher/fire-02.png"] }
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function card(item, key, tag) {
  const has = item.images.length > 0;
  const shot = has
    ? `<button class="shot" type="button" data-key="${key}" aria-label="Open ${esc(item.name)} screenshots">
         ${tag ? `<span class="tagline">${tag}</span>` : ""}
         <img src="${item.images[0]}" alt="${esc(item.name)} VR module" loading="lazy">
         ${item.images.length > 1 ? `<span class="n">${item.images.length}</span>` : ""}
       </button>`
    : "";
  const video = item.video
    ? ` <a href="https://youtu.be/${item.video}" target="_blank" rel="noreferrer">Video</a>`
    : "";
  return `<article class="card reveal${has ? "" : " text-only"}">${shot}
    <h3>${esc(item.name)}</h3><p>${esc(item.text)}${video}</p></article>`;
}

modules.forEach((m, i) => (galleries["m" + i] = m));
labs.forEach((l, i) => (galleries["l" + i] = l));

document.getElementById("modules").innerHTML = modules.map((m, i) => card(m, "m" + i, m.code)).join("");
document.getElementById("labs").innerHTML = labs.map((l, i) => card(l, "l" + i, "LAB " + String(i + 1).padStart(2, "0"))).join("");

// Viewer
const dlg = document.getElementById("viewer");
const img = document.getElementById("viewer-img");
const cap = document.getElementById("viewer-cap");
const count = document.getElementById("viewer-count");
let cur = null, idx = 0;

function show() {
  img.src = cur.images[idx];
  img.alt = `${cur.name} screenshot ${idx + 1}`;
  cap.textContent = cur.name;
  count.textContent = cur.images.length > 1 ? `${idx + 1} / ${cur.images.length}` : "";
  dlg.classList.toggle("single", cur.images.length < 2);
}
function open(key) {
  cur = galleries[key]; idx = 0;
  if (!cur || !cur.images.length) return;
  show(); dlg.showModal();
}
function step(d) { idx = (idx + d + cur.images.length) % cur.images.length; show(); }

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-key],[data-gallery]");
  if (t) open(t.dataset.key || t.dataset.gallery);
});
dlg.querySelector(".close").onclick = () => dlg.close();
dlg.querySelector(".prev").onclick = () => step(-1);
dlg.querySelector(".next").onclick = () => step(1);
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
document.addEventListener("keydown", (e) => {
  if (!dlg.open) return;
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

// ---- Hero: lab screenshots cross-fading behind a VR-style grid floor
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const slides = document.getElementById("hero-slides");
const hudLab = document.getElementById("hud-lab");
const heroShots = labs.map((l) => [l.images[0], l.name]);
heroShots.forEach(([src, name], i) => {
  const im = new Image();
  im.src = src; im.alt = ""; im.decoding = "async";
  if (i === 0) im.className = "on";
  slides.appendChild(im);
});
let hs = 0;
if (!still) setInterval(() => {
  const ims = slides.children;
  ims[hs].className = "";
  hs = (hs + 1) % ims.length;
  ims[hs].className = "on";
  hudLab.textContent = heroShots[hs][1].toUpperCase();
}, 5200);

const cv = document.getElementById("grid");
const ctx = cv.getContext("2d");
let W = 0, H = 0, mx = 0, my = 0, t0 = performance.now();
function size() {
  const r = devicePixelRatio || 1;
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = W * r; cv.height = H * r; ctx.setTransform(r, 0, 0, r, 0, 0);
}
addEventListener("resize", size); size();
addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
const fps = document.getElementById("hud-fps");
let frames = 0, last = performance.now();
function draw(now) {
  const t = (now - t0) / 1000;
  ctx.clearRect(0, 0, W, H);
  const hz = H * (0.62 + my * 0.03);            // horizon
  const cx = W / 2 + mx * W * 0.06;             // vanishing point follows the pointer
  const grad = ctx.createLinearGradient(0, hz, 0, H);
  grad.addColorStop(0, "rgba(71,230,255,0)");
  grad.addColorStop(1, "rgba(71,230,255,0.38)");
  ctx.strokeStyle = grad; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = -24; i <= 24; i++) {             // lines to the vanishing point
    ctx.moveTo(cx + i * 6, hz); ctx.lineTo(cx + i * W * 0.11, H);
  }
  const off = (t * 0.35) % 1;                   // the floor glides towards the viewer
  for (let k = 0; k < 18; k++) {
    const z = Math.pow((k + off) / 18, 2.4);
    const y = hz + (H - hz) * z;
    ctx.moveTo(0, y); ctx.lineTo(W, y);
  }
  ctx.stroke();
  // tracking reticle
  const rx = W * (0.5 + mx * 0.5), ry = H * (0.5 + my * 0.5);
  ctx.strokeStyle = "rgba(71,230,255,0.55)";
  ctx.beginPath(); ctx.arc(rx, ry, 14, 0, Math.PI * 2);
  ctx.moveTo(rx - 24, ry); ctx.lineTo(rx - 18, ry); ctx.moveTo(rx + 18, ry); ctx.lineTo(rx + 24, ry);
  ctx.moveTo(rx, ry - 24); ctx.lineTo(rx, ry - 18); ctx.moveTo(rx, ry + 18); ctx.lineTo(rx, ry + 24);
  ctx.stroke();
  frames++;
  if (now - last > 1000) { fps.textContent = Math.round(frames * 1000 / (now - last)) + " FPS"; frames = 0; last = now; }
  if (!still) requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// ---- Reveal blocks as they scroll in (an enhancement only: nothing stays hidden)
if (!still && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal, .head, .fyp-head, .other li, .about-cols").forEach((el) => {
    el.classList.add("reveal");
    if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("below"); io.observe(el); }
  });
  document.documentElement.classList.add("anim");
  // failsafe: whatever has not appeared after a few seconds (slow device, full-page capture, print) is shown
  const showAll = () => document.querySelectorAll(".reveal.below").forEach((el) => el.classList.add("in"));
  setTimeout(showAll, 3500);
  addEventListener("beforeprint", showAll);
}
