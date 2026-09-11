import * as THREE from "three";
import type { MeshParams } from "@/lib/mesh-params";
import { REGIONS, type Region } from "@/lib/types";

const RING = 28;
const SUBDIV = 4;

export interface Section {
  y: number;
  rx: number;
  rz: number;
  /** Depth toward the back (negative z). Defaults to rz. */
  rzBack?: number;
  cx?: number;
  cz?: number;
}

function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function refine(sections: Section[]): Section[] {
  const out: Section[] = [];
  const n = sections.length;
  const get = (i: number) => sections[Math.min(n - 1, Math.max(0, i))];
  const keys: (keyof Section)[] = ["y", "rx", "rz", "rzBack", "cx", "cz"];
  for (let i = 0; i < n - 1; i++) {
    for (let s = 0; s < SUBDIV; s++) {
      const t = s / SUBDIV;
      const sec: Section = { y: 0, rx: 0, rz: 0 };
      for (const k of keys) {
        const v = (j: number) => {
          const sec = get(j);
          const val = sec[k];
          if (val !== undefined) return val;
          return k === "rzBack" ? sec.rz : 0;
        };
        (sec as unknown as Record<string, number>)[k] = catmull(v(i - 1), v(i), v(i + 1), v(i + 2), t);
      }
      out.push(sec);
    }
  }
  const last = sections[n - 1];
  out.push({ ...last, rzBack: last.rzBack ?? last.rz, cx: last.cx ?? 0, cz: last.cz ?? 0 });
  return out;
}

/** A closed tube of elliptical cross-sections whose topology is fixed and whose vertices are rewritten each update. */
class Tube {
  readonly mesh: THREE.Mesh;
  private readonly geometry: THREE.BufferGeometry;
  private readonly positions: Float32Array;
  private readonly rings: number;

  constructor(nSections: number, material: THREE.Material) {
    this.rings = (nSections - 1) * SUBDIV + 1;
    const vertexCount = this.rings * RING + 2;
    this.positions = new Float32Array(vertexCount * 3);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    const idx: number[] = [];
    for (let r = 0; r < this.rings - 1; r++) {
      for (let j = 0; j < RING; j++) {
        const a = r * RING + j;
        const b = r * RING + ((j + 1) % RING);
        const c = (r + 1) * RING + j;
        const d = (r + 1) * RING + ((j + 1) % RING);
        idx.push(a, c, b, b, c, d);
      }
    }
    const top = vertexCount - 2;
    const bottom = vertexCount - 1;
    for (let j = 0; j < RING; j++) {
      idx.push(top, j, (j + 1) % RING);
      const base = (this.rings - 1) * RING;
      idx.push(bottom, base + ((j + 1) % RING), base + j);
    }
    this.geometry.setIndex(idx);
    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.castShadow = true;
  }

  update(sections: Section[]) {
    const fine = refine(sections);
    const p = this.positions;
    for (let r = 0; r < fine.length; r++) {
      const s = fine[r];
      const cx = s.cx ?? 0;
      const cz = s.cz ?? 0;
      const rzBack = s.rzBack ?? s.rz;
      for (let j = 0; j < RING; j++) {
        const a = (j / RING) * Math.PI * 2;
        const sin = Math.sin(a);
        const o = (r * RING + j) * 3;
        p[o] = cx + s.rx * Math.cos(a);
        p[o + 1] = s.y;
        p[o + 2] = cz + (sin >= 0 ? s.rz : rzBack) * sin;
      }
    }
    const first = fine[0];
    const last = fine[fine.length - 1];
    const top = (this.rings * RING) * 3;
    p[top] = first.cx ?? 0;
    p[top + 1] = first.y;
    p[top + 2] = first.cz ?? 0;
    p[top + 3] = last.cx ?? 0;
    p[top + 4] = last.y;
    p[top + 5] = last.cz ?? 0;
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
    this.geometry.computeBoundingSphere();
  }
}

const SPHERE_GEO = new THREE.SphereGeometry(1, 24, 18);

const NEUTRAL = new THREE.Color("#5c6270");
const WARM = new THREE.Color("#ffb347");
const HOT = new THREE.Color("#ff4d6d");

export class BodyRig {
  readonly group = new THREE.Group();
  private readonly materials: Record<Region | "skin", THREE.MeshStandardMaterial>;
  private readonly torso: Tube;
  private readonly neck: Tube;
  private readonly head: THREE.Mesh;
  private readonly deltoid: [THREE.Mesh, THREE.Mesh];
  private readonly pec: [THREE.Mesh, THREE.Mesh];
  private readonly glute: [THREE.Mesh, THREE.Mesh];
  private readonly upperArm: [Tube, Tube];
  private readonly forearm: [Tube, Tube];
  private readonly hand: [THREE.Mesh, THREE.Mesh];
  private readonly thigh: [Tube, Tube];
  private readonly calf: [Tube, Tube];
  private readonly foot: [THREE.Mesh, THREE.Mesh];
  private skin = new THREE.Color("#d9a684");

