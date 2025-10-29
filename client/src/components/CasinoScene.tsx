import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { useUser } from "@/lib/stores/useUser";

const openCashierModal = () => {
  window.dispatchEvent(new CustomEvent('openCashierModal'));
};

const openSlotMachineModal = (machineNumber: number) => {
  window.dispatchEvent(new CustomEvent('openSlotMachineModal', { detail: { machineNumber } }));
};

// VIP Underground Casino Floor
function CasinoFloor() {
  const roomSize = 80;
  
  return (
    <group>
      {/* Main polished dark floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial
          color="#0a0a15"
          roughness={0.1}
          metalness={0.9}
          envMapIntensity={1}
        />
      </mesh>

      {/* Center floor design - cyan circle with purple ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[8, 12, 64]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Neon walkway strips */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -20]} receiveShadow>
        <planeGeometry args={[40, 2]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 10]} receiveShadow>
        <planeGeometry args={[40, 2]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

// Dark luxury walls
function CasinoWalls() {
  const roomSize = 80;
  const wallHeight = 15;
  
  return (
    <group>
      {/* Back Wall */}
      <mesh position={[0, wallHeight / 2, -roomSize / 2]} receiveShadow>
        <boxGeometry args={[roomSize, wallHeight, 1]} />
        <meshStandardMaterial 
          color="#0f0f1a" 
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-roomSize / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[1, wallHeight, roomSize]} />
        <meshStandardMaterial 
          color="#0f0f1a" 
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* Right Wall */}
      <mesh position={[roomSize / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[1, wallHeight, roomSize]} />
        <meshStandardMaterial 
          color="#0f0f1a" 
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* Ceiling neon strips */}
      <mesh position={[-15, wallHeight - 1, 0]}>
        <boxGeometry args={[0.5, 0.2, roomSize]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
        />
      </mesh>
      
      <mesh position={[15, wallHeight - 1, 0]}>
        <boxGeometry args={[0.5, 0.2, roomSize]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Casino name sign */}
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

// Game object component
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

  const createPlaceholder = () => {
    if (modelPath.includes('slot-machine')) {
      return (
        <group>
          {/* Slot machine body - neon purple glow */}
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 2, 0.8]} />
            <meshStandardMaterial 
              color="#1a0a2e" 
              metalness={0.9} 
              roughness={0.2}
              emissive="#a855f7"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Screen - bright purple glow */}
          <mesh position={[0, 1.2, 0.41]} castShadow>
            <boxGeometry args={[0.8, 0.6, 0.1]} />
            <meshStandardMaterial 
              color="#000000" 
              emissive="#c084fc" 
              emissiveIntensity={2}
            />
          </mesh>
          {/* Arm - gold accent */}
          <mesh position={[0.6, 1, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.8]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              metalness={1} 
              roughness={0.1}
              emissive="#fbbf24"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      );
    } else if (modelPath.includes('fish-table')) {
      return (
        <group>
          {/* Table surface - dark base */}
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.5, 1.5, 0.1]} />
            <meshStandardMaterial 
              color="#0a2540" 
              metalness={0.8} 
              roughness={0.3}
            />
          </mesh>
          {/* Screen - cyan glow */}
          <mesh position={[0, 0.86, 0]} castShadow>
            <cylinderGeometry args={[1.3, 1.3, 0.05]} />
            <meshStandardMaterial 
              color="#000000" 
              emissive="#06b6d4" 
              emissiveIntensity={2}
            />
          </mesh>
          {/* Base */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.8, 0.8]} />
            <meshStandardMaterial 
              color="#1a1a2e" 
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        </group>
      );
    } else if (modelPath.includes('cashier-booth')) {
      return (
        <group>
          {/* Booth structure - luxury dark */}
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[3, 3, 2]} />
            <meshStandardMaterial 
              color="#1a0f2e" 
              metalness={0.6}
              roughness={0.4}
              emissive="#00ffff"
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Window - cyan glow */}
          <mesh position={[0, 2, 1.01]} castShadow>
            <boxGeometry args={[2, 1, 0.1]} />
            <meshStandardMaterial 
              color="#000000" 
              emissive="#00ffff" 
              emissiveIntensity={1.5}
              transparent 
              opacity={0.9} 
            />
          </mesh>
          {/* Sign - bright cyan */}
          <mesh position={[0, 3.2, 1.01]} castShadow>
            <boxGeometry args={[2.5, 0.5, 0.1]} />
            <meshStandardMaterial 
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      );
    } else if (modelPath.includes('pitbull-pirate')) {
      return (
        <group>
          {/* Body */}
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.4, 1.5]} />
            <meshStandardMaterial 
              color="#6b4423"
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
          {/* Head */}
          <mesh position={[0, 2, 0]} castShadow>
            <sphereGeometry args={[0.4]} />
            <meshStandardMaterial 
              color="#d4a574"
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
          {/* Pirate hat - cyan accent */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[0.5, 0.6]} />
            <meshStandardMaterial 
              color="#0a0a1a"
              emissive="#00ffff"
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Eye patch */}
          <mesh position={[0.2, 2.1, 0.35]} castShadow>
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

  return (
    <>
      {/* 10 Slot Machines in two rows */}
      {Array.from({ length: 10 }, (_, i) => (
        <GameObject
          key={`slot-${i}`}
          position={[
            ((i % 5) - 2) * 6,
            0,
            Math.floor(i / 5) === 0 ? -15 : 5
          ]}
          modelPath="slot-machine"
          scale={1}
          onClick={() => handleSlotMachineClick(i + 1)}
          label={`Slot Machine ${i + 1}`}
          glowColor="#a855f7"
        />
      ))}

      {/* 6 Fish Tables in two rows */}
      {Array.from({ length: 6 }, (_, i) => (
        <GameObject
          key={`fish-${i}`}
          position={[
            ((i % 3) - 1) * 8,
            0,
            Math.floor(i / 3) === 0 ? -30 : 20
          ]}
          modelPath="fish-table"
          scale={1}
          onClick={handleGameClick}
          label={`Fish Table ${i + 1}`}
          glowColor="#06b6d4"
        />
      ))}

      {/* Cashier Booth */}
      <GameObject
        position={[0, 0, 35]}
        modelPath="cashier-booth"
        scale={1}
        onClick={() => openCashierModal()}
        label="💰 Cashier"
        glowColor="#00ffff"
      />

      {/* Captain Pitbull at cashier */}
      <GameObject
        position={[0, 0, 33]}
        modelPath="pitbull-pirate"
        scale={1}
        glowColor="#00ffff"
      />
    </>
  );
}

