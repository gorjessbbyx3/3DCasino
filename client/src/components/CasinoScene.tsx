import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Environment, Text, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { useUser } from "@/lib/stores/useUser";

const openCashierModal = () => {
  window.dispatchEvent(new CustomEvent('openCashierModal'));
};

const openSlotMachineModal = (machineNumber: number) => {
  window.dispatchEvent(new CustomEvent('openSlotMachineModal', { detail: { machineNumber } }));
};

// Room state management
type RoomType = 'slots' | 'fish';

const useRoomState = () => {
  const [currentRoom, setCurrentRoom] = useState<RoomType>('slots');
  return { currentRoom, setCurrentRoom };
};

// Create a context for room state
const RoomContext = React.createContext<{ currentRoom: RoomType; setCurrentRoom: (room: RoomType) => void }>({
  currentRoom: 'slots',
  setCurrentRoom: () => {}
});

// RGB LED Floor Tile
function LEDTile({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime + delay;
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      
      // RGB color cycling
      const r = Math.sin(time * 0.5) * 0.5 + 0.5;
      const g = Math.sin(time * 0.5 + 2) * 0.5 + 0.5;
      const b = Math.sin(time * 0.5 + 4) * 0.5 + 0.5;
      
      material.emissive.setRGB(r, g, b);
      material.emissiveIntensity = 0.6 + Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={position} receiveShadow>
      <planeGeometry args={[4.8, 4.8]} />
      <meshStandardMaterial
        color="#1a1a2e"
        emissive="#ff0000"
        emissiveIntensity={0.6}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

// VIP Underground Casino Floor with RGB LED Tiles
function CasinoFloor({ roomSize = 35 }: { roomSize?: number }) {
  const tiles = useMemo(() => {
    const tileArray = [];
    const tileSize = 5; // Larger tiles to reduce count
    const tilesPerSide = Math.floor(roomSize / tileSize);
    
    for (let x = 0; x < tilesPerSide; x++) {
      for (let z = 0; z < tilesPerSide; z++) {
        const posX = (x - tilesPerSide / 2) * tileSize + tileSize / 2;
        const posZ = (z - tilesPerSide / 2) * tileSize + tileSize / 2;
        const delay = (x + z) * 0.1; // Stagger the animation
        
        tileArray.push({
          key: `tile-${x}-${z}`,
          position: [posX, 0.01, posZ] as [number, number, number],
          delay
        });
      }
    }
    return tileArray;
  }, [roomSize]);

  return (
    <group>
      {/* Base floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial
          color="#000000"
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* RGB LED Tiles */}
      {tiles.map((tile: { key: string; position: [number, number, number]; delay: number }) => (
        <LEDTile key={tile.key} position={tile.position} delay={tile.delay} />
      ))}
    </group>
  );
}

// Room walls with doorways
function RoomWalls({ roomSize = 35, backLeftDoor = false, backRightDoor = false, backSign = "" }: { 
  roomSize?: number; 
  backLeftDoor?: boolean; 
  backRightDoor?: boolean;
  backSign?: string;
}) {
  const wallHeight = 12;
  const doorWidth = 6;
  const doorHeight = 5;
  
  return (
    <group>
      {/* Back Wall with optional doors underneath sign */}
      {backLeftDoor || backRightDoor ? (
        <>
          {/* Wall above doors */}
          <mesh position={[0, wallHeight - doorHeight / 2 - 0.5, -roomSize / 2]} receiveShadow>
            <boxGeometry args={[roomSize, wallHeight - doorHeight - 1, 1]} />
            <meshStandardMaterial color="#0f0f1a" roughness={0.6} metalness={0.4} />
          </mesh>
          
          {/* Center divider between doors */}
          <mesh position={[0, doorHeight / 2, -roomSize / 2]} receiveShadow>
            <boxGeometry args={[2, doorHeight, 1]} />
            <meshStandardMaterial color="#0f0f1a" roughness={0.6} metalness={0.4} />
          </mesh>
          
          {/* Left door opening */}
          {backLeftDoor && (
            <>
              {/* Left wall section beside left door */}
              <mesh position={[-roomSize / 2 + doorWidth / 2 + 1, doorHeight / 2, -roomSize / 2]} receiveShadow>
                <boxGeometry args={[roomSize / 2 - doorWidth - 2, doorHeight, 1]} />
                <meshStandardMaterial color="#0f0f1a" roughness={0.6} metalness={0.4} />
              </mesh>
              {/* Left door frame - glowing purple */}
              <mesh position={[-doorWidth / 2 - 1, doorHeight / 2, -roomSize / 2 + 0.5]}>
                <boxGeometry args={[doorWidth + 1, doorHeight + 1, 0.3]} />
                <meshStandardMaterial 
                  color="#a855f7"
                  emissive="#a855f7"
                  emissiveIntensity={1}
                />
              </mesh>
              {/* Left door label */}
              <Text
                position={[-doorWidth / 2 - 1, doorHeight + 1, -roomSize / 2 + 1]}
                fontSize={0.8}
                color="#a855f7"
                anchorX="center"
                anchorY="middle"
              >
                ← SLOTS
              </Text>
            </>
          )}
          
          {/* Right door opening */}
          {backRightDoor && (
            <>
              {/* Right wall section beside right door */}
              <mesh position={[roomSize / 2 - doorWidth / 2 - 1, doorHeight / 2, -roomSize / 2]} receiveShadow>
                <boxGeometry args={[roomSize / 2 - doorWidth - 2, doorHeight, 1]} />
                <meshStandardMaterial color="#0f0f1a" roughness={0.6} metalness={0.4} />
              </mesh>
              {/* Right door frame - glowing cyan */}
              <mesh position={[doorWidth / 2 + 1, doorHeight / 2, -roomSize / 2 + 0.5]}>
                <boxGeometry args={[doorWidth + 1, doorHeight + 1, 0.3]} />
                <meshStandardMaterial 
                  color="#06b6d4"
                  emissive="#06b6d4"
                  emissiveIntensity={1}
                />
              </mesh>
              {/* Right door label */}
              <Text
                position={[doorWidth / 2 + 1, doorHeight + 1, -roomSize / 2 + 1]}
                fontSize={0.8}
                color="#06b6d4"
                anchorX="center"
                anchorY="middle"
              >
                🎣 FISH GAMES
              </Text>
            </>
          )}
        </>
      ) : (
        <mesh position={[0, wallHeight / 2, -roomSize / 2]} receiveShadow>
          <boxGeometry args={[roomSize, wallHeight, 1]} />
          <meshStandardMaterial color="#0f0f1a" roughness={0.6} metalness={0.4} />
        </mesh>
      )}

      {/* Left Wall - always solid */}
      <mesh position={[-roomSize / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[1, wallHeight, roomSize]} />
        <meshStandardMaterial color="#0f0f1a" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Right Wall - always solid */}
      <mesh position={[roomSize / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[1, wallHeight, roomSize]} />
        <meshStandardMaterial color="#0f0f1a" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Ceiling neon strips */}
      <mesh position={[-10, wallHeight - 1, 0]}>
        <boxGeometry args={[0.5, 0.2, roomSize]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
        />
      </mesh>
      
      <mesh position={[10, wallHeight - 1, 0]}>
        <boxGeometry args={[0.5, 0.2, roomSize]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Back wall sign */}
      {backSign && (
        <Text
          position={[0, wallHeight - 2, -roomSize / 2 + 0.6]}
          fontSize={2}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#0891b2"
        >
          {backSign}
        </Text>
      )}
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
          {/* Slot machine body - neon purple glow with enhanced metallic finish */}
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 2.2, 0.9]} />
            <meshStandardMaterial 
              color="#1a0a2e" 
              metalness={0.95} 
              roughness={0.1}
              emissive="#a855f7"
              emissiveIntensity={hovered ? 0.8 : 0.5}
            />
          </mesh>
          
          {/* Larger Screen - bright purple glow with animation */}
          <mesh position={[0, 1.3, 0.46]} castShadow>
            <boxGeometry args={[1.1, 1.0, 0.12]} />
            <meshStandardMaterial 
              color="#000000" 
              emissive={hovered ? "#e879f9" : "#c084fc"}
              emissiveIntensity={hovered ? 3.5 : 2.5}
            />
          </mesh>
          
          {/* Screen frame - gold trim */}
          <mesh position={[0, 1.3, 0.47]} castShadow>
            <boxGeometry args={[1.15, 1.05, 0.08]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              metalness={1} 
              roughness={0.1}
              emissive="#fbbf24"
              emissiveIntensity={hovered ? 0.6 : 0.3}
            />
          </mesh>
          
          {/* Decorative top crown */}
          <mesh position={[0, 2.3, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 0.3, 6]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              metalness={1} 
              roughness={0.1}
              emissive="#fbbf24"
              emissiveIntensity={hovered ? 0.8 : 0.4}
            />
          </mesh>
          
          {/* Arm - gold accent with hover animation */}
          <mesh 
            position={[0.65, hovered ? 1.2 : 1, 0]} 
            rotation={[0, 0, hovered ? -0.3 : 0]}
            castShadow
          >
            <cylinderGeometry args={[0.06, 0.06, 0.8]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              metalness={1} 
              roughness={0.1}
              emissive="#fbbf24"
              emissiveIntensity={hovered ? 0.8 : 0.3}
            />
          </mesh>
          
          {/* Base pedestal */}
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.5, 0.6, 0.4, 8]} />
            <meshStandardMaterial 
              color="#1a0a2e" 
              metalness={0.9} 
              roughness={0.2}
            />
          </mesh>
        </group>
      );
    } else if (modelPath.includes('fish-table')) {
      return (
        <group>
          {/* Rectangular table surface */}
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[4, 0.1, 2.5]} />
            <meshStandardMaterial 
              color="#0a2540" 
              metalness={0.8} 
              roughness={0.3}
            />
          </mesh>
          {/* Screen - cyan glow rectangular */}
          <mesh position={[0, 0.86, 0]} castShadow>
            <boxGeometry args={[3.8, 0.05, 2.3]} />
            <meshStandardMaterial 
              color="#000000" 
              emissive="#06b6d4" 
              emissiveIntensity={2}
            />
          </mesh>
          {/* Rectangular base */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[3, 0.8, 2]} />
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
            <boxGeometry args={[4, 3, 2.5]} />
            <meshStandardMaterial 
              color="#1a0f2e" 
              metalness={0.6}
              roughness={0.4}
              emissive="#00ffff"
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Window - cyan glow */}
          <mesh position={[0, 2, 1.26]} castShadow>
            <boxGeometry args={[3, 1.5, 0.1]} />
            <meshStandardMaterial 
              color="#000000" 
              emissive="#00ffff" 
              emissiveIntensity={1.5}
              transparent 
              opacity={0.9} 
            />
          </mesh>
          {/* Sign - bright cyan */}
          <mesh position={[0, 3.5, 1.26]} castShadow>
            <boxGeometry args={[3.5, 0.6, 0.1]} />
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
      // Gentle floating animation when hovered
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.15;
      // Subtle rotation animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.05;
    } else if (meshRef.current) {
      // Return to original position smoothly
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotation[1], 0.1);
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={hovered ? scale * 1.08 : scale}
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

      {/* Enhanced glow effect with pulsing */}
      {hovered && (
        <>
          <pointLight
            position={[0, 3, 0]}
            color={glowColor}
            intensity={20}
            distance={10}
          />
          <pointLight
            position={[0, 1, 1]}
            color={glowColor}
            intensity={15}
            distance={6}
          />
        </>
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

// Cashier Window Component with Image
function CashierWindow() {
  const { setShowAuthModal, user } = useUser();
  const [hovered, setHovered] = useState(false);
  const texture = useLoader(THREE.TextureLoader, '/Copilot_20251028_193236_1761716033443.png');

  const handleCashierClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      openCashierModal();
    }
  };

  return (
    <group position={[-10, 3, -16.5]}>
      {/* Cashier booth frame */}
      <mesh 
        position={[0, 2, 0]} 
        castShadow
        onClick={handleCashierClick}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[6, 4, 0.5]} />
        <meshStandardMaterial 
          color="#1a0f2e" 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Window with pitbull image */}
      <mesh position={[0, 2, 0.26]} castShadow>
        <planeGeometry args={[5.5, 3.5]} />
        <meshStandardMaterial 
          map={texture}
          emissive="#ffffff"
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Glowing CASHIER sign above */}
      <Text
        position={[0, 4.5, 0.3]}
        fontSize={0.6}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#0891b2"
      >
        CASHIER
      </Text>

      {/* Glow effect when hovered */}
      {hovered && (
        <pointLight
          position={[0, 2, 1]}
          color="#00ffff"
          intensity={10}
          distance={8}
        />
      )}
    </group>
  );
}

