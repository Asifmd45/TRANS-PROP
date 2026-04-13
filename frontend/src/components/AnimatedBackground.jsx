import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─── Mouse-reactive particle swarm ────────────────────────────────────────────
function InteractiveParticles({ mouse }) {
  const points = useRef(null);
  const count = 600;

  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      [0.22, 0.74, 0.97],   // cyan
      [0.48, 0.32, 0.98],   // violet
      [0.98, 0.42, 0.62],   // pink
      [0.20, 0.83, 0.60],   // emerald
      [0.98, 0.75, 0.14],   // amber
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      vel[i * 3]     = (Math.random() - 0.5) * 0.004;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
      vel[i * 3 + 2] = 0;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3]     = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return [pos, vel, col];
  }, []);

  const posRef = useRef(new Float32Array(positions));

  useFrame((_, delta) => {
    if (!points.current) return;
    const buf = points.current.geometry.getAttribute("position");
    const [mx, my] = mouse.current;

    for (let i = 0; i < count; i++) {
      const ix = i * 3, iy = i * 3 + 1;
      const dx = mx * 14 - posRef.current[ix];
      const dy = my * 8  - posRef.current[iy];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 4) {
        velocities[ix] += dx * 0.0004;
        velocities[iy] += dy * 0.0004;
      }
      velocities[ix] *= 0.98;
      velocities[iy] *= 0.98;
      posRef.current[ix] += velocities[ix];
      posRef.current[iy] += velocities[iy];

      // wrap around
      if (posRef.current[ix] >  14) posRef.current[ix] = -14;
      if (posRef.current[ix] < -14) posRef.current[ix] =  14;
      if (posRef.current[iy] >   8) posRef.current[iy] =  -8;
      if (posRef.current[iy] <  -8) posRef.current[iy] =   8;

      buf.setXYZ(i, posRef.current[ix], posRef.current[iy], posRef.current[i * 3 + 2]);
    }
    buf.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.055} vertexColors transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

// ─── Slow-rotating wireframe spheres ──────────────────────────────────────────
function WireframeSpheres() {
  const g1 = useRef(null);
  const g2 = useRef(null);
  const g3 = useRef(null);

  useFrame((_, delta) => {
    if (g1.current) { g1.current.rotation.y += delta * 0.08; g1.current.rotation.x += delta * 0.04; }
    if (g2.current) { g2.current.rotation.y -= delta * 0.06; g2.current.rotation.z += delta * 0.03; }
    if (g3.current) { g3.current.rotation.x += delta * 0.05; g3.current.rotation.y += delta * 0.07; }
  });

  return (
    <>
      <mesh ref={g1} position={[-8, 2, -4]}>
        <icosahedronGeometry args={[3, 1]} />
        <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.08} />
      </mesh>
      <mesh ref={g2} position={[9, -2, -5]}>
        <octahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.07} />
      </mesh>
      <mesh ref={g3} position={[1, 4, -6]}>
        <icosahedronGeometry args={[2, 1]} />
        <meshBasicMaterial color="#f97316" wireframe transparent opacity={0.06} />
      </mesh>
    </>
  );
}

// ─── Aurora nebula planes ──────────────────────────────────────────────────────
function AuroraPlane() {
  const mesh = useRef(null);
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.material.opacity =
        0.04 + Math.sin(clock.getElapsedTime() * 0.3) * 0.02;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -8]} rotation={[0.2, 0, 0]}>
      <planeGeometry args={[40, 20]} />
      <meshBasicMaterial
        color="#3b0764"
        transparent
        opacity={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Scene wrapper ─────────────────────────────────────────────────────────────
function Scene({ mouse }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[5, 5, 3]}  intensity={0.4} color="#c084fc" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#38bdf8" />
      <AuroraPlane />
      <WireframeSpheres />
      <InteractiveParticles mouse={mouse} />
    </>
  );
}

// ─── Export ────────────────────────────────────────────────────────────────────
export default function AnimatedBackground() {
  const mouse = useRef([0, 0]);

  useEffect(() => {
    const handler = (e) => {
      mouse.current = [
        (e.clientX / window.innerWidth  - 0.5) * 2,
        -(e.clientY / window.innerHeight - 0.5) * 2,
      ];
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 75 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: false }}
      >
        <Scene mouse={mouse} />
      </Canvas>
    </div>
  );
}
