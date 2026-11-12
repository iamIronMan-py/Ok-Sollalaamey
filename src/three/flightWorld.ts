import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createSkylineCanvas, SKYLINE_LAYERS, type SkylineKind } from './landmarks';

type FlightWorldOptions = {
  mobile?: boolean;
  reduced?: boolean;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

function makeCloudTexture(size: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    const blobs = Math.round(size / 9);
    for (let i = 0; i < blobs; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = size * (0.03 + Math.random() * 0.13);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255,255,255,0.92)');
      gradient.addColorStop(0.45, 'rgba(255,252,250,0.42)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const clearings = Math.round(size / 14);
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < clearings; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = size * (0.02 + Math.random() * 0.09);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(0,0,0,0.9)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function makeGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,248,226,1)');
    gradient.addColorStop(0.22, 'rgba(255,224,168,0.85)');
    gradient.addColorStop(0.55, 'rgba(255,188,138,0.25)');
    gradient.addColorStop(1, 'rgba(255,188,138,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#0a1226');
    gradient.addColorStop(0.3, '#243a67');
    gradient.addColorStop(0.52, '#5e6f9f');
    gradient.addColorStop(0.68, '#b48fa0');
    gradient.addColorStop(0.82, '#f0b491');
    gradient.addColorStop(1, '#ffe8c9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 8, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export class FlightWorld {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly plane = new THREE.Group();
  private readonly curve: THREE.CatmullRomCurve3;
  private readonly cloudNear: THREE.Mesh;
  private readonly cloudFar: THREE.Mesh;
  private readonly cloudTextures: THREE.Texture[] = [];
  private readonly disposables: Array<{ dispose: () => void }> = [];
  private readonly pmrem: THREE.PMREMGenerator;
  private readonly environment: THREE.Texture;
  private readonly mobile: boolean;
  private readonly reduced: boolean;
  private trail!: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private trailPositions!: Float32Array;
  private trailAttribute!: THREE.BufferAttribute;
  private trailCount = 0;
  private exhaust!: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  private exhaustPositions!: Float32Array;
  private exhaustAttribute!: THREE.BufferAttribute;
  private exhaustCount = 0;
  private progress = 0;
  private disposed = false;
  private readonly airportGroup = new THREE.Group();
  private readonly airportMaterials: Array<{ material: THREE.Material; opacity: number }> = [];
  private readonly loaderMaterials: Array<{ material: THREE.Material; opacity: number }> = [];
  private readonly parisGroup = new THREE.Group();
  private readonly parisMaterials: Array<{ material: THREE.Material; opacity: number }> = [];
  private readonly parisSurfaceY = -3.4;
  private readonly parisDir = new THREE.Vector3();
  private readonly parisCenter = new THREE.Vector3();
  private readonly dubaiSkyline = new THREE.Group();
  private readonly parisSkyline = new THREE.Group();
  private readonly dubaiSkylineMaterials: Array<{ material: THREE.MeshBasicMaterial; opacity: number }> = [];
  private readonly parisSkylineMaterials: Array<{ material: THREE.MeshBasicMaterial; opacity: number }> = [];
  private readonly takeoffDir = new THREE.Vector3();
  private readonly takeoffStart = new THREE.Vector3();
  private readonly groundQuaternion = new THREE.Quaternion();
  private readonly cruisePlanePosition = new THREE.Vector3();
  private readonly cruisePlaneQuaternion = new THREE.Quaternion();
  private readonly cruiseCameraPosition = new THREE.Vector3();
  private readonly cruiseLookAt = new THREE.Vector3();
  private readonly skylineView = new THREE.Vector3();
  private readonly groundY = -7.02;
  private cargoDoorPivot!: THREE.Group;
  private cargoBox!: THREE.Group;
  private cargoBoxHome = new THREE.Vector3();
  private cargoBoxTarget = new THREE.Vector3();
  private cargoBoxUnload = new THREE.Vector3();
  private loaderGroup!: THREE.Group;
  private landingGear!: THREE.Group;
  private sunSprite!: THREE.Sprite;
  private moonSprite!: THREE.Sprite;
  private engineFans: THREE.Mesh[] = [];
  private navLights: THREE.MeshStandardMaterial[] = [];
  private citySparks: Array<{ material: THREE.SpriteMaterial; base: number; phase: number; speed: number; kind: SkylineKind }> = [];

  constructor(canvas: HTMLCanvasElement, options: FlightWorldOptions = {}) {
    this.mobile = Boolean(options.mobile);
    this.reduced = Boolean(options.reduced);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !this.mobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.25 : 1.5));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.renderer.shadowMap.enabled = !this.mobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xd9b6ad, 60, 1600);

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 2600);

    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
    this.scene.environment = this.environment;
    this.scene.environmentIntensity = 0.55;

    this.curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-27, 3.4, -17),
        new THREE.Vector3(-15, 8.8, -5),
        new THREE.Vector3(-2, 4.4, 7),
        new THREE.Vector3(11, 9.6, 2),
        new THREE.Vector3(23, 2.6, -15),
      ],
      false,
      'catmullrom',
      0.5,
    );

    const start = this.curve.getPointAt(0);
    this.takeoffDir.copy(this.curve.getTangentAt(0)).setY(0).normalize();
    this.takeoffStart.copy(start).addScaledVector(this.takeoffDir, -26);
    this.takeoffStart.y = this.groundY + 0.58;
    const groundLook = new THREE.Object3D();
    groundLook.position.copy(this.takeoffStart);
    groundLook.lookAt(this.takeoffStart.clone().add(this.takeoffDir));
    this.groundQuaternion.copy(groundLook.quaternion);

    this.buildSky();
    this.buildLights();
    this.cloudNear = this.buildCloudSea(-7.4, 0.9, 3.5, 0.22);
    this.cloudFar = this.buildCloudSea(-10.6, 0.55, 2.1, 0.14);
    this.buildSun();
    this.buildParticles();
    this.buildTrail();
    this.buildExhaust();
    this.buildPlane();
    this.buildAirport();
    this.buildLoader();
    this.buildParisRunway();
    this.buildSkylines();

    this.scene.add(this.plane);
    this.resize();
    this.setProgress(0);
    this.captureCruisePose();
    (window as any).__flightWorld = this;
  }

  private captureCruisePose() {
    this.cruisePlanePosition.copy(this.plane.position);
    this.cruisePlaneQuaternion.copy(this.plane.quaternion);
    this.cruiseCameraPosition.copy(this.camera.position);
  }

  private trackAirportMaterial(material: THREE.Material) {
    material.transparent = true;
    this.airportMaterials.push({ material, opacity: material.opacity });
    this.disposables.push(material);
    return material;
  }

  private trackLoaderMaterial(material: THREE.Material) {
    material.transparent = true;
    this.loaderMaterials.push({ material, opacity: material.opacity });
    this.disposables.push(material);
    return material;
  }

  private setAirportFade(fade: number) {
    const amount = clamp01(fade);
    this.airportGroup.visible = amount > 0.008;
    this.airportMaterials.forEach(({ material, opacity }) => {
      material.opacity = opacity * amount;
      material.depthWrite = amount > 0.55;
    });
  }

  private setLoaderFade(fade: number) {
    const amount = clamp01(fade);
    this.loaderGroup.visible = amount > 0.012;
    this.loaderMaterials.forEach(({ material, opacity }) => {
      material.opacity = opacity * amount;
      material.depthWrite = amount > 0.55;
    });
  }

  // Paris materials tracked here if/when runway geometry is added.
  // (kept minimal to avoid unused-variable build errors)

  private setParisFade(fade: number) {
    const amount = clamp01(fade);
    this.parisGroup.visible = amount > 0.008;
    this.parisMaterials.forEach(({ material, opacity }) => {
      material.opacity = opacity * amount;
      material.depthWrite = amount > 0.55;
    });
  }

  private buildSkyline(
    kind: SkylineKind,
    group: THREE.Group,
    origin: THREE.Vector3,
    outDir: THREE.Vector3,
    materials: Array<{ material: THREE.MeshBasicMaterial; opacity: number }>,
    centerAligned: boolean,
  ) {
    const layers = this.mobile
      ? SKYLINE_LAYERS[kind].filter((spec) => spec.layer !== 'far')
      : SKYLINE_LAYERS[kind];
    const baseY = kind === 'dubai' ? this.groundY : this.parisSurfaceY;
    const yaw = Math.atan2(-outDir.x, -outDir.z);

    const sparkCanvas = document.createElement('canvas');
    sparkCanvas.width = 64;
    sparkCanvas.height = 64;
    const sctx = sparkCanvas.getContext('2d');
    if (sctx) {
      const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.25, kind === 'dubai' ? 'rgba(180,245,255,1)' : 'rgba(255,235,190,1)');
      g.addColorStop(0.55, kind === 'dubai' ? 'rgba(120,220,255,0.8)' : 'rgba(255,210,140,0.8)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      sctx.fillStyle = g;
      sctx.beginPath();
      const o = 28, inr = 10;
      for (let i = 0; i < 10; i += 1) {
        const r = i % 2 === 0 ? o : inr;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        sctx.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r);
      }
      sctx.closePath();
      sctx.fill();
    }
    const sparkTexture = new THREE.CanvasTexture(sparkCanvas);
    sparkTexture.colorSpace = THREE.SRGBColorSpace;
    this.disposables.push(sparkTexture);

    for (const spec of layers) {
      for (const offset of [-1, 0, 1]) {
        const canvas = createSkylineCanvas(kind, spec.layer, this.mobile);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          opacity: spec.opacity,
          fog: false,
          toneMapped: false,
        });
        const geometry = new THREE.PlaneGeometry(spec.worldWidth, spec.worldHeight);
        const mesh = new THREE.Mesh(geometry, material);
        if (centerAligned) {
          mesh.position.set(offset * spec.worldWidth, baseY + spec.worldHeight / 2 - 4, -spec.depth);
        } else {
          mesh.position.copy(origin).addScaledVector(outDir, spec.depth);
          mesh.position.y = baseY + spec.worldHeight / 2 - 4;
          mesh.rotation.y = yaw;
          mesh.position.add(new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(offset * spec.worldWidth));
        }
        group.add(mesh);
        materials.push({ material, opacity: spec.opacity });
        this.disposables.push(texture, material, geometry);

        const sparkCount = spec.layer === 'near' ? (this.mobile ? 26 : 48) : (this.mobile ? 16 : 30);
        for (let i = 0; i < sparkCount; i += 1) {
          const sm = new THREE.SpriteMaterial({
            map: sparkTexture,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
            fog: false,
            color: 0xffffff,
          });
          const sprite = new THREE.Sprite(sm);
          const sx = (Math.random() - 0.5) * spec.worldWidth * 0.92;
          const sy = baseY + 6 + Math.random() * (spec.worldHeight * 0.75);
          if (centerAligned) {
            sprite.position.set(offset * spec.worldWidth + sx, sy, -spec.depth + 0.5);
          } else {
            sprite.position.copy(origin).addScaledVector(outDir, spec.depth - 0.5);
            sprite.position.y = sy;
            const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
            sprite.position.addScaledVector(right, offset * spec.worldWidth + sx);
          }
          const scale = spec.layer === 'near' ? 2.6 + Math.random() * 3.2 : 2 + Math.random() * 2.4;
          sprite.scale.set(scale, scale, 1);
          group.add(sprite);
          this.citySparks.push({ material: sm, base: 0.75 + Math.random() * 0.45, phase: Math.random() * Math.PI * 2, speed: 1.8 + Math.random() * 4.2, kind });
          this.disposables.push(sm);
        }
      }
    }
  }

  private placeSkylineAhead(kind: 'dubai', anchor: THREE.Vector3, dir: THREE.Vector3) {
    const group = kind === 'dubai' ? this.dubaiSkyline : this.parisSkyline;
    group.position.set(anchor.x, 0, anchor.z);
    group.rotation.y = Math.atan2(-dir.x, -dir.z);
  }

  private setSkylineFade(kind: SkylineKind, fade: number) {
    const amount = clamp01(fade);
    const group = kind === 'dubai' ? this.dubaiSkyline : this.parisSkyline;
    const list = kind === 'dubai' ? this.dubaiSkylineMaterials : this.parisSkylineMaterials;
    group.visible = amount > 0.004;
    for (const { material, opacity } of list) {
      material.opacity = opacity * amount;
    }
  }

  private updateCitySparks() {
    const now = performance.now() * 0.001;
    const dubaiFade = this.dubaiSkyline.visible
      ? (this.dubaiSkylineMaterials[0] ? this.dubaiSkylineMaterials[0].material.opacity / (this.dubaiSkylineMaterials[0].opacity || 1) : 0)
      : 0;
    const parisFade = this.parisSkyline.visible
      ? (this.parisSkylineMaterials[0] ? this.parisSkylineMaterials[0].material.opacity / (this.parisSkylineMaterials[0].opacity || 1) : 0)
      : 0;
    this.citySparks.forEach((s) => {
      const fade = s.kind === 'dubai' ? dubaiFade : parisFade;
      const twinkle = 0.75 + 0.55 * Math.pow(Math.max(0, Math.sin(now * s.speed + s.phase)), 1.4);
      const flicker = 0.9 + 0.25 * Math.sin(now * (s.speed * 2.7) + s.phase * 1.3);
      s.material.opacity = Math.min(1, s.base * fade * twinkle * flicker);
    });
  }

  private buildSkylines() {
    this.buildSkyline(
      'dubai',
      this.dubaiSkyline,
      this.takeoffStart,
      this.takeoffDir.clone().multiplyScalar(-1),
      this.dubaiSkylineMaterials,
      true,
    );
    this.buildSkyline(
      'paris',
      this.parisSkyline,
      this.parisCenter,
      this.parisDir,
      this.parisSkylineMaterials,
      false,
    );
    this.scene.add(this.dubaiSkyline, this.parisSkyline);
    this.setSkylineFade('dubai', 0);
    this.setSkylineFade('paris', 0);
  }

  private buildParisRunway() {
    const end = this.curve.getPointAt(1);
    const dir = this.curve.getTangentAt(1).setY(0).normalize();
    const center = end.clone().addScaledVector(dir, 20);
    this.parisDir.copy(dir);
    this.parisCenter.copy(center);

    const group = new THREE.Group();
    group.position.set(center.x, this.parisSurfaceY, center.z);
    group.rotation.y = Math.atan2(dir.x, dir.z);

    const stripMaterial = this.trackParisMaterial(
      new THREE.MeshStandardMaterial({ color: 0x1f242e, roughness: 0.86, metalness: 0.1 }),
    );
    const stripGeometry = new THREE.BoxGeometry(18, 0.14, 420);
    const strip = new THREE.Mesh(stripGeometry, stripMaterial);
    strip.position.y = 0.02;
    strip.receiveShadow = true;
    group.add(strip);
    this.disposables.push(stripGeometry);

    const shoulderMaterial = this.trackParisMaterial(
      new THREE.MeshStandardMaterial({ color: 0x4a3945, roughness: 0.95 }),
    );
    for (const side of [-1, 1]) {
      const shoulderGeometry = new THREE.BoxGeometry(1.6, 0.1, 420);
      const shoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
      shoulder.position.set(side * 9.8, 0.01, 0);
      group.add(shoulder);
      this.disposables.push(shoulderGeometry);
    }

    const dashMaterial = this.trackParisMaterial(
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.05, emissive: 0xffffff, emissiveIntensity: 0.35 }),
    );
    const dashGeometry = new THREE.BoxGeometry(0.7, 0.03, 8);
    for (let z = -190; z <= 190; z += 16) {
      const dash = new THREE.Mesh(dashGeometry, dashMaterial);
      dash.position.set(0, 0.12, z);
      group.add(dash);
    }
    this.disposables.push(dashGeometry);

    const edgeLightMaterial = this.trackParisMaterial(
      new THREE.MeshBasicMaterial({ color: 0xfff4c8 }),
    );
    const edgeLightGeometry = new THREE.SphereGeometry(0.18, 8, 8);
    for (const side of [-1, 1]) {
      for (let z = -200; z <= 200; z += 18) {
        const light = new THREE.Mesh(edgeLightGeometry, edgeLightMaterial);
        light.position.set(side * 10.6, 0.22, z);
        group.add(light);
      }
    }
    this.disposables.push(edgeLightGeometry);

    this.parisGroup.add(group);
    this.scene.add(this.parisGroup);
    this.setParisFade(0);
  }

  private trackParisMaterial<T extends THREE.Material>(material: T): T {
    material.transparent = true;
    this.parisMaterials.push({ material, opacity: (material as any).opacity ?? 1 });
    this.disposables.push(material);
    return material;
  }

  private buildAirport() {
    const runway = new THREE.Group();
    const runwayCenter = this.takeoffStart.clone().addScaledVector(this.takeoffDir, 30);
    runway.position.set(runwayCenter.x, this.groundY, runwayCenter.z);
    runway.rotation.y = Math.atan2(this.takeoffDir.x, this.takeoffDir.z);

    const stripMaterial = this.trackAirportMaterial(
      new THREE.MeshStandardMaterial({ color: 0x20242d, roughness: 0.82, metalness: 0.12 }),
    );
    const stripGeometry = new THREE.BoxGeometry(20, 0.12, 184);
    const strip = new THREE.Mesh(stripGeometry, stripMaterial);
    strip.position.y = 0.04;
    strip.receiveShadow = true;
    runway.add(strip);
    this.disposables.push(stripGeometry);

    const shoulderMaterial = this.trackAirportMaterial(
      new THREE.MeshStandardMaterial({ color: 0x553f4a, roughness: 0.95 }),
    );
    for (const side of [-1, 1]) {
      const shoulderGeometry = new THREE.BoxGeometry(2.4, 0.08, 184);
      const shoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
      shoulder.position.set(side * 11.2, 0.015, 0);
      runway.add(shoulder);
      this.disposables.push(shoulderGeometry);
    }

    const dashMaterial = this.trackAirportMaterial(
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.05, emissive: 0xffffff, emissiveIntensity: 0.35 }),
    );
    const dashGeometry = new THREE.BoxGeometry(0.7, 0.03, 8);
    for (let z = -80; z <= 80; z += 16) {
      const dash = new THREE.Mesh(dashGeometry, dashMaterial);
      dash.position.set(0, 0.13, z);
      runway.add(dash);
    }
    this.disposables.push(dashGeometry);

    const edgeLightMaterial = this.trackAirportMaterial(
      new THREE.MeshBasicMaterial({ color: 0xfff4c8 }),
    );
    const edgeLightGeometry = new THREE.SphereGeometry(0.18, 8, 8);
    for (const side of [-1, 1]) {
      for (let z = -88; z <= 88; z += 16) {
        const light = new THREE.Mesh(edgeLightGeometry, edgeLightMaterial);
        light.position.set(side * 10.8, 0.22, z);
        runway.add(light);
      }
    }
    this.disposables.push(edgeLightGeometry);

    const terminalMaterial = this.trackAirportMaterial(
      new THREE.MeshStandardMaterial({ color: 0x6e5360, roughness: 0.7, metalness: 0.15 }),
    );
    const terminalGeometry = new THREE.BoxGeometry(18, 8, 54);
    const terminal = new THREE.Mesh(terminalGeometry, terminalMaterial);
    terminal.position.set(58, 4, -32);
    runway.add(terminal);
    this.disposables.push(terminalGeometry);

    const glowMaterial = this.trackAirportMaterial(
      new THREE.MeshBasicMaterial({ color: 0xffcf9a }),
    );
    const glowGeometry = new THREE.BoxGeometry(0.5, 0.14, 48);
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(48.8, 2.4, -32);
    runway.add(glow);
    this.disposables.push(glowGeometry);

    this.airportGroup.add(runway);
    this.scene.add(this.airportGroup);
    this.setAirportFade(1);
  }

  private buildLoader() {
    const group = new THREE.Group();
    const offset = new THREE.Vector3(1.22, 0, 0.72).applyQuaternion(this.groundQuaternion);
    group.position.copy(this.takeoffStart).add(offset);
    group.position.y = this.groundY;
    group.quaternion.copy(this.groundQuaternion);

    const metal = this.trackLoaderMaterial(
      new THREE.MeshStandardMaterial({ color: 0xc9b7ad, roughness: 0.5, metalness: 0.55 }),
    );
    const darkMetal = this.trackLoaderMaterial(
      new THREE.MeshStandardMaterial({ color: 0x30282e, roughness: 0.68, metalness: 0.35 }),
    );
    const belt = this.trackLoaderMaterial(
      new THREE.MeshStandardMaterial({ color: 0x5b454f, roughness: 0.9 }),
    );
    const beacon = this.trackLoaderMaterial(
      new THREE.MeshBasicMaterial({ color: 0xffc987 }),
    );

    const bedGeometry = new THREE.BoxGeometry(1.5, 0.1, 1.05);
    const bed = new THREE.Mesh(bedGeometry, metal);
    bed.position.set(0, 0.52, 0);
    bed.castShadow = true;
    group.add(bed);
    this.disposables.push(bedGeometry);

    const beltGeometry = new THREE.BoxGeometry(1.28, 0.035, 0.82);
    const beltMesh = new THREE.Mesh(beltGeometry, belt);
    beltMesh.position.set(0, 0.585, 0);
    group.add(beltMesh);
    this.disposables.push(beltGeometry);

    for (const x of [-0.58, 0.58]) {
      for (const z of [-0.36, 0.36]) {
        const legGeometry = new THREE.BoxGeometry(0.09, 0.46, 0.09);
        const leg = new THREE.Mesh(legGeometry, darkMetal);
        leg.position.set(x, 0.27, z);
        group.add(leg);
        this.disposables.push(legGeometry);
      }
    }

    const axleGeometry = new THREE.BoxGeometry(1.28, 0.06, 0.06);
    const axle = new THREE.Mesh(axleGeometry, darkMetal);
    axle.position.set(0, 0.14, -0.34);
    group.add(axle);
    this.disposables.push(axleGeometry);

    const wheelGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
    wheelGeometry.rotateZ(Math.PI / 2);
    for (const x of [-0.52, 0.52]) {
      const wheel = new THREE.Mesh(wheelGeometry, darkMetal);
      wheel.position.set(x, 0.13, -0.36);
      group.add(wheel);
    }
    this.disposables.push(wheelGeometry);

    const beaconGeometry = new THREE.SphereGeometry(0.055, 8, 8);
    const beaconMesh = new THREE.Mesh(beaconGeometry, beacon);
    beaconMesh.position.set(0.52, 0.82, 0.36);
    group.add(beaconMesh);
    this.disposables.push(beaconGeometry);

    this.loaderGroup = group;
    this.scene.add(group);
    this.setLoaderFade(1);
  }

  private buildSky() {
    const texture = makeSkyTexture();
    this.cloudTextures.push(texture);
    const geometry = new THREE.SphereGeometry(320, 32, 20);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
      fog: false,
    });
    const sky = new THREE.Mesh(geometry, material);
    sky.rotation.y = Math.PI * 0.35;
    this.scene.add(sky);
  }

  private buildLights() {
    const hemisphere = new THREE.HemisphereLight(0xcfe0ff, 0xffc9a5, 1.15);
    this.scene.add(hemisphere);

    const key = new THREE.DirectionalLight(0xfff0d8, 3.1);
    key.position.set(26, 34, 16);
    key.castShadow = true;
    key.shadow.mapSize.set(this.mobile ? 512 : 1024, this.mobile ? 512 : 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 120;
    key.shadow.camera.left = -36;
    key.shadow.camera.right = 36;
    key.shadow.camera.top = 36;
    key.shadow.camera.bottom = -36;
    key.shadow.bias = -0.0007;
    key.shadow.radius = 6;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x9fb7ff, 2.0);
    rim.position.set(-24, 10, -26);
    this.scene.add(rim);

    const fill = new THREE.DirectionalLight(0xffd2c0, 0.7);
    fill.position.set(-6, -14, 18);
    this.scene.add(fill);


  }

  private buildCloudSea(y: number, opacity: number, repeat: number, speed: number) {
    const texture = makeCloudTexture(this.mobile ? 380 : 620);
    texture.repeat.set(repeat, repeat);
    texture.offset.set(Math.random(), Math.random());
    this.cloudTextures.push(texture);

    const geometry = new THREE.PlaneGeometry(900, 900);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity,
      depthWrite: false,
      toneMapped: false,
      fog: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = y;
    mesh.renderOrder = 2;
    mesh.userData.speed = speed;
    this.scene.add(mesh);
    this.disposables.push(geometry, material);
    return mesh;
  }

  private buildSun() {
    const texture = makeGlowTexture();
    this.cloudTextures.push(texture);
    const material = new THREE.SpriteMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.7,
      toneMapped: false,
      fog: false,
    });
    const sun = new THREE.Sprite(material);
    sun.position.set(120, 46, -180);
    sun.scale.set(36, 36, 1);
    this.scene.add(sun);
    this.sunSprite = sun;
    this.disposables.push(material);

    const moonCanvas = document.createElement('canvas');
    moonCanvas.width = 512;
    moonCanvas.height = 512;
    const ctx = moonCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 512);
      const glow = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
      glow.addColorStop(0, 'rgba(255,255,255,1)');
      glow.addColorStop(0.18, 'rgba(255,255,255,1)');
      glow.addColorStop(0.38, 'rgba(235,255,255,1)');
      glow.addColorStop(0.6, 'rgba(210,250,255,0.98)');
      glow.addColorStop(0.82, 'rgba(180,245,255,0.95)');
      glow.addColorStop(1, 'rgba(140,230,255,0.9)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(256, 256, 230, 0, Math.PI * 2);
      ctx.fill();

      const core = ctx.createRadialGradient(230, 220, 10, 256, 256, 120);
      core.addColorStop(0, 'rgba(255,255,255,1)');
      core.addColorStop(0.5, 'rgba(255,255,255,0.85)');
      core.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(256, 256, 180, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = 'rgba(140,250,255,0.95)';
      ctx.lineWidth = 2.5;
      for (let r = 50; r <= 210; r += 32) {
        ctx.beginPath();
        ctx.arc(256, 256, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(30, 256); ctx.lineTo(482, 256);
      ctx.moveTo(256, 30); ctx.lineTo(256, 482);
      ctx.moveTo(90, 90); ctx.lineTo(422, 422);
      ctx.moveTo(422, 90); ctx.lineTo(90, 422);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.28;
      for (let y = 30; y < 482; y += 8) {
        ctx.fillStyle = y % 16 === 0 ? 'rgba(170,255,255,0.55)' : 'rgba(255,255,255,0.16)';
        ctx.fillRect(30, y, 452, 2.5);
      }
      ctx.restore();

      const sparks = [
        [120, 120, 10], [380, 140, 8], [150, 360, 9], [360, 360, 11], [256, 90, 7], [256, 420, 8],
        [90, 256, 7], [420, 256, 9], [180, 200, 6], [330, 210, 7], [210, 320, 8], [320, 320, 6],
      ];
      sparks.forEach(([x, y, s], i) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((i * Math.PI) / 8);
        ctx.fillStyle = 'rgba(255,255,255,0.98)';
        ctx.shadowColor = 'rgba(180,255,255,1)';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        for (let p = 0; p < 8; p += 1) {
          const a = (p * Math.PI) / 4;
          const r = p % 2 === 0 ? s : s * 0.4;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      ctx.save();
      ctx.globalAlpha = 0.38;
      ctx.strokeStyle = 'rgba(255,255,255,0.98)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(256, 256, 236, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(150,250,255,0.95)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(256, 256, 220, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    const moonTexture = new THREE.CanvasTexture(moonCanvas);
    moonTexture.colorSpace = THREE.SRGBColorSpace;
    this.cloudTextures.push(moonTexture);
    const moonMaterial = new THREE.SpriteMaterial({
      map: moonTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0,
      toneMapped: false,
      fog: false,
      color: 0xffffff,
    });
    const moon = new THREE.Sprite(moonMaterial);
    moon.scale.set(14, 14, 1);
    moon.visible = false;
    this.scene.add(moon);
    this.moonSprite = moon;
    this.disposables.push(moonMaterial);
  }

  private buildParticles() {
    const count = this.mobile ? 3500 : 9000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = -160 + Math.random() * 320;
      positions[i * 3 + 1] = -12 + Math.random() * 90;
      positions[i * 3 + 2] = -180 + Math.random() * 360;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 64, 64);
      ctx.translate(32, 32);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 28);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.95)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      const outer = 22;
      const inner = 9;
      for (let i = 0; i < 10; i += 1) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cloudTextures.push(texture);

    const material = new THREE.PointsMaterial({
      color: 0xfff3f8,
      map: texture,
      size: 0.24,
      transparent: true,
      opacity: 0.75,
      alphaTest: 0.02,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.disposables.push(geometry, material);
  }

  private buildTrail() {
    this.trailCount = this.mobile ? 18 : 40;
    this.trailPositions = new Float32Array(this.trailCount * 3);
    const colors = new Float32Array(this.trailCount * 3);
    const palette = [
      new THREE.Color('#b3122f'),
      new THREE.Color('#8b6bd1'),
      new THREE.Color('#e0405a'),
      new THREE.Color('#a58ae0'),
    ];
    for (let i = 0; i < this.trailCount; i += 1) {
      const color = palette[i % palette.length];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const geometry = new THREE.BufferGeometry();
    this.trailAttribute = new THREE.BufferAttribute(this.trailPositions, 3);
    geometry.setAttribute('position', this.trailAttribute);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: this.mobile ? 0.34 : 0.27,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    points.renderOrder = 3;
    points.visible = !this.reduced;
    this.scene.add(points);
    this.disposables.push(geometry, material);
    this.trail = points;
  }

  private buildExhaust() {
    this.exhaustCount = this.mobile ? 18 : 34;
    this.exhaustPositions = new Float32Array(this.exhaustCount * 3);
    const geometry = new THREE.BufferGeometry();
    this.exhaustAttribute = new THREE.BufferAttribute(this.exhaustPositions, 3);
    geometry.setAttribute('position', this.exhaustAttribute);
    const material = new THREE.PointsMaterial({
      size: this.mobile ? 0.38 : 0.3,
      color: 0xe8dfd6,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.NormalBlending,
      toneMapped: false,
    });
    this.exhaust = new THREE.Points(geometry, material);
    this.exhaust.frustumCulled = false;
    this.exhaust.renderOrder = 4;
    this.exhaust.visible = !this.reduced;
    this.scene.add(this.exhaust);
    this.disposables.push(geometry, material);
  }

  private updateExhaust(power: number, backDir: THREE.Vector3, spread = 0.08) {
    if (!this.exhaust || this.reduced) return;
    const material = this.exhaust.material;
    material.opacity = Math.min(0.5, Math.max(0, power * 0.55));
    this.exhaust.visible = power > 0.01;
    const count = this.exhaustCount;
    for (let i = 0; i < count; i += 1) {
      const depth = 0.25 + (i / Math.max(1, count - 1)) * (1.1 + power * 1.4);
      const jitter = spread + depth * 0.08;
      for (const side of [-1, 1]) {
        const local = new THREE.Vector3(
          side * 1.18 + (Math.random() - 0.5) * jitter,
          -0.2 + (Math.random() - 0.5) * jitter * 0.8,
          0.02,
        );
        this.plane.localToWorld(local);
        local.addScaledVector(backDir, depth + Math.random() * 0.25);
        local.y += Math.random() * jitter * 0.5;
        if (side === -1) {
          this.exhaustPositions[i * 3] = local.x;
          this.exhaustPositions[i * 3 + 1] = local.y;
          this.exhaustPositions[i * 3 + 2] = local.z;
        }
      }
    }
    // fill both engines
    for (let i = 0; i < count; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const depth = 0.3 + (i / Math.max(1, count - 1)) * (1.2 + power * 1.6);
      const jitter = spread + depth * 0.07;
      const local = new THREE.Vector3(
        side * 1.18 + (Math.random() - 0.5) * jitter,
        -0.2 + (Math.random() - 0.5) * jitter * 0.7,
        0.02,
      );
      this.plane.localToWorld(local);
      local.addScaledVector(backDir, depth + Math.random() * 0.2);
      local.y += (Math.random() - 0.2) * jitter;
      this.exhaustPositions[i * 3] = local.x;
      this.exhaustPositions[i * 3 + 1] = local.y;
      this.exhaustPositions[i * 3 + 2] = local.z;
    }
    this.exhaustAttribute.needsUpdate = true;
  }

  private updateTrail(t: number) {
    if (!this.trail || this.reduced) return;
    const count = this.trailCount;
    for (let i = 0; i < count; i += 1) {
      const depth = i / Math.max(1, count - 1);
      const u = clamp01(t - depth * 0.085);
      const point = this.curve.getPointAt(u);
      const flutter = Math.sin(t * 28 + i * 0.9) * (0.1 + depth * 0.2);
      const sway = Math.cos(t * 21 + i * 1.7) * (0.14 + depth * 0.2);
      this.trailPositions[i * 3] = point.x + flutter;
      this.trailPositions[i * 3 + 1] = point.y + sway - 0.16 - depth * 0.32;
      this.trailPositions[i * 3 + 2] = point.z + flutter * 0.6;
    }
    this.trailAttribute.needsUpdate = true;
  }

  private buildPlane() {
    const body = new THREE.MeshPhysicalMaterial({
      color: 0xfdfaf7,
      metalness: 0.25,
      roughness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.15,
    });
    const pearl = new THREE.MeshPhysicalMaterial({
      color: 0xf2e6e6,
      metalness: 0.35,
      roughness: 0.3,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1,
      side: THREE.DoubleSide,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: 0xe7c98f,
      metalness: 1,
      roughness: 0.28,
      envMapIntensity: 1.2,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x101b2c,
      metalness: 0.9,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.5,
    });
    const engine = new THREE.MeshStandardMaterial({
      color: 0xc9d1da,
      metalness: 1,
      roughness: 0.22,
      envMapIntensity: 1.3,
    });
    const engineDark = new THREE.MeshStandardMaterial({
      color: 0x1a2230,
      metalness: 0.8,
      roughness: 0.35,
    });
    this.disposables.push(body, pearl, gold, glass, engine, engineDark);

    // Fuselage: lathe profile along +Z.
    const profile = [
      [0.015, -2.05],
      [0.11, -1.92],
      [0.24, -1.62],
      [0.37, -1.18],
      [0.45, -0.55],
      [0.46, 0.1],
      [0.43, 0.72],
      [0.34, 1.24],
      [0.22, 1.66],
      [0.09, 1.94],
      [0.0, 2.06],
    ].map(([radius, z]) => new THREE.Vector2(radius, z));

    const fuselageGeometry = new THREE.LatheGeometry(profile, this.mobile ? 36 : 64);
    fuselageGeometry.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeometry, body);
    fuselage.castShadow = true;
    this.plane.add(fuselage);
    this.disposables.push(fuselageGeometry);

    // Cockpit visor.
    const visorGeometry = new THREE.SphereGeometry(0.3, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    visorGeometry.scale(0.94, 0.6, 1.75);
    const visor = new THREE.Mesh(visorGeometry, glass);
    visor.position.set(0, 0.29, 1.24);
    visor.castShadow = true;
    this.plane.add(visor);
    this.disposables.push(visorGeometry);

    // Cabin windows.
    const windowGeometry = new THREE.BoxGeometry(0.03, 0.06, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3b4e,
      metalness: 0.9,
      roughness: 0.18,
      envMapIntensity: 1.2,
    });
    const perSide = this.mobile ? 8 : 12;
    const windows = new THREE.InstancedMesh(windowGeometry, windowMaterial, perSide * 2);
    const matrix = new THREE.Matrix4();
    const zStart = -1.15;
    const zStep = 2.4 / (perSide - 1);
    let index = 0;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < perSide; i += 1) {
        const z = zStart + i * zStep;
        const x = side * 0.425;
        matrix.makeTranslation(x, 0.13, z);
        windows.setMatrixAt(index, matrix);
        index += 1;
      }
    }
    windows.instanceMatrix.needsUpdate = true;
    this.plane.add(windows);
    this.disposables.push(windowGeometry, windowMaterial);

    // Fuselage name: "Love Airlines".
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 1024;
    nameCanvas.height = 256;
    const nameCtx = nameCanvas.getContext('2d');
    if (nameCtx) {
      nameCtx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);
      nameCtx.font = 'italic 700 118px "Georgia", "Times New Roman", serif';
      nameCtx.textAlign = 'center';
      nameCtx.textBaseline = 'middle';
      nameCtx.lineJoin = 'round';
      nameCtx.strokeStyle = '#d4af37';
      nameCtx.lineWidth = 7;
      nameCtx.strokeText('Love Airlines', nameCanvas.width / 2, nameCanvas.height / 2 + 6);
      nameCtx.fillStyle = '#ff1028';
      nameCtx.fillText('Love Airlines', nameCanvas.width / 2, nameCanvas.height / 2 + 6);
      nameCtx.strokeStyle = 'rgba(120, 20, 20, 0.35)';
      nameCtx.lineWidth = 1.5;
      nameCtx.strokeText('Love Airlines', nameCanvas.width / 2, nameCanvas.height / 2 + 6);
      const nameTexture = new THREE.CanvasTexture(nameCanvas);
      nameTexture.colorSpace = THREE.SRGBColorSpace;
      nameTexture.needsUpdate = true;
      const nameMaterial = new THREE.MeshBasicMaterial({
        map: nameTexture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        side: THREE.FrontSide,
      });
      const nameGeometry = new THREE.PlaneGeometry(1.35, 0.34);
      for (const side of [-1, 1] as const) {
        const namePlate = new THREE.Mesh(nameGeometry, nameMaterial);
        namePlate.position.set(side * 0.5, 0.24, 0.15);
        namePlate.rotation.y = side * Math.PI / 2;
        namePlate.renderOrder = 10;
        this.plane.add(namePlate);
      }
      this.disposables.push(nameTexture, nameMaterial, nameGeometry);
    }

    // Gold spine along the top of the fuselage.
    const spineGeometry = new THREE.BoxGeometry(0.055, 0.02, 2.2);
    const spine = new THREE.Mesh(spineGeometry, gold);
    spine.position.set(0, 0.462, -0.1);
    this.plane.add(spine);
    this.disposables.push(spineGeometry);

    // Wings.
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0.32, 0.64);
    wingShape.lineTo(2.95, -0.28);
    wingShape.lineTo(2.84, -0.86);
    wingShape.lineTo(0.32, -0.94);
    wingShape.closePath();
    const wingGeometry = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.09,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.025,
      bevelSegments: 2,
      steps: 1,
    });
    wingGeometry.rotateX(Math.PI / 2);
    wingGeometry.translate(0, 0.045, 0);
    this.disposables.push(wingGeometry);

    const roseMaterial = new THREE.MeshStandardMaterial({
      color: 0xd62839,
      emissive: 0x4a0b16,
      emissiveIntensity: 0.18,
      roughness: 0.55,
      metalness: 0.05,
    });
    const petalMaterial = new THREE.MeshStandardMaterial({
      color: 0xff7a8c,
      emissive: 0x5a1020,
      emissiveIntensity: 0.12,
      roughness: 0.6,
      metalness: 0.02,
    });
    const roseCenterMaterial = new THREE.MeshStandardMaterial({
      color: 0xe7c98f,
      emissive: 0x3a2a10,
      emissiveIntensity: 0.08,
      roughness: 0.5,
      metalness: 0.1,
    });
    this.disposables.push(roseMaterial, petalMaterial, roseCenterMaterial);

    const makeWingRose = () => {
      const group = new THREE.Group();
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), roseCenterMaterial);
      group.add(center);
      for (let i = 0; i < 6; i += 1) {
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 10), i % 2 ? petalMaterial : roseMaterial);
        petal.scale.set(1.05, 0.55, 1.25);
        const a = (i / 6) * Math.PI * 2;
        petal.position.set(Math.cos(a) * 0.1, 0.0, Math.sin(a) * 0.1);
        petal.rotation.y = a;
        petal.rotation.z = 0.15;
        group.add(petal);
      }
      for (let i = 0; i < 4; i += 1) {
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), i % 2 ? roseMaterial : petalMaterial);
        petal.scale.set(0.95, 0.5, 1.1);
        const a = (i / 4) * Math.PI * 2 + 0.4;
        petal.position.set(Math.cos(a) * 0.045, 0.035, Math.sin(a) * 0.045);
        petal.rotation.y = a;
        group.add(petal);
      }
      return group;
    };

    const rightWing = new THREE.Mesh(wingGeometry, pearl);
    rightWing.rotation.z = 0.07;
    rightWing.castShadow = true;
    const rightRose = makeWingRose();
    rightRose.position.set(1.55, 0.105, -0.1);
    rightRose.scale.setScalar(0.9);
    rightRose.rotation.x = -Math.PI / 2;
    rightWing.add(rightRose);
    this.plane.add(rightWing);

    const leftWingGeometry = wingGeometry.clone();
    leftWingGeometry.scale(-1, 1, 1);
    const leftWing = new THREE.Mesh(leftWingGeometry, pearl);
    leftWing.rotation.z = -0.07;
    leftWing.castShadow = true;
    const leftRose = makeWingRose();
    leftRose.position.set(-1.55, 0.105, -0.1);
    leftRose.scale.setScalar(0.9);
    leftRose.rotation.x = -Math.PI / 2;
    leftWing.add(leftRose);
    this.plane.add(leftWing);
    this.disposables.push(leftWingGeometry);

    // Winglets.
    for (const side of [-1, 1]) {
      const wingletGeometry = new THREE.BoxGeometry(0.05, 0.34, 0.5);
      const winglet = new THREE.Mesh(wingletGeometry, gold);
      winglet.position.set(side * 2.95, 0.17, -0.58);
      winglet.rotation.z = side * -0.22;
      this.plane.add(winglet);
      this.disposables.push(wingletGeometry);
    }

    // Navigation lights: red (left) and green (right).
    for (const spec of [
      { side: -1, color: 0xff2b2b, emissive: 0xff1010 },
      { side: 1, color: 0x31ff5a, emissive: 0x12ff3a },
    ] as const) {
      const lightGeometry = new THREE.SphereGeometry(0.05, 14, 14);
      const lightMaterial = new THREE.MeshStandardMaterial({
        color: spec.color,
        emissive: spec.emissive,
        emissiveIntensity: 2.2,
        roughness: 0.25,
        metalness: 0.1,
        toneMapped: false,
      });
      const light = new THREE.Mesh(lightGeometry, lightMaterial);
      light.position.set(spec.side * 3.02, 0.18, -0.58);
      this.plane.add(light);
      this.navLights.push(lightMaterial);
      this.disposables.push(lightGeometry, lightMaterial);
    }

    // Engines.
    for (const side of [-1, 1]) {
      const nacelleGeometry = new THREE.CylinderGeometry(0.2, 0.235, 0.86, 24, 1, true);
      nacelleGeometry.rotateX(Math.PI / 2);
      const nacelle = new THREE.Mesh(nacelleGeometry, engine);
      nacelle.position.set(side * 1.18, -0.2, 0.02);
      nacelle.castShadow = true;
      this.plane.add(nacelle);
      this.disposables.push(nacelleGeometry);

      const intakeGeometry = new THREE.TorusGeometry(0.2, 0.035, 12, 28);
      const intake = new THREE.Mesh(intakeGeometry, engine);
      intake.position.set(side * 1.18, -0.2, 0.45);
      this.plane.add(intake);
      this.disposables.push(intakeGeometry);

      const fanGeometry = new THREE.CircleGeometry(0.185, 28);
      const fan = new THREE.Mesh(fanGeometry, engineDark);
      fan.position.set(side * 1.18, -0.2, 0.445);
      this.plane.add(fan);
      this.engineFans.push(fan);
      this.disposables.push(fanGeometry);

      const pylonGeometry = new THREE.BoxGeometry(0.09, 0.22, 0.52);
      const pylon = new THREE.Mesh(pylonGeometry, pearl);
      pylon.position.set(side * 1.14, 0.0, -0.02);
      this.plane.add(pylon);
      this.disposables.push(pylonGeometry);
    }

    // Vertical stabiliser.
    const finShape = new THREE.Shape();
    finShape.moveTo(-1.98, 0.04);
    finShape.lineTo(-1.02, 0.04);
    finShape.lineTo(-1.5, 0.92);
    finShape.lineTo(-1.82, 0.92);
    finShape.closePath();
    const finGeometry = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.02,
      bevelSegments: 2,
      steps: 1,
    });
    finGeometry.rotateY(-Math.PI / 2);
    finGeometry.translate(0.035, 0, 0);
    const fin = new THREE.Mesh(finGeometry, body);
    fin.castShadow = true;
    this.plane.add(fin);
    this.disposables.push(finGeometry);

    // Horizontal stabilisers.
    for (const side of [-1, 1]) {
      const stabiliserGeometry = wingGeometry.clone();
      stabiliserGeometry.scale(side * 0.34, 0.34, 0.34);
      const stabiliser = new THREE.Mesh(stabiliserGeometry, pearl);
      stabiliser.position.set(side * 0.02, 0.06, -1.58);
      this.plane.add(stabiliser);
      this.disposables.push(stabiliserGeometry);
    }

    // Tail light.
    const lightGeometry = new THREE.SphereGeometry(0.055, 12, 12);
    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffb0a0, toneMapped: false });
    const tailLight = new THREE.Mesh(lightGeometry, lightMaterial);
    tailLight.position.set(0, -0.02, -2.06);
    this.plane.add(tailLight);
    this.disposables.push(lightGeometry, lightMaterial);

    // Cargo hold and hinged door.
    const holdMaterial = new THREE.MeshStandardMaterial({
      color: 0x241b20,
      metalness: 0.25,
      roughness: 0.92,
    });
    const holdGeometry = new THREE.BoxGeometry(0.014, 0.42, 0.58);
    const hold = new THREE.Mesh(holdGeometry, holdMaterial);
    hold.position.set(0.424, 0.0, 0.72);
    this.plane.add(hold);
    this.disposables.push(holdGeometry, holdMaterial);

    const doorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf7ece8,
      metalness: 0.22,
      roughness: 0.32,
      clearcoat: 0.7,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1.05,
    });
    this.cargoDoorPivot = new THREE.Group();
    this.cargoDoorPivot.position.set(0.432, 0.22, 0.72);
    const doorGeometry = new THREE.BoxGeometry(0.018, 0.46, 0.58);
    const doorPanel = new THREE.Mesh(doorGeometry, doorMaterial);
    doorPanel.position.y = -0.23;
    doorPanel.castShadow = true;
    this.cargoDoorPivot.add(doorPanel);
    this.plane.add(this.cargoDoorPivot);
    this.disposables.push(doorGeometry, doorMaterial);

    // Plain blush cargo box with a gold ribbon cross.
    const cargoMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1b4c5,
      metalness: 0.08,
      roughness: 0.52,
      envMapIntensity: 0.9,
    });
    const ribbonMaterial = new THREE.MeshStandardMaterial({
      color: 0xe7c98f,
      metalness: 0.8,
      roughness: 0.3,
      envMapIntensity: 1.1,
    });
    const boxSize = 0.24;
    this.cargoBox = new THREE.Group();
    const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize * 0.92, boxSize);
    const boxMesh = new THREE.Mesh(boxGeometry, cargoMaterial);
    boxMesh.castShadow = true;
    this.cargoBox.add(boxMesh);
    const bandA = new THREE.Mesh(
      new THREE.BoxGeometry(boxSize + 0.006, boxSize * 0.16, boxSize + 0.006),
      ribbonMaterial,
    );
    const bandB = new THREE.Mesh(
      new THREE.BoxGeometry(boxSize * 0.16, boxSize * 0.94, boxSize + 0.006),
      ribbonMaterial,
    );
    this.cargoBox.add(bandA, bandB);
    this.cargoBoxHome.set(1.22, 0.12, 0.72);
    this.cargoBoxTarget.set(0.3, 0.02, 0.72);
    this.cargoBoxUnload.set(1.46, -0.54, 0.72);
    this.cargoBox.position.copy(this.cargoBoxHome);
    this.plane.add(this.cargoBox);
    this.disposables.push(boxGeometry, cargoMaterial, ribbonMaterial);

    // Landing gear, hidden once airborne.
    this.landingGear = new THREE.Group();
    const gearMaterial = new THREE.MeshStandardMaterial({
      color: 0x26232a,
      metalness: 0.7,
      roughness: 0.42,
    });
    const strutGeometry = new THREE.CylinderGeometry(0.018, 0.018, 0.36, 7);
    const wheelGeometry = new THREE.CylinderGeometry(0.085, 0.085, 0.055, 12);
    wheelGeometry.rotateZ(Math.PI / 2);
    for (const gear of [
      { x: 0, z: 1.35 },
      { x: -0.56, z: -0.28 },
      { x: 0.56, z: -0.28 },
    ]) {
      const strut = new THREE.Mesh(strutGeometry, gearMaterial);
      strut.position.set(gear.x, -0.55, gear.z);
      this.landingGear.add(strut);
      const wheel = new THREE.Mesh(wheelGeometry, gearMaterial);
      wheel.position.set(gear.x, -0.73, gear.z);
      this.landingGear.add(wheel);
    }
    this.plane.add(this.landingGear);
    this.disposables.push(strutGeometry, wheelGeometry, gearMaterial);

    this.plane.scale.setScalar(0.92);
  }

  setTakeoff(value: number) {
    if (this.disposed) return;
    const u = clamp01(value);
    if (u >= 1) {
      this.setProgress(0);
      return;
    }

    const dir = this.takeoffDir;
    const roll = smoothstep(0.08, 0.36, u);
    const taxi = smoothstep(0.34, 0.72, u);
    const accel = smoothstep(0.62, 0.9, u);
    const travel = 26 * (roll * 0.18 + taxi * 0.42 + accel * 0.4 + smoothstep(0.88, 1, u) * 0.12);
    const groundPoint = this.takeoffStart.clone().addScaledVector(dir, travel);
    groundPoint.y = this.groundY + 0.58;
    const climb = smoothstep(0.66, 1, u);
    const position = groundPoint.lerp(this.cruisePlanePosition, climb);
    const idleBob = Math.sin(u * Math.PI * 10) * 0.012 * (1 - climb);
    position.y += idleBob;
    this.plane.position.copy(position);

    const pitch = smoothstep(0.64, 0.92, u) * 0.44;
    const groundRotation = this.groundQuaternion
      .clone()
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-pitch, 0, 0)));
    groundRotation.slerp(this.cruisePlaneQuaternion, smoothstep(0.86, 1, u));
    this.plane.quaternion.copy(groundRotation);

    const doorOpen = smoothstep(0.02, 0.15, u) * (1 - smoothstep(0.24, 0.33, u));
    this.cargoDoorPivot.rotation.z = doorOpen * 1.06;

    const load = smoothstep(0.08, 0.24, u);
    this.cargoBox.position.lerpVectors(this.cargoBoxHome, this.cargoBoxTarget, load);
    this.cargoBox.rotation.y = -0.18 * (1 - load);
    this.cargoBox.visible = u < 0.32;

    const loaderOut = smoothstep(0.28, 0.45, u);
    this.loaderGroup.position.y = this.groundY - loaderOut * 1.3;
    this.setLoaderFade(1 - loaderOut);

    const airportFade = 1 - smoothstep(0.46, 0.88, u);
    this.setAirportFade(airportFade);
    this.setSkylineFade('paris', 0);
    this.setSkylineFade('dubai', 1 - 0.78 * smoothstep(0.32, 1, u));
    if (this.sunSprite) (this.sunSprite.material as THREE.SpriteMaterial).opacity = 0.7;
    if (this.moonSprite) { this.moonSprite.visible = false; (this.moonSprite.material as THREE.SpriteMaterial).opacity = 0; }

    this.landingGear.visible = u < 0.84;

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.groundQuaternion);
    const forward = dir.clone();
    const drift = Math.sin(u * Math.PI * 2) * 0.18;
    const loadCamera = this.takeoffStart
      .clone()
      .addScaledVector(right, (this.mobile ? 8.8 : 7.2) + drift)
      .add(new THREE.Vector3(0, this.mobile ? 3.0 : 2.5, 0))
      .addScaledVector(forward, (this.mobile ? 5.8 : 4.8) + smoothstep(0, 0.35, u) * 1.1);
    const loadTarget = this.takeoffStart
      .clone()
      .addScaledVector(right, 0.2)
      .add(new THREE.Vector3(0, 0.68, 0))
      .addScaledVector(forward, 0.55 + smoothstep(0, 0.35, u) * 0.4);

    const chaseCamera = position
      .clone()
      .addScaledVector(right, this.mobile ? 7.8 : 6.6)
      .add(new THREE.Vector3(0, this.mobile ? 3.8 : 3.1, 0))
      .addScaledVector(forward, this.mobile ? -13 : -11.5);
    const chaseTarget = position
      .clone()
      .addScaledVector(forward, 4)
      .add(new THREE.Vector3(0, 1.35, 0));

    const follow = smoothstep(0.3, 0.66, u);
    const handover = smoothstep(0.7, 1, u);
    const cameraPosition = loadCamera
      .lerp(chaseCamera, follow)
      .lerp(this.cruiseCameraPosition, handover);
    const lookTarget = loadTarget.lerp(chaseTarget, follow).lerp(this.cruiseLookAt, handover);

    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(lookTarget);
    this.camera.getWorldDirection(this.skylineView);
    this.placeSkylineAhead('dubai', this.plane.position, this.skylineView);

    const nearMap = (this.cloudNear.material as THREE.MeshBasicMaterial).map;
    const farMap = (this.cloudFar.material as THREE.MeshBasicMaterial).map;
    if (nearMap) nearMap.offset.x = u * 0.12;
    if (farMap) farMap.offset.x = u * 0.07;
    if (this.trail) this.trail.visible = false;

    const throttle = smoothstep(0.06, 0.24, u) * 0.45 + smoothstep(0.24, 0.72, u) * 0.35 + smoothstep(0.72, 1, u) * 0.5;
    const backDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.plane.quaternion).normalize();
    if (this.exhaust) this.updateExhaust(throttle, backDir, 0.05 + throttle * 0.06);
    const fanSpin = performance.now() * 0.001 * (1.5 + throttle * 22);
    this.engineFans.forEach((fan) => {
      fan.rotation.z = fanSpin;
    });
    const blink = (performance.now() / 320) % 1 < 0.18 ? 2.6 : 0.08;
    this.navLights.forEach((m) => { m.emissiveIntensity = blink; });

    this.render();
  }

  setProgress(value: number) {
    if (this.disposed) return;
    const t = clamp01(value);
    this.progress = t;
    this.setAirportFade(0);
    this.setLoaderFade(0);

    const touchdownAt = 0.84;
    const roll = smoothstep(touchdownAt, 1, t);
    const landBlend = smoothstep(0.68, touchdownAt, t);
    const unload = smoothstep(0.9, 0.995, t);
    const rollDistance = roll * 58;

    if (t < 0.86) {
      this.cargoDoorPivot.rotation.z = 0;
      this.cargoBox.visible = false;
      this.cargoBox.position.copy(this.cargoBoxTarget);
      this.cargoBox.rotation.y = 0;
    } else {
      this.cargoDoorPivot.rotation.z = unload * 1.12;
      this.cargoBox.visible = true;
      this.cargoBox.position.lerpVectors(this.cargoBoxTarget, this.cargoBoxUnload, unload);
      this.cargoBox.rotation.y = unload * 0.22;
    }

    this.setParisFade(smoothstep(0.74, 0.88, t));
    this.setSkylineFade('dubai', 0.22 * (1 - smoothstep(0, 0.12, t)));
    this.setSkylineFade('paris', smoothstep(0.74, 0.88, t));
    const moonIn = smoothstep(0.68, 0.96, t);
    if (this.sunSprite) {
      (this.sunSprite.material as THREE.SpriteMaterial).opacity = 0.7 * (1 - 0.95 * moonIn);
    }
    if (this.moonSprite) {
      this.moonSprite.visible = moonIn > 0.001;
      (this.moonSprite.material as THREE.SpriteMaterial).opacity = moonIn;
    }
    this.landingGear.visible = t > 0.62;
    if (this.trail) this.trail.visible = !this.reduced && t < 0.86;
    if (this.exhaust) {
      this.exhaust.visible = false;
      (this.exhaust.material as THREE.PointsMaterial).opacity = 0;
    }

    const point = this.curve.getPointAt(t);
    const tangent = this.curve.getTangentAt(t).normalize();
    const nextTangent = this.curve.getTangentAt(Math.min(1, t + 0.012)).normalize();
    const flat = tangent.clone().setY(0).normalize();
    const runwayFlat = this.parisDir.lengthSq() > 0 ? this.parisDir.clone() : flat;

    const bob = Math.sin(t * Math.PI * 6.2) * 0.09 * (1 - landBlend);
    const touchdownY = this.parisSurfaceY + 0.672;
    this.plane.position.set(
      point.x + runwayFlat.x * rollDistance,
      point.y + (touchdownY - point.y) * landBlend + bob,
      point.z + runwayFlat.z * rollDistance,
    );
    this.plane.up.set(0, 1, 0);
    const lookDir = tangent
      .clone()
      .lerp(runwayFlat, smoothstep(0.7, 0.9, t))
      .normalize();
    this.plane.lookAt(this.plane.position.clone().add(lookDir));

    const flare = smoothstep(0.82, 0.9, t) * (1 - smoothstep(0.9, 0.98, t));
    this.plane.rotateX(-0.045 * flare);

    const turn = new THREE.Vector3().crossVectors(tangent, nextTangent);
    const bank = THREE.MathUtils.clamp(-turn.y * 26, -0.62, 0.62) * (1 - landBlend);
    this.plane.rotateZ(bank);

    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const orbit = -0.45 + t * 1.55;
    const distance = 20.5 - Math.sin(t * Math.PI) * 6.5;
    const behind = Math.cos(orbit) * distance;
    const side = Math.sin(orbit) * distance;
    const height = 5.8 + Math.sin(t * Math.PI) * 1.6 + Math.cos(t * Math.PI * 2) * 0.5 - landBlend * 2.6;

    const orbitCamPos = this.plane.position
      .clone()
      .add(tangent.clone().multiplyScalar(-behind))
      .add(right.clone().multiplyScalar(side))
      .add(new THREE.Vector3(0, height, 0));
    const orbitLook = this.plane.position
      .clone()
      .add(lookDir.clone().multiplyScalar(3.4))
      .add(new THREE.Vector3(0, 0.9, 0));

    const chaseIn = smoothstep(0.76, 0.9, t);
    const chaseCamPos = this.plane.position
      .clone()
      .addScaledVector(runwayFlat, -22)
      .add(new THREE.Vector3(0, 6.4, 0));
    const chaseLook = this.plane.position
      .clone()
      .addScaledVector(runwayFlat, 32)
      .add(new THREE.Vector3(0, 3.0, 0));

    const cameraPosition = orbitCamPos.lerp(chaseCamPos, chaseIn);
    const look = orbitLook.lerp(chaseLook, chaseIn);

    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(look);
    this.cruiseLookAt.copy(look);
    if (this.sunSprite) {
      const parisBlend = smoothstep(0.7, 0.9, t);
      const viewDir = look.clone().sub(cameraPosition).setY(0).normalize();
      const camRight = new THREE.Vector3().crossVectors(viewDir, new THREE.Vector3(0, 1, 0)).normalize();
      const cruiseSun = new THREE.Vector3(120, 46, -180);
      const parisSun = cameraPosition
        .clone()
        .add(viewDir.multiplyScalar(220))
        .add(camRight.multiplyScalar(95))
        .add(new THREE.Vector3(0, 70, 0));
      this.sunSprite.position.copy(cruiseSun.lerp(parisSun, parisBlend));
    }
    if (this.moonSprite) {
      const viewDirM = look.clone().sub(cameraPosition).normalize();
      const camRightM = new THREE.Vector3().crossVectors(viewDirM, this.camera.up).normalize();
      const camUpM = new THREE.Vector3().crossVectors(camRightM, viewDirM).normalize();
      this.moonSprite.position
        .copy(cameraPosition)
        .addScaledVector(viewDirM, 120)
        .addScaledVector(camRightM, 38)
        .addScaledVector(camUpM, 28);
    }
    if (t < 0.13) {
      this.camera.getWorldDirection(this.skylineView);
      this.placeSkylineAhead('dubai', this.plane.position, this.skylineView);
    }

    this.updateTrail(t);

    const nearMap = (this.cloudNear.material as THREE.MeshBasicMaterial).map;
    const farMap = (this.cloudFar.material as THREE.MeshBasicMaterial).map;
    if (nearMap) nearMap.offset.x = this.progress * (this.cloudNear.userData.speed as number);
    if (farMap) farMap.offset.x = this.progress * (this.cloudFar.userData.speed as number);

    const fanSpeed = t < 0.86 ? 22 : 22 * (1 - smoothstep(0.86, 1, t)) + 1.2;
    const fanSpin = performance.now() * 0.001 * fanSpeed;
    this.engineFans.forEach((fan) => {
      fan.rotation.z = fanSpin;
    });
    const blink = (performance.now() / 320) % 1 < 0.18 ? 2.6 : 0.08;
    this.navLights.forEach((m) => { m.emissiveIntensity = blink; });
    this.updateCitySparks();

    this.render();
  }

  resize() {
    if (this.disposed) return;
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.render();
  }

  render() {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.environment.dispose();
    this.pmrem.dispose();
    this.cloudTextures.forEach((texture) => texture.dispose());
    this.disposables.forEach((item) => item.dispose());
    this.scene.environment = null;
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
  }
}
