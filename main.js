let scene, camera, renderer, composer, controls;
let explosionParticles, galaxyParticles, starField;
let blackHoleModel = null;
let sunModel = null;
let planetModels = {}; // Store all planet models
let modelsFadeStart = 0; // Track when models start fading in
let clock = new THREE.Clock();
let explosionCount = 20000;
let galaxyCount = 8000;
let starCount = 15000; // Number of background stars
let viaGalaxy = false;

init(); animate();

function init(){
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, innerWidth/innerHeight, 0.1, 10000); // Reduced FOV from 75 to 50 to minimize distortion
  camera.position.set(0, 0, 200); // Original burst view position

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0); // Focus on center initially
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Add minimal lighting only for 3D models that need it (like sun)
  const ambientLight = new THREE.AmbientLight(0x404040, 0.1); // Reduced from 0.3 to 0.1
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2); // Reduced from 0.5 to 0.2
  directionalLight.position.set(100, 100, 50);
  scene.add(directionalLight);

  // Add a very dim secondary light
  const secondaryLight = new THREE.DirectionalLight(0x6699ff, 0.05); // Reduced from 0.2 to 0.05
  secondaryLight.position.set(-100, -100, -50);
  scene.add(secondaryLight);

  composer = new THREE.EffectComposer(renderer);
  composer.addPass(new THREE.RenderPass(scene,camera));

  let bloom = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),1.5,0.4,0.85);
  bloom.threshold = 0.4; // Reduced for more dramatic sun glow
  bloom.strength = 2.5; // Reduced from 3.5 to 2.5 for less intense bloom
  bloom.radius = 0.7; // Slightly reduced radius
  composer.addPass(bloom);

  createExplosion();
  createStarField(); // Add background stars immediately
  createNavigationUI();
  window.addEventListener('resize', onResize);
}

function createExplosion(){
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(explosionCount*3);
  const vel = new Float32Array(explosionCount*3);

  for(let i=0;i<explosionCount;i++){
    pos[i*3]=0; pos[i*3+1]=0; pos[i*3+2]=0;
    const theta = Math.random()*Math.PI*2;
    const phi = Math.acos(2*Math.random()-1);
    const speed = Math.random()*1.0 + 0.5;
    vel[i*3] = speed*Math.sin(phi)*Math.cos(theta);
    vel[i*3+1] = speed*Math.sin(phi)*Math.sin(theta);
    vel[i*3+2] = speed*Math.cos(phi);
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geo.setAttribute('velocity', new THREE.BufferAttribute(vel,3));

  const material = new THREE.PointsMaterial({
    size: 4.0, // Increased from 2.5 to 4.0 for bigger particles
    map: generateSprite(),
    color: 0xffffff, // Bright white color
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8, // Reduced from 1.5 to 0.8 for less brightness
    depthWrite: false
  });

  explosionParticles = new THREE.Points(geo, material);
  scene.add(explosionParticles);
}

function generateSprite(){
  const canvas = document.createElement('canvas');
  canvas.width=64; canvas.height=64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32,32,0,32,32,32);
  grad.addColorStop(0,'rgba(255,255,255,1)');
  grad.addColorStop(0.2,'rgba(255,255,255,0.8)');
  grad.addColorStop(0.4,'rgba(255,255,255,0.5)');
  grad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(canvas);
}

