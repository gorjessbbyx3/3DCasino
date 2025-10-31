import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree, useLoader, ThreeEvent } from "@react-three/fiber";
import { Environment, Text, OrbitControls, useTexture, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import { useUser } from "@/lib/stores/useUser";
import { useRoom } from "@/lib/stores/useRoom";

const openCashierModal = () => {
  window.dispatchEvent(new CustomEvent('openCashierModal'));
};

const openSlotMachineModal = (machineNumber: number) => {
  window.dispatchEvent(new CustomEvent('openSlotMachineModal', { detail: { machineNumber } }));
};


// Clickable entrance component (to fish games)
function ClickableEntrance({ position, doorWidth, doorHeight }: { 
  position: [number, number, number]; 
  doorWidth: number;
  doorHeight: number;
}) {
  const { camera } = useThree();
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // Teleport through the door
    camera.position.set(0, 2.4, -17);
  };
  
  return (
    <mesh 
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <planeGeometry args={[doorWidth, doorHeight]} />
      <meshStandardMaterial 
        map={useTexture("/fish-entrance.png")}
        emissive="#ffffff"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

// Clickable exit door component (back to lobby)
function ClickableDoorExit({ position, doorWidth, doorHeight }: { 
  position: [number, number, number]; 
  doorWidth: number;
  doorHeight: number;
}) {
  const { camera } = useThree();
  const { setCurrentRoom } = useRoom();
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // Return to slots lobby
    setCurrentRoom('slots');
    camera.position.set(0, 2.4, -14);
  };
  
  return (
    <mesh 
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <planeGeometry args={[doorWidth, doorHeight]} />
      <meshStandardMaterial 
        color="#1a1a2e"
        emissive="#06b6d4"
        emissiveIntensity={0.3}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// Room walls with doorways
function RoomWalls({ roomSize = 35, backLeftDoor = false, backRightDoor = false, frontDoor = false, backSign = "" }: { 
  roomSize?: number; 
  backLeftDoor?: boolean; 
  backRightDoor?: boolean;
  frontDoor?: boolean;
  backSign?: string;
}) {
  const wallHeight = 22; // Increased from 16 to 22 to prevent sign cutoff
  const doorWidth = 6;
  const doorHeight = 5;
  
  return (
    <group>
      {/* Back Wall with optional doors underneath sign */}
      {backLeftDoor || backRightDoor ? (
        <>
          {/* Wall above doors - black */}
          <mesh position={[0, wallHeight - doorHeight / 2 - 0.5, -roomSize / 2]} receiveShadow>
            <boxGeometry args={[roomSize, wallHeight - doorHeight - 1, 1]} />
            <meshStandardMaterial 
              color="#0f0f1a"
              roughness={0.6}
              metalness={0.4}
            />
          </mesh>
          
          
          {/* Left hallway entrance - Fish Games */}
          {backLeftDoor && (
            <>
              <ClickableEntrance 
                position={[-doorWidth / 2 - 1, doorHeight / 2, -roomSize / 2 + 0.01]}
                doorWidth={doorWidth}
                doorHeight={doorHeight}
              />
              
              {/* Hallway corridor extending back */}
              <group position={[-doorWidth / 2 - 1, 0, -roomSize / 2]}>
                {/* Left hallway wall - dark */}
                <mesh position={[-doorWidth / 2, doorHeight / 2, -4]} castShadow receiveShadow>
                  <boxGeometry args={[0.5, doorHeight, 8]} />
                  <meshStandardMaterial 
                    color="#1a1a2e"
                    roughness={0.5}
                    metalness={0.3}
                  />
                </mesh>
                
                {/* Right hallway wall - dark */}
                <mesh position={[doorWidth / 2, doorHeight / 2, -4]} castShadow receiveShadow>
                  <boxGeometry args={[0.5, doorHeight, 8]} />
                  <meshStandardMaterial 
                    color="#1a1a2e"
                    roughness={0.5}
                    metalness={0.3}
                  />
                </mesh>
                
                {/* Hallway ceiling - dark */}
                <mesh position={[0, doorHeight, -4]} receiveShadow>
                  <boxGeometry args={[doorWidth, 0.3, 8]} />
                  <meshStandardMaterial 
                    color="#0a0a1a"
                    roughness={0.4}
                    metalness={0.5}
                  />
                </mesh>
                
                {/* Hallway floor - dark */}
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
              
              {/* Hallway entrance sign - large and prominent */}
              <group position={[-doorWidth / 2 - 1, doorHeight + 1.5, -roomSize / 2 + 1]}>
                <Text
                  fontSize={1.5}
                  color="#06b6d4"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.15}
                  outlineColor="#ffffff"
                  letterSpacing={0.05}
                >
                  🎣 FISH GAMES 🎣
                </Text>
                
                {/* Glow effect for the sign */}
                <pointLight position={[0, 0, 0.5]} color="#06b6d4" intensity={20} distance={8} />
                
                {/* Decorative border lights */}
                {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
                  <mesh key={i} position={[x, 0.8, 0]}>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial
                      color="#06b6d4"
                      emissive="#06b6d4"
                      emissiveIntensity={3}
                    />
                  </mesh>
                ))}
                {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
                  <mesh key={`bottom-${i}`} position={[x, -0.8, 0]}>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshStandardMaterial
                      color="#06b6d4"
                      emissive="#06b6d4"
                      emissiveIntensity={3}
                    />
                  </mesh>
                ))}
              </group>
            </>
          )}
          
          {/* Right door opening */}
          {backRightDoor && (
            <>
              <ClickableEntrance 
                position={[doorWidth / 2 + 1, doorHeight / 2, -roomSize / 2 + 0.01]}
                doorWidth={doorWidth}
                doorHeight={doorHeight}
              />
            </>
          )}
        </>
      ) : (
        <mesh position={[0, wallHeight / 2, -roomSize / 2]} receiveShadow>
          <boxGeometry args={[roomSize, wallHeight, 1]} />
          <meshStandardMaterial color="#0f0f1a" roughness={0.6} metalness={0.4} />
        </mesh>
      )}

      {/* Left Wall - black */}
      <mesh position={[-roomSize / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[1, wallHeight, roomSize]} />
        <meshStandardMaterial 
          color="#0f0f1a"
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* Right Wall - black */}
      <mesh position={[roomSize / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[1, wallHeight, roomSize]} />
        <meshStandardMaterial 
          color="#0f0f1a"
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>

      {/* Front Wall with optional door back to lobby */}
      {frontDoor ? (
        <>
          {/* Wall above door */}
          <mesh position={[0, wallHeight - doorHeight / 2 - 0.5, roomSize / 2]} receiveShadow>
            <boxGeometry args={[roomSize, wallHeight - doorHeight - 1, 1]} />
            <meshStandardMaterial 
              color="#0f0f1a"
              roughness={0.6}
              metalness={0.4}
            />
          </mesh>
          
          {/* Wall left of door */}
          <mesh position={[-roomSize / 2 + (roomSize - doorWidth) / 4, doorHeight / 2, roomSize / 2]} receiveShadow>
            <boxGeometry args={[(roomSize - doorWidth) / 2, doorHeight, 1]} />
            <meshStandardMaterial 
              color="#0f0f1a"
              roughness={0.6}
              metalness={0.4}
            />
          </mesh>
          
          {/* Wall right of door */}
          <mesh position={[roomSize / 2 - (roomSize - doorWidth) / 4, doorHeight / 2, roomSize / 2]} receiveShadow>
            <boxGeometry args={[(roomSize - doorWidth) / 2, doorHeight, 1]} />
            <meshStandardMaterial 
              color="#0f0f1a"
              roughness={0.6}
              metalness={0.4}
            />
          </mesh>
          
          {/* Clickable door to return to lobby */}
          <ClickableDoorExit position={[0, doorHeight / 2, roomSize / 2 - 0.01]} doorWidth={doorWidth} doorHeight={doorHeight} />
          
          {/* EXIT text on door */}
          <Text
            position={[0, doorHeight / 2 + 1, roomSize / 2 - 0.5]}
            fontSize={1.2}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.1}
            outlineColor="#ffffff"
          >
            ← EXIT TO LOBBY
          </Text>
          
          {/* Door lighting */}
          <pointLight position={[0, doorHeight, roomSize / 2 - 2]} color="#06b6d4" intensity={15} distance={10} />
        </>
      ) : (
        <mesh position={[0, wallHeight / 2, roomSize / 2]} receiveShadow>
          <boxGeometry args={[roomSize, wallHeight, 1]} />
          <meshStandardMaterial 
            color="#0f0f1a"
            roughness={0.6}
            metalness={0.4}
          />
        </mesh>
      )}

      {/* Back wall sign - Image display */}
      {backSign && backSign === "JADE ROYALE" ? (
        <mesh position={[0, 16, -roomSize / 2 + 0.6]}>
          <planeGeometry args={[28, 12]} />
          <meshStandardMaterial 
            map={useTexture("/textures/jade-royale-sign.jpeg")}
            transparent={false}
          />
          <pointLight position={[0, 0, 1]} color="#ffffff" intensity={40} distance={20} />
        </mesh>
      ) : backSign ? (
        <group position={[0, wallHeight - 2, -roomSize / 2 + 0.6]}>
          {/* Main sign text - green with white glow */}
          <Text
            position={[0, 0, 0]}
            fontSize={2.5}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.25}
            outlineColor="#ffffff"
            letterSpacing={0.1}
          >
            {backSign}
          </Text>
          
          {/* Outer glow effect using point lights */}
          <pointLight position={[0, 0, 1]} color="#ffffff" intensity={50} distance={15} />
          <pointLight position={[-5, 0, 1]} color="#00ff00" intensity={30} distance={10} />
          <pointLight position={[5, 0, 1]} color="#00ff00" intensity={30} distance={10} />
          
          {/* Marquee bulbs around the sign */}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * Math.PI * 2;
            const radiusX = 12;
            const radiusY = 2.5;
            const x = Math.cos(angle) * radiusX;
            const y = Math.sin(angle) * radiusY;
            return (
              <mesh key={i} position={[x, y, 0.1]}>
                <sphereGeometry args={[0.15, 8, 8]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#ffffff"
                  emissiveIntensity={2 + Math.sin(Date.now() * 0.003 + i * 0.5) * 1.5}
                />
              </mesh>
            );
          })}
          
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
      ) : null}
    </group>
  );
}

