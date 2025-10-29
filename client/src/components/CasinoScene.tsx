import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useUser } from "@/lib/stores/useUser";

function CasinoFloor() {
  return (
    <group>
      {/* Main carpet floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#1a0f0f"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Casino center logo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial
          color="#10b981"
          roughness={0.2}
          metalness={0.8}
          emissive="#0a5d3a"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Walkway markers */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -15]} receiveShadow>
        <planeGeometry args={[60, 4]} />
        <meshStandardMaterial
          color="#ffd700"
          opacity={0.3}
          transparent
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 15]} receiveShadow>
        <planeGeometry args={[40, 4]} />
        <meshStandardMaterial
          color="#ffd700"
          opacity={0.3}
          transparent
        />
      </mesh>
    </group>
  );
}

function CasinoWalls() {
  const wallHeight = 12;
  const wallThickness = 0.5;
  const roomSize = 40;

  const wallMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#2a1810",
    roughness: 0.6,
    metalness: 0.1,
  }), []);

  const walls = [
    { position: [0, wallHeight / 2, -roomSize / 2], dimensions: [roomSize, wallHeight, wallThickness] },
    { position: [0, wallHeight / 2, roomSize / 2], dimensions: [roomSize, wallHeight, wallThickness] },
    { position: [-roomSize / 2, wallHeight / 2, 0], dimensions: [wallThickness, wallHeight, roomSize] },
    { position: [roomSize / 2, wallHeight / 2, 0], dimensions: [wallThickness, wallHeight, roomSize] }
  ];

  return (
    <group>
      {walls.map((wall, i) => (
        <mesh key={i} position={wall.position as [number, number, number]} receiveShadow castShadow>
          <boxGeometry args={wall.dimensions as [number, number, number]} />
          <primitive object={wallMaterial.clone()} />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh position={[0, wallHeight, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial
          color="#1a0f0a"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Casino entrance sign */}
      <Text
        position={[0, wallHeight - 2, -roomSize / 2 + 0.6]}
        fontSize={2}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
      >
        JADE ROYALE CASINO
      </Text>
    </group>
  );
}

interface GameObjectProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  modelPath: string;
  scale?: number;
  onClick?: () => void;
  label?: string;
  glowColor?: string;
}

function GameObject({
  position,
  rotation = [0, 0, 0],
  modelPath,
  scale = 1,
  onClick,
  label,
  glowColor = "#10b981"
}: GameObjectProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Create placeholder geometry based on model type
  const createPlaceholder = () => {
    if (modelPath.includes('slot-machine')) {
      return (
        <group>
          {/* Slot machine body */}
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1, 2, 0.8]} />
            <meshStandardMaterial color="#ff6b35" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Screen */}
          <mesh position={[0, 1.2, 0.41]}>
            <boxGeometry args={[0.8, 0.6, 0.1]} />
            <meshStandardMaterial color="#000000" emissive="#ffd700" emissiveIntensity={0.3} />
          </mesh>
          {/* Arm */}
          <mesh position={[0.6, 1, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.8]} />
            <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
          </mesh>
        </group>
      );
    } else if (modelPath.includes('fish-table')) {
      return (
        <group>
          {/* Table surface */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.1]} />
            <meshStandardMaterial color="#003d7a" metalness={0.2} roughness={0.8} />
          </mesh>
          {/* Screen */}
          <mesh position={[0, 0.86, 0]}>
            <cylinderGeometry args={[1.3, 1.3, 0.05]} />
            <meshStandardMaterial color="#000040" emissive="#00bfff" emissiveIntensity={0.2} />
          </mesh>
          {/* Base */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.5, 0.8, 0.8]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        </group>
      );
    } else if (modelPath.includes('cashier-booth')) {
      return (
        <group>
          {/* Booth structure */}
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[3, 3, 2]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          {/* Window */}
          <mesh position={[0, 2, 1.01]}>
            <boxGeometry args={[2, 1, 0.1]} />
            <meshStandardMaterial color="#87ceeb" transparent opacity={0.7} />
          </mesh>
          {/* Sign */}
          <mesh position={[0, 3.2, 1.01]}>
            <boxGeometry args={[2.5, 0.5, 0.1]} />
            <meshStandardMaterial color="#ffd700" />
          </mesh>
        </group>
      );
    } else if (modelPath.includes('pitbull-pirate')) {
      return (
        <group>
          {/* Body */}
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 1.5]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          {/* Head */}
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.4]} />
            <meshStandardMaterial color="#d2691e" />
          </mesh>
          {/* Pirate hat */}
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[0.5, 0.6]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          {/* Eye patch */}
          <mesh position={[0.2, 2.1, 0.35]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        </group>
      );
    }
    return null;
  };

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={hovered ? scale * 1.1 : scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {createPlaceholder()}

      {/* Glow effect */}
      {hovered && (
        <pointLight
          position={[0, 3, 0]}
          color={glowColor}
          intensity={15}
          distance={8}
        />
      )}

      {/* Label */}
      {hovered && label && (
        <Text
          position={[0, 4, 0]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineColor="#000000"
          outlineWidth={0.02}
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function CasinoGames() {
  const { setShowAuthModal, user } = useUser();

  const handleGameClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      window.location.href = "/coming-soon";
    }
  };

  const handleCashierClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      const event = new CustomEvent("openCashier");
      window.dispatchEvent(event);
    }
  };

  // 10 Slot machines arranged in two rows
  const slotPositions: [number, number, number][] = [
    // Front row (5 machines)
    [-16, 0, -10], [-8, 0, -10], [0, 0, -10], [8, 0, -10], [16, 0, -10],
    // Back row (5 machines)
    [-16, 0, -18], [-8, 0, -18], [0, 0, -18], [8, 0, -18], [16, 0, -18]
  ];

  // 6 Fish tables arranged in two rows
  const fishTablePositions: [number, number, number][] = [
    // Front row (3 tables)
    [-12, 0, 8], [0, 0, 8], [12, 0, 8],
    // Back row (3 tables)
    [-12, 0, 16], [0, 0, 16], [12, 0, 16]
  ];

  return (
    <>
      {/* 10 Slot Machines */}
      {slotPositions.map((pos, i) => (
        <GameObject
          key={`slot-${i}`}
          position={pos}
          rotation={[0, 0, 0]}
          modelPath="/models/slot-machine.glb"
          scale={2}
          onClick={handleGameClick}
          label={`Slot Machine ${i + 1}`}
          glowColor="#ffd700"
        />
      ))}

      {/* 6 Fish Table Games */}
      {fishTablePositions.map((pos, i) => (
        <GameObject
          key={`fish-${i}`}
          position={pos}
          rotation={[0, 0, 0]}
          modelPath="/models/fish-table.glb"
          scale={2.5}
          onClick={handleGameClick}
          label={`Fish Hunter Table ${i + 1}`}
          glowColor="#00bfff"
        />
      ))}

      {/* Cashier Booth */}
      <GameObject
        position={[0, 0, -25]}
        rotation={[0, 0, 0]}
        modelPath="/models/cashier-booth.glb"
        scale={3}
        onClick={handleCashierClick}
        label="Cashier Booth"
        glowColor="#10b981"
      />

      {/* Pirate Captain (Pitbull Dog) */}
      <GameObject
        position={[0, 0, -23]}
        rotation={[0, 0, 0]}
        modelPath="/models/pitbull-pirate.glb"
        scale={2}
        onClick={handleCashierClick}
        label="Captain Pitbull - Cashier"
        glowColor="#ff6b35"
      />
    </>
  );
}

