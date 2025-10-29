import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls, Text, Float, Sparkles, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useUser } from "@/lib/stores/useUser";

// Modal openers
const openCashierModal = () => {
  const event = new CustomEvent('openCashierModal');
  window.dispatchEvent(event);
};

const openSlotMachineModal = (machineNumber: number) => {
  const event = new CustomEvent('openSlotMachineModal', { detail: { machineNumber } });
  window.dispatchEvent(event);
};

// Enhanced Floor with reflective surface
function CasinoFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={2048}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050505"
        metalness={0.5}
      />
    </mesh>
  );
}

// Enhanced Walls with neon trim
function CasinoWalls() {
  return (
    <group>
      {/* Back Wall */}
      <mesh position={[0, 5, -40]} castShadow receiveShadow>
        <boxGeometry args={[80, 10, 1]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Neon trim for back wall */}
      <mesh position={[0, 9.5, -39.9]}>
        <boxGeometry args={[80, 0.2, 0.1]} />
        <meshBasicMaterial color="#00ff88" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-40, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 10, 80]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[40, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 10, 80]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

// Enhanced Slot Machine with glow effects
function SlotMachine({ position, number, onClick }: { position: [number, number, number], number: number, onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      if (hovered) {
        meshRef.current.scale.setScalar(1.05 + Math.sin(state.clock.elapsedTime * 8) * 0.02);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2, 3, 1.5]} />
          <meshStandardMaterial 
            color={hovered ? "#ffd700" : "#c41e3a"} 
            roughness={0.1} 
            metalness={0.8}
            emissive={hovered ? "#ff4400" : "#220000"}
            emissiveIntensity={hovered ? 0.3 : 0.1}
          />
        </mesh>

        {/* Neon glow around slot machine */}
        <mesh position={[0, 0, 0.76]}>
          <boxGeometry args={[2.2, 3.2, 0.1]} />
          <meshBasicMaterial 
            color="#00ff88" 
            transparent 
            opacity={hovered ? 0.8 : 0.3}
          />
        </mesh>

        {/* Sparkles around hovered machine */}
        {hovered && <Sparkles count={50} scale={5} size={3} speed={0.8} color="#ffd700" />}
      </Float>

      {/* Floating number above machine */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        {number}
      </Text>
    </group>
  );
}

// Enhanced Cashier Booth with premium materials
function CashierBooth({ position, onClick }: { position: [number, number, number], onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.03;
    }
  });

  return (
    <group position={position}>
      <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[4, 2.5, 2]} />
          <meshStandardMaterial 
            color={hovered ? "#ffd700" : "#4a90e2"} 
            roughness={0.1} 
            metalness={0.9}
            emissive={hovered ? "#ffaa00" : "#002244"}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Premium glow effect */}
        <mesh position={[0, 0, 1.1]}>
          <boxGeometry args={[4.2, 2.7, 0.1]} />
          <meshBasicMaterial 
            color="#4a90e2" 
            transparent 
            opacity={hovered ? 0.6 : 0.2}
          />
        </mesh>
      </Float>

      <Text
        position={[0, 2, 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.json"
      >
        💰 CASHIER 💰
      </Text>
    </group>
  );
}

// Enhanced lighting setup
function SceneLighting() {
  return (
    <>
      {/* Main ambient light */}
      <ambientLight intensity={0.3} color="#4a5568" />

      {/* Key spotlight from above */}
      <spotLight
        position={[0, 20, 0]}
        angle={Math.PI / 3}
        penumbra={0.3}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#ffffff"
      />

      {/* Colored rim lights */}
      <pointLight position={[-20, 10, -20]} intensity={0.8} color="#ff6b6b" />
      <pointLight position={[20, 10, -20]} intensity={0.8} color="#4ecdc4" />
      <pointLight position={[0, 10, 20]} intensity={0.8} color="#45b7d1" />

      {/* Neon accent lights */}
      <pointLight position={[-15, 5, -15]} intensity={1.2} color="#00ff88" />
      <pointLight position={[15, 5, -15]} intensity={1.2} color="#ff0088" />
    </>
  );
}

// Enhanced particle system
function CasinoParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 200;
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const y = i * 3 + 1;
        positions[y] += Math.sin(state.clock.elapsedTime + i) * 0.01;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#00ff88"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Player controls with mobile support
function PlayerControls() {
  const { camera, gl } = useThree();
  const [keys, setKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(event.code));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(event.code);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = 10 * delta;

    if (keys.has('KeyW') || keys.has('ArrowUp')) {
      camera.position.z -= speed;
    }
    if (keys.has('KeyS') || keys.has('ArrowDown')) {
      camera.position.z += speed;
    }
    if (keys.has('KeyA') || keys.has('ArrowLeft')) {
      camera.position.x -= speed;
    }
    if (keys.has('KeyD') || keys.has('ArrowRight')) {
      camera.position.x += speed;
    }

    // Constrain camera within casino bounds
    camera.position.x = Math.max(-35, Math.min(35, camera.position.x));
    camera.position.z = Math.max(-35, Math.min(35, camera.position.z));
    camera.position.y = Math.max(2, Math.min(15, camera.position.y));
  });

  return null;
}

// Main scene component
function Scene() {
  return (
    <>
      <PlayerControls />
      <SceneLighting />
      <CasinoFloor />
      <CasinoWalls />
      <CasinoParticles />

      {/* Cashier Booth */}
      <CashierBooth
        position={[0, 1.25, -25]}
        onClick={() => openCashierModal()}
      />

      {/* Slot Machines arranged in a casino layout */}
      {Array.from({ length: 10 }, (_, i) => (
        <SlotMachine
          key={i + 1}
          position={[
            ((i % 5) - 2) * 8,
            1.5,
            Math.floor(i / 5) * 10 - 5
          ]}
          number={i + 1}
          onClick={() => openSlotMachineModal(i + 1)}
        />
      ))}

      {/* Welcome text floating above */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <Text
          position={[0, 8, -15]}
          fontSize={3}
          color="#ffd700"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter.json"
        >
          🎰 JADE ROYALE 🎰
        </Text>
      </Float>
    </>
  );
}

// Canvas wrapper with enhanced settings
function CanvasWrapper() {
  return (
    <Canvas
      shadows
      camera={{ 
        position: [0, 5, 15], 
        fov: 60,
        near: 0.1,
        far: 1000
      }}
      gl={{ 
        antialias: true, 
        alpha: false,
        powerPreference: "high-performance",
        shadowMap: true
      }}
      onCreated={({ gl, scene }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.setClearColor('#000011');
        scene.fog = new THREE.Fog('#000011', 30, 80);
      }}
    >
      <Suspense fallback={null}>
        <Scene />
        <Environment preset="night" background={false} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={50}
        />
      </Suspense>
    </Canvas>
  );
}

export function CasinoScene() {
  return <CanvasWrapper />;
}