// Starry ceiling component
function StarryCeiling({ roomSize, height }: { roomSize: number; height: number }) {
  const starsRef = useRef<THREE.Group>(null);
  
  // Generate random star positions - stable across renders
  const stars = useMemo(() => {
    const starArray: { pos: [number, number, number]; size: number; brightness: number }[] = [];
    const numStars = 200;
    
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

// Video material component for fish tables
function VideoMaterial({ videoUrl }: { videoUrl: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    console.log('VideoMaterial: Loading video:', videoUrl);
    const video = document.createElement('video');
    video.src = videoUrl;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.autoplay = true;
    
    // Try to play when data is loaded
    const handleLoadedData = () => {
      console.log('VideoMaterial: Video data loaded, attempting to play:', videoUrl);
      video.play()
        .then(() => {
          console.log('VideoMaterial: Video playing successfully:', videoUrl);
          setIsPlaying(true);
        })
        .catch((error) => {
          console.log('VideoMaterial: Autoplay blocked, setting up interaction listener:', error);
          // Autoplay blocked - try again on any user interaction
          const playOnInteraction = () => {
            video.play()
              .then(() => {
                setIsPlaying(true);
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
                document.removeEventListener('keydown', playOnInteraction);
              })
              .catch(() => {});
          };
          
          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('touchstart', playOnInteraction, { once: true });
          document.addEventListener('keydown', playOnInteraction, { once: true });
        });
    };

    video.addEventListener('loadeddata', handleLoadedData);

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    
    videoRef.current = video;
    setVideoTexture(texture);

    return () => {
      video.pause();
      video.removeEventListener('loadeddata', handleLoadedData);
      video.src = '';
      texture.dispose();
    };
  }, [videoUrl]);

  // Update texture each frame when playing
  useFrame(() => {
    if (videoTexture && videoRef.current && isPlaying) {
      videoTexture.needsUpdate = true;
    }
  });

  if (!videoTexture) {
    return <meshStandardMaterial color="#000000" emissive="#06b6d4" emissiveIntensity={2} />;
  }

  return <meshStandardMaterial map={videoTexture} toneMapped={false} />;
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
  screenImage?: string;
  videoUrl?: string;
  gameNameImage?: string;
}

function GameObject({
  position,
  rotation = [0, 0, 0],
  modelPath,
  scale = 1,
  onClick,
  label,
  glowColor = "#10b981",
  machineColor = "#6366f1",
  screenImage,
  videoUrl,
  gameNameImage
}: GameObjectProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const coinsRef = useRef<Array<{ offset: [number, number, number], speed: number, angle: number, startTime: number }>>([]);
  
  // Load textures unconditionally (React hooks rule)
  // Use a placeholder image if none provided to avoid conditional hook calls
  const screenTexture = useTexture(screenImage || "/textures/disco-floor.png");
  const gameNameTexture = useTexture(gameNameImage || "/textures/disco-floor.png");
  
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
      // 9:16 aspect ratio for vertical screen
      const screenWidth = 1.4;
      const screenHeight = screenWidth * (16 / 9); // 2.49
      
      return (
        <group>
          {/* Premium curved cabinet - sleeker and taller for 9:16 screen */}
          <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.6, 0.65, 4.0, 32]} />
            <meshStandardMaterial 
              color="#0a0a1e" 
              metalness={0.98} 
              roughness={0.05}
              emissive={machineColor}
              emissiveIntensity={hovered ? 0.6 : 0.3}
            />
          </mesh>
          
          {/* Game name image placeholder above screen */}
          {gameNameImage && (
            <mesh position={[0, 4.5, 0.66]} castShadow>
              <planeGeometry args={[1.2, 0.4]} />
              <meshStandardMaterial 
                map={gameNameTexture}
                toneMapped={false}
                transparent={true}
              />
              <pointLight 
                position={[0, 0, 0.3]} 
                color="#ffffff" 
                intensity={3} 
                distance={2} 
              />
            </mesh>
          )}
          
          {/* 9:16 vertical screen - for game display or video */}
          <mesh position={[0, 2.3, 0.66]} castShadow>
            <planeGeometry args={[screenWidth, screenHeight]} />
            {videoUrl ? (
              <VideoMaterial videoUrl={videoUrl} />
            ) : screenImage ? (
              <meshStandardMaterial 
                map={screenTexture}
                toneMapped={false}
              />
            ) : (
              <meshStandardMaterial 
                color="#000000" 
                emissive={machineColor}
                emissiveIntensity={hovered ? 4.5 : 3.2}
              />
            )}
          </mesh>
          
          {/* Screen backlight for visibility */}
          {(screenImage || videoUrl) && (
            <pointLight 
              position={[0, 2.3, 0.8]} 
              color="#ffffff" 
              intensity={hovered ? 10 : 6} 
              distance={3.5} 
            />
          )}
          
          {/* LED strip lights around screen */}
          {Array.from({ length: 20 }).map((_, i) => {
            const perimeter = (screenWidth + screenHeight) * 2;
            const distance = (i / 20) * perimeter;
            let x = 0, y = 0;
            
            if (distance < screenWidth) {
              x = -screenWidth / 2 + distance;
              y = -screenHeight / 2;
            } else if (distance < screenWidth + screenHeight) {
              x = screenWidth / 2;
              y = -screenHeight / 2 + (distance - screenWidth);
            } else if (distance < screenWidth * 2 + screenHeight) {
              x = screenWidth / 2 - (distance - screenWidth - screenHeight);
              y = screenHeight / 2;
            } else {
              x = -screenWidth / 2;
              y = screenHeight / 2 - (distance - screenWidth * 2 - screenHeight);
            }
            
            return (
              <mesh key={i} position={[x, 2.3 + y, 0.68]} castShadow>
                <sphereGeometry args={[0.02, 8, 8]} />
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
          {/* Screen - video or cyan glow rectangular */}
          <mesh position={[0, 0.86, 0]} castShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.8, 2.3]} />
            {videoUrl ? (
              <VideoMaterial videoUrl={videoUrl} />
            ) : (
              <meshStandardMaterial 
                color="#000000" 
                emissive="#06b6d4" 
                emissiveIntensity={2}
              />
            )}
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

      {/* Label - removed to show only glow effect */}
    </group>
  );
}

// Video Material Component for Cashier
function CashierVideoMaterial() {
  const texture = useVideoTexture('/videos/cashier.mp4');

  return (
    <meshBasicMaterial
      map={texture}
      toneMapped={false}
    />
  );
}

// Cashier Window Component with Video and Text Bubbles
function CashierWindow() {
  const { setShowAuthModal, user } = useUser();
  const [hoveredButton, setHoveredButton] = useState<'add' | 'withdraw' | null>(null);

  const handleButtonClick = (action: 'add' | 'withdraw') => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      openCashierModal();
    }
  };

  return (
    <group position={[-10, 3, -16.5]}>
      {/* Cashier booth frame */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[8, 5, 0.5]} />
        <meshStandardMaterial 
          color="#1a0f2e" 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Video display */}
      <mesh position={[0, 2, 0.26]} castShadow>
        <planeGeometry args={[7.5, 4.5]} />
        <CashierVideoMaterial />
      </mesh>

      {/* Glowing CASHIER sign above */}
      <Text
        position={[0, 5, 0.3]}
        fontSize={0.7}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#0891b2"
      >
        💰 CASHIER 💰
      </Text>

      {/* Add Credits Button - Left side */}
      <group position={[-3.5, 0, 0.5]}>
        {/* Speech bubble background */}
        <mesh
          onClick={() => handleButtonClick('add')}
          onPointerOver={() => {
            setHoveredButton('add');
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHoveredButton(null);
            document.body.style.cursor = "auto";
          }}
        >
          <planeGeometry args={[2.8, 1.2]} />
          <meshBasicMaterial 
            color={hoveredButton === 'add' ? "#00ff00" : "#ffffff"}
            transparent
            opacity={0.95}
          />
        </mesh>
        
        {/* Button text */}
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.35}
          color={hoveredButton === 'add' ? "#000000" : "#1a0f2e"}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          💵 Add Credits?
        </Text>

        {/* Glow effect */}
        {hoveredButton === 'add' && (
          <pointLight
            position={[0, 0, 0.5]}
            color="#00ff00"
            intensity={8}
            distance={4}
          />
        )}
      </group>

      {/* Withdraw Button - Right side */}
      <group position={[3.5, 0, 0.5]}>
        {/* Speech bubble background */}
        <mesh
          onClick={() => handleButtonClick('withdraw')}
          onPointerOver={() => {
            setHoveredButton('withdraw');
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHoveredButton(null);
            document.body.style.cursor = "auto";
          }}
        >
          <planeGeometry args={[2.8, 1.2]} />
          <meshBasicMaterial 
            color={hoveredButton === 'withdraw' ? "#ffd700" : "#ffffff"}
            transparent
            opacity={0.95}
          />
        </mesh>
        
        {/* Button text */}
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.35}
          color={hoveredButton === 'withdraw' ? "#000000" : "#1a0f2e"}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          🏦 Withdraw?
        </Text>

        {/* Glow effect */}
        {hoveredButton === 'withdraw' && (
          <pointLight
            position={[0, 0, 0.5]}
            color="#ffd700"
            intensity={8}
            distance={4}
          />
        )}
      </group>

      {/* Ambient lighting for cashier area */}
      <pointLight
        position={[0, 2, 2]}
        color="#00ffff"
        intensity={5}
        distance={10}
      />
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

  // Calculate curved line positions for all 13 slot machines
  const totalMachines = 13;
  const machineSpacing = 3.8;
  const curveAmount = 3; // How much the ends curve forward
  
  const slotPositions = Array.from({ length: totalMachines }, (_, i) => {
    // Center the machines around x=0
    const xPos = (i - (totalMachines - 1) / 2) * machineSpacing;
    
    // Calculate curve: parabolic curve where outer machines move forward
    // Normalized position from -1 (leftmost) to 1 (rightmost)
    const normalizedPos = (i - (totalMachines - 1) / 2) / ((totalMachines - 1) / 2);
    // Parabolic curve: z = -14 + curve * (normalized^2)
    const zPos = -14 + curveAmount * Math.pow(normalizedPos, 2);
    
    return { x: xPos, z: zPos };
  });

  return (
    <group>
      {/* Starry Ceiling */}
      <StarryCeiling roomSize={55} height={22} />
      
      {/* Left Wall with new texture - positioned slightly inside to show in front of black wall */}
      <mesh position={[-27.0, 11, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 22, 55]} />
        <meshStandardMaterial 
          map={useTexture("/wall-texture.jpeg")}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Right Wall with new texture - positioned slightly inside to show in front of black wall */}
      <mesh position={[27.0, 11, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 22, 55]} />
        <meshStandardMaterial 
          map={useTexture("/wall-texture.jpeg")}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* STRAIGHT LINE WITH CURVED ENDS - All 13 machines facing forward */}
      {slotPositions.map((pos, i) => (
        <GameObject
          key={`slot-${i}`}
          position={[pos.x, 0, pos.z]}
          rotation={[0, 0, 0]}
          modelPath="slot-machine"
          scale={2.5}
          onClick={() => handleSlotMachineClick(i + 1)}
          label={`Slot Machine ${i + 1}`}
          glowColor="#a855f7"
          machineColor={machineColors[i % machineColors.length]}
          videoUrl={
            i === 0 ? "/videos/olympus-promo.mp4" :
            i === 1 ? "/videos/bigger-bass.mp4" :
            i === 6 ? "/videos/slot-game-1.mp4" :
            i === 7 ? "/videos/slot-game-2.mp4" :
            undefined
          }
          gameNameImage={
            i === 0 ? "/slot-olympus.png" :
            i === 1 ? "/slot-bass.webp" :
            i === 6 ? "/slot-olympus.png" :
            i === 7 ? "/slot-bass.webp" :
            undefined
          }
        />
      ))}
    </group>
  );
}

