import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { Environment, Text, PointerLockControls, useTexture } from "@react-three/drei";
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

// Animated light bulb component
function AnimatedBulb({ position, color, baseIntensity = 2, variance = 1, speed = 0.005, offset = 0 }: {
  position: [number, number, number];
  color: string;
  baseIntensity?: number;
  variance?: number;
  speed?: number;
  offset?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      const time = state.clock.elapsedTime;
      material.emissiveIntensity = baseIntensity + Math.sin(time * speed * 1000 + offset * 0.3) * variance;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={baseIntensity}
      />
    </mesh>
  );
}

// Animated marquee bulb component
function MarqueeBulb({ position, offset = 0 }: {
  position: [number, number, number];
  offset?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      const time = state.clock.elapsedTime;
      material.emissiveIntensity = 2 + Math.sin(time * 3 + offset * 0.5) * 1.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

// RGB LED Floor Tile - simplified static version
function LEDTile({ position }: { position: [number, number, number] }) {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={position} 
      receiveShadow
    >
      <planeGeometry args={[9.8, 9.8]} />
      <meshStandardMaterial
        color="#1a1a2e"
        emissive="#6366f1"
        emissiveIntensity={0.3}
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
    const tileSize = 10; // Larger tiles to reduce count
    const tilesPerSide = Math.floor(roomSize / tileSize);

    for (let x = 0; x < tilesPerSide; x++) {
      for (let z = 0; z < tilesPerSide; z++) {
        const posX = (x - tilesPerSide / 2) * tileSize + tileSize / 2;
        const posZ = (z - tilesPerSide / 2) * tileSize + tileSize / 2;

        tileArray.push({
          key: `tile-${x}-${z}`,
          position: [posX, 0.01, posZ] as [number, number, number]
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
      {tiles.map((tile: { key: string; position: [number, number, number] }) => (
        <LEDTile key={tile.key} position={tile.position} />
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
  const wallHeight = 16;
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
            <meshStandardMaterial 
              color="#0f0f1a"
              roughness={0.6}
              metalness={0.4}
            />
          </mesh>

          {/* Center divider between doors */}
          <mesh position={[0, doorHeight / 2, -roomSize / 2]} receiveShadow>
            <boxGeometry args={[2, doorHeight, 1]} />
            <meshStandardMaterial 
              color="#0f0f1a"
              roughness={0.6}
              metalness={0.4}
            />
          </mesh>

          {/* Left hallway entrance - Fish Games */}
          {backLeftDoor && (
            <>
              {/* Left wall section beside hallway */}
              <mesh position={[-roomSize / 2 + doorWidth / 2 + 1, doorHeight / 2, -roomSize / 2]} receiveShadow>
                <boxGeometry args={[roomSize / 2 - doorWidth - 2, doorHeight, 1]} />
                <meshStandardMaterial 
                  color="#0f0f1a"
                  roughness={0.6}
                  metalness={0.4}
                />
              </mesh>

              {/* Hallway entrance frame - glowing cyan */}
              <mesh position={[-doorWidth / 2 - 1, doorHeight / 2, -roomSize / 2 + 0.5]}>
                <boxGeometry args={[doorWidth + 1, doorHeight + 1, 0.3]} />
                <meshStandardMaterial 
                  color="#06b6d4"
                  emissive="#06b6d4"
                  emissiveIntensity={1.5}
                />
              </mesh>

              {/* Decorative lights around entrance - temporarily simplified */}

              {/* Hallway corridor extending back */}
              <group position={[-doorWidth / 2 - 1, 0, -roomSize / 2]}>
                {/* Left hallway wall */}
                <mesh position={[-doorWidth / 2, doorHeight / 2, -4]} castShadow receiveShadow>
                  <boxGeometry args={[0.5, doorHeight, 8]} />
                  <meshStandardMaterial 
                    color="#1a1a2e"
                    roughness={0.5}
                    metalness={0.3}
                  />
                </mesh>

                {/* Right hallway wall */}
                <mesh position={[doorWidth / 2, doorHeight / 2, -4]} castShadow receiveShadow>
                  <boxGeometry args={[0.5, doorHeight, 8]} />
                  <meshStandardMaterial 
                    color="#1a1a2e"
                    roughness={0.5}
                    metalness={0.3}
                  />
                </mesh>

                {/* Hallway ceiling */}
                <mesh position={[0, doorHeight, -4]} receiveShadow>
                  <boxGeometry args={[doorWidth, 0.3, 8]} />
                  <meshStandardMaterial 
                    color="#0a0a1a"
                    roughness={0.4}
                    metalness={0.5}
                  />
                </mesh>

                {/* Hallway floor */}
                <mesh position={[0, 0, -4]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[doorWidth, 8]} />
                  <meshStandardMaterial 
                    color="#1a1a2e"
                    roughness={0.3}
                    metalness={0.6}
                  />
                </mesh>

                {/* Hallway ceiling lights */}
                {[0, -2, -4, -6].map((z, i) => (
                  <group key={i} position={[0, doorHeight - 0.2, z]}>
                    <mesh>
                      <boxGeometry args={[2, 0.1, 0.5]} />
                      <meshStandardMaterial 
                        color="#06b6d4"
                        emissive="#06b6d4"
                        emissiveIntensity={2}
                      />
                    </mesh>
                    <pointLight color="#06b6d4" intensity={15} distance={8} />
                  </group>
                ))}

                {/* End of hallway - archway to fish room */}
                <mesh position={[0, doorHeight / 2, -8]}>
                  <boxGeometry args={[doorWidth + 1, doorHeight + 1, 0.3]} />
                  <meshStandardMaterial 
                    color="#06b6d4"
                    emissive="#06b6d4"
                    emissiveIntensity={2}
                  />
                </mesh>
              </group>

              {/* Hallway entrance label */}
              <Text
                position={[-doorWidth / 2 - 1, doorHeight + 1, -roomSize / 2 + 1]}
                fontSize={0.8}
                color="#06b6d4"
                anchorX="center"
                anchorY="middle"
              >
                🎣 FISH GAMES
              </Text>
            </>
          )}

          {/* Right door opening */}
          {backRightDoor && (
            <>
              {/* Right wall section beside right door */}
              <mesh position={[roomSize / 2 - doorWidth / 2 - 1, doorHeight / 2, -roomSize / 2]} receiveShadow>
                <boxGeometry args={[roomSize / 2 - doorWidth - 2, doorHeight, 1]} />
                <meshStandardMaterial 
                  color="#0f0f1a"
                  roughness={0.6}
                  metalness={0.4}
                />
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

      {/* Left Wall - dark */}
      <mesh position={[-roomSize / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[1, wallHeight, roomSize]} />
        <meshStandardMaterial 
          color="#0f0f1a"
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* Right Wall - dark */}
      <mesh position={[roomSize / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[1, wallHeight, roomSize]} />
        <meshStandardMaterial 
          color="#0f0f1a"
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* Front Wall (entrance side) - temporarily without texture */}
      <mesh position={[0, wallHeight / 2, roomSize / 2]} receiveShadow>
        <boxGeometry args={[roomSize, wallHeight, 1]} />
        <meshStandardMaterial 
          color="#0f0f1a"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Back wall sign - Broadway/Hollywood style */}
      {backSign && (
        <group position={[0, wallHeight - 2, -roomSize / 2 + 0.6]}>
          {/* Main sign text - green with white glow - Fancy cursive font */}
          <Text
            position={[0, 0, 0]}
            fontSize={2.5}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.25}
            outlineColor="#ffffff"
            letterSpacing={0.1}
            font="https://fonts.gstatic.com/s/greatvibes/v19/RWmMoKWR9v4ksMfaWd_JN-XCg6UKDXlq.woff"
          >
            {backSign}
          </Text>

          {/* Outer glow effect using point lights */}
          <pointLight position={[0, 0, 1]} color="#ffffff" intensity={50} distance={15} />
          <pointLight position={[-5, 0, 1]} color="#00ff00" intensity={30} distance={10} />
          <pointLight position={[5, 0, 1]} color="#00ff00" intensity={30} distance={10} />

          {/* Marquee bulbs around the sign - temporarily simplified */}

          {/* Background panel for the sign */}
          <mesh position={[0, 0, -0.2]}>
            <boxGeometry args={[25, 5.5, 0.3]} />
            <meshStandardMaterial 
              color="#1a1a1a"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Starry ceiling component
function StarryCeiling({ roomSize, height }: { roomSize: number; height: number }) {
  const starsRef = useRef<THREE.Group>(null);

  // Generate random star positions - stable across renders
  const stars = useMemo(() => {
    const starArray: { pos: [number, number, number]; size: number; brightness: number }[] = [];
    const numStars = 50;

    for (let i = 0; i < numStars; i++) {
      starArray.push({
        pos: [
          (Math.random() - 0.5) * roomSize * 0.95,
          height - 0.5,
          (Math.random() - 0.5) * roomSize * 0.95
        ],
        size: Math.random() * 0.08 + 0.02,
        brightness: Math.random() * 2 + 1
      });
    }
    return starArray;
  }, [roomSize, height]);

  useFrame((state) => {
    if (starsRef.current) {
      const time = state.clock.elapsedTime;
      let meshIndex = 0;
      starsRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && meshIndex < stars.length) {
          const material = child.material as THREE.MeshStandardMaterial;
          // Twinkling effect
          const twinkle = Math.sin(time * (1 + meshIndex * 0.1)) * 0.3 + 0.7;
          material.emissiveIntensity = stars[meshIndex].brightness * twinkle;
          meshIndex++;
        }
      });
    }
  });

  return (
    <group ref={starsRef}>
      {/* Dark ceiling background */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial 
          color="#000511" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Stars */}
      {stars.map((star, i) => (
        <mesh key={i} position={star.pos}>
          <sphereGeometry args={[star.size, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={star.brightness}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Some larger glowing stars */}
      {stars.slice(0, 30).map((star, i) => (
        <pointLight
          key={`light-${i}`}
          position={star.pos}
          color="#e0e7ff"
          intensity={0.3}
          distance={3}
        />
      ))}
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
  machineColor?: string;
}

function GameObject({
  position,
  rotation = [0, 0, 0],
  modelPath,
  scale = 1,
  onClick,
  label,
  glowColor = "#10b981",
  machineColor = "#6366f1"
}: GameObjectProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const coinsRef = useRef<Array<{ offset: [number, number, number], speed: number, angle: number, startTime: number }>>([]);

  // Initialize coins for slot machine hover effect
  React.useEffect(() => {
    if (modelPath.includes('slot-machine')) {
      coinsRef.current = Array.from({ length: 8 }, (_, i) => ({
        offset: [0, 0, 0] as [number, number, number],
        speed: 2 + Math.random() * 2,
        angle: (i / 8) * Math.PI * 2,
        startTime: 0
      }));
    }
  }, [modelPath]);

  const createPlaceholder = () => {
    if (modelPath.includes('slot-machine')) {
      return (
        <group>
          {/* Premium curved cabinet - IGT style sleek design - TALLER */}
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.65, 0.7, 3.6, 32]} />
            <meshStandardMaterial 
              color="#0a0a1e" 
              metalness={0.98} 
              roughness={0.05}
              emissive={machineColor}
              emissiveIntensity={hovered ? 0.6 : 0.3}
            />
          </mesh>

          {/* Premium large screen - ultra bright display */}
          <mesh position={[0, 2.2, 0.66]} castShadow>
            <boxGeometry args={[1.2, 1.6, 0.08]} />
            <meshStandardMaterial 
              color="#000000"
              emissive={machineColor}
              emissiveIntensity={hovered ? 0.5 : 0.3}
            />
          </mesh>

          {/* Curved screen bezel - glossy frame */}
          <mesh position={[0, 2.2, 0.68]} castShadow>
            <boxGeometry args={[1.26, 1.66, 0.04]} />
            <meshStandardMaterial 
              color="#1a1a2e" 
              metalness={1} 
              roughness={0.02}
              emissive={machineColor}
              emissiveIntensity={hovered ? 0.8 : 0.4}
            />
          </mesh>

          {/* Game logo frame above screen */}
          <group position={[0, 3.25, 0.7]}>
            {/* Golden decorative frame */}
            <mesh castShadow>
              <boxGeometry args={[1.4, 0.5, 0.08]} />
              <meshStandardMaterial 
                color="#d4af37"
                metalness={1}
                roughness={0.1}
                emissive="#d4af37"
                emissiveIntensity={0.3}
              />
            </mesh>

            {/* Game logo area - simplified */}
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[1.3, 0.4]} />
              <meshStandardMaterial 
                color="#d4af37"
                emissive="#ffd700"
                emissiveIntensity={0.5}
              />
            </mesh>

            {/* Frame border lights */}
            {[
              [-0.7, 0.25], [0.7, 0.25], [-0.7, -0.25], [0.7, -0.25]
            ].map((pos, i) => (
              <mesh key={i} position={[pos[0], pos[1], 0.08]} castShadow>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial
                  color="#ffd700"
                  emissive="#ffd700"
                  emissiveIntensity={2}
                />
              </mesh>
            ))}
          </group>

          {/* LED strip lights around screen - premium marquee effect */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const radius = 0.68;
            const x = Math.sin(angle) * radius;
            const y = 2.2 + Math.cos(angle) * radius * 0.65;
            return (
              <mesh key={i} position={[x, y, 0.7]} castShadow>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#60a5fa"
                  emissiveIntensity={hovered ? 5 : 2.5}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            );
          })}

          {/* Top curved topper - signature IGT style */}
          <mesh position={[0, 3.8, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.55, 0.4, 32]} />
            <meshStandardMaterial 
              color="#1e1b4b" 
              metalness={0.95} 
              roughness={0.05}
              emissive="#6366f1"
              emissiveIntensity={hovered ? 1.2 : 0.6}
            />
          </mesh>

          {/* Illuminated top logo area */}
          <mesh position={[0, 3.8, 0.46]} castShadow>
            <boxGeometry args={[0.8, 0.25, 0.05]} />
            <meshStandardMaterial 
              color="#000000" 
              emissive="#a78bfa"
              emissiveIntensity={hovered ? 3 : 1.8}
            />
          </mesh>

          {/* Control panel area - angled */}
          <mesh position={[0, 0.6, 0.5]} rotation={[-0.3, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1, 0.3, 0.4]} />
            <meshStandardMaterial 
              color="#0f0f23" 
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>

          {/* Premium base with LED underglow */}
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.75, 0.8, 0.3, 32]} />
            <meshStandardMaterial 
              color="#0a0a1e" 
              metalness={0.95} 
              roughness={0.1}
              emissive="#3b82f6"
              emissiveIntensity={hovered ? 0.8 : 0.3}
            />
          </mesh>

          {/* Casino stool in front */}
          <group position={[0, 0, 1.2]}>
            {/* Stool seat - cushioned top */}
            <mesh position={[0, 0.65, 0]} castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.1, 32]} />
              <meshStandardMaterial 
                color="#8b0000" 
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>
            {/* Stool pole */}
            <mesh position={[0, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.6, 16]} />
              <meshStandardMaterial 
                color="#2a2a2a" 
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            {/* Stool base */}
            <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
              <meshStandardMaterial 
                color="#1a1a1a" 
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
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
    // Animate flying coins for slot machines when hovered
    if (modelPath.includes('slot-machine') && hovered) {
      coinsRef.current.forEach((coin) => {
        if (coin.startTime === 0) {
          coin.startTime = state.clock.elapsedTime;
        }
        const elapsed = state.clock.elapsedTime - coin.startTime;
        const distance = elapsed * coin.speed;

        coin.offset[0] = Math.cos(coin.angle) * distance;
        coin.offset[1] = 2 + Math.sin(elapsed * 3) * 0.5 - elapsed * 0.5;
        coin.offset[2] = Math.sin(coin.angle) * distance;

        // Reset coin if it's too far
        if (distance > 3) {
          coin.startTime = state.clock.elapsedTime;
        }
      });
    } else if (modelPath.includes('slot-machine') && !hovered) {
      // Reset all coins
      coinsRef.current.forEach((coin) => {
        coin.startTime = 0;
        coin.offset = [0, 0, 0];
      });
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
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

      {/* Outline glow effect for slot machines when hovered */}
      {hovered && modelPath.includes('slot-machine') && (
        <>
          {/* Glowing outline around cabinet */}
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.75, 0.8, 3.7, 32]} />
            <meshBasicMaterial 
              color="#ffd700" 
              transparent 
              opacity={0.3}
              wireframe={false}
            />
          </mesh>

          {/* Bright outer glow shell */}
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.8, 0.85, 3.8, 32]} />
            <meshBasicMaterial 
              color="#ffd700" 
              transparent 
              opacity={0.15}
            />
          </mesh>

          {/* Flying coins */}
          {coinsRef.current.map((coin, i) => coin.startTime > 0 && (
            <group key={i} position={coin.offset}>
              {/* Gold coin */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                <meshStandardMaterial 
                  color="#ffd700"
                  metalness={1}
                  roughness={0.2}
                  emissive="#ffd700"
                  emissiveIntensity={0.5}
                />
              </mesh>
              {/* Dollar sign on coin */}
              <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.01, 16]} />
                <meshBasicMaterial 
                  color="#ff8800"
                />
              </mesh>
            </group>
          ))}
        </>
      )}

      {/* Label */}
      {hovered && label && (
        <Text
          position={[0, modelPath.includes('slot-machine') ? 5 : 4, 0]}
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

// Cashier Window Component
function CashierWindow() {
  const { setShowAuthModal, user } = useUser();
  const [hovered, setHovered] = useState(false);

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

      {/* Cashier window display */}
      <mesh position={[0, 2, 0.26]} castShadow>
        <planeGeometry args={[5.5, 3.5]} />
        <meshStandardMaterial 
          color="#1a0f2e"
          emissive="#00ffff"
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

  // Different colors for each slot machine
  const machineColors = [
    "#6366f1", // Indigo
    "#ec4899", // Pink
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#06b6d4", // Cyan
    "#8b5cf6", // Purple
    "#ef4444", // Red
    "#14b8a6", // Teal
    "#f97316", // Orange
    "#a855f7"  // Violet
  ];

  return (
    <group>
      {/* Starry Ceiling */}
      <StarryCeiling roomSize={35} height={16} />

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
          machineColor={machineColors[i]}
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
          machineColor={machineColors[i + 5]}
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
      {/* Starry Ceiling */}
      <StarryCeiling roomSize={35} height={16} />

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
        <ambientLight intensity={0.8} color="#4a4a6e" />
        <spotLight
          position={[0, 10, 0]}
          angle={Math.PI / 2.5}
          penumbra={0.5}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          color="#ffffff"
        />
        {/* Purple lights for slot machines */}
        <pointLight position={[-14, 4, -10]} intensity={4} color="#a855f7" distance={15} />
        <pointLight position={[-14, 4, 0]} intensity={4} color="#a855f7" distance={15} />
        <pointLight position={[-14, 4, 10]} intensity={4} color="#a855f7" distance={15} />
        <pointLight position={[14, 4, -10]} intensity={4} color="#a855f7" distance={15} />
        <pointLight position={[14, 4, 0]} intensity={4} color="#a855f7" distance={15} />
        <pointLight position={[14, 4, 10]} intensity={4} color="#a855f7" distance={15} />
        {/* Cyan light for cashier window on back wall */}
        <pointLight position={[-10, 4, -16]} intensity={6} color="#00ffff" distance={15} />
      </>
    );
  } else if (roomType === 'fish') {
    return (
      <>
        <ambientLight intensity={0.8} color="#4a4a6e" />
        <spotLight
          position={[0, 10, 0]}
          angle={Math.PI / 2.5}
          penumbra={0.5}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          color="#ffffff"
        />
        {/* Cyan lights for fish tables */}
        <pointLight position={[-12, 4, -8]} intensity={4} color="#06b6d4" distance={15} />
        <pointLight position={[0, 4, -8]} intensity={4} color="#06b6d4" distance={15} />
        <pointLight position={[12, 4, -8]} intensity={4} color="#06b6d4" distance={15} />
        <pointLight position={[-12, 4, 8]} intensity={4} color="#06b6d4" distance={15} />
        <pointLight position={[0, 4, 8]} intensity={4} color="#06b6d4" distance={15} />
        <pointLight position={[12, 4, 8]} intensity={4} color="#06b6d4" distance={15} />
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
          <RoomWalls backRightDoor={true} backSign="JADE ROYALE" />
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
          gl.setClearColor('#1a1a3e');
          scene.fog = new THREE.Fog('#1a1a3e', 40, 70);
        }}
      >
        <Scene />
        <Environment preset="night" background={false} />
        <PointerLockControls 
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </RoomContext.Provider>
  );
}

export function CasinoScene() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <CanvasWrapper />
    </div>
  );
}