function createGalaxy(){
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(galaxyCount*3);
  for(let i=0;i<galaxyCount;i++){
    pos[i*3] = (Math.random()-0.5)*6000;
    pos[i*3+1] = (Math.random()-0.5)*6000;
    pos[i*3+2] = (Math.random()-0.5)*6000;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const mat = new THREE.PointsMaterial({
    size: 2.5, // Increased from 1.5 to 2.5 for bigger galaxy particles
    depthTest: false,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0, // Start invisible for fade-in effect
    vertexColors: false,
    color: 0xffffff // Bright white color
  });
  galaxyParticles = new THREE.Points(geo, mat);
  galaxyParticles.material.userData.targetOpacity = 0.6; // Reduced from 1.0 to 0.6 for less brightness
  scene.add(galaxyParticles);
}

function createStarField(){
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  
  // Create stars at various distances and sizes
  for(let i = 0; i < starCount; i++){
    // Distribute stars in a large sphere around the scene
    const radius = 3000 + Math.random() * 5000; // Stars between 3000-8000 units away
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = radius * Math.cos(phi);
    
    // Vary star colors (white, blue, yellow, red)
    const colorType = Math.random();
    if(colorType < 0.6){
      // White/blue stars (most common)
      colors[i * 3] = 0.8 + Math.random() * 0.2;     // R
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2; // G  
      colors[i * 3 + 2] = 1.0; // B
    } else if(colorType < 0.8){
      // Yellow/orange stars
      colors[i * 3] = 1.0; // R
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.3 + Math.random() * 0.3; // B
    } else {
      // Red stars
      colors[i * 3] = 1.0; // R
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.2; // G
      colors[i * 3 + 2] = 0.1 + Math.random() * 0.2; // B
    }
    
    // Vary star sizes based on distance and type
    const distance = Math.sqrt(pos[i*3]**2 + pos[i*3+1]**2 + pos[i*3+2]**2);
    const baseSizeByDistance = Math.max(0.3, 2.0 - (distance - 3000) / 5000);
    sizes[i] = baseSizeByDistance * (0.5 + Math.random() * 1.5);
  }
  
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  
  const fragmentShader = `
    varying vec3 vColor;
    uniform float time;
    
    void main() {
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5, 0.5));
      float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
      
      // Add subtle twinkling effect
      float twinkle = 0.8 + 0.2 * sin(time * 3.0 + gl_FragCoord.x * 0.01 + gl_FragCoord.y * 0.01);
      
      gl_FragColor = vec4(vColor, alpha * 0.8 * twinkle);
    }
  `;
  
  const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true
  });
  
  starField = new THREE.Points(geo, starMaterial);
  scene.add(starField);
}

function loadModel(){
  const loader = new THREE.GLTFLoader();
  loader.load('blackholegltf/scene.gltf', 
    (gltf) => {
      blackHoleModel = gltf.scene;
      
      // Scale the model appropriately to match other objects
      blackHoleModel.scale.set(4, 4, 4); // Same scale as other objects
      blackHoleModel.position.set(1000, 300, 800); // Positioned for comfortable viewing
      
      // Ensure all materials are properly set up and start invisible
      blackHoleModel.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.material.opacity = 0; // Start invisible for fade-in effect
          // Minimal emissive properties for black hole (much less glow)
          if (child.material.emissiveMap) {
            child.material.emissive = new THREE.Color(0x222222); // Reduced from 0x444444
            child.material.emissiveIntensity = 0.1; // Add intensity control
          }
          // Store original opacity for fade-in
          child.material.userData.targetOpacity = 0.8;
        }
      });
      
      scene.add(blackHoleModel);
      console.log("Black hole model loaded successfully!");
      
      // Add coordinate marker for black hole
      createCoordinateMarker(blackHoleModel.position, 'Black Hole\n(2000, 800, -1500)', 0x800080);
    },
    (progress) => {
      console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
    },
    (err) => {
      console.error('Failed to load GLTF model:', err);
    }
  );
}

function loadSunModel(){
  const loader = new THREE.GLTFLoader();
  loader.load('sun/scene.gltf', 
    (gltf) => {
      sunModel = gltf.scene;
      
      // Scale and position the sun model at comfortable viewing distance
      sunModel.scale.set(4, 4, 4); // Same scale as planets (2.0 * 2 = 4)
      sunModel.position.set(0, 0, -200); // Move sun back to previous working position
      
      // Enhance sun materials for glowing effect and start invisible
      sunModel.traverse((child) => {
        if (child.isMesh) {
          // Make the sun glow with reduced brightness
          child.material.emissive = new THREE.Color(0xff8800); // Slightly less bright orange
          child.material.emissiveIntensity = 2.0; // Reduced from 3.0 to 2.0 for less brightness
          
          // If it has a transmission map, make it slightly transparent
          if (child.material.map) {
            child.material.transparent = true;
            child.material.opacity = 0; // Start invisible for fade-in effect
            // Store original opacity for fade-in
            child.material.userData.targetOpacity = 0.9;
          } else {
            child.material.transparent = true;
            child.material.opacity = 0; // Start invisible for fade-in effect
            child.material.userData.targetOpacity = 1.0;
          }
        }
      });
      
      scene.add(sunModel);
      console.log("Sun model loaded successfully!");
      
      // Add a point light at the sun's position for realistic lighting (start dim)
      const sunLight = new THREE.PointLight(0xffaa44, 0, 1200); // Normal range for z=400 system
      sunLight.position.copy(sunModel.position);
      sunLight.userData.targetIntensity = 1.5; // Store target intensity
      scene.add(sunLight);
      window.sunLight = sunLight; // Store reference for animation
      
      // Add a glowing sphere around the sun for enhanced effect
      createSunGlow();
      
      // Add coordinate marker for sun 
      createCoordinateMarker(sunModel.position, 'Sun\n(0, 0, -200)', 0xffaa00);
      
    },
    (progress) => {
      console.log('Sun loading progress:', (progress.loaded / progress.total * 100) + '%');
    },
    (err) => {
      console.error('Failed to load Sun model:', err);
    }
  );
}