  constructor() {
    const mk = () =>
      new THREE.MeshStandardMaterial({ color: this.skin, roughness: 0.55, metalness: 0.02 });
    this.materials = Object.fromEntries([...REGIONS, "skin"].map((r) => [r, mk()])) as Record<
      Region | "skin",
      THREE.MeshStandardMaterial
    >;
    const m = this.materials;
    const sphere = (mat: THREE.Material) => {
      const mesh = new THREE.Mesh(SPHERE_GEO, mat);
      mesh.castShadow = true;
      return mesh;
    };
    const pair = <T>(f: () => T): [T, T] => [f(), f()];

    this.torso = new Tube(8, m.core);
    this.neck = new Tube(2, m.skin);
    this.head = sphere(m.skin);
    this.deltoid = pair(() => sphere(m.shoulders));
    this.pec = pair(() => sphere(m.chest));
    this.glute = pair(() => sphere(m.glutes));
    this.upperArm = pair(() => new Tube(3, m.arms));
    this.forearm = pair(() => new Tube(3, m.arms));
    this.hand = pair(() => sphere(m.skin));
    this.thigh = pair(() => new Tube(4, m.quads));
    this.calf = pair(() => new Tube(4, m.calves));
    this.foot = pair(() => sphere(m.skin));

    const all: THREE.Object3D[] = [
      this.torso.mesh,
      this.neck.mesh,
      this.head,
      ...this.deltoid,
      ...this.pec,
      ...this.glute,
      ...this.upperArm.map((t) => t.mesh),
      ...this.forearm.map((t) => t.mesh),
      ...this.hand,
      ...this.thigh.map((t) => t.mesh),
      ...this.calf.map((t) => t.mesh),
      ...this.foot,
    ];
    for (const o of all) this.group.add(o);
  }

  setSkin(hex: string) {
    this.skin.set(hex);
  }

