import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './Games.scss';
import { useToast } from '../../components/layout/ToastContext';

interface CubeMeshProps {
  color: string;
  isAnimating: boolean;
  wireframe: boolean;
  speed: number;
}

const InteractiveCube: React.FC<CubeMeshProps> = ({ color, isAnimating, wireframe, speed }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current && isAnimating) {
      meshRef.current.rotation.x += delta * speed;
      meshRef.current.rotation.y += delta * speed * 1.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2.0, 2.0, 2.0]} />
      <meshStandardMaterial
        color={color}
        wireframe={wireframe}
        roughness={0.2}
        metalness={0.7}
      />
    </mesh>
  );
};

const PALETTES = [
  { name: 'Cyber Neon', colors: ['#00f0ff', '#ff007f'] },
  { name: 'Emerald Glow', colors: ['#10b981', '#06b6d4'] },
  { name: 'Solar Flare', colors: ['#f59e0b', '#ef4444'] },
  { name: 'Ultra Violet', colors: ['#8b5cf6', '#ec4899'] },
];

const Cube3D: React.FC = () => {
  const { showToast } = useToast();
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [customColors, setCustomColors] = useState<string[] | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);

  const activeColors = customColors || PALETTES[paletteIndex].colors;

  const handlePaletteChange = (index: number) => {
    setPaletteIndex(index);
    setCustomColors(null);
    showToast(`Palette: ${PALETTES[index].name} 🎨`, 'info');
  };

  const handleRandomizeColors = () => {
    const c1 = `hsl(${Math.floor(Math.random() * 360)}, 90%, 55%)`;
    const c2 = `hsl(${Math.floor(Math.random() * 360)}, 90%, 55%)`;
    setCustomColors([c1, c2]);
    showToast('Generated Random Neon HSL Colors! 🌈', 'success');
  };

  const toggleAnimation = () => {
    const nextVal = !isAnimating;
    setIsAnimating(nextVal);
    showToast(`Cube Rotation ${nextVal ? 'Resumed ▶️' : 'Paused ⏸️'}`, 'info');
  };

  const toggleWireframe = () => {
    const nextVal = !wireframe;
    setWireframe(nextVal);
    showToast(`Render Mode: ${nextVal ? 'Wireframe Mesh' : 'Solid Material'}`, 'info');
  };

  return (
    <div className="game-arcade-wrapper cube3d-wrapper">
      {/* Header */}
      <div className="arcade-header-card">
        <div className="header-meta">
          <span className="arcade-badge">
            <i className="fas fa-cube"></i> Three.js WebGL
          </span>
          <h2 className="arcade-title">Interactive 3D Mesh Lab</h2>
        </div>

        <div className="arcade-header-actions">
          <button
            type="button"
            className="arcade-btn icon-btn"
            onClick={toggleWireframe}
            title={wireframe ? 'Switch to Solid' : 'Switch to Wireframe'}
          >
            <i className={`fas fa-${wireframe ? 'vector-square' : 'cubes'}`}></i>
          </button>
          <button
            type="button"
            className="arcade-btn icon-btn"
            onClick={toggleAnimation}
            title={isAnimating ? 'Pause Rotation' : 'Resume Rotation'}
          >
            <i className={`fas fa-${isAnimating ? 'pause' : 'play'}`}></i>
          </button>
          <button
            type="button"
            className="arcade-btn primary-btn"
            onClick={handleRandomizeColors}
          >
            <i className="fas fa-shuffle"></i>
            <span>Randomize</span>
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="arcade-stats-bar">
        <div className="stat-pill selector-pill">
          <span className="stat-name">Palette</span>
          <div className="palette-pills-row">
            {PALETTES.map((p, idx) => (
              <button
                key={p.name}
                type="button"
                className={`palette-chip ${paletteIndex === idx && !customColors ? 'active' : ''}`}
                onClick={() => handlePaletteChange(idx)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="stat-pill selector-pill">
          <span className="stat-name">Speed</span>
          <select
            value={rotationSpeed}
            onChange={(e) => setRotationSpeed(Number(e.target.value))}
            className="arcade-select"
          >
            <option value={0.5}>Slow (0.5x)</option>
            <option value={1.0}>Normal (1.0x)</option>
            <option value={2.0}>Fast (2.0x)</option>
          </select>
        </div>
      </div>

      {/* Dual 3D Viewport Canvas */}
      <div className="cubes-viewport-container">
        {activeColors.map((color, index) => (
          <div key={index} className="webgl-cube-card">
            <div className="cube-card-header">
              <span className="cube-id-label">Node {index + 1}</span>
              <span className="color-hex-tag font-mono">{color}</span>
            </div>

            <div className="cube-canvas-frame">
              <Canvas camera={{ position: [0, 0, 4.5] }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[4, 5, 3]} intensity={1.2} />
                <pointLight position={[-4, -3, -2]} intensity={0.5} />
                <OrbitControls enableZoom={false} enablePan={false} />
                <InteractiveCube
                  color={color}
                  isAnimating={isAnimating}
                  wireframe={wireframe}
                  speed={rotationSpeed}
                />
              </Canvas>
            </div>
          </div>
        ))}
      </div>

      <div className="arcade-hints-bar">
        <span><i className="fas fa-hand"></i> Click and drag or touch on each cube to rotate its 3D orbital perspective</span>
        <span><i className="fas fa-microchip"></i> Hardware-accelerated 60 FPS WebGL rendering via Three.js</span>
      </div>
    </div>
  );
};

export default Cube3D;
