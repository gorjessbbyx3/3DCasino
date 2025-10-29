import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useUser } from "@/lib/stores/useUser";

function CasinoFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        color="#1a0f0a"
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

function CasinoWalls() {
  const wallHeight = 8;
  const wallThickness = 0.5;
  const roomSize = 50;

  return (
    <group>
      <mesh position={[0, wallHeight / 2, -roomSize / 2]} receiveShadow>
        <boxGeometry args={[roomSize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#0a3d2a" roughness={0.7} />
      </mesh>

      <mesh position={[0, wallHeight / 2, roomSize / 2]} receiveShadow>
        <boxGeometry args={[roomSize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#0a3d2a" roughness={0.7} />
      </mesh>

      <mesh position={[-roomSize / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
        <meshStandardMaterial color="#0a3d2a" roughness={0.7} />
      </mesh>

      <mesh position={[roomSize / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
        <meshStandardMaterial color="#0a3d2a" roughness={0.7} />
      </mesh>

      <mesh position={[0, wallHeight, 0]} receiveShadow>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial color="#050505" side={THREE.DoubleSide} />
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

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.1;
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
      {hovered && label && (
        <mesh position={[0, 3, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color="#10b981" opacity={0.8} transparent />
        </mesh>
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
  return (
    <>
      <ambientLight intensity={0.3} />

      <spotLight
        position={[0, 10, -20]}
        angle={0.5}
        penumbra={0.5}
        intensity={50}
        castShadow
        color="#10b981"
      />

      <pointLight position={[-15, 5, -15]} intensity={20} color="#fbbf24" />
      <pointLight position={[15, 5, -15]} intensity={20} color="#fbbf24" />
      <pointLight position={[-15, 5, 15]} intensity={20} color="#fbbf24" />
      <pointLight position={[15, 5, 15]} intensity={20} color="#fbbf24" />

      <pointLight position={[0, 5, 0]} intensity={30} color="#10b981" />
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
      shadows
      camera={{ position: [0, 2, 25], fov: 75 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#000000"]} />

      <Lighting />
      <CasinoFloor />
      <CasinoWalls />
      <CasinoObjects />
      <PlayerControls />
    </Canvas>
  );
}

useGLTF.preload("/models/slot-machine.glb");
useGLTF.preload("/models/fish-table.glb");
useGLTF.preload("/models/cashier-booth.glb");
useGLTF.preload("/models/pitbull-pirate.glb");