
function createNebula(scene) {
  const nebulaPatches = [];
  const cloudCount = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < cloudCount; i++) {
    const tex = new THREE.CanvasTexture(generateNebulaTexture());
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });

    const nebulaCloud = new THREE.Mesh(
      new THREE.SphereGeometry(100, 16, 16),
      mat
    );

    nebulaCloud.position.set(
      (Math.random() - 0.5) * 1500,
      (Math.random() - 0.5) * 1500,
      (Math.random() - 0.5) * 1500
    );

    nebulaCloud.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    scene.add(nebulaCloud);
    nebulaPatches.push(nebulaCloud);
  }

  return nebulaPatches;
}

window.createNebula = createNebula;

function generateNebulaTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, size, size);

  const gradientCount = 4 + Math.floor(Math.random() * 3);

  for (let i = 0; i < gradientCount; i++) {
    const centerX = Math.random() * size;
    const centerY = Math.random() * size;
    const radius = 100 + Math.random() * 150;

    const colors = [
      `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
      `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 150)}, 0.5)`,
      `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.4)`
    ];

    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(0.5, colors[1]);
    grad.addColorStop(1, colors[2]);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  for (let i = 0; i < 150; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`;
    const x = Math.random() * size;
    const y = Math.random() * size;
    const starSize = Math.random() * 4 + 2;
    ctx.beginPath();
    ctx.arc(x, y, starSize, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}
