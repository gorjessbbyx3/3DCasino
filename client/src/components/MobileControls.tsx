import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MobileControlsProps {
  onMove: (x: number, z: number) => void;
  onRotate: (delta: number) => void;
}

export function MobileControls({ onMove, onRotate }: MobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const moveIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (joystickActive && moveIntervalRef.current === null) {
      moveIntervalRef.current = window.setInterval(() => {
        if (joystickPosition.x !== 0 || joystickPosition.y !== 0) {
          onMove(joystickPosition.x, joystickPosition.y);
        }
      }, 16);
    } else if (!joystickActive && moveIntervalRef.current !== null) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }

    return () => {
      if (moveIntervalRef.current !== null) {
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = null;
      }
    };
  }, [joystickActive, joystickPosition, onMove]);

  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setJoystickActive(true);
    updateJoystickPosition(e);
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickActive) return;
    e.preventDefault();
    updateJoystickPosition(e);
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPosition({ x: 0, y: 0 });
  };

  const updateJoystickPosition = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2;

    if (distance > maxDistance) {
      const angle = Math.atan2(deltaY, deltaX);
      setJoystickPosition({
        x: Math.cos(angle) * maxDistance / maxDistance,
        y: Math.sin(angle) * maxDistance / maxDistance,
      });
    } else {
      setJoystickPosition({
        x: deltaX / maxDistance,
        y: deltaY / maxDistance,
      });
    }
  };

  const handleRotateLeft = () => {
    onRotate(-0.05);
  };

  const handleRotateRight = () => {
    onRotate(0.05);
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Left Arrow Button */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
        <button
          onTouchStart={handleRotateLeft}
          onMouseDown={handleRotateLeft}
          className="w-16 h-16 bg-black/60 backdrop-blur-sm border-2 border-cyan-400/50 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-10 h-10 text-cyan-300" />
        </button>
      </div>

      {/* Right Arrow Button */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
        <button
          onTouchStart={handleRotateRight}
          onMouseDown={handleRotateRight}
          className="w-16 h-16 bg-black/60 backdrop-blur-sm border-2 border-cyan-400/50 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform"
        >
          <ChevronRight className="w-10 h-10 text-cyan-300" />
        </button>
      </div>

      {/* Joystick */}
      <div className="fixed bottom-24 left-8 z-50">
        <div
          ref={joystickRef}
          className="relative w-32 h-32 bg-black/40 backdrop-blur-sm border-2 border-purple-400/50 rounded-full shadow-lg shadow-purple-500/30"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onMouseDown={handleJoystickStart}
          onMouseMove={handleJoystickMove}
          onMouseUp={handleJoystickEnd}
          onMouseLeave={handleJoystickEnd}
        >
          {/* Joystick Base */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full border-2 border-purple-300/20 rounded-full"></div>
            <div className="absolute w-16 h-16 border-2 border-purple-300/30 rounded-full"></div>
          </div>

          {/* Joystick Stick */}
          <div
            className="absolute w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-lg shadow-purple-500/50 border-2 border-purple-300 transition-transform"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${joystickPosition.x * 40}px), calc(-50% + ${joystickPosition.y * 40}px))`,
            }}
          >
            <div className="absolute inset-2 bg-white/20 rounded-full"></div>
          </div>

          {/* Directional Indicators */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-purple-300/50 text-xs">▲</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-purple-300/50 text-xs">▼</div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-300/50 text-xs">◄</div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-300/50 text-xs">►</div>
          </div>
        </div>

        {/* Label */}
        <div className="text-center mt-2 text-purple-300 text-sm font-semibold">
          MOVE
        </div>
      </div>
    </>
  );
}