// Holographic Video Display Component
function HolographicVideo({ position, videoUrl }: { position: [number, number, number]; videoUrl: string }) {
  return (
    <group position={position}>
      {/* Holographic frame with glowing edges */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.5, 0.05, 3]} />
        <meshStandardMaterial 
          color="#06b6d4" 
          emissive="#06b6d4" 
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Video plane floating above table */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 2.8]} />
        <VideoMaterial videoUrl={videoUrl} />
      </mesh>
      
      {/* Holographic glow effect */}
      <pointLight position={[0, 0, 0]} color="#06b6d4" intensity={3} distance={8} />
      
      {/* Corner markers for holographic effect */}
      {[
        [-2.1, 0, -1.4], [2.1, 0, -1.4], 
        [-2.1, 0, 1.4], [2.1, 0, 1.4]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial 
            color="#06b6d4" 
            emissive="#06b6d4" 
            emissiveIntensity={3}
          />
        </mesh>
      ))}
    </group>
  );
}

// Fish Game Room
function FishGameRoom() {
  const { setShowAuthModal, user } = useUser();
  const { selectedFishTable, setSelectedFishTable } = useRoom();
  const roomSize = 35;

  const handleTableClick = (tableNumber: number) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      // Toggle selection - if clicking the same table, deselect it
      setSelectedFishTable(selectedFishTable === tableNumber ? null : tableNumber);
    }
  };

  // Fish tables arranged in a single horizontal line
  const tableSpacing = 5.5;
  const tablePositions = Array.from({ length: 6 }, (_, i) => ({
    x: (i - 2.5) * tableSpacing,
    z: -10,
    tableNumber: i + 1
  }));

  return (
    <group>
      {/* Starry Ceiling */}
      <StarryCeiling roomSize={35} height={22} />
      
      {/* Left Wall with new texture */}
      <mesh position={[-roomSize / 2, 11, 0]} receiveShadow>
        <boxGeometry args={[1, 22, roomSize]} />
        <meshStandardMaterial 
          map={useTexture("/wall-texture.jpeg")}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Right Wall with new texture */}
      <mesh position={[roomSize / 2, 11, 0]} receiveShadow>
        <boxGeometry args={[1, 22, roomSize]} />
        <meshStandardMaterial 
          map={useTexture("/wall-texture.jpeg")}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Front Wall with new texture */}
      <mesh position={[0, 11, roomSize / 2]} receiveShadow>
        <boxGeometry args={[roomSize, 22, 1]} />
        <meshStandardMaterial 
          map={useTexture("/wall-texture.jpeg")}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Back Wall with new texture */}
      <mesh position={[0, 11, -roomSize / 2]} receiveShadow>
        <boxGeometry args={[roomSize, 22, 1]} />
        <meshStandardMaterial 
          map={useTexture("/wall-texture.jpeg")}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* 6 Fish Tables in a single horizontal line - NO video on table surface */}
      {tablePositions.map(({ x, z, tableNumber }) => (
        <GameObject
          key={`fish-${tableNumber}`}
          position={[x, 0, z]}
          modelPath="fish-table"
          scale={1.8}
          onClick={() => handleTableClick(tableNumber)}
          label={`Fish Table ${tableNumber}`}
          glowColor={selectedFishTable === tableNumber ? "#00ff00" : "#06b6d4"}
        />
      ))}
      
      {/* Holographic video display above selected table */}
      {selectedFishTable !== null && (
        <HolographicVideo 
          position={[
            tablePositions[selectedFishTable - 1].x,
            3.5, // Height above table
            tablePositions[selectedFishTable - 1].z
          ]}
          videoUrl={
            selectedFishTable % 2 === 0 
              ? "/videos/fish-game-2.mp4" 
              : "/videos/fish-game-1.mp4"
          }
        />
      )}
    </group>
  );
}