  update(p: MeshParams, time: number, glow: Partial<Record<Region, number>> = {}) {
    const breathe = 1 + 0.012 * Math.sin(time * 1.4);
    const lift = 0.003 * Math.sin(time * 1.4);
    const y = p.y;

    this.torso.update([
      { y: y.shoulder + 0.02 + lift, rx: p.chestRx * 0.7, rz: p.chestRz * 0.7, rzBack: p.chestRz * 0.7 },
      { y: y.shoulder + lift, rx: p.chestRx * 0.97, rz: p.chestRz * 0.9 * breathe, rzBack: (p.chestRz + p.backBulge) * breathe },
      { y: y.chest + lift * 0.5, rx: p.chestRx * breathe, rz: p.chestRz * breathe, rzBack: (p.chestRz + p.backBulge * 1.2) * breathe },
      { y: y.midriff, rx: (p.chestRx + p.waistRx) / 2, rz: (p.chestRz + p.waistRz) / 2, rzBack: (p.chestRz + p.waistRz) / 2 + p.backBulge * 0.6 },
      { y: y.waist, rx: p.waistRx, rz: p.waistRz, rzBack: p.waistRz * 0.95 },
      { y: y.upperHip, rx: (p.waistRx + p.hipRx) / 2, rz: (p.waistRz + p.hipRz) / 2, rzBack: (p.waistRz + p.hipRz) / 2 },
      { y: y.hip, rx: p.hipRx, rz: p.hipRz * 0.95, rzBack: p.hipRz },
      { y: y.crotch, rx: p.hipRx * 0.9, rz: p.hipRz * 0.8, rzBack: p.hipRz * 0.85 },
    ]);

    this.neck.update([
      { y: y.chin - 0.01, rx: p.neckR, rz: p.neckR },
      { y: y.shoulder + 0.01 + lift, rx: p.neckR * 1.25, rz: p.neckR * 1.2 },
    ]);
    this.head.position.set(0, y.head, 0.005);
    this.head.scale.set(p.headR, p.headR * 1.22, p.headR * 1.05);

    for (const side of [0, 1] as const) {
      const sx = side === 0 ? -1 : 1;
      const shoulderX = sx * p.shoulderHalfWidth;
      const armX = shoulderX + sx * p.deltoidR * 0.35;

      this.deltoid[side].position.set(shoulderX, y.shoulder - p.deltoidR * 0.25 + lift, 0);
      this.deltoid[side].scale.set(p.deltoidR, p.deltoidR * 1.05, p.deltoidR * 0.95);

      this.pec[side].position.set(sx * p.chestRx * 0.45, y.chest + 0.01 + lift * 0.5, p.chestRz * 0.45);
      this.pec[side].scale.set(p.pecR * 1.05, p.pecR * 0.75, p.pecR * 0.9);

      this.glute[side].position.set(sx * p.hipRx * 0.4, y.hip - 0.015, -p.hipRz * 0.62);
      this.glute[side].scale.set(p.gluteR * 0.8, p.gluteR * 0.85, p.gluteR * 0.75);

      const elbowX = armX + sx * 0.035;
      const wristX = elbowX + sx * 0.04;
      this.upperArm[side].update([
        { y: y.shoulder - p.deltoidR * 0.6 + lift, rx: p.upperArmR * 1.05, rz: p.upperArmR * 1.1, cx: armX },
        { y: (y.shoulder + y.elbow) / 2, rx: p.upperArmR, rz: p.upperArmR * 1.08, cx: (armX + elbowX) / 2 },
        { y: y.elbow, rx: p.upperArmR * 0.8, rz: p.upperArmR * 0.82, cx: elbowX },
      ]);
      this.forearm[side].update([
        { y: y.elbow + 0.01, rx: p.forearmR * 0.9, rz: p.forearmR * 0.9, cx: elbowX },
        { y: y.elbow - (y.elbow - y.wrist) * 0.3, rx: p.forearmR, rz: p.forearmR, cx: elbowX + (wristX - elbowX) * 0.3 },
        { y: y.wrist, rx: p.wristR, rz: p.wristR * 0.85, cx: wristX },
      ]);
      this.hand[side].position.set(wristX + sx * 0.01, y.wrist - 0.075, 0);
      this.hand[side].scale.set(p.wristR * 1.2, 0.085, p.wristR * 0.6);

      const legX = sx * p.hipRx * 0.5;
      const kneeX = sx * p.hipRx * 0.42;
      const ankleX = sx * p.hipRx * 0.4;
      this.thigh[side].update([
        { y: y.hip - 0.01, rx: p.thighRx * 1.05, rz: p.thighRz * 1.05, rzBack: p.thighRz * 1.1, cx: legX },
        { y: y.crotch - 0.03, rx: p.thighRx, rz: p.thighRz, rzBack: p.thighRz * 1.08, cx: legX },
        { y: y.knee + (y.crotch - y.knee) * 0.4, rx: p.thighRx * 0.85, rz: p.thighRz * 0.9, rzBack: p.thighRz * 0.9, cx: (legX + kneeX) / 2 },
        { y: y.knee, rx: p.kneeR, rz: p.kneeR * 1.05, cx: kneeX },
      ]);
      this.calf[side].update([
        { y: y.knee + 0.01, rx: p.kneeR * 0.95, rz: p.kneeR, cx: kneeX },
        { y: y.knee - (y.knee - y.ankle) * 0.28, rx: p.calfR, rz: p.calfR * 0.95, rzBack: p.calfR * 1.15, cx: (kneeX + ankleX) / 2 },
        { y: y.knee - (y.knee - y.ankle) * 0.65, rx: p.calfR * 0.78, rz: p.calfR * 0.75, cx: ankleX },
        { y: y.ankle, rx: p.ankleR, rz: p.ankleR, cx: ankleX },
      ]);
      this.foot[side].position.set(ankleX, y.ankle * 0.55, 0.045);
      this.foot[side].scale.set(p.ankleR * 1.3, y.ankle * 0.6, 0.11);
    }

    this.applyColors(p.heat, glow);
  }

  private applyColors(heat: Record<Region, number> | null, glow: Partial<Record<Region, number>>) {
    const tmp = new THREE.Color();
    for (const r of REGIONS) {
      const mat = this.materials[r];
      if (heat) {
        const v = Math.min(1, heat[r]);
        if (v < 0.5) tmp.copy(NEUTRAL).lerp(WARM, v * 2);
        else tmp.copy(WARM).lerp(HOT, (v - 0.5) * 2);
        mat.color.copy(tmp);
        mat.roughness = 0.4;
      } else {
        mat.color.copy(this.skin);
        mat.roughness = 0.55;
      }
      const g = glow[r] ?? 0;
      mat.emissive.set("#ff7a59");
      mat.emissiveIntensity = g * 0.9;
    }
    const skin = this.materials.skin;
    skin.color.copy(heat ? NEUTRAL : this.skin);
    skin.roughness = heat ? 0.4 : 0.55;
  }

  dispose() {
    for (const mat of Object.values(this.materials)) mat.dispose();
    this.group.traverse((o) => {
      if (o instanceof THREE.Mesh && o.geometry !== SPHERE_GEO) o.geometry.dispose();
    });
  }
}
