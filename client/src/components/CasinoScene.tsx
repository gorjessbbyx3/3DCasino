import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useUser } from "@/lib/stores/useUser";

function CasinoFloor() {
  return (
    <group>
      {/* Main carpet floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#2a0f0f"
          roughness={0.8}
          metalness={0.1}
          normalScale={[0.5, 0.5]}
        />
      </mesh>

      {/* Decorative border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <ringGeometry args={[45, 48, 64]} />
        <meshStandardMaterial
          color="#ffd700"
          roughness={0.3}
          metalness={0.7}
          emissive="#332200"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Center medallion */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial
          color="#10b981"
          roughness={0.2}
          metalness={0.8}
          emissive="#0a5d3a"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}

function CasinoWalls() {
  const wallHeight = 10;
  const wallThickness = 0.5;
  const roomSize = 50;

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: "#1a0f0a",
    roughness: 0.4,
    metalness: 0.2,
    normalScale: new THREE.Vector2(0.3, 0.3)
  });

  return (
    <group>
      {/* Main walls with pillars */}
      {[
        [0, wallHeight / 2, -roomSize / 2, [roomSize, wallHeight, wallThickness]],
        [0, wallHeight / 2, roomSize / 2, [roomSize, wallHeight, wallThickness]],
        [-roomSize / 2, wallHeight / 2, 0, [wallThickness, wallHeight, roomSize]],
        [roomSize / 2, wallHeight / 2, 0, [wallThickness, wallHeight, roomSize]]
      ].map((wall, i) => (
        <group key={i}>
          <mesh position={wall[0] as [number, number, number]} receiveShadow castShadow>
            <boxGeometry args={wall[1] as [number, number, number]} />
            <primitive object={wallMaterial.clone()} />
          </mesh>

          {/* Decorative trim */}
          <mesh position={[
            (wall[0] as [number, number, number])[0],
            wallHeight - 0.5,
            (wall[0] as [number, number, number])[2]
          ]} receiveShadow>
            <boxGeometry args={[
              (wall[1] as [number, number, number])[0] * 1.02,
              0.3,
              (wall[1] as [number, number, number])[2] * 1.02
            ]} />
            <meshStandardMaterial
              color="#ffd700"
              roughness={0.2}
              metalness={0.8}
              emissive="#332200"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      ))}

      {/* Ornate ceiling */}
      <mesh position={[0, wallHeight, 0]} receiveShadow>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial
          color="#0a0505"
          side={THREE.DoubleSide}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Chandelier */}
      <mesh position={[0, wallHeight - 1, 0]} castShadow>
        <sphereGeometry args={[1.5, 16, 8]} />
        <meshStandardMaterial
          color="#ffd700"
          roughness={0.1}
          metalness={0.9}
          emissive="#ffaa00"
          emissiveIntensity={0.3}
        />
      </mesh>
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
}