// Room lighting based on room type
function RoomLighting({ roomType }: { roomType: 'slots' | 'fish' }) {
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
        {/* Purple lights for slot machines along the line */}
        <pointLight position={[-15, 4, -12]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[-10, 4, -14]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[-5, 4, -14]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[0, 4, -14]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[5, 4, -14]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[10, 4, -14]} intensity={3} color="#a855f7" distance={12} />
        <pointLight position={[15, 4, -12]} intensity={3} color="#a855f7" distance={12} />
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

// Keyboard movement controls with smooth walking
function KeyboardMovementControls() {
  const { camera, controls } = useThree();
  const { currentRoom, setCurrentRoom, setSelectedFishTable } = useRoom();
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysPressed.current[key] = true;
        console.log('Key pressed:', key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const moveSpeed = 8 * delta; // Units per second
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    // Adjust camera FOV for mobile devices to zoom in
    const isMobile = window.innerWidth < 768;
    if (isMobile && camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 40;
      camera.updateProjectionMatrix();
    } else if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 50;
      camera.updateProjectionMatrix();
    }

    // Get camera direction vectors
    camera.getWorldDirection(forward);
    forward.y = 0; // Keep movement on horizontal plane
    forward.normalize();
    
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    right.normalize();

    // Track if we moved
    let moved = false;

    // WASD and Arrow key movement
    if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
      camera.position.addScaledVector(forward, moveSpeed);
      moved = true;
    }
    if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
      camera.position.addScaledVector(forward, -moveSpeed);
      moved = true;
    }
    if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
      camera.position.addScaledVector(right, -moveSpeed);
      moved = true;
    }
    if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
      camera.position.addScaledVector(right, moveSpeed);
      moved = true;
    }

    // Update OrbitControls target to follow camera position
    if (moved && controls) {
      const orbitControls = controls as any;
      if (orbitControls.target) {
        // Keep the target in front of the camera
        const targetPosition = camera.position.clone();
        targetPosition.addScaledVector(forward, 5);
        targetPosition.y = 3.5;
        orbitControls.target.copy(targetPosition);
      }
    }

    // Room transitions based on position - door on back wall
    if (currentRoom === 'slots') {
      // Back door to fish games (under sign)
      if (camera.position.z < -17) {
        setCurrentRoom('fish');
        camera.position.set(0, 3.5, 15);
      }
    } else if (currentRoom === 'fish') {
      // Front door back to slots lobby
      if (camera.position.z > 17) {
        setCurrentRoom('slots');
        setSelectedFishTable(null); // Clear fish table selection when leaving
        camera.position.set(0, 3.5, -15);
      }
    }

    // Keep camera within current room bounds (expanded for slot machine access)
    camera.position.x = Math.max(-25, Math.min(25, camera.position.x));
    camera.position.z = Math.max(-18, Math.min(18, camera.position.z));
    camera.position.y = 3.5; // Elevated view to see more of the casino
  });

  return null;
}