// Slot Machine Room with Cashier Window
function SlotMachineRoom() {
  const { setShowAuthModal, user } = useUser();

  const handleSlotMachineClick = (machineNumber: number) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      openSlotMachineModal(machineNumber);
    }
  };

  return (
    <group>
      {/* Cashier Window on back wall, left of Fish Games door */}
      <CashierWindow />

      {/* Left wall slots - 5 machines */}
      {Array.from({ length: 5 }, (_, i) => (
        <GameObject
          key={`slot-left-${i}`}
          position={[-14, 0, (i - 2) * 5]}
          rotation={[0, Math.PI / 2, 0]}
          modelPath="slot-machine"
          scale={2.5}
          onClick={() => handleSlotMachineClick(i + 1)}
          label={`Slot Machine ${i + 1}`}
          glowColor="#a855f7"
        />
      ))}

      {/* Right wall slots - 5 machines */}
      {Array.from({ length: 5 }, (_, i) => (
        <GameObject
          key={`slot-right-${i}`}
          position={[14, 0, (i - 2) * 5]}
          rotation={[0, -Math.PI / 2, 0]}
          modelPath="slot-machine"
          scale={2.5}
          onClick={() => handleSlotMachineClick(i + 6)}
          label={`Slot Machine ${i + 6}`}
          glowColor="#a855f7"
        />
      ))}
    </group>
  );
}