function createSunGlow(){
  // Create a glowing sphere around the sun - larger and brighter like original
  const glowGeometry = new THREE.SphereGeometry(35, 32, 32); // Increased from 20 to 35 for larger glow
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0, // Start invisible for fade-in effect
    blending: THREE.AdditiveBlending
  });
  
  const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  sunGlow.position.set(0, 0, -200); // Sun position at z=-200
  sunGlow.material.userData.targetOpacity = 0.3; // Increased from 0.1 to 0.3 for stronger glow
  scene.add(sunGlow);
  
  // Store reference for animation
  window.sunGlow = sunGlow;
}

function loadPlanets(){
  // Planet data with realistic orbital distances in circular arrangement
  // All objects scaled to same size for uniform viewing
  const planetData = {
    mercury: { 
      distance: 200, // Inner orbit
      angle: 0, // Starting angle in radians
      size: 2.0, // Same size as all others
      color: 0x8c7853,
      folder: 'mercury'
    },
    venus: { 
      distance: 350, // Second orbit
      angle: Math.PI / 4, // 45 degrees offset
      size: 1.0, // Smaller size to prevent overlapping
      color: 0xffc649,
      folder: 'venus'
    },
    earth: { 
      distance: 500, // Third orbit - reference
      angle: Math.PI / 2, // 90 degrees offset
      size: 0.5, // Much smaller size
      color: 0x6b93d6,
      folder: 'earth'
    },
    mars: { 
      distance: 700, // Fourth orbit
      angle: 3 * Math.PI / 4, // 135 degrees offset
      size: 2.0, // Same size as all others
      color: 0xcd5c5c,
      folder: 'mars_the_red_planet_free'
    },
    jupiter: { 
      distance: 1200, // Fifth orbit - gas giant
      angle: Math.PI, // 180 degrees offset
      size: 2.0, // Same size as all others
      color: 0xd8ca9d,
      folder: 'jupiter'
    },
    // TEMPORARILY DISABLED - Missing large .bin files
    // saturn: { 
    //   distance: 1800, // Sixth orbit
    //   angle: 5 * Math.PI / 4, // 225 degrees offset
    //   size: 5.0, 
    //   color: 0xfad5a5,
    //   folder: 'saturn (1)'
    // },
    // uranus: { 
    //   distance: 2500, // Seventh orbit
    //   angle: 3 * Math.PI / 2, // 270 degrees offset
    //   size: 2.5, 
    //   color: 0x4fd0e3,
    //   folder: 'uranus'
    // },
    neptune: { 
      distance: 3200, // Eighth orbit
      angle: 7 * Math.PI / 4, // 315 degrees offset
      size: 2.5, 
      color: 0x4b70dd,
      folder: 'neptune'
    },
    // DUPLICATE ENTRIES REMOVED
    // saturn: { 
    //   distance: 1800, // Sixth orbit
    //   angle: 5 * Math.PI / 4, // 225 degrees offset
    //   size: 0.08, // 10 times smaller than 0.8 (0.8 / 10 = 0.08)
    //   color: 0xfad5a5,
    //   folder: 'saturn (1)'
    // },
    // uranus: { 
    //   distance: 2500, // Seventh orbit
    //   angle: 3 * Math.PI / 2, // 270 degrees offset
    //   size: 0.8, // Much smaller to account for ring system
    //   color: 0x4fd0e3,
    //   folder: 'uranus'
    // },
    // neptune: { 
    //   distance: 3200, // Eighth orbit
    //   angle: 7 * Math.PI / 4, // 315 degrees offset
    //   size: 2.0, // Same size as all others
    //   color: 0x4b70dd,
    //   folder: 'neptune'
    // },
    pluto: { 
      distance: 4000, // Outer orbit - dwarf planet
      angle: 2 * Math.PI / 3, // Different angle
      size: 2.0, // Same size as all others
      color: 0xbc8f8f,
      folder: 'pluto'
    }
  };

  const loader = new THREE.GLTFLoader();
  
  Object.keys(planetData).forEach(planetName => {
    const planet = planetData[planetName];
    
    loader.load(`${planet.folder}/scene.gltf`, 
      (gltf) => {
        const planetModel = gltf.scene;
        
        // Scale the planet according to its relative size
        const baseScale = planet.size * 2; // Base scaling factor
        planetModel.scale.set(baseScale, baseScale, baseScale);
        
        // Position the planet in circular orbit around the sun
        const x = Math.cos(planet.angle) * planet.distance;
        const z = Math.sin(planet.angle) * planet.distance - 200; // Offset to sun's z position
        planetModel.position.set(x, 0, z);
        
        // Enhance planet materials and start invisible
        planetModel.traverse((child) => {
          if (child.isMesh) {
            // Completely remove ALL emissive properties and maps
            child.material.emissive = new THREE.Color(0x000000); // No emissive glow
            child.material.emissiveIntensity = 0; // No emissive intensity
            if (child.material.emissiveMap) {
              child.material.emissiveMap = null; // Remove emissive texture map completely
            }
            
            // Remove all reflections and lighting responses
            child.material.metalness = 0; // No metallic reflection
            child.material.roughness = 1; // Maximum roughness to eliminate shine
            if (child.material.envMap) {
              child.material.envMap = null; // Remove environment map reflections
            }
            
            // Make material unaffected by scene lighting
            if (child.material.type === 'MeshStandardMaterial' || child.material.type === 'MeshPhysicalMaterial') {
              // Convert to basic material to remove lighting effects
              const basicMaterial = new THREE.MeshBasicMaterial({
                map: child.material.map,
                color: child.material.color || new THREE.Color(planet.color),
                transparent: true,
                opacity: 0
              });
              basicMaterial.userData.targetOpacity = 1.0;
              child.material = basicMaterial;
            } else {
              // For other material types, just ensure no lighting response
              child.material.transparent = true;
              child.material.opacity = 0;
              child.material.userData.targetOpacity = 1.0;
            }
          }
        });
        
        scene.add(planetModel);
        planetModels[planetName] = planetModel;
        
        // Add coordinate marker
        createCoordinateMarker(
          planetModel.position, 
          `${planetName.charAt(0).toUpperCase() + planetName.slice(1)}\n(${Math.round(x)}, 0, ${Math.round(z)})`, 
          planet.color
        );
        
        console.log(`${planetName} model loaded successfully!`);
      },
      (progress) => {
        console.log(`${planetName} loading progress:`, (progress.loaded / progress.total * 100) + '%');
      },
      (err) => {
        console.error(`Failed to load ${planetName} model:`, err);
      }
    );
  });
}

