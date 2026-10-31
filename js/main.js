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

function card(item, key) {
  const has = item.images.length > 0;
  const shot = has
    ? `<button class="shot" type="button" data-key="${key}" aria-label="Open ${esc(item.name)} screenshots">
         <img src="${item.images[0]}" alt="${esc(item.name)} VR module" loading="lazy">
         ${item.images.length > 1 ? `<span class="n">${item.images.length}</span>` : ""}
       </button>`
    : "";
  const video = item.video
    ? ` <a href="https://youtu.be/${item.video}" target="_blank" rel="noreferrer">Video</a>`
    : "";
  return `<article class="card${has ? "" : " text-only"}">${shot}
    <h3>${esc(item.name)}</h3><p>${esc(item.text)}${video}</p></article>`;
}

modules.forEach((m, i) => (galleries["m" + i] = m));
labs.forEach((l, i) => (galleries["l" + i] = l));

document.getElementById("modules").innerHTML = modules.map((m, i) => card(m, "m" + i)).join("");
document.getElementById("labs").innerHTML = labs.map((l, i) => card(l, "l" + i)).join("");

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