// Fish Game Room
function FishGameRoom() {
  const { setShowAuthModal, user } = useUser();

  const handleGameClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      window.location.href = "/coming-soon";
    }
  };

  return (
    <group>
      {/* 6 Rectangular Fish Tables in two rows */}
      {Array.from({ length: 6 }, (_, i) => (
        <GameObject
          key={`fish-${i}`}
          position={[
            ((i % 3) - 1) * 8,
            0,
            Math.floor(i / 3) === 0 ? -6 : 6
          ]}
          modelPath="fish-table"
          scale={1.8}
          onClick={handleGameClick}
          label={`Fish Table ${i + 1}`}
          glowColor="#06b6d4"
        />
      ))}
    </group>
  );
}

// Room lighting based on room type
function RoomLighting({ roomType }: { roomType: RoomType }) {
  if (roomType === 'slots') {
    return (
      <>
        <ambientLight intensity={0.15} color="#1a1a2e" />
        <spotLight
          position={[0, 10, 0]}
          angle={Math.PI / 2.5}
          penumbra={0.5}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          color="#ffffff"
        />
        {/* Purple lights for slot machines */}
        <pointLight position={[-14, 4, -10]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[-14, 4, 0]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[-14, 4, 10]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[14, 4, -10]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[14, 4, 0]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[14, 4, 10]} intensity={3} color="#a855f7" distance={12} />
        {/* Cyan light for cashier window on back wall */}
        <pointLight position={[-10, 4, -16]} intensity={5} color="#00ffff" distance={12} />
      </>
    );
  } else if (roomType === 'fish') {
    return (
      <>
        <ambientLight intensity={0.15} color="#1a1a2e" />
        <spotLight
          position={[0, 10, 0]}
          angle={Math.PI / 2.5}
          penumbra={0.5}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          color="#ffffff"
        />
        {/* Cyan lights for fish tables */}
        <pointLight position={[-12, 4, -8]} intensity={3} color="#06b6d4" distance={12} />
        <pointLight position={[0, 4, -8]} intensity={3} color="#06b6d4" distance={12} />
        <pointLight position={[12, 4, -8]} intensity={3} color="#06b6d4" distance={12} />
        <pointLight position={[-12, 4, 8]} intensity={3} color="#06b6d4" distance={12} />
        <pointLight position={[0, 4, 8]} intensity={3} color="#06b6d4" distance={12} />
        <pointLight position={[12, 4, 8]} intensity={3} color="#06b6d4" distance={12} />
      </>
    );
  }
  return null;
}