function createNavigationUI(){
  // Create navigation buttons
  const navContainer = document.createElement('div');
  navContainer.style.position = 'fixed';
  navContainer.style.top = '20px';
  navContainer.style.left = '20px';
  navContainer.style.zIndex = '1000';
  navContainer.style.display = 'flex';
  navContainer.style.flexDirection = 'column';
  navContainer.style.gap = '10px';
  
  // Center/Explosion button (back to original burst view)
  const centerBtn = createNavButton('🌌 Center/Burst', () => {
    animateCamera(new THREE.Vector3(0, 0, 200), new THREE.Vector3(0, 0, 0));
  });
  
  // Sun button (look at sun's new position)
  const sunBtn = createNavButton('☀️ Sun Close-up', () => {
    animateCamera(new THREE.Vector3(0, 0, 200), new THREE.Vector3(0, 0, -200));
  });
  
  // Black Hole button (comfortable viewing distance)
  const blackHoleBtn = createNavButton('⚫ Black Hole', () => {
    animateCamera(new THREE.Vector3(1100, 400, 900), new THREE.Vector3(1000, 300, 800));
  });
  
  // Overview button - bird's eye view of the solar system
  const overviewBtn = createNavButton('🌍 Overview', () => {
    animateCamera(new THREE.Vector3(1500, 1200, 800), new THREE.Vector3(0, 0, -200));
  });
  
  // Solar System Overview button - wide view of orbital system
  const solarSystemBtn = createNavButton('🪐 Solar System', () => {
    animateCamera(new THREE.Vector3(3000, 2000, 1000), new THREE.Vector3(0, 0, -200));
  });
  
  // Mercury button
  const mercuryBtn = createNavButton('☿ Mercury', () => {
    const mercuryX = Math.cos(0) * 200;
    const mercuryZ = Math.sin(0) * 200 - 200;
    animateCamera(new THREE.Vector3(mercuryX + 50, 50, mercuryZ + 50), new THREE.Vector3(mercuryX, 0, mercuryZ));
  });
  
  // Venus button
  const venusBtn = createNavButton('♀ Venus', () => {
    const venusX = Math.cos(Math.PI / 4) * 350;
    const venusZ = Math.sin(Math.PI / 4) * 350 - 200;
    animateCamera(new THREE.Vector3(venusX + 70, 70, venusZ + 70), new THREE.Vector3(venusX, 0, venusZ));
  });
  
  // Earth button - positioned in orbit
  const earthBtn = createNavButton('🌍 Earth', () => {
    const earthX = Math.cos(Math.PI / 2) * 500;
    const earthZ = Math.sin(Math.PI / 2) * 500 - 200;
    animateCamera(new THREE.Vector3(earthX + 100, 100, earthZ + 100), new THREE.Vector3(earthX, 0, earthZ));
  });
  
  // Mars button - positioned in orbit
  const marsBtn = createNavButton('🔴 Mars', () => {
    const marsX = Math.cos(3 * Math.PI / 4) * 700;
    const marsZ = Math.sin(3 * Math.PI / 4) * 700 - 200;
    animateCamera(new THREE.Vector3(marsX + 150, 100, marsZ + 150), new THREE.Vector3(marsX, 0, marsZ));
  });
  
  // Jupiter button - positioned in orbit
  const jupiterBtn = createNavButton('🪐 Jupiter', () => {
    const jupiterX = Math.cos(Math.PI) * 1200;
    const jupiterZ = Math.sin(Math.PI) * 1200 - 200;
    animateCamera(new THREE.Vector3(jupiterX + 300, 200, jupiterZ + 300), new THREE.Vector3(jupiterX, 0, jupiterZ));
  });
  
  // TEMPORARILY DISABLED - Saturn and Uranus models missing
  // // Saturn button
  // const saturnBtn = createNavButton('🪐 Saturn', () => {
  //   const saturnX = Math.cos(5 * Math.PI / 4) * 1800;
  //   const saturnZ = Math.sin(5 * Math.PI / 4) * 1800 - 200;
  //   animateCamera(new THREE.Vector3(saturnX + 400, 250, saturnZ + 400), new THREE.Vector3(saturnX, 0, saturnZ));
  // });
  
  // // Uranus button
  // const uranusBtn = createNavButton('🌀 Uranus', () => {
  //   const uranusX = Math.cos(3 * Math.PI / 2) * 2500;
  //   const uranusZ = Math.sin(3 * Math.PI / 2) * 2500 - 200;
  //   animateCamera(new THREE.Vector3(uranusX + 300, 200, uranusZ + 300), new THREE.Vector3(uranusX, 0, uranusZ));
  // });
  
  // Neptune button
  const neptuneBtn = createNavButton('🔵 Neptune', () => {
    const neptuneX = Math.cos(7 * Math.PI / 4) * 3200;
    const neptuneZ = Math.sin(7 * Math.PI / 4) * 3200 - 200;
    animateCamera(new THREE.Vector3(neptuneX + 300, 200, neptuneZ + 300), new THREE.Vector3(neptuneX, 0, neptuneZ));
  });
  
  // Pluto button
  const plutoBtn = createNavButton('🟤 Pluto', () => {
    const plutoX = Math.cos(2 * Math.PI / 3) * 4000;
    const plutoZ = Math.sin(2 * Math.PI / 3) * 4000 - 200;
    animateCamera(new THREE.Vector3(plutoX + 200, 150, plutoZ + 200), new THREE.Vector3(plutoX, 0, plutoZ));
  });
  
  navContainer.appendChild(centerBtn);
  navContainer.appendChild(sunBtn);
  navContainer.appendChild(blackHoleBtn);
  navContainer.appendChild(mercuryBtn);
  navContainer.appendChild(venusBtn);
  navContainer.appendChild(earthBtn);
  navContainer.appendChild(marsBtn);
  navContainer.appendChild(jupiterBtn);
  // navContainer.appendChild(saturnBtn); // DISABLED - missing model
  // navContainer.appendChild(uranusBtn); // DISABLED - missing model
  navContainer.appendChild(neptuneBtn);
  navContainer.appendChild(plutoBtn);
  navContainer.appendChild(solarSystemBtn);
  navContainer.appendChild(overviewBtn);
  
  document.body.appendChild(navContainer);
}