// Clickable floor for teleportation
function ClickableFloor({ roomSize = 55 }: { roomSize?: number }) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Load custom floor texture
  const floorTexture = useTexture("/textures/disco-floor.png");
  
  // Configure texture for proper tiling
  useEffect(() => {
    if (floorTexture) {
      floorTexture.wrapS = THREE.RepeatWrapping;
      floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.repeat.set(6, 6); // More repeats for colorful tiles
    }
  }, [floorTexture]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const point = event.point;
    // Teleport camera to clicked position, elevated view
    camera.position.set(point.x, 3.5, point.z);
  };

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
      onClick={handleClick}
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
      <planeGeometry args={[roomSize, roomSize]} />
      <meshStandardMaterial
        map={floorTexture}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function Scene() {
  const { currentRoom } = useRoom();

  return (
    <>
      <KeyboardMovementControls />
      <RoomLighting roomType={currentRoom} />
      <ClickableFloor />
      
      {currentRoom === 'slots' && (
        <>
          <RoomWalls roomSize={55} backSign="JADE ROYALE" />
          <SlotMachineRoom />
        </>
      )}
      
      {currentRoom === 'fish' && (
        <>
          <RoomWalls backSign="🎣 FISH GAMES 🎣" frontDoor={true} />
          <FishGameRoom />
        </>
      )}
    </>
  );
}

