import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useUser } from "@/lib/stores/useUser";

function CasinoFloor() {
  return (
    <group>
      {/* Main polished floor - luxury underground VIP */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#0a0a15"
          roughness={0.2}
          metalness={0.9}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Neon cyan center design */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial
          color="#00ffff"
          roughness={0.1}
          metalness={0.95}
          emissive="#00d4ff"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Inner neon ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <ringGeometry args={[4, 4.5, 64]} />
        <meshStandardMaterial
          color="#8b5cf6"
          roughness={0.1}
          metalness={0.95}
          emissive="#7c3aed"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Purple neon walkway accents */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -15]} receiveShadow>
        <planeGeometry args={[60, 0.3]} />
        <meshStandardMaterial
          color="#a855f7"
          roughness={0.1}
          metalness={0.9}
          emissive="#9333ea"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 15]} receiveShadow>
        <planeGeometry args={[40, 0.3]} />
        <meshStandardMaterial
          color="#06b6d4"
          roughness={0.1}
          metalness={0.9}
          emissive="#0891b2"
          emissiveIntensity={2}
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
    color: "#0f0520",
    roughness: 0.3,
    metalness: 0.7,
    envMapIntensity: 1.2,
  }), []);

  const walls = useMemo(() => [
    { position: [0, wallHeight / 2, -roomSize / 2] as [number, number, number], dimensions: [roomSize, wallHeight, wallThickness] as [number, number, number] },
    { position: [0, wallHeight / 2, roomSize / 2] as [number, number, number], dimensions: [roomSize, wallHeight, wallThickness] as [number, number, number] },
    { position: [-roomSize / 2, wallHeight / 2, 0] as [number, number, number], dimensions: [wallThickness, wallHeight, roomSize] as [number, number, number] },
    { position: [roomSize / 2, wallHeight / 2, 0] as [number, number, number], dimensions: [wallThickness, wallHeight, roomSize] as [number, number, number] }
  ], [wallHeight, roomSize, wallThickness]);

  return (
    <group>
      {walls.map((wall, i) => (
        <mesh key={i} position={wall.position} receiveShadow castShadow>
          <boxGeometry args={wall.dimensions} />
          <primitive object={wallMaterial.clone()} />
        </mesh>
      ))}

      {/* Ceiling - dark luxury */}
      <mesh position={[0, wallHeight, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial
          color="#050510"
          roughness={0.2}
          metalness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Neon ceiling strips */}
      <mesh position={[-10, wallHeight - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, roomSize]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={3}
          transparent
          opacity={0.8}
        />
      </mesh>
      <mesh position={[10, wallHeight - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, roomSize]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#9333ea"
          emissiveIntensity={3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Neon casino sign */}
      <Text
        position={[0, wallHeight - 2, -roomSize / 2 + 0.6]}
        fontSize={2.5}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#0891b2"
      >
        💎 JADE ROYALE 💎
      </Text>
      <Text
        position={[0, wallHeight - 3.5, -roomSize / 2 + 0.6]}
        fontSize={1}
        color="#a855f7"
        anchorX="center"
        anchorY="middle"
      >
        VIP UNDERGROUND CASINO
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

  const handleSlotMachineClick = (machineNumber: number) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      window.dispatchEvent(
        new CustomEvent("openSlotMachine", { detail: { machineNumber } })
      );
    }
  };

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
          onClick={() => handleSlotMachineClick(i + 1)}
          label={`Slot Machine ${i + 1}`}
          glowColor="#a855f7"
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
          glowColor="#06b6d4"
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
        glowColor="#00ffff"
      />

      {/* Pirate Captain (Pitbull Dog) */}
      <GameObject
        position={[0, 0, -23]}
        rotation={[0, 0, 0]}
        modelPath="/models/pitbull-pirate.glb"
        scale={2}
        onClick={handleCashierClick}
        label="Captain Pitbull - Cashier"
        glowColor="#00ffff"
      />
    </>
  );
}