// First-person WASD movement controls with room transitions
function FirstPersonControls() {
  const { camera } = useThree();
  const { currentRoom, setCurrentRoom } = React.useContext(RoomContext);
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMoveForward(true);
          break;
        case 'KeyS':
        case 'ArrowDown':
          setMoveBackward(true);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setMoveLeft(true);
          break;
        case 'KeyD':
        case 'ArrowRight':
          setMoveRight(true);
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMoveForward(false);
          break;
        case 'KeyS':
        case 'ArrowDown':
          setMoveBackward(false);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setMoveLeft(false);
          break;
        case 'KeyD':
        case 'ArrowRight':
          setMoveRight(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const speed = 15 * delta;
    const direction = new THREE.Vector3();

    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(direction, camera.up).normalize();

    if (moveForward) {
      camera.position.addScaledVector(direction, speed);
    }
    if (moveBackward) {
      camera.position.addScaledVector(direction, -speed);
    }
    if (moveLeft) {
      camera.position.addScaledVector(right, -speed);
    }
    if (moveRight) {
      camera.position.addScaledVector(right, speed);
    }

    // Room transitions based on position - door on back wall
    if (currentRoom === 'slots') {
      // Back door to fish games (under sign)
      if (camera.position.z < -16) {
        setCurrentRoom('fish');
        camera.position.set(0, 1.7, 14);
      }
    } else if (currentRoom === 'fish') {
      // Exit back to slots from back wall
      if (camera.position.z < -16) {
        setCurrentRoom('slots');
        camera.position.set(0, 1.7, 14);
      }
    }

    // Keep camera within current room bounds
    camera.position.x = Math.max(-16.5, Math.min(16.5, camera.position.x));
    camera.position.z = Math.max(-16.5, Math.min(16.5, camera.position.z));
    camera.position.y = 1.7; // Eye level
  });

  return null;
}

function Scene() {
  const { currentRoom } = React.useContext(RoomContext);

  return (
    <>
      <FirstPersonControls />
      <RoomLighting roomType={currentRoom} />
      <CasinoFloor />
      
      {currentRoom === 'slots' && (
        <>
          <RoomWalls backRightDoor={true} backSign="💎 JADE ROYALE 💎" />
          <SlotMachineRoom />
        </>
      )}
      
      {currentRoom === 'fish' && (
        <>
          <RoomWalls backLeftDoor={true} backSign="🎣 FISH GAMES 🎣" />
          <FishGameRoom />
        </>
      )}
    </>
  );
}

function CanvasWrapper() {
  const roomState = useRoomState();

  return (
    <RoomContext.Provider value={roomState}>
      <Canvas
        shadows
        camera={{ 
          position: [0, 1.7, 14], 
          fov: 75,
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
          scene.fog = new THREE.Fog('#000011', 30, 60);
        }}
      >
        <Suspense fallback={null}>
          <Scene />
          <Environment preset="night" background={false} />
          <PointerLockControls 
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </RoomContext.Provider>
  );
}

export function CasinoScene() {
  return <CanvasWrapper />;
}