function CanvasWrapper() {
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglError(true);
    }
  }, []);

  if (webglError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4">🎰 Jade Royale Casino</h1>
          <p className="text-xl text-purple-200 mb-4">
            Your browser doesn't support WebGL, which is required for our 3D casino experience.
          </p>
          <p className="text-sm text-purple-300">
            Please try using a modern browser like Chrome, Firefox, Safari, or Edge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      shadows
      camera={{ 
        position: [0, 3.5, 14], 
        fov: 50,
        near: 0.1,
        far: 1000
      }}
      gl={{ 
        antialias: true, 
        alpha: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false
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
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          rotateSpeed={0.5}
          target={[0, 3.5, 0]}
        />
      </Suspense>
    </Canvas>
  );
}

// Navigation arrows component
function NavigationArrows() {
  const { currentRoom, setCurrentRoom } = useRoom();
  const { user, setShowAuthModal } = useUser();

  const handleLeftArrowClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      openCashierModal();
    }
  };

  const handleRightArrowClick = () => {
    if (currentRoom === 'slots') {
      setCurrentRoom('fish');
    }
  };

  // Only show navigation arrows in slots room
  if (currentRoom !== 'slots') return null;

  return (
    <>
      {/* Left Arrow - Cashier */}
      <button
        onClick={handleLeftArrowClick}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-cyan-500/80 hover:bg-cyan-400 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 group"
        aria-label="Go to Cashier"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
        </svg>
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          CASHIER
        </div>
      </button>

      {/* Right Arrow - Fish Games */}
      <button
        onClick={handleRightArrowClick}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50 bg-purple-500/80 hover:bg-purple-400 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 group"
        aria-label="Go to Fish Games"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
        <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          FISH GAMES
        </div>
      </button>
    </>
  );
}

export function CasinoScene() {
  return (
    <>
      <CanvasWrapper />
      <NavigationArrows />
    </>
  );
}