function CasinoLighting() {
  return (
    <>
      {/* Low ambient for moody underground VIP feel */}
      <ambientLight intensity={0.15} color="#0a0a20" />

      {/* Main soft overhead with cyan tint */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.4}
        color="#4dd4ff"
        castShadow
        shadow-camera-far={50}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Slot machine area - neon purple */}
      <spotLight
        position={[0, 15, -14]}
        target-position={[0, 0, -14]}
        angle={0.9}
        penumbra={0.6}
        intensity={80}
        color="#a855f7"
        castShadow
      />

      {/* Fish table area - electric cyan */}
      <spotLight
        position={[0, 15, 12]}
        target-position={[0, 0, 12]}
        angle={0.9}
        penumbra={0.6}
        intensity={80}
        color="#06b6d4"
        castShadow
      />

      {/* Cashier booth - cyan accent */}
      <spotLight
        position={[0, 18, -20]}
        target-position={[0, 0, -24]}
        angle={0.5}
        penumbra={0.4}
        intensity={100}
        color="#00ffff"
        castShadow
      />

      {/* Neon corner accents - blue/purple/cyan theme */}
      <pointLight position={[-15, 3, -15]} intensity={40} color="#8b5cf6" />
      <pointLight position={[15, 3, -15]} intensity={40} color="#06b6d4" />
      <pointLight position={[-15, 3, 15]} intensity={40} color="#00ffff" />
      <pointLight position={[15, 3, 15]} intensity={40} color="#a855f7" />

      {/* Center floor glow - cyan */}
      <pointLight position={[0, 2, 0]} intensity={60} color="#00d4ff" />

      {/* Atmospheric rim lights */}
      <pointLight position={[-20, 6, 0]} intensity={30} color="#4c1d95" />
      <pointLight position={[20, 6, 0]} intensity={30} color="#0e7490" />

      {/* Ceiling neon strips glow */}
      <pointLight position={[-10, 11, 0]} intensity={35} color="#06b6d4" />
      <pointLight position={[10, 11, 0]} intensity={35} color="#9333ea" />
    </>
  );
}

function FirstPersonControls() {
  const { camera, gl } = useThree();
  const [movement, setMovement] = useState({ forward: 0, right: 0 });
  const [rotation, setRotation] = useState({ yaw: 0, pitch: 0 });
  const velocity = useRef(new THREE.Vector3());
  const rotationRef = useRef({ yaw: 0, pitch: 0 });
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Desktop controls
  useEffect(() => {
    if (isMobile) return;

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

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        const sensitivity = 0.002;
        rotationRef.current = {
          yaw: rotationRef.current.yaw - e.movementX * sensitivity,
          pitch: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationRef.current.pitch - e.movementY * sensitivity))
        };
        setRotation(rotationRef.current);
      }
    };

    const handleClick = () => {
      if (!document.pointerLockElement) {
        gl.domElement.requestPointerLock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('click', handleClick);
    
    const interval = setInterval(updateMovement, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('click', handleClick);
      clearInterval(interval);
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
    };
  }, [gl, isMobile]);

  // Mobile touch controls
  useEffect(() => {
    if (!isMobile) return;

    let movementTouchId: number | null = null;
    let lookTouchId: number | null = null;
    const movementStart = { x: 0, y: 0 };
    const lookStart = { x: 0, y: 0 };

    const handleTouchStart = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((touch) => {
        const x = touch.clientX;
        const y = touch.clientY;
        const isLeftSide = x < window.innerWidth / 2;

        if (isLeftSide && movementTouchId === null) {
          movementTouchId = touch.identifier;
          movementStart.x = x;
          movementStart.y = y;
        } else if (!isLeftSide && lookTouchId === null) {
          lookTouchId = touch.identifier;
          lookStart.x = x;
          lookStart.y = y;
        }
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((touch) => {
        if (touch.identifier === movementTouchId) {
          const dx = touch.clientX - movementStart.x;
          const dy = touch.clientY - movementStart.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 50;
          const clampedDistance = Math.min(distance, maxDistance);
          const angle = Math.atan2(dy, dx);
          
          setMovement({
            forward: -Math.sin(angle) * (clampedDistance / maxDistance),
            right: Math.cos(angle) * (clampedDistance / maxDistance)
          });
        } else if (touch.identifier === lookTouchId) {
          const dx = touch.clientX - lookStart.x;
          const dy = touch.clientY - lookStart.y;
          const sensitivity = 0.005;
          
          rotationRef.current = {
            yaw: rotationRef.current.yaw - dx * sensitivity,
            pitch: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationRef.current.pitch - dy * sensitivity))
          };
          setRotation(rotationRef.current);
          
          lookStart.x = touch.clientX;
          lookStart.y = touch.clientY;
        }
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((touch) => {
        if (touch.identifier === movementTouchId) {
          movementTouchId = null;
          setMovement({ forward: 0, right: 0 });
        } else if (touch.identifier === lookTouchId) {
          lookTouchId = null;
        }
      });
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile]);

  useFrame((state, delta) => {
    const speed = 8;
    const dampening = 0.85;

    // Apply rotation to camera
    camera.rotation.order = 'YXZ';
    camera.rotation.y = rotation.yaw;
    camera.rotation.x = rotation.pitch;

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
      shadows
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
      <color attach="background" args={["#050510"]} />
      <fog attach="fog" args={["#0a0a20", 25, 60]} />

      <Environment
        background={false}
        environmentIntensity={0.5}
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