// VIP Underground lighting - moody and exclusive
function SceneLighting() {
  return (
    <>
      {/* Low ambient for underground feel */}
      <ambientLight intensity={0.15} color="#1a1a2e" />

      {/* Main overhead spotlight */}
      <spotLight
        position={[0, 12, 0]}
        angle={Math.PI / 2.5}
        penumbra={0.5}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#ffffff"
      />

      {/* Purple zone lights for slot machines */}
      <pointLight position={[-12, 4, -15]} intensity={2} color="#a855f7" distance={15} />
      <pointLight position={[12, 4, -15]} intensity={2} color="#a855f7" distance={15} />
      <pointLight position={[-12, 4, 5]} intensity={2} color="#a855f7" distance={15} />
      <pointLight position={[12, 4, 5]} intensity={2} color="#a855f7" distance={15} />

      {/* Cyan zone lights for fish tables */}
      <pointLight position={[-8, 4, -30]} intensity={2.5} color="#06b6d4" distance={15} />
      <pointLight position={[8, 4, -30]} intensity={2.5} color="#06b6d4" distance={15} />
      <pointLight position={[-8, 4, 20]} intensity={2.5} color="#06b6d4" distance={15} />
      <pointLight position={[8, 4, 20]} intensity={2.5} color="#06b6d4" distance={15} />

      {/* Bright cyan accent for cashier */}
      <pointLight position={[0, 6, 35]} intensity={4} color="#00ffff" distance={12} />

      {/* Corner accent lights */}
      <pointLight position={[-30, 3, -30]} intensity={1} color="#a855f7" distance={20} />
      <pointLight position={[30, 3, -30]} intensity={1} color="#06b6d4" distance={20} />
      <pointLight position={[-30, 3, 30]} intensity={1} color="#06b6d4" distance={20} />
      <pointLight position={[30, 3, 30]} intensity={1} color="#a855f7" distance={20} />
    </>
  );
}

function Scene() {
  return (
    <>
      <SceneLighting />
      <CasinoFloor />
      <CasinoWalls />
      <CasinoGames />
    </>
  );
}

function CanvasWrapper() {
  return (
    <Canvas
      shadows
      camera={{ 
        position: [0, 8, 40], 
        fov: 60,
        near: 0.1,
        far: 1000
      }}
      gl={{ 
        antialias: true, 
        alpha: false,
        powerPreference: "high-performance"
      }}
      onCreated={({ gl, scene }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.setClearColor('#000011');
        scene.fog = new THREE.Fog('#000011', 40, 100);
      }}
    >
      <Suspense fallback={null}>
        <Scene />
        <Environment preset="night" background={false} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={8}
          maxDistance={60}
        />
      </Suspense>
    </Canvas>
  );
}

export function CasinoScene() {
  return <CanvasWrapper />;
}