function CasinoLighting() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} color="#fff8dc" />

      {/* Main overhead lighting */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-camera-far={50}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Slot machine area lighting */}
      <spotLight
        position={[0, 15, -14]}
        target-position={[0, 0, -14]}
        angle={0.8}
        penumbra={0.5}
        intensity={50}
        color="#ffd700"
        castShadow
      />

      {/* Fish table area lighting */}
      <spotLight
        position={[0, 15, 12]}
        target-position={[0, 0, 12]}
        angle={0.8}
        penumbra={0.5}
        intensity={50}
        color="#00bfff"
        castShadow
      />

      {/* Cashier booth dramatic lighting */}
      <spotLight
        position={[0, 18, -20]}
        target-position={[0, 0, -24]}
        angle={0.4}
        penumbra={0.3}
        intensity={80}
        color="#10b981"
        castShadow
      />

      {/* Corner accent lights */}
      <pointLight position={[-15, 8, -15]} intensity={20} color="#ff6b6b" />
      <pointLight position={[15, 8, -15]} intensity={20} color="#4ecdc4" />
      <pointLight position={[-15, 8, 15]} intensity={20} color="#ffe66d" />
      <pointLight position={[15, 8, 15]} intensity={20} color="#a8e6cf" />

      {/* Center floor accent */}
      <pointLight position={[0, 5, 0]} intensity={25} color="#10b981" />
    </>
  );
}

