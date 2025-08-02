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
let currentPlanet = null;
let infoPanel = null;
let typewriterInterval = null;

// Planet information data
const planetInfo = {
  mercury: {
    name: "Mercury",
    data: "Distance from Sun: 58 million km\nDiameter: 4,879 km\nDay Length: 58.6 Earth days\nYear Length: 88 Earth days\nTemperature: -173°C to 427°C",
    funFacts: "• Smallest planet in our solar system\n• Has no atmosphere or moons\n• One day on Mercury is longer than its year\n• Surface covered in craters like our Moon\n• Experiences extreme temperature swings",
    earthComparison: "• 38% of Earth's gravity\n• 18 times closer to Sun than Earth\n• No seasons due to almost no axial tilt\n• Could fit inside Earth's Atlantic Ocean\n• Receives 7 times more solar energy than Earth"
  },
  venus: {
    name: "Venus",
    data: "Distance from Sun: 108 million km\nDiameter: 12,104 km\nDay Length: 243 Earth days\nYear Length: 225 Earth days\nTemperature: 462°C (hottest planet)",
    funFacts: "• Hottest planet despite not being closest to Sun\n• Spins backwards (retrograde rotation)\n• Day is longer than its year\n• Thick atmosphere of carbon dioxide\n• Surface pressure 90 times that of Earth",
    earthComparison: "• 95% of Earth's size (Earth's twin)\n• 82% of Earth's mass\n• 91% of Earth's gravity\n• Extreme greenhouse effect vs Earth's moderate one\n• No water due to runaway greenhouse effect"
  },
  earth: {
    name: "Earth",
    data: "Distance from Sun: 150 million km\nDiameter: 12,756 km\nDay Length: 24 hours\nYear Length: 365.25 days\nTemperature: -89°C to 58°C",
    funFacts: "• Only known planet with life\n• 71% of surface covered by water\n• Has one natural satellite (Moon)\n• Magnetic field protects from solar radiation\n• Atmosphere is 78% nitrogen, 21% oxygen",
    earthComparison: "• Our home planet - the reference point\n• Perfect distance from Sun for liquid water\n• Ideal atmospheric composition for life\n• Active plate tectonics shape the surface\n• The Goldilocks planet - not too hot, not too cold"
  },
  mars: {
    name: "Mars",
    data: "Distance from Sun: 228 million km\nDiameter: 6,792 km\nDay Length: 24.6 hours\nYear Length: 687 Earth days\nTemperature: -87°C to -5°C",
    funFacts: "• Known as the Red Planet due to iron oxide\n• Has the largest volcano in solar system (Olympus Mons)\n• Two small moons: Phobos and Deimos\n• Evidence of ancient river valleys and lakes\n• Dust storms can cover entire planet",
    earthComparison: "• 53% of Earth's diameter\n• 38% of Earth's gravity\n• Day length very similar to Earth\n• Thin atmosphere (1% of Earth's pressure)\n• Polar ice caps like Earth but made of frozen CO2"
  },
  jupiter: {
    name: "Jupiter",
    data: "Distance from Sun: 778 million km\nDiameter: 142,984 km\nDay Length: 9.9 hours\nYear Length: 12 Earth years\nTemperature: -108°C (cloud tops)",
    funFacts: "• Largest planet in our solar system\n• Has over 80 known moons\n• Great Red Spot is a storm larger than Earth\n• Made mostly of hydrogen and helium\n• Acts as solar system's vacuum cleaner",
    earthComparison: "• 11 times wider than Earth\n• 318 times more massive than Earth\n• Could fit 1,300 Earths inside\n• Shortest day of any planet vs Earth's 24 hours\n• Protects Earth by deflecting asteroids and comets"
  },
  saturn: {
    name: "Saturn",
    data: "Distance from Sun: 1.4 billion km\nDiameter: 120,536 km\nDay Length: 10.7 hours\nYear Length: 29 Earth years\nTemperature: -139°C",
    funFacts: "• Famous for its spectacular ring system\n• Less dense than water (would float!)\n• Has over 80 known moons\n• Titan (moon) has thick atmosphere and lakes\n• Hexagonal storm at north pole",
    earthComparison: "• 9 times wider than Earth\n• 95 times more massive than Earth\n• 764 Earths could fit inside\n• Much less dense than Earth\n• Rings span distance equal to Earth-Moon distance"
  },
  uranus: {
    name: "Uranus",
    data: "Distance from Sun: 2.9 billion km\nDiameter: 51,118 km\nDay Length: 17.2 hours\nYear Length: 84 Earth years\nTemperature: -197°C",
    funFacts: "• Rotates on its side (98° axial tilt)\n• Has faint rings discovered in 1977\n• Made of water, methane, and ammonia ices\n• Coldest planetary atmosphere in solar system\n• 27 known moons",
    earthComparison: "• 4 times wider than Earth\n• 14.5 times more massive than Earth\n• 63 Earths could fit inside\n• Extreme seasons due to sideways rotation\n• Takes 84 Earth years to orbit the Sun once"
  },
  neptune: {
    name: "Neptune",
    data: "Distance from Sun: 4.5 billion km\nDiameter: 49,528 km\nDay Length: 16.1 hours\nYear Length: 165 Earth years\nTemperature: -201°C",
    funFacts: "• Windiest planet with speeds up to 2,100 km/h\n• Deep blue color from methane in atmosphere\n• Has 14 known moons\n• Triton (largest moon) orbits backwards\n• First planet discovered by mathematical prediction",
    earthComparison: "• 4 times wider than Earth\n• 17 times more massive than Earth\n• 57 Earths could fit inside\n• Strongest winds in solar system vs Earth's hurricanes\n• So far from Sun it hasn't completed one orbit since discovery"
  },
  pluto: {
    name: "Pluto",
    data: "Distance from Sun: 5.9 billion km\nDiameter: 2,376 km\nDay Length: 6.4 Earth days\nYear Length: 248 Earth years\nTemperature: -229°C",
    funFacts: "• Reclassified as dwarf planet in 2006\n• Has five known moons, largest is Charon\n• Surface made of nitrogen and methane ice\n• Sometimes closer to Sun than Neptune\n• Heart-shaped region called Tombaugh Regio",
    earthComparison: "• 18% of Earth's diameter\n• 0.2% of Earth's mass\n• 7% of Earth's gravity\n• Day length similar to Earth's week\n• 40 times farther from Sun than Earth"
  }
};

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
  controls.target.set(0, 0, -200); // Focus on Sun's actual position
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Add top navigation bar
  createTopNavbar();

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
  // Planet data with orbital arrangement but MUCH larger distances for better separation
  // All objects scaled to same size for uniform viewing
  const planetData = {
    mercury: { 
      distance: 1500, // Much larger distance - was 200
      angle: 0, // Starting angle in radians
      size: 2.0, // Same size as all others
      color: 0x8c7853,
      folder: 'mercury'
    },
    venus: { 
      distance: 2500, // Much larger distance - was 350
      angle: Math.PI / 4, // 45 degrees offset
      size: 1.0, // Smaller size to prevent overlapping
      color: 0xffc649,
      folder: 'venus'
    },
    earth: { 
      distance: 3500, // Much larger distance - was 500
      angle: Math.PI / 2, // 90 degrees offset
      size: 0.5, // Much smaller size
      color: 0x6b93d6,
      folder: 'earth'
    },
    mars: { 
      distance: 4500, // Much larger distance - was 700
      angle: 3 * Math.PI / 4, // 135 degrees offset
      size: 2.0, // Same size as all others
      color: 0xcd5c5c,
      folder: 'mars_the_red_planet_free'
    },
    jupiter: { 
      distance: 6000, // Much larger distance - was 1200
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
      distance: 8000, // Much larger distance - was 3200
      angle: 7 * Math.PI / 4, // 315 degrees offset
      size: 2.5, 
      color: 0x4b70dd,
      folder: 'neptune'
    },
    pluto: { 
      distance: 10000, // Much larger distance - was 4000
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
        
        // Position the planet in orbital arrangement with much larger distances
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
            
            // Special handling for Pluto - ensure no brightness or reflections
            if (planetName === 'pluto') {
              // Convert to basic material with muted colors for Pluto
              const basicMaterial = new THREE.MeshBasicMaterial({
                map: child.material.map,
                color: new THREE.Color(0x8B7355), // Muted brown color for Pluto
                transparent: true,
                opacity: 0
              });
              basicMaterial.userData.targetOpacity = 0.9; // Slightly less bright
              child.material = basicMaterial;
            } else {
              // Make material unaffected by scene lighting for other planets
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
    animateCamera(new THREE.Vector3(0, 0, 200), new THREE.Vector3(0, 0, -200)); // Back to original burst position
  });
  
  // Sun button (very close view for full Sun experience)
  const sunBtn = createNavButton('☀️ Sun Close-up', () => {
    if (sunModel) {
      ultraCloseUp(sunModel.position, 20, 3000); // Much closer view of the Sun - reduced from 40 to 20 for closer view
    } else {
      ultraCloseUp(new THREE.Vector3(0, 0, -200), 20, 3000); // Correct sun position - reduced from 40 to 20
    }
  });
  
  // Black Hole button (comfortable viewing distance)
  const blackHoleBtn = createNavButton('⚫ Black Hole', () => {
    if (blackHoleModel) {
      zoomToObject(blackHoleModel.position, 15, 3500); // Black hole zoom
    } else {
      zoomToObject(new THREE.Vector3(1000, 300, 800), 15, 3500); // Default black hole area
    }
  });
  
  // Overview button - bird's eye view of the orbital solar system
  const overviewBtn = createNavButton('🌍 Overview', () => {
    animateCamera(new THREE.Vector3(3000, 2500, 1500), new THREE.Vector3(0, 0, -200));
  });
  
  // Solar System Overview button - wide view of orbital system
  const solarSystemBtn = createNavButton('🪐 Solar System', () => {
    animateCamera(new THREE.Vector3(3000, 2000, 1000), new THREE.Vector3(0, 0, -200));
  });
  
  // Mercury button - orbital arrangement with custom positioning
  const mercuryBtn = createNavButton('☿ Mercury', () => {
    const mercuryX = Math.cos(0) * 1500;
    const mercuryZ = Math.sin(0) * 1500 - 200;
    const mercuryPos = new THREE.Vector3(mercuryX, 0, mercuryZ);
    
    // Custom Mercury zoom - much closer view
    const baseDistance = Math.max(15, 2.0 * 10); // Reduced base distance (20) and scale multiplier (15) for much closer view
    const offset = baseDistance;
    
    const targetPosition = new THREE.Vector3(
      mercuryPos.x + offset * 1.5,  // Side angle
      mercuryPos.y + offset * 1.0,  // Elevation
      mercuryPos.z + offset * 3.0   // Distance
    );
    
    animateCamera(targetPosition, mercuryPos, 2500); // Custom Mercury camera animation
  });
  
  // Venus button - orbital arrangement with custom positioning
  const venusBtn = createNavButton('♀ Venus', () => {
    const venusX = Math.cos(Math.PI / 4) * 2500;
    const venusZ = Math.sin(Math.PI / 4) * 2500 - 200;
    const venusPos = new THREE.Vector3(venusX, 0, venusZ);
    
    // Custom Venus zoom - much closer view for detailed inspection
    const baseDistance = Math.max(6, 1.0 * 4); // Reduced from 15 to 8 base distance and 12 to 6 multiplier for much closer view
    const offset = baseDistance;
    
    const targetPosition = new THREE.Vector3(
      venusPos.x + offset * 0.8,  // Reduced side angle from 1.2 to 0.8
      venusPos.y + offset * 0.5,  // Reduced elevation from 0.8 to 0.5
      venusPos.z + offset * 1.5   // Reduced distance from 2.5 to 1.5
    );
    
    animateCamera(targetPosition, venusPos, 3000); // Custom Venus camera animation - centers Venus in view
  });
  
  // Earth button - orbital arrangement with custom positioning
  const earthBtn = createNavButton('🌍 Earth', () => {
    const earthX = Math.cos(Math.PI / 2) * 3500;
    const earthZ = Math.sin(Math.PI / 2) * 3500 - 200;
    const earthPos = new THREE.Vector3(earthX, 0, earthZ);
    
    // Custom Earth zoom - closer to the model
    const baseDistance = Math.max(80, 0.5 * 60); // Reduced base distance (80) and scale multiplier (60) for closer view
    const offset = baseDistance;
    
    const targetPosition = new THREE.Vector3(
      earthPos.x + offset * 1.5,  // Side angle
      earthPos.y + offset * 1.0,  // Elevation
      earthPos.z + offset * 3.0   // Distance
    );
    
    animateCamera(targetPosition, earthPos, 3000); // Custom Earth camera animation
  });
  
  // Mars button - orbital arrangement with custom positioning
  const marsBtn = createNavButton('🔴 Mars', () => {
    const marsX = Math.cos(3 * Math.PI / 4) * 4500;
    const marsZ = Math.sin(3 * Math.PI / 4) * 4500 - 200;
    const marsPos = new THREE.Vector3(marsX, 0, marsZ);
    
    // Custom Mars zoom - 5x closer than previous setting
    const baseDistance = Math.max(8, 2.0 * 4); // Reduced base distance (16) and scale multiplier (12) for 5x closer view
    const offset = baseDistance;
    
    const targetPosition = new THREE.Vector3(
      marsPos.x + offset * 1.5,  // Side angle
      marsPos.y + offset * 1.0,  // Elevation
      marsPos.z + offset * 3.0   // Distance
    );
    
    animateCamera(targetPosition, marsPos, 3000); // Custom Mars camera animation
  });
  
  // Jupiter button - orbital arrangement with custom distance
  const jupiterBtn = createNavButton('🪐 Jupiter', () => {
    const jupiterX = Math.cos(Math.PI) * 6000;
    const jupiterZ = Math.sin(Math.PI) * 6000 - 200;
    const jupiterPos = new THREE.Vector3(jupiterX, 0, jupiterZ);
    
    // Custom Jupiter zoom with base distance 200 and scale multiplier 100
    const baseDistance = Math.max(200, 2 * 100); // 2 is Jupiter scale, 100 is multiplier
    const offset = baseDistance;
    
    const targetPosition = new THREE.Vector3(
      jupiterPos.x + offset * 1.5,  // Side angle
      jupiterPos.y + offset * 1.0,  // Elevation
      jupiterPos.z + offset * 3.0   // Distance
    );
    
    animateCamera(targetPosition, jupiterPos, 4000); // Custom Jupiter camera animation
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
  
  // Neptune button - orbital arrangement with custom positioning
  const neptuneBtn = createNavButton('🔵 Neptune', () => {
    const neptuneX = Math.cos(7 * Math.PI / 4) * 8000;
    const neptuneZ = Math.sin(7 * Math.PI / 4) * 8000 - 200;
    const neptunePos = new THREE.Vector3(neptuneX, 0, neptuneZ);
    
    // Custom Neptune zoom with increased distance - moved further back
    const baseDistance = Math.max(150, 2.5 * 120); // Increased base distance (150) and scale multiplier (120) for more distance
    const offset = baseDistance;
    
    const targetPosition = new THREE.Vector3(
      neptunePos.x + offset * 1.5,  // Side angle
      neptunePos.y + offset * 1.0,  // Elevation
      neptunePos.z + offset * 3.0   // Distance
    );
    
    animateCamera(targetPosition, neptunePos, 3500); // Custom Neptune camera animation
  });
  
  // Pluto button - orbital arrangement with custom positioning
  const plutoBtn = createNavButton('🟤 Pluto', () => {
    const plutoX = Math.cos(2 * Math.PI / 3) * 10000;
    const plutoZ = Math.sin(2 * Math.PI / 3) * 10000 - 200;
    const plutoPos = new THREE.Vector3(plutoX, 0, plutoZ);
    
    // Custom Pluto zoom with same distance as Jupiter (1x)
    const baseDistance = Math.max(200, 2 * 150); // Same as Jupiter: base distance (200) and scale multiplier (100)
    const offset = baseDistance;
    
    const targetPosition = new THREE.Vector3(
      plutoPos.x + offset * 1.5,  // Side angle
      plutoPos.y + offset * 1.0,  // Elevation
      plutoPos.z + offset * 3.0   // Distance
    );
    
    animateCamera(targetPosition, plutoPos, 3000); // Custom Pluto camera animation
  });

  // Full Cinematic Tour button
  const tourBtn = createNavButton('🎬 Cinematic Tour', () => {
    startCinematicTour();
  });
  
  navContainer.appendChild(centerBtn);
  navContainer.appendChild(sunBtn);
  navContainer.appendChild(blackHoleBtn);
  navContainer.appendChild(tourBtn);
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

// Enhanced zoom function for full-screen object viewing
function zoomToObject(objectPosition, objectScale = 1, duration = 3000) {
  // Calculate optimal camera distance based on object scale to prevent going inside
  const baseDistance = Math.max(200, objectScale * 100); // Updated base distance to 200 and scale multiplier to 100
  const cameraDistance = baseDistance;
  
  // Create camera position that maintains good viewing angle with much more distance
  const offset = cameraDistance;
  
  // Position camera at optimal distance for full object view without being overwhelming
  const targetPosition = new THREE.Vector3(
    objectPosition.x + offset * 1.5,  // Increased from 1.0 to 1.5 for more side angle
    objectPosition.y + offset * 1.0,  // Increased from 0.8 to 1.0 for more elevation
    objectPosition.z + offset * 3.0   // Increased from 2.0 to 3.0 for much more distance
  );
  
  const targetLookAt = objectPosition.clone();
  
  // Animate camera with longer duration for cinematic effect
  animateCamera(targetPosition, targetLookAt, duration);
}

// Ultra close-up function for detailed object inspection
function ultraCloseUp(objectPosition, objectScale = 1, duration = 2500) {
  // Get very close to the object for detailed viewing
  const closeDistance = Math.max(15, objectScale * 8);
  
  const targetPosition = new THREE.Vector3(
    objectPosition.x + closeDistance,
    objectPosition.y + closeDistance * 0.3,
    objectPosition.z + closeDistance * 0.8
  );
  
  const targetLookAt = objectPosition.clone();
  
  animateCamera(targetPosition, targetLookAt, duration);
}

// Cinematic tour function - follows solar system order from Sun outward with exact individual button positioning
function startCinematicTour() {
  const tourSequence = [
    { 
      name: 'Sun', 
      buttonType: 'sun' // Use exact Sun button logic
    },
    { 
      name: 'Mercury', 
      buttonType: 'mercury' // Use exact Mercury button logic
    },
    { 
      name: 'Venus', 
      buttonType: 'venus' // Use exact Venus button logic
    },
    { 
      name: 'Earth', 
      buttonType: 'earth' // Use exact Earth button logic
    },
    { 
      name: 'Mars', 
      buttonType: 'mars' // Use exact Mars button logic
    },
    { 
      name: 'Jupiter', 
      buttonType: 'jupiter' // Use exact Jupiter button logic
    },
    { 
      name: 'Neptune', 
      buttonType: 'neptune' // Use exact Neptune button logic
    },
    { 
      name: 'Pluto', 
      buttonType: 'pluto' // Use exact Pluto button logic
    }
  ];
  
  let currentIndex = 0;
  
  function nextTourStop() {
    if (currentIndex < tourSequence.length) {
      const stop = tourSequence[currentIndex];
      console.log(`🎬 Tour: Visiting ${stop.name} (${currentIndex + 1}/${tourSequence.length})`);
      
      // Execute the exact same logic as individual planet buttons
      switch(stop.buttonType) {
        case 'sun':
          if (sunModel) {
            ultraCloseUp(sunModel.position, 20, 3000);
          } else {
            ultraCloseUp(new THREE.Vector3(0, 0, -200), 20, 3000);
          }
          break;
          
        case 'mercury':
          const mercuryX = Math.cos(0) * 1500;
          const mercuryZ = Math.sin(0) * 1500 - 200;
          const mercuryPos = new THREE.Vector3(mercuryX, 0, mercuryZ);
          
          const mercuryBaseDistance = Math.max(15, 2.0 * 10);
          const mercuryOffset = mercuryBaseDistance;
          
          const mercuryTargetPosition = new THREE.Vector3(
            mercuryPos.x + mercuryOffset * 1.5,
            mercuryPos.y + mercuryOffset * 1.0,
            mercuryPos.z + mercuryOffset * 3.0
          );
          
          animateCamera(mercuryTargetPosition, mercuryPos, 2500);
          break;
          
        case 'venus':
          const venusX = Math.cos(Math.PI / 4) * 2500;
          const venusZ = Math.sin(Math.PI / 4) * 2500 - 200;
          const venusPos = new THREE.Vector3(venusX, 0, venusZ);
          
          const venusBaseDistance = Math.max(6, 1.0 * 4);
          const venusOffset = venusBaseDistance;
          
          const venusTargetPosition = new THREE.Vector3(
            venusPos.x + venusOffset * 0.8,
            venusPos.y + venusOffset * 0.5,
            venusPos.z + venusOffset * 1.5
          );
          
          animateCamera(venusTargetPosition, venusPos, 3000);
          break;
          
        case 'earth':
          const earthX = Math.cos(Math.PI / 2) * 3500;
          const earthZ = Math.sin(Math.PI / 2) * 3500 - 200;
          const earthPos = new THREE.Vector3(earthX, 0, earthZ);
          
          const earthBaseDistance = Math.max(80, 0.5 * 60);
          const earthOffset = earthBaseDistance;
          
          const earthTargetPosition = new THREE.Vector3(
            earthPos.x + earthOffset * 1.5,
            earthPos.y + earthOffset * 1.0,
            earthPos.z + earthOffset * 3.0
          );
          
          animateCamera(earthTargetPosition, earthPos, 3000);
          break;
          
        case 'mars':
          const marsX = Math.cos(3 * Math.PI / 4) * 4500;
          const marsZ = Math.sin(3 * Math.PI / 4) * 4500 - 200;
          const marsPos = new THREE.Vector3(marsX, 0, marsZ);
          
          const marsBaseDistance = Math.max(8, 2.0 * 4);
          const marsOffset = marsBaseDistance;
          
          const marsTargetPosition = new THREE.Vector3(
            marsPos.x + marsOffset * 1.5,
            marsPos.y + marsOffset * 1.0,
            marsPos.z + marsOffset * 3.0
          );
          
          animateCamera(marsTargetPosition, marsPos, 3000);
          break;
          
        case 'jupiter':
          const jupiterX = Math.cos(Math.PI) * 6000;
          const jupiterZ = Math.sin(Math.PI) * 6000 - 200;
          const jupiterPos = new THREE.Vector3(jupiterX, 0, jupiterZ);
          
          const jupiterBaseDistance = Math.max(200, 2 * 100);
          const jupiterOffset = jupiterBaseDistance;
          
          const jupiterTargetPosition = new THREE.Vector3(
            jupiterPos.x + jupiterOffset * 1.5,
            jupiterPos.y + jupiterOffset * 1.0,
            jupiterPos.z + jupiterOffset * 3.0
          );
          
          animateCamera(jupiterTargetPosition, jupiterPos, 4000);
          break;
          
        case 'neptune':
          const neptuneX = Math.cos(7 * Math.PI / 4) * 8000;
          const neptuneZ = Math.sin(7 * Math.PI / 4) * 8000 - 200;
          const neptunePos = new THREE.Vector3(neptuneX, 0, neptuneZ);
          
          const neptuneBaseDistance = Math.max(150, 2.5 * 120);
          const neptuneOffset = neptuneBaseDistance;
          
          const neptuneTargetPosition = new THREE.Vector3(
            neptunePos.x + neptuneOffset * 1.5,
            neptunePos.y + neptuneOffset * 1.0,
            neptunePos.z + neptuneOffset * 3.0
          );
          
          animateCamera(neptuneTargetPosition, neptunePos, 3500);
          break;
          
        case 'pluto':
          const plutoX = Math.cos(2 * Math.PI / 3) * 10000;
          const plutoZ = Math.sin(2 * Math.PI / 3) * 10000 - 200;
          const plutoPos = new THREE.Vector3(plutoX, 0, plutoZ);
          
          const plutoBaseDistance = Math.max(200, 2 * 150);
          const plutoOffset = plutoBaseDistance;
          
          const plutoTargetPosition = new THREE.Vector3(
            plutoPos.x + plutoOffset * 1.5,
            plutoPos.y + plutoOffset * 1.0,
            plutoPos.z + plutoOffset * 3.0
          );
          
          animateCamera(plutoTargetPosition, plutoPos, 3000);
          break;
      }
      
      currentIndex++;
      
      // Schedule next stop with longer pause for better cinematic effect
      setTimeout(nextTourStop, 4000 + 1500); // Use consistent 4000ms duration + 1.5 second pause
    } else {
      // Tour complete - return to solar system overview
      console.log('🎬 Cinematic Tour complete! Returning to Solar System overview...');
      setTimeout(() => {
        animateCamera(new THREE.Vector3(3000, 2000, 1000), new THREE.Vector3(0, 0, -200), 4000);
      }, 2000);
    }
  }
  
  // Start the tour
  console.log('🎬 Starting Cinematic Solar System Tour!');
  console.log('📍 Tour route: Sun → Mercury → Venus → Earth → Mars → Jupiter → Neptune → Pluto');
  console.log('🎯 Using exact individual button camera positioning for each object');
  nextTourStop();
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
  
  // Show SPACEWALK text after 5 seconds of burst (only once)
  if(t > 5 && !window.spaceWalkTextShown){ 
    createSpaceWalkTextAnimation();
    window.spaceWalkTextShown = true; // Prevent showing multiple times
  }

  // After models are loaded and faded in, automatically move camera closer to Sun
  if(viaGalaxy && modelsFadeStart > 0 && t > modelsFadeStart + 4 && !window.movedToSun){
    // Move camera closer to Sun after burst and fade-in complete - much slower transition
    animateCamera(new THREE.Vector3(0, 0, -100), new THREE.Vector3(0, 0, -200), 8000); // Increased from 2000 to 8000 for much slower movement
    window.movedToSun = true; // Prevent repeating the movement
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
    
    // Fade in all planets and add rotation (except Venus only)
    Object.keys(planetModels).forEach(planetName => {
      const planet = planetModels[planetName];
      if(planet){
        // Rotate all planets except Venus
        if(planetName !== 'venus') {
          planet.rotation.y += 0.003; // Planet self-rotation around its own axis
        }
        
        planet.traverse((child) => {
          if (child.isMesh) {
            // Handle opacity fade-in only (rotation handled at planet level)
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

// Function to create coordinate markers for planet labels
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
  labelDiv.style.fontSize = '24px'; // Larger font size
  labelDiv.style.fontFamily = 'Astronoma, Arial, sans-serif'; // Use Astronoma font
  labelDiv.style.background = 'rgba(0, 0, 0, 0.7)';
  labelDiv.style.padding = '8px 16px';
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

// Function to permanently hide all coordinate markers (planet names)
function hideCoordinateMarkers() {
  if (window.coordinateLabels) {
    window.coordinateLabels.forEach(label => {
      if (label.element && label.element.parentNode) {
        // Permanently remove the element from DOM
        label.element.parentNode.removeChild(label.element);
      }
      if (label.marker) {
        // Permanently hide the marker
        label.marker.visible = false;
      }
    });
    // Clear the array to prevent re-showing
    window.coordinateLabels = [];
  }
}

// Function to show all coordinate markers (planet names)
function showCoordinateMarkers() {
  if (window.coordinateLabels) {
    window.coordinateLabels.forEach(label => {
      if (label.element && label.element.parentNode) {
        label.element.style.display = 'block';
      }
      if (label.marker) {
        label.marker.visible = true;
      }
    });
  }
}

// Create animated SPACEWALK text that flies in from random sides  
function createSpaceWalkTextAnimation() {
  // Preload the font
  const font = new FontFace('Astronoma', 'url(astronoma.ttf)');
  font.load().then(() => {
    document.fonts.add(font);
    
    const letters = ['S', 'P', 'A', 'C', 'E', 'W', 'A', 'L', 'K']; // Removed space - now SPACEWALK as one word
    const letterElements = [];
    
    letters.forEach((letter, index) => {
      const letterDiv = document.createElement('div');
      letterDiv.textContent = letter;
      letterDiv.style.position = 'fixed';
      letterDiv.style.fontSize = '120px';
      letterDiv.style.fontWeight = 'bold';
      letterDiv.style.color = 'white';
      letterDiv.style.fontFamily = 'Astronoma, Arial, sans-serif';
      letterDiv.style.zIndex = '10000';
      letterDiv.style.pointerEvents = 'none';
      letterDiv.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)';
      letterDiv.style.transition = 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      
      // Random starting position outside the viewport
      const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let startPos = { x: 0, y: 0 };
      
      switch(side) {
        case 0: // top
          startPos.x = Math.random() * window.innerWidth;
          startPos.y = -200;
          break;
        case 1: // right
          startPos.x = window.innerWidth + 200;
          startPos.y = Math.random() * window.innerHeight;
          break;
        case 2: // bottom
          startPos.x = Math.random() * window.innerWidth;
          startPos.y = window.innerHeight + 200;
          break;
        case 3: // left
          startPos.x = -200;
          startPos.y = Math.random() * window.innerHeight;
          break;
      }
      
      letterDiv.style.left = startPos.x + 'px';
      letterDiv.style.top = startPos.y + 'px';
      
      document.body.appendChild(letterDiv);
      letterElements.push(letterDiv);
      
      // Animate to final position after short delay
      setTimeout(() => {
        // Calculate final position for SPACEWALK as one centered word
        const totalWidth = letters.length * 100; // Approximate width per letter
        const startX = (window.innerWidth - totalWidth) / 2;
        const finalX = startX + (index * 100);
        const finalY = window.innerHeight / 2 - 60;
        
        letterDiv.style.left = finalX + 'px';
        letterDiv.style.top = finalY + 'px';
      }, index * 200 + 500); // Staggered animation with 500ms initial delay
    });
    
    // Add dive-in button after letters settle
    setTimeout(() => {
      const resumeButton = document.createElement('button');
      resumeButton.innerHTML = 'dive in for spacewalk'; // Landing intro text - no space between space and walk
      resumeButton.style.position = 'fixed';
      resumeButton.style.left = '50%';
      resumeButton.style.top = '65%';
      resumeButton.style.transform = 'translateX(-50%)';
      resumeButton.style.padding = '20px 40px';
      resumeButton.style.fontSize = '24px';
      resumeButton.style.fontFamily = 'Astronoma, Arial, sans-serif';
      resumeButton.style.background = 'transparent';
      resumeButton.style.color = 'white';
      resumeButton.style.border = '2px solid white';
      resumeButton.style.borderRadius = '50px';
      resumeButton.style.cursor = 'pointer';
      resumeButton.style.zIndex = '10001';
      resumeButton.style.backdropFilter = 'blur(10px)';
      resumeButton.style.transition = 'all 0.3s ease';
      resumeButton.style.fontWeight = 'bold';
      resumeButton.style.letterSpacing = '2px';
      resumeButton.style.textTransform = 'lowercase';
      
      // Hover effects
      resumeButton.onmouseover = () => {
        resumeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        resumeButton.style.color = 'white';
        resumeButton.style.transform = 'translateX(-50%) scale(1.05)';
      };
      
      resumeButton.onmouseout = () => {
        resumeButton.style.backgroundColor = 'transparent';
        resumeButton.style.color = 'white';
        resumeButton.style.transform = 'translateX(-50%) scale(1)';
      };
      
      // Click handler - continue to sun only
      resumeButton.onclick = () => {
        // Fade out text and button first
        letterElements.forEach((letter) => {
          letter.style.transition = 'all 0.8s ease-out';
          letter.style.opacity = '0';
          letter.style.transform = 'scale(0.5)';
        });
        
        resumeButton.style.transition = 'all 0.8s ease-out';
        resumeButton.style.opacity = '0';
        
        // Trigger galaxy and sun sequence - prevent interference
        setTimeout(() => {
          // Clean up elements
          letterElements.forEach((letter) => {
            if (letter.parentNode) {
              letter.parentNode.removeChild(letter);
            }
          });
          
          if (resumeButton.parentNode) {
            resumeButton.parentNode.removeChild(resumeButton);
          }
          
          // Force trigger galaxy and sun only when dive in is clicked
          if (!viaGalaxy && !window.cinematicTourActive) {
            createGalaxy();
            loadModel();
            loadSunModel();
            loadPlanets();
            modelsFadeStart = clock.elapsedTime;
            viaGalaxy = true;
            window.resumeClicked = true;
          }
          
          // Show navbar after galaxy effects start (1 second delay)
          setTimeout(() => {
            switchToHamburgerMode();
          }, 1000);
        }, 800);
      };
      
      document.body.appendChild(resumeButton);
      window.resumeButton = resumeButton;
    }, 2500); // Show button after letters are formed
    
    // Store references for cleanup
    window.spaceWalkLetters = letterElements;
  }).catch(() => {
    console.log('Font loading failed, using fallback');
    // Fallback animation without custom font
  });
}

// Function to create and show planet information panel
function showPlanetInfo(planetName) {
  // Remove existing panel if any
  hidePlanetInfo();
  
  const info = planetInfo[planetName.toLowerCase()];
  if (!info) return;
  
  currentPlanet = planetName.toLowerCase();
  
  // Create info panel with navbar-style design but larger for content
  infoPanel = document.createElement('div');
  infoPanel.style.position = 'fixed';
  infoPanel.style.top = '50%';
  infoPanel.style.right = '30px'; // Right side positioning
  infoPanel.style.transform = 'translateY(-50%)'; // Center vertically
  infoPanel.style.width = '350px'; // Larger width for content
  infoPanel.style.maxHeight = '80vh'; // Max height for scrolling
  infoPanel.style.overflowY = 'auto'; // Enable scrolling if needed
  infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Match navbar transparency
  infoPanel.style.border = '1px solid rgba(255, 255, 255, 0.5)'; // Match navbar border
  infoPanel.style.borderRadius = '25px'; // Match navbar circular corners
  infoPanel.style.padding = '25px';
  infoPanel.style.fontFamily = 'Astronoma, Arial, sans-serif'; // Match navbar font
  infoPanel.style.color = 'white';
  infoPanel.style.fontSize = '14px';
  infoPanel.style.lineHeight = '1.6';
  infoPanel.style.zIndex = '10000';
  infoPanel.style.backdropFilter = 'blur(10px)'; // Match navbar blur
  infoPanel.style.opacity = '0'; // Start invisible for animation
  infoPanel.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'; // Match navbar animation
  
  // Planet title
  const title = document.createElement('h2');
  title.textContent = info.name;
  title.style.color = 'white';
  title.style.textAlign = 'center';
  title.style.margin = '0 0 20px 0';
  title.style.fontSize = '28px';
  title.style.fontWeight = 'bold';
  title.style.fontFamily = 'Astronoma, Arial, sans-serif';
  title.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
  infoPanel.appendChild(title);
  
  // Data Section
  const dataSection = document.createElement('div');
  dataSection.style.marginBottom = '20px';
  
  const dataTitle = document.createElement('h3');
  dataTitle.textContent = 'Planet Data';
  dataTitle.style.color = '#4FC3F7';
  dataTitle.style.fontSize = '18px';
  dataTitle.style.fontWeight = 'bold';
  dataTitle.style.margin = '0 0 10px 0';
  dataTitle.style.fontFamily = 'Astronoma, Arial, sans-serif';
  dataSection.appendChild(dataTitle);
  
  const dataText = document.createElement('div');
  dataText.style.whiteSpace = 'pre-line';
  dataText.style.color = 'white';
  dataText.style.fontSize = '14px';
  dataText.style.lineHeight = '1.6';
  dataText.textContent = info.data;
  dataSection.appendChild(dataText);
  infoPanel.appendChild(dataSection);
  
  // Fun Facts Section
  const factsSection = document.createElement('div');
  factsSection.style.marginBottom = '20px';
  
  const factsTitle = document.createElement('h3');
  factsTitle.textContent = 'Fun Facts';
  factsTitle.style.color = '#81C784';
  factsTitle.style.fontSize = '18px';
  factsTitle.style.fontWeight = 'bold';
  factsTitle.style.margin = '0 0 10px 0';
  factsTitle.style.fontFamily = 'Astronoma, Arial, sans-serif';
  factsSection.appendChild(factsTitle);
  
  const factsText = document.createElement('div');
  factsText.style.whiteSpace = 'pre-line';
  factsText.style.color = 'white';
  factsText.style.fontSize = '14px';
  factsText.style.lineHeight = '1.6';
  factsText.textContent = info.funFacts;
  factsSection.appendChild(factsText);
  infoPanel.appendChild(factsSection);
  
  // Earth Comparison Section
  const comparisonSection = document.createElement('div');
  comparisonSection.style.marginBottom = '20px';
  
  const comparisonTitle = document.createElement('h3');
  comparisonTitle.textContent = 'Compared to Earth';
  comparisonTitle.style.color = '#FFB74D';
  comparisonTitle.style.fontSize = '18px';
  comparisonTitle.style.fontWeight = 'bold';
  comparisonTitle.style.margin = '0 0 10px 0';
  comparisonTitle.style.fontFamily = 'Astronoma, Arial, sans-serif';
  comparisonSection.appendChild(comparisonTitle);
  
  const comparisonText = document.createElement('div');
  comparisonText.style.whiteSpace = 'pre-line';
  comparisonText.style.color = 'white';
  comparisonText.style.fontSize = '14px';
  comparisonText.style.lineHeight = '1.6';
  comparisonText.textContent = info.earthComparison;
  comparisonSection.appendChild(comparisonText);
  infoPanel.appendChild(comparisonSection);
  
  // Close button with navbar-style design
  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '15px';
  closeButton.style.right = '15px';
  closeButton.style.background = 'transparent';
  closeButton.style.border = '1px solid rgba(255, 255, 255, 0.3)'; // Match navbar border style
  closeButton.style.borderRadius = '15px'; // Match navbar button radius
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '14px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.fontFamily = 'Astronoma, Arial, sans-serif'; // Match navbar font
  closeButton.style.width = '30px';
  closeButton.style.height = '30px';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; // Match navbar transition
  closeButton.onmouseover = () => {
    closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'; // Match navbar hover
    closeButton.style.borderColor = 'rgba(255, 255, 255, 0.7)';
    closeButton.style.transform = 'scale(1.05)'; // Match navbar hover scale
  };
  closeButton.onmouseout = () => {
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    closeButton.style.transform = 'scale(1)';
  };
  closeButton.onclick = hidePlanetInfo;
  infoPanel.appendChild(closeButton);
  
  document.body.appendChild(infoPanel);
  
  // Animate panel appearance with navbar-style animation
  setTimeout(() => {
    infoPanel.style.opacity = '1';
  }, 100);
}

// Function to hide planet info panel
function hidePlanetInfo() {
  if (infoPanel) {
    document.body.removeChild(infoPanel);
    infoPanel = null;
  }
  if (typewriterInterval) {
    clearInterval(typewriterInterval);
    typewriterInterval = null;
  }
  currentPlanet = null;
}

// Function to create top navigation bar
function createTopNavbar() {
  const navbar = document.createElement('nav');
  navbar.id = 'topNavbar';
  navbar.style.position = 'fixed';
  navbar.style.top = '20px';
  navbar.style.right = '20px';
  navbar.style.zIndex = '10001';
  navbar.style.display = 'none'; // Start hidden
  navbar.style.gap = '15px';
  navbar.style.padding = '10px 20px';
  navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Transparent background
  navbar.style.border = '1px solid rgba(255, 255, 255, 0.5)'; // Thin white border
  navbar.style.borderRadius = '25px';
  navbar.style.backdropFilter = 'blur(10px)';
  navbar.style.opacity = '0'; // Start invisible for animation
  navbar.style.transform = 'translateY(-20px) scale(0.9)'; // Start above and smaller
  navbar.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'; // Smooth spring animation
  
  // Hamburger toggle button
  const hamburger = document.createElement('button');
  hamburger.innerHTML = '☰';
  hamburger.style.padding = '8px 12px';
  hamburger.style.backgroundColor = 'transparent';
  hamburger.style.color = 'white';
  hamburger.style.border = '1px solid rgba(255, 255, 255, 0.3)';
  hamburger.style.borderRadius = '15px';
  hamburger.style.cursor = 'pointer';
  hamburger.style.fontSize = '16px';
  hamburger.style.fontFamily = 'Astronoma, Arial, sans-serif';
  hamburger.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; // Smooth animation
  hamburger.style.display = 'none'; // Start hidden
  hamburger.style.opacity = '0'; // Start invisible
  hamburger.style.transform = 'scale(0.8)'; // Start smaller
  
  // Menu container (initially visible)
  const menuContainer = document.createElement('div');
  menuContainer.style.display = 'flex';
  menuContainer.style.gap = '10px';
  menuContainer.style.alignItems = 'center';
  menuContainer.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'; // Smooth animation
  
  const menuItems = [
    { text: 'Tour', action: () => startCinematicTour() },
    { text: 'Planets', action: () => togglePlanetsList() },
    { text: 'About', action: () => toggleAboutSection() }
  ];
  
  menuItems.forEach(item => {
    const menuBtn = document.createElement('button');
    menuBtn.textContent = item.text;
    menuBtn.style.padding = '8px 16px';
    menuBtn.style.backgroundColor = 'transparent';
    menuBtn.style.color = 'white';
    menuBtn.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    menuBtn.style.borderRadius = '15px';
    menuBtn.style.cursor = 'pointer';
    menuBtn.style.fontSize = '14px';
    menuBtn.style.fontFamily = 'Astronoma, Arial, sans-serif';
    menuBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; // Smooth animation
    menuBtn.style.fontWeight = '500';
    
    // Hover effects
    menuBtn.onmouseover = () => {
      menuBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
      menuBtn.style.borderColor = 'rgba(255, 255, 255, 0.7)';
      menuBtn.style.transform = 'scale(1.05)';
    };
    
    menuBtn.onmouseout = () => {
      menuBtn.style.backgroundColor = 'transparent';
      menuBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      menuBtn.style.transform = 'scale(1)';
    };
    
    menuBtn.onclick = () => {
      // Add click animation
      menuBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        item.action();
        menuBtn.style.transform = 'scale(1)';
      }, 150);
    };
    
    menuContainer.appendChild(menuBtn);
  });
  
  // Hamburger hover effects
  hamburger.onmouseover = () => {
    hamburger.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    hamburger.style.borderColor = 'rgba(255, 255, 255, 0.7)';
    hamburger.style.transform = 'scale(1.05)';
  };
  
  hamburger.onmouseout = () => {
    hamburger.style.backgroundColor = 'transparent';
    hamburger.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    hamburger.style.transform = 'scale(1)';
  };
  
  // Hamburger click handler
  hamburger.onclick = () => toggleLeftNavigation();
  
  navbar.appendChild(hamburger);
  navbar.appendChild(menuContainer);
  document.body.appendChild(navbar);
  
  // Store references globally
  window.hamburgerButton = hamburger;
  window.menuContainer = menuContainer;
}

// Function to switch to hamburger mode
function switchToHamburgerMode() {
  const navbar = document.getElementById('topNavbar');
  if (navbar) {
    // Show navbar with smooth animation
    navbar.style.display = 'flex';
    navbar.style.flexDirection = 'column';
    
    // Animate navbar appearance
    setTimeout(() => {
      navbar.style.opacity = '1';
      navbar.style.transform = 'translateY(0) scale(1)';
    }, 100);
    
    // Keep navbar visible but animate menu hide
    if (window.menuContainer) {
      window.menuContainer.style.opacity = '0';
      window.menuContainer.style.transform = 'translateX(20px)';
      setTimeout(() => {
        window.menuContainer.style.display = 'none';
      }, 500);
    }
    
    if (window.hamburgerButton) {
      window.hamburgerButton.style.display = 'block';
      // Animate hamburger button appearance
      setTimeout(() => {
        window.hamburgerButton.style.opacity = '1';
        window.hamburgerButton.style.transform = 'scale(1)';
      }, 200);
    }
  }
}

// Function to hide SPACEWALK text and dive-in button
function hideSpaceWalkText() {
  console.log('hideSpaceWalkText called'); // Debug log
  
  // Hide SPACEWALK letters
  if (window.spaceWalkLetters) {
    console.log('Hiding SPACEWALK letters:', window.spaceWalkLetters.length); // Debug log
    window.spaceWalkLetters.forEach(letter => {
      if (letter && letter.parentNode) {
        letter.style.display = 'none';
        letter.style.visibility = 'hidden';
        letter.style.opacity = '0';
      }
    });
  }
  
  // Hide dive-in button
  if (window.resumeButton) {
    console.log('Hiding resume button'); // Debug log
    if (window.resumeButton.parentNode) {
      window.resumeButton.style.display = 'none';
      window.resumeButton.style.visibility = 'hidden';
      window.resumeButton.style.opacity = '0';
    }
  }
  
  // More aggressive approach - find all elements that could be SPACEWALK text
  const allDivs = document.querySelectorAll('div');
  allDivs.forEach(div => {
    const text = div.textContent;
    // Check if this div contains any SPACEWALK letter
    if (text && text.length === 1 && ['S', 'P', 'A', 'C', 'E', 'W', 'L', 'K'].includes(text)) {
      div.style.display = 'none';
      div.style.visibility = 'hidden';
      div.style.opacity = '0';
      console.log('Hidden letter:', text);
    }
  });
  
  // Hide any buttons containing "dive in" or "spacewalk"
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(button => {
    const text = button.textContent.toLowerCase();
    if (text.includes('dive in') || text.includes('spacewalk')) {
      button.style.display = 'none';
      button.style.visibility = 'hidden';
      button.style.opacity = '0';
      console.log('Hidden button:', button.textContent);
    }
  });
}

// Planets list functionality
let planetsListPanel = null;

function togglePlanetsList() {
  if (planetsListPanel && document.body.contains(planetsListPanel)) {
    hidePlanetsList();
  } else {
    showPlanetsList();
  }
}

function showPlanetsList() {
  // Remove existing panel if any
  hidePlanetsList();
  
  // Create planets list panel
  planetsListPanel = document.createElement('div');
  planetsListPanel.style.position = 'fixed';
  planetsListPanel.style.left = '20px';
  planetsListPanel.style.top = '80px'; // Below navbar
  planetsListPanel.style.width = '250px';
  planetsListPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Match navbar
  planetsListPanel.style.border = '1px solid rgba(255, 255, 255, 0.5)';
  planetsListPanel.style.borderRadius = '25px'; // Match navbar
  planetsListPanel.style.padding = '20px';
  planetsListPanel.style.backdropFilter = 'blur(10px)';
  planetsListPanel.style.zIndex = '9999';
  planetsListPanel.style.fontFamily = 'Astronoma, Arial, sans-serif';
  planetsListPanel.style.opacity = '0'; // Start invisible for animation
  planetsListPanel.style.transform = 'translateX(-20px) scale(0.9)'; // Start from left and smaller
  planetsListPanel.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'; // Smooth animation
  
  // Title
  const title = document.createElement('h3');
  title.textContent = 'Select Planet';
  title.style.color = 'white';
  title.style.textAlign = 'center';
  title.style.margin = '0 0 20px 0';
  title.style.fontSize = '20px';
  title.style.fontWeight = 'bold';
  title.style.fontFamily = 'Astronoma, Arial, sans-serif';
  planetsListPanel.appendChild(title);
  
  // Planet buttons
  const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  planets.forEach((planet, index) => {
    const planetBtn = document.createElement('button');
    planetBtn.textContent = planet;
    planetBtn.style.width = '100%';
    planetBtn.style.padding = '12px 16px';
    planetBtn.style.margin = '5px 0';
    planetBtn.style.backgroundColor = 'transparent';
    planetBtn.style.color = 'white';
    planetBtn.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    planetBtn.style.borderRadius = '12px'; // Match navbar style
    planetBtn.style.cursor = 'pointer';
    planetBtn.style.fontSize = '16px'; // Larger font
    planetBtn.style.fontFamily = 'Astronoma, Arial, sans-serif';
    planetBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; // Smooth animation
    planetBtn.style.textAlign = 'center';
    planetBtn.style.fontWeight = '500';
    planetBtn.style.opacity = '0'; // Start invisible
    planetBtn.style.transform = 'translateX(20px)'; // Start from right
    
    // Staggered animation for each button
    setTimeout(() => {
      planetBtn.style.opacity = '1';
      planetBtn.style.transform = 'translateX(0)';
    }, (index + 1) * 100); // 100ms delay between each button
    
    planetBtn.onmouseover = () => {
      planetBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
      planetBtn.style.borderColor = 'rgba(255, 255, 255, 0.7)';
      planetBtn.style.transform = 'scale(1.03) translateY(-2px)';
      planetBtn.style.boxShadow = '0 4px 16px rgba(255, 255, 255, 0.2)';
    };
    
    planetBtn.onmouseout = () => {
      planetBtn.style.backgroundColor = 'transparent';
      planetBtn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      planetBtn.style.transform = 'scale(1) translateY(0)';
      planetBtn.style.boxShadow = 'none';
    };
    
    planetBtn.onclick = () => {
      console.log('Planet clicked:', planet); // Debug log
      
      // STEP 1: FIRST - Immediately hide SPACEWALK text and dive-in button
      hideSpaceWalkText();
      
      // STEP 2: Trigger galaxy and sun effects (same as dive in button)
      if (!viaGalaxy && !window.cinematicTourActive) {
        createGalaxy();
        loadModel();
        loadSunModel();
        loadPlanets();
        modelsFadeStart = clock.elapsedTime;
        viaGalaxy = true;
        window.resumeClicked = true;
      }
      
      // STEP 3: Show navbar after galaxy effects start (same timing as dive in)
      setTimeout(() => {
        switchToHamburgerMode();
      }, 1000);
      
      // STEP 4: Add click animation and go to planet
      planetBtn.style.transform = 'scale(0.95)';
      
      // Hide the planets list immediately
      hidePlanetsList();
      
      // STEP 5: Navigate to planet after galaxy effects and navbar appear
      setTimeout(() => {
        navigateToPlanet(planet);
      }, 2000); // Longer delay to let galaxy effects and navbar appear properly
    };
    
    planetsListPanel.appendChild(planetBtn);
  });
  
  document.body.appendChild(planetsListPanel);
  
  // Animate panel appearance
  setTimeout(() => {
    planetsListPanel.style.opacity = '1';
    planetsListPanel.style.transform = 'translateX(0) scale(1)';
  }, 100);
}

function hidePlanetsList() {
  if (planetsListPanel && document.body.contains(planetsListPanel)) {
    // Animate panel disappearance
    planetsListPanel.style.opacity = '0';
    planetsListPanel.style.transform = 'translateX(-20px) scale(0.9)';
    
    setTimeout(() => {
      if (planetsListPanel && document.body.contains(planetsListPanel)) {
        document.body.removeChild(planetsListPanel);
      }
      planetsListPanel = null;
    }, 400);
  }
}

// Function to navigate to specific planet
function navigateToPlanet(planetName) {
  // Hide all planet name labels
  hideCoordinateMarkers();
  
  const planetActions = {
    'Mercury': () => {
      const mercuryX = Math.cos(0) * 1500;
      const mercuryZ = Math.sin(0) * 1500 - 200;
      const mercuryPos = new THREE.Vector3(mercuryX, 0, mercuryZ);
      const baseDistance = Math.max(15, 2.0 * 10);
      const offset = baseDistance;
      const targetPosition = new THREE.Vector3(
        mercuryPos.x + offset * 1.5,
        mercuryPos.y + offset * 1.0,
        mercuryPos.z + offset * 3.0
      );
      animateCamera(targetPosition, mercuryPos, 2500);
      // Show planet info after animation completes
      setTimeout(() => showPlanetInfo('Mercury'), 2500);
    },
    'Venus': () => {
      const venusX = Math.cos(Math.PI / 4) * 2500;
      const venusZ = Math.sin(Math.PI / 4) * 2500 - 200;
      const venusPos = new THREE.Vector3(venusX, 0, venusZ);
      const baseDistance = Math.max(6, 1.0 * 4);
      const offset = baseDistance;
      const targetPosition = new THREE.Vector3(
        venusPos.x + offset * 0.8,
        venusPos.y + offset * 0.5,
        venusPos.z + offset * 1.5
      );
      animateCamera(targetPosition, venusPos, 3000);
      // Show planet info after animation completes
      setTimeout(() => showPlanetInfo('Venus'), 3000);
    },
    'Earth': () => {
      const earthX = Math.cos(Math.PI / 2) * 3500;
      const earthZ = Math.sin(Math.PI / 2) * 3500 - 200;
      const earthPos = new THREE.Vector3(earthX, 0, earthZ);
      const baseDistance = Math.max(80, 0.5 * 60);
      const offset = baseDistance;
      const targetPosition = new THREE.Vector3(
        earthPos.x + offset * 1.5,
        earthPos.y + offset * 1.0,
        earthPos.z + offset * 3.0
      );
      animateCamera(targetPosition, earthPos, 3000);
      // Show planet info after animation completes
      setTimeout(() => showPlanetInfo('Earth'), 3000);
    },
    'Mars': () => {
      const marsX = Math.cos(3 * Math.PI / 4) * 4500;
      const marsZ = Math.sin(3 * Math.PI / 4) * 4500 - 200;
      const marsPos = new THREE.Vector3(marsX, 0, marsZ);
      const baseDistance = Math.max(8, 2.0 * 4);
      const offset = baseDistance;
      const targetPosition = new THREE.Vector3(
        marsPos.x + offset * 1.5,
        marsPos.y + offset * 1.0,
        marsPos.z + offset * 3.0
      );
      animateCamera(targetPosition, marsPos, 3000);
      // Show planet info after animation completes
      setTimeout(() => showPlanetInfo('Mars'), 3000);
    },
    'Jupiter': () => {
      const jupiterX = Math.cos(Math.PI) * 6000;
      const jupiterZ = Math.sin(Math.PI) * 6000 - 200;
      const jupiterPos = new THREE.Vector3(jupiterX, 0, jupiterZ);
      const baseDistance = Math.max(200, 2 * 100);
      const offset = baseDistance;
      const targetPosition = new THREE.Vector3(
        jupiterPos.x + offset * 1.5,
        jupiterPos.y + offset * 1.0,
        jupiterPos.z + offset * 3.0
      );
      animateCamera(targetPosition, jupiterPos, 4000);
      // Show planet info after animation completes
      setTimeout(() => showPlanetInfo('Jupiter'), 4000);
    },
    'Saturn': () => {
      const saturnX = Math.cos(5 * Math.PI / 4) * 7000;
      const saturnZ = Math.sin(5 * Math.PI / 4) * 7000 - 200;
      const saturnPos = new THREE.Vector3(saturnX, 0, saturnZ);
      const baseDistance = Math.max(180, 2.5 * 120);
      const offset = baseDistance;
      const targetPosition = new THREE.Vector3(
        saturnPos.x + offset * 1.5,
        saturnPos.y + offset * 1.0,
        saturnPos.z + offset * 3.0
      );
      animateCamera(targetPosition, saturnPos, 3500);
      // Show planet info after animation completes
      setTimeout(() => showPlanetInfo('Saturn'), 3500);
    },
    'Uranus': () => {
      const uranusX = Math.cos(3 * Math.PI / 2) * 8500;
      const uranusZ = Math.sin(3 * Math.PI / 2) * 8500 - 200;
      const uranusPos = new THREE.Vector3(uranusX, 0, uranusZ);
      const baseDistance = Math.max(120, 2.0 * 80);
      const offset = baseDistance;
      const targetPosition = new THREE.Vector3(
        uranusPos.x + offset * 1.5,
        uranusPos.y + offset * 1.0,
        uranusPos.z + offset * 3.0
      );
      animateCamera(targetPosition, uranusPos, 3500);
      // Show planet info after animation completes
      setTimeout(() => showPlanetInfo('Uranus'), 3500);
    },
    'Neptune': () => {
      const neptuneX = Math.cos(7 * Math.PI / 4) * 8000;
      const neptuneZ = Math.sin(7 * Math.PI / 4) * 8000 - 200;
      const neptunePos = new THREE.Vector3(neptuneX, 0, neptuneZ);
      const baseDistance = Math.max(150, 2.5 * 120);
      const offset = baseDistance;
      const targetPosition = new THREE.Vector3(
        neptunePos.x + offset * 1.5,
        neptunePos.y + offset * 1.0,
        neptunePos.z + offset * 3.0
      );
      animateCamera(targetPosition, neptunePos, 3500);
      // Show planet info after animation completes
      setTimeout(() => showPlanetInfo('Neptune'), 3500);
    },
    'Pluto': () => {
      const plutoX = Math.cos(2 * Math.PI / 3) * 10000;
      const plutoZ = Math.sin(2 * Math.PI / 3) * 10000 - 200;
      const plutoPos = new THREE.Vector3(plutoX, 0, plutoZ);
      const baseDistance = Math.max(200, 2 * 150);
      const offset = baseDistance;
      const targetPosition = new THREE.Vector3(
        plutoPos.x + offset * 1.5,
        plutoPos.y + offset * 1.0,
        plutoPos.z + offset * 3.0
      );
      animateCamera(targetPosition, plutoPos, 3000);
      // Show planet info after animation completes
      setTimeout(() => showPlanetInfo('Pluto'), 3000);
    }
  };
  
  if (planetActions[planetName]) {
    planetActions[planetName]();
  }
}

// Cinematic tour functionality
function startCinematicTour() {
  console.log('Starting cinematic tour');
  window.cinematicTourActive = true;
  
  // Hide the dive-in button when cinematic tour starts
  hideSpaceWalkText();
  
  // Start from Sun if not already there
  if (!viaGalaxy) {
    createGalaxy();
    loadModel();
    loadSunModel();
    loadPlanets();
    modelsFadeStart = clock.elapsedTime;
    viaGalaxy = true;
  }
  
  // Tour sequence with delays
  const tourSequence = [
    { planet: 'Sun', delay: 1000 },
    { planet: 'Mercury', delay: 6000 },
    { planet: 'Venus', delay: 6000 },
    { planet: 'Earth', delay: 6000 },
    { planet: 'Mars', delay: 6000 },
    { planet: 'Jupiter', delay: 6000 },
    { planet: 'Saturn', delay: 6000 },
    { planet: 'Uranus', delay: 6000 },
    { planet: 'Neptune', delay: 6000 },
    { planet: 'Pluto', delay: 6000 }
  ];
  
  let currentStop = 0;
  
  function nextStop() {
    if (currentStop < tourSequence.length && window.cinematicTourActive) {
      const stop = tourSequence[currentStop];
      
      if (stop.planet === 'Sun') {
        // Move to Sun
        animateCamera(new THREE.Vector3(0, 0, -100), new THREE.Vector3(0, 0, -200), 3000);
      } else {
        navigateToPlanet(stop.planet);
      }
      
      currentStop++;
      setTimeout(nextStop, stop.delay);
    } else {
      window.cinematicTourActive = false;
    }
  }
  
  nextStop();
}

// About section functionality
let aboutSection = null;

function toggleAboutSection() {
  if (aboutSection) {
    hideAboutSection();
  } else {
    showAboutSection();
  }
}

function showAboutSection() {
  hideAboutSection(); // Remove existing if any
  
  aboutSection = document.createElement('div');
  aboutSection.style.position = 'fixed';
  aboutSection.style.top = '50%';
  aboutSection.style.left = '50%';
  aboutSection.style.transform = 'translate(-50%, -50%)';
  aboutSection.style.width = '80%';
  aboutSection.style.maxWidth = '600px';
  aboutSection.style.maxHeight = '80vh';
  aboutSection.style.overflowY = 'auto';
  aboutSection.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  aboutSection.style.border = '1px solid rgba(255, 255, 255, 0.5)';
  aboutSection.style.borderRadius = '25px';
  aboutSection.style.padding = '30px';
  aboutSection.style.backdropFilter = 'blur(10px)';
  aboutSection.style.zIndex = '10002';
  aboutSection.style.fontFamily = 'Astronoma, Arial, sans-serif';
  aboutSection.style.color = 'white';
  aboutSection.style.opacity = '0';
  aboutSection.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  
  aboutSection.innerHTML = `
    <h2 style="text-align: center; margin-bottom: 30px; font-size: 32px; color: white;">About SPACEWALK</h2>
    
    <div style="margin-bottom: 30px;">
      <h3 style="color: #4FC3F7; font-size: 24px; margin-bottom: 15px;">Our Mission</h3>
      <p style="line-height: 1.8; font-size: 16px;">
        SPACEWALK is an immersive 3D space exploration experience that brings the wonders of our solar system 
        directly to your browser. Our mission is to make space education accessible, engaging, and visually stunning 
        for explorers of all ages.
      </p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="color: #81C784; font-size: 24px; margin-bottom: 15px;">Features</h3>
      <ul style="line-height: 1.8; font-size: 16px; padding-left: 20px;">
        <li>Interactive 3D models of all planets in our solar system</li>
        <li>Detailed educational information for each celestial body</li>
        <li>Cinematic guided tours through space</li>
        <li>Real-time particle effects and cosmic animations</li>
        <li>Responsive design that works on all devices</li>
      </ul>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="color: #FFB74D; font-size: 24px; margin-bottom: 15px;">Our Team</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
        <div style="background: rgba(0,0,0,0); border: 1px solid rgba(255,255,255,0.3); border-radius: 15px; padding: 20px; text-align: center;">
          <h4 style="color: #4FC3F7; margin-bottom: 10px;">Lead Developer</h4>
          <p style="font-size: 14px; line-height: 1.6;">Responsible for the core 3D engine, particle systems, and interactive navigation features.</p>
        </div>
        <div style="background: rgba(0,0,0,0); border: 1px solid rgba(255,255,255,0.3); border-radius: 15px; padding: 20px; text-align: center;">
          <h4 style="color: #81C784; margin-bottom: 10px;">Content Specialist</h4>
          <p style="font-size: 14px; line-height: 1.6;">Curates accurate astronomical data and educational content for each planet.</p>
        </div>
        <div style="background: rgba(0,0,0,0); border: 1px solid rgba(255,255,255,0.3); border-radius: 15px; padding: 20px; text-align: center;">
          <h4 style="color: #FFB74D; margin-bottom: 10px;">UI/UX Designer</h4>
          <p style="font-size: 14px; line-height: 1.6;">Designs the intuitive interface and seamless user experience throughout the journey.</p>
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <p style="font-size: 14px; color: rgba(255,255,255,0.7);">
        Built with Three.js, WebGL, and passion for space exploration.<br>
        © 2025 SPACEWALK Team. Made for curious minds everywhere.
      </p>
    </div>
  `;
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '20px';
  closeBtn.style.right = '20px';
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = '1px solid rgba(255, 255, 255, 0.3)';
  closeBtn.style.borderRadius = '15px';
  closeBtn.style.color = 'white';
  closeBtn.style.width = '40px';
  closeBtn.style.height = '40px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '18px';
  closeBtn.style.fontFamily = 'Astronoma, Arial, sans-serif';
  closeBtn.style.transition = 'all 0.3s ease';
  closeBtn.onclick = hideAboutSection;
  
  closeBtn.onmouseover = () => {
    closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    closeBtn.style.transform = 'scale(1.05)';
  };
  
  closeBtn.onmouseout = () => {
    closeBtn.style.backgroundColor = 'transparent';
    closeBtn.style.transform = 'scale(1)';
  };
  
  aboutSection.appendChild(closeBtn);
  document.body.appendChild(aboutSection);
  
  // Animate appearance
  setTimeout(() => {
    aboutSection.style.opacity = '1';
  }, 100);
}

function hideAboutSection() {
  if (aboutSection) {
    aboutSection.style.opacity = '0';
    setTimeout(() => {
      if (aboutSection && document.body.contains(aboutSection)) {
        document.body.removeChild(aboutSection);
      }
      aboutSection = null;
    }, 500);
  }
}

// Left navigation toggle functionality
function toggleLeftNavigation() {
  const leftNav = document.querySelector('div[style*="position: fixed"][style*="left: 20px"]');
  if (leftNav && leftNav.style.display !== 'none') {
    hideLeftNavigation();
  } else {
    showLeftNavigation();
  }
}

function hideLeftNavigation() {
  const leftNav = document.querySelector('div[style*="position: fixed"][style*="left: 20px"]');
  if (leftNav) {
    leftNav.style.display = 'none';
  }
}

function showLeftNavigation() {
  const leftNav = document.querySelector('div[style*="position: fixed"][style*="left: 20px"]');
  if (leftNav) {
    leftNav.style.display = 'flex';
  }
}