function createNavButton(text, onClick){
  const button = document.createElement('button');
  button.textContent = text;
  button.style.padding = '10px 15px';
  button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  button.style.color = 'white';
  button.style.border = '1px solid rgba(255, 255, 255, 0.3)';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '14px';
  button.style.transition = 'all 0.3s ease';
  
  button.onmouseover = () => {
    button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    button.style.transform = 'scale(1.05)';
  };
  
  button.onmouseout = () => {
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    button.style.transform = 'scale(1)';
  };
  
  button.onclick = onClick;
  return button;
}

function animateCamera(targetPosition, targetLookAt, duration = 2000){
  const startPosition = camera.position.clone();
  const startLookAt = controls.target.clone();
  const startTime = performance.now();
  
  function animate(currentTime){
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeInOut = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    // Interpolate camera position
    camera.position.lerpVectors(startPosition, targetPosition, easeInOut);
    
    // Interpolate look-at target
    controls.target.lerpVectors(startLookAt, targetLookAt, easeInOut);
    controls.update();
    
    if(progress < 1){
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

function createCoordinateMarker(position, label, color = 0xffffff){
  // Create a small sphere marker
  const markerGeometry = new THREE.SphereGeometry(5, 16, 16);
  const markerMaterial = new THREE.MeshBasicMaterial({ 
    color: color, 
    transparent: true, 
    opacity: 0.8 
  });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.position.copy(position);
  marker.position.y += 80; // Offset above the model
  scene.add(marker);
  
  // Create text label using CSS3D (simplified approach with DOM overlay)
  const labelDiv = document.createElement('div');
  labelDiv.textContent = label;
  labelDiv.style.position = 'absolute';
  labelDiv.style.color = `#${color.toString(16).padStart(6, '0')}`;
  labelDiv.style.fontSize = '12px';
  labelDiv.style.fontFamily = 'Arial, sans-serif';
  labelDiv.style.background = 'rgba(0, 0, 0, 0.7)';
  labelDiv.style.padding = '4px 8px';
  labelDiv.style.borderRadius = '4px';
  labelDiv.style.border = `1px solid #${color.toString(16).padStart(6, '0')}`;
  labelDiv.style.pointerEvents = 'none';
  labelDiv.style.whiteSpace = 'pre-line';
  labelDiv.style.textAlign = 'center';
  labelDiv.style.zIndex = '999';
  
  document.body.appendChild(labelDiv);
  
  // Store reference for position updates
  if (!window.coordinateLabels) window.coordinateLabels = [];
  window.coordinateLabels.push({
    element: labelDiv,
    position: marker.position,
    marker: marker
  });
}

function updateCoordinateLabels(){
  if (!window.coordinateLabels) return;
  
  window.coordinateLabels.forEach(label => {
    // Project 3D position to 2D screen coordinates
    const vector = label.position.clone();
    vector.project(camera);
    
    // Convert to screen coordinates
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
    
    // Update label position
    label.element.style.left = (x - 50) + 'px'; // Center the label
    label.element.style.top = (y - 10) + 'px';
    
    // Hide label if behind camera or too far (extended distance for distant black hole)
    const distance = camera.position.distanceTo(label.position);
    label.element.style.opacity = (vector.z < 1 && distance < 5000) ? '1' : '0';
    
    // Make marker pulse
    const time = performance.now() * 0.001;
    label.marker.scale.setScalar(1 + Math.sin(time * 2) * 0.2);
  });
}

function onResize(){
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  composer.setSize(innerWidth,innerHeight);
}

function animate(){
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  if(explosionParticles){
    const pos = explosionParticles.geometry.attributes.position.array;
    const vel = explosionParticles.geometry.attributes.velocity.array;
    for(let i=0;i<explosionCount;i++){
      pos[i*3] += vel[i*3]*50*dt;
      pos[i*3+1] += vel[i*3+1]*50*dt;
      pos[i*3+2] += vel[i*3+2]*50*dt;
    }
    explosionParticles.geometry.attributes.position.needsUpdate = true;
  }

  const t = clock.elapsedTime;
  if(t > 5 && !viaGalaxy){ // Reverted back to 5 seconds
    createGalaxy();
    loadModel();
    loadSunModel(); // Load sun model as well
    loadPlanets(); // Load all planets
    modelsFadeStart = t; // Record when models start fading in
    viaGalaxy = true;
  }

  // Handle fade-in effect for models
  if(viaGalaxy && modelsFadeStart > 0){
    const fadeProgress = Math.min((t - modelsFadeStart) / 3, 1); // 3-second fade-in
    const easeInProgress = fadeProgress * fadeProgress; // Ease-in effect
    
    // Fade in galaxy particles
    if(galaxyParticles && galaxyParticles.material.userData.targetOpacity){
      galaxyParticles.material.opacity = easeInProgress * galaxyParticles.material.userData.targetOpacity;
    }
    
    // Fade in black hole
    if(blackHoleModel){
      blackHoleModel.traverse((child) => {
        if (child.isMesh && child.material.userData.targetOpacity) {
          child.material.opacity = easeInProgress * child.material.userData.targetOpacity;
        }
      });
    }
    
    // Fade in sun
    if(sunModel){
      sunModel.traverse((child) => {
        if (child.isMesh && child.material.userData.targetOpacity) {
          child.material.opacity = easeInProgress * child.material.userData.targetOpacity;
        }
      });
    }
    
    // Fade in sun glow
    if(window.sunGlow && window.sunGlow.material.userData.targetOpacity){
      window.sunGlow.material.opacity = easeInProgress * window.sunGlow.material.userData.targetOpacity;
    }
    
    // Fade in sun light
    if(window.sunLight && window.sunLight.userData.targetIntensity){
      window.sunLight.intensity = easeInProgress * window.sunLight.userData.targetIntensity;
    }
    
    // Fade in all planets and add rotation
    Object.values(planetModels).forEach(planet => {
      if(planet){
        planet.traverse((child) => {
          if (child.isMesh) {
            // Check if this is a ring component
            const isRing = child.name.toLowerCase().includes('ring') || 
                          child.material.name.toLowerCase().includes('ring');
            
            if (isRing) {
              // Rings orbit around the planet (slower than planet rotation)
              child.rotation.y += 0.001; // Slow orbital motion for rings
            } else {
              // Planet body rotates on its axis
              child.rotation.y += 0.003; // Planet self-rotation
            }
            
            // Handle opacity fade-in
            if (child.material.userData.targetOpacity) {
              child.material.opacity = easeInProgress * child.material.userData.targetOpacity;
            }
          }
        });
      }
    });
  }

  // Animate the black hole model if it's loaded (now at very distant position)
  if(blackHoleModel){
    blackHoleModel.rotation.y += 0.005;
    blackHoleModel.rotation.x += 0.002;
    
    // Add subtle floating motion for black hole at comfortable viewing distance
    blackHoleModel.position.y = 300 + Math.sin(t * 0.3) * 30;
  }

  // Animate the sun model if it's loaded (now at center)
  if(sunModel){
    sunModel.rotation.y += 0.008; // Slightly faster rotation
    sunModel.rotation.z += 0.003; // Add some wobble
    
    // Add subtle floating motion at center
    sunModel.position.y = 0 + Math.sin(t * 0.5) * 10;
    
    // Animate the sun glow if it exists
    if(window.sunGlow){
      window.sunGlow.position.copy(sunModel.position);
      window.sunGlow.scale.setScalar(1 + Math.sin(t * 2) * 0.1); // Pulsing effect
      
      // Use base opacity from fade-in plus pulsing variation
      const baseOpacity = window.sunGlow.material.userData.targetOpacity || 0.1;
      const currentFadeOpacity = window.sunGlow.material.opacity;
      const maxOpacity = Math.min(currentFadeOpacity, baseOpacity);
      window.sunGlow.material.opacity = maxOpacity + Math.sin(t * 3) * 0.03; // Smaller pulsing variation
    }
  }

  // Update coordinate label positions
  updateCoordinateLabels();

  // Add subtle starfield animation (very slow rotation)
  if(starField){
    starField.rotation.y += 0.0001;
    starField.rotation.x += 0.00005;
    
    // Update twinkling effect
    if(starField.material.uniforms.time){
      starField.material.uniforms.time.value = t;
    }
  }

  controls.update();
  composer.render(dt);
}