function FirstPersonControls() {
  const { camera, gl } = useThree();
  const [movement, setMovement] = useState({ forward: 0, right: 0 });
  const velocity = useRef(new THREE.Vector3());
  const [mousePressed, setMousePressed] = useState(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const updateMovement = () => {
      let forward = 0;
      let right = 0;

      if (keys['KeyW'] || keys['ArrowUp']) forward += 1;
      if (keys['KeyS'] || keys['ArrowDown']) forward -= 1;
      if (keys['KeyA'] || keys['ArrowLeft']) right -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) right += 1;

      setMovement({ forward, right });
    };

    const handleMouseDown = (e: MouseEvent) => {
      setMousePressed(true);
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setMousePressed(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mousePressed) {
        const deltaX = e.clientX - lastMousePosition.current.x;
        const deltaY = e.clientY - lastMousePosition.current.y;

        camera.rotation.y -= deltaX * 0.002;
        camera.rotation.x -= deltaY * 0.002;
        camera.rotation.x = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, camera.rotation.x));

        lastMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    const interval = setInterval(updateMovement, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [camera, mousePressed]);

  useFrame((state, delta) => {
    const speed = 8;
    const dampening = 0.85;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    const targetVelocity = new THREE.Vector3();
    targetVelocity.add(forward.multiplyScalar(movement.forward * speed));
    targetVelocity.add(right.multiplyScalar(movement.right * speed));

    velocity.current.lerp(targetVelocity, dampening);

    const newPosition = camera.position.clone();
    newPosition.add(velocity.current.clone().multiplyScalar(delta));

    // Keep player at walking height
    newPosition.y = 2.5;

    // Boundary limits
    const maxDistance = 35;
    newPosition.x = Math.max(-maxDistance, Math.min(maxDistance, newPosition.x));
    newPosition.z = Math.max(-maxDistance, Math.min(maxDistance, newPosition.z));

    camera.position.copy(newPosition);
  });

  return null;
}

export function CasinoScene() {
  return (
    <Canvas
      shadows={{ type: "PCFSoftShadowMap" }}
      camera={{
        position: [0, 2.5, 30],
        fov: 75,
        near: 0.1,
        far: 1000
      }}
      gl={{
        antialias: true,
        powerPreference: "high-performance"
      }}
    >
      <color attach="background" args={["#0f0f0f"]} />
      <fog attach="fog" args={["#1a1a1a", 20, 50]} />

      <Environment
        background={false}
        environmentIntensity={0.2}
        preset="night"
      />

      <Suspense fallback={null}>
        <CasinoLighting />
        <CasinoFloor />
        <CasinoWalls />
        <CasinoGames />
        <FirstPersonControls />
      </Suspense>
    </Canvas>
  );
}

// Models will be loaded as placeholder geometry for now