function GameObject({ position, rotation = [0, 0, 0], modelPath, scale = 2.5, onClick, label }: GameObjectProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    if (meshRef.current) {
      if (hovered) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.rotation.y += 0.01;
      } else {
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.1);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotation[1], 0.1);
      }
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={hovered ? scale * 1.05 : scale}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) {
          onClick();
        }
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
      <primitive object={clonedScene} />

      {/* Glow effect when hovered */}
      {hovered && (
        <pointLight
          position={[0, 2, 0]}
          color="#10b981"
          intensity={20}
          distance={10}
        />
      )}

      {/* Enhanced label */}
      {hovered && label && (
        <group position={[0, 3.5, 0]}>
          <mesh>
            <planeGeometry args={[3, 0.8]} />
            <meshBasicMaterial
              color="#000000"
              opacity={0.8}
              transparent
            />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[2.8, 0.6]} />
            <meshBasicMaterial
              color="#10b981"
              opacity={0.9}
              transparent
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

function CasinoObjects() {
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

  const slotPositions: [number, number, number][] = [
    [-15, 0, -15], [-10, 0, -15], [-5, 0, -15],
    [5, 0, -15], [10, 0, -15], [15, 0, -15],
    [-15, 0, 15], [-5, 0, 15],
    [5, 0, 15], [15, 0, 15]
  ];

  const fishTablePositions: [number, number, number][] = [
    [-10, 0, 0], [0, 0, 0], [10, 0, 0],
    [-10, 0, 8], [0, 0, 8], [10, 0, 8]
  ];

  return (
    <>
      {slotPositions.map((pos, i) => (
        <GameObject
          key={`slot-${i}`}
          position={pos}
          rotation={[0, Math.PI, 0]}
          modelPath="/models/slot-machine.glb"
          onClick={handleGameClick}
          label="Slot Machine"
        />
      ))}

      {fishTablePositions.map((pos, i) => (
        <GameObject
          key={`fish-${i}`}
          position={pos}
          modelPath="/models/fish-table.glb"
          onClick={handleGameClick}
          label="Fish Table"
        />
      ))}

      <GameObject
        position={[0, 0, -20]}
        modelPath="/models/cashier-booth.glb"
        scale={3}
        onClick={handleCashierClick}
        label="Cashier"
      />

      <GameObject
        position={[0, 0, -20]}
        rotation={[0, 0, 0]}
        modelPath="/models/pitbull-pirate.glb"
        scale={1.5}
        onClick={handleCashierClick}
      />
    </>
  );
}

function Lighting() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 25 + Math.sin(state.clock.elapsedTime * 2) * 5;
    }
  });

  return (
    <>
      {/* Ambient lighting with warmer tone */}
      <ambientLight intensity={0.2} color="#fff8dc" />

      {/* Main dramatic spotlight on cashier */}
      <spotLight
        position={[0, 12, -18]}
        target-position={[0, 0, -20]}
        angle={0.4}
        penumbra={0.6}
        intensity={80}
        castShadow
        color="#10b981"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Corner accent lights with color variation */}
      <pointLight position={[-20, 7, -20]} intensity={15} color="#ff6b6b" />
      <pointLight position={[20, 7, -20]} intensity={15} color="#4ecdc4" />
      <pointLight position={[-20, 7, 20]} intensity={15} color="#ffe66d" />
      <pointLight position={[20, 7, 20]} intensity={15} color="#a8e6cf" />

      {/* Slot machine area lighting */}
      <spotLight
        position={[-10, 8, -12]}
        target-position={[-10, 0, -15]}
        angle={0.6}
        penumbra={0.4}
        intensity={40}
        color="#ffd700"
        castShadow
      />
      <spotLight
        position={[10, 8, -12]}
        target-position={[10, 0, -15]}
        angle={0.6}
        penumbra={0.4}
        intensity={40}
        color="#ffd700"
        castShadow
      />

      {/* Fish table lighting */}
      <spotLight
        position={[0, 6, 5]}
        target-position={[0, 0, 8]}
        angle={0.8}
        penumbra={0.3}
        intensity={35}
        color="#00bfff"
        castShadow
      />

      {/* Animated center light */}
      <pointLight
        ref={lightRef}
        position={[0, 8, 0]}
        intensity={25}
        color="#10b981"
        castShadow
      />

      {/* Ceiling chandelier lights */}
      <pointLight position={[0, 9, 0]} intensity={40} color="#ffd700" />

      {/* Atmospheric fog effect using directional light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.5}
        color="#ffffff"
        castShadow
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
    </>
  );
}

function PlayerControls() {
  const { camera, gl } = useThree();
  const [movement, setMovement] = useState({ forward: 0, right: 0 });
  const [rotation, setRotation] = useState({ yaw: 0, pitch: 0 });
  const velocity = useRef(new THREE.Vector3());
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const rotationRef = useRef({ yaw: 0, pitch: 0 });

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

  useFrame((state, delta) => {
    const speed = 5;
    const dampening = 0.9;

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

    newPosition.y = 2;
    const maxDistance = 45;
    newPosition.x = Math.max(-maxDistance, Math.min(maxDistance, newPosition.x));
    newPosition.z = Math.max(-maxDistance, Math.min(maxDistance, newPosition.z));

    camera.position.copy(newPosition);

    camera.rotation.order = 'YXZ';
    camera.rotation.y = rotation.yaw;
    camera.rotation.x = rotation.pitch;
  });

  if (isMobile) {
    return <MobileJoystick onMove={setMovement} onRotate={setRotation} />;
  }

  return null;
}

function MobileJoystick({
  onMove,
  onRotate
}: {
  onMove: (m: { forward: number; right: number }) => void;
  onRotate: (r: { yaw: number; pitch: number }) => void;
}) {
  const [lookTouch, setLookTouch] = useState<{ x: number; y: number } | null>(null);
  const [moveTouch, setMoveTouch] = useState<{ id: number; x: number; y: number; startX: number; startY: number } | null>(null);
  const rotationRef = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      Array.from(e.touches).forEach(touch => {
        const x = touch.clientX;
        const y = touch.clientY;

        if (x < window.innerWidth / 2 && !moveTouch) {
          setMoveTouch({ id: touch.identifier, x, y, startX: x, startY: y });
        } else if (x >= window.innerWidth / 2 && !lookTouch) {
          setLookTouch({ x, y });
        }
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      Array.from(e.touches).forEach(touch => {
        if (moveTouch && touch.identifier === moveTouch.id) {
          const deltaX = touch.clientX - moveTouch.startX;
          const deltaY = touch.clientY - moveTouch.startY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const maxDistance = 50;
          const clampedDistance = Math.min(distance, maxDistance);

          if (distance > 0) {
            const angle = Math.atan2(deltaY, deltaX);
            const forward = -Math.sin(angle) * (clampedDistance / maxDistance);
            const right = Math.cos(angle) * (clampedDistance / maxDistance);
            onMove({ forward, right });
          }

          setMoveTouch(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null);
        } else if (lookTouch) {
          const deltaX = touch.clientX - lookTouch.x;
          const deltaY = touch.clientY - lookTouch.y;

          rotationRef.current = {
            yaw: rotationRef.current.yaw - deltaX * 0.003,
            pitch: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationRef.current.pitch - deltaY * 0.003))
          };

          onRotate(rotationRef.current);
          setLookTouch({ x: touch.clientX, y: touch.clientY });
        }
      });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const remainingTouches = Array.from(e.touches).map(t => t.identifier);

      if (moveTouch && !remainingTouches.includes(moveTouch.id)) {
        setMoveTouch(null);
        onMove({ forward: 0, right: 0 });
      }

      if (e.touches.length === 0) {
        setLookTouch(null);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [moveTouch, lookTouch, onMove, onRotate]);

  return null;
}

export function CasinoScene() {
  return (
    <Canvas
      shadows={{ type: "PCFSoftShadowMap" }}
      camera={{
        position: [0, 3, 25],
        fov: 75,
        near: 0.1,
        far: 1000
      }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
        depth: true
      }}
    >
      {/* Atmospheric background gradient */}
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#1a1a1a", 30, 60]} />

      {/* Enhanced HDR environment */}
      <Environment
        background={false}
        environmentIntensity={0.3}
        preset="night"
      />

      <Suspense fallback={null}>
        <Lighting />
        <CasinoFloor />
        <CasinoWalls />
        <CasinoObjects />
        <PlayerControls />
      </Suspense>

      {/* Subtle particles for atmosphere */}
      <Points limit={1000}>
        <pointsMaterial
          size={0.1}
          sizeAttenuation
          color="#ffffff"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </Canvas>
  );
}

function Points({ limit }: { limit: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const positions = new Float32Array(limit * 3);
    for (let i = 0; i < limit; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, [limit]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        sizeAttenuation
        color="#ffffff"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

useGLTF.preload("/models/slot-machine.glb");
useGLTF.preload("/models/fish-table.glb");
useGLTF.preload("/models/cashier-booth.glb");
useGLTF.preload("/models/pitbull-pirate.glb");