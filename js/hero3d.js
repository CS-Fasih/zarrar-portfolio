(function () {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas || typeof THREE === "undefined") {
    return;
  }

  function supportsWebgl() {
    try {
      const testCanvas = document.createElement("canvas");
      return Boolean(window.WebGLRenderingContext && (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl")));
    } catch (error) {
      return false;
    }
  }

  if (!supportsWebgl()) {
    canvas.setAttribute("data-webgl", "unavailable");
    return;
  }

  const scene = new THREE.Scene();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
  } catch (error) {
    canvas.setAttribute("data-webgl", "unavailable");
    return;
  }
  renderer.setClearColor(0xfaf7ff, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const camera = new THREE.PerspectiveCamera(47, 1, 0.1, 100);
  camera.position.set(0, 1.55, 7.4);

  const root = new THREE.Group();
  scene.add(root);

  const cubeGroup = new THREE.Group();
  const desktopBaseY = 0.52;
  let currentBaseY = desktopBaseY;
  cubeGroup.position.y = currentBaseY;
  root.add(cubeGroup);

  const purple = new THREE.Color("#7700cc");
  const cyan = new THREE.Color("#0099cc");

  function makeEdges(geometry, color, opacity) {
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity
    });
    return new THREE.LineSegments(edges, material);
  }

  const outerCube = makeEdges(new THREE.BoxGeometry(2.3, 2.3, 2.3), purple, 0.96);
  const innerCube = makeEdges(new THREE.BoxGeometry(1.05, 1.05, 1.05), cyan, 0.92);
  const octahedron = makeEdges(new THREE.OctahedronGeometry(1.56), purple, 0.58);
  cubeGroup.add(outerCube, innerCube, octahedron);

  const ringMaterialA = new THREE.MeshBasicMaterial({
    color: purple,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });
  const ringMaterialB = new THREE.MeshBasicMaterial({
    color: cyan,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.08, 0.024, 8, 92), ringMaterialA);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.52, 0.021, 8, 92), ringMaterialB);
  ringA.rotation.x = Math.PI / 2.6;
  ringA.rotation.y = Math.PI / 5;
  ringB.rotation.x = -Math.PI / 3;
  ringB.rotation.y = Math.PI / 7;
  cubeGroup.add(ringA, ringB);

  const grid = new THREE.GridHelper(18, 32, 0x7700cc, 0x0099cc);
  grid.position.y = -2.35;
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  scene.add(grid);

  function createParticleSet(count, color, size, radius, rising) {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const ix = i * 3;
      positions[ix] = (Math.random() - 0.5) * radius;
      positions[ix + 1] = (Math.random() - 0.5) * 8.2;
      positions[ix + 2] = (Math.random() - 0.5) * radius;
      speeds[i] = rising ? 0.009 + Math.random() * 0.018 : 0.003 + Math.random() * 0.008;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: rising ? 0.76 : 0.55,
      depthWrite: false
    });
    const points = new THREE.Points(geometry, material);
    points.userData.speeds = speeds;
    points.userData.rising = rising;
    scene.add(points);
    return points;
  }

  const cyanParticles = createParticleSet(220, cyan, 0.04, 11, true);
  const purpleParticles = createParticleSet(150, purple, 0.034, 12, false);

  const purpleLight = new THREE.PointLight(0x7700cc, 1.6, 14);
  purpleLight.position.set(-3.5, 3, 4);
  const cyanLight = new THREE.PointLight(0x0099cc, 1.4, 14);
  cyanLight.position.set(3.4, 2.2, 3);
  const ambient = new THREE.AmbientLight(0xffffff, 1.8);
  scene.add(purpleLight, cyanLight, ambient);

  const mouse = new THREE.Vector2(0, 0);
  const target = new THREE.Vector3(0, currentBaseY, 0);
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    const compact = width < 720;
    currentBaseY = compact ? 0.12 : desktopBaseY;
    cubeGroup.scale.setScalar(compact ? 0.72 : 1);
    target.y = currentBaseY;
  }

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    target.set(mouse.x * 0.72, currentBaseY + mouse.y * 0.28, 0);
  }

  function animateParticles(points, delta) {
    const positions = points.geometry.attributes.position.array;
    const speeds = points.userData.speeds;
    const rising = points.userData.rising;
    for (let i = 0; i < speeds.length; i += 1) {
      const yIndex = i * 3 + 1;
      positions[yIndex] += speeds[i] * delta;
      if (positions[yIndex] > 4.4) {
        positions[yIndex] = -4.1;
      }
      if (!rising) {
        positions[i * 3] += Math.sin(delta * 0.001 + i) * 0.0008;
      }
    }
    points.geometry.attributes.position.needsUpdate = true;
  }

  let lastTime = 0;
  function render(time) {
    const delta = Math.min(time - lastTime || 16, 32);
    lastTime = time;
    const t = time * 0.001;

    cubeGroup.position.lerp(target, 0.045);
    cubeGroup.position.y += Math.sin(t * 1.2) * 0.0035;

    if (!prefersReduced) {
      outerCube.rotation.x += 0.004;
      outerCube.rotation.y += 0.006;
      innerCube.rotation.x -= 0.008;
      innerCube.rotation.y -= 0.005;
      octahedron.rotation.x += 0.005;
      octahedron.rotation.z += 0.004;
      ringA.rotation.z += 0.008;
      ringB.rotation.z -= 0.006;
      root.rotation.y = Math.sin(t * 0.18) * 0.08;
      animateParticles(cyanParticles, delta);
      animateParticles(purpleParticles, delta * 0.75);
    }

    purpleLight.intensity = 1.45 + Math.sin(t * 2.1) * 0.45;
    cyanLight.intensity = 1.3 + Math.cos(t * 2.4) * 0.38;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  resize();
  requestAnimationFrame(render);
})();
