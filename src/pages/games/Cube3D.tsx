import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './Games.scss';

const Cube = ({ color, isAnimating }: { color: string; isAnimating: boolean }) => {
  const meshRef = React.useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && isAnimating) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.8, 1.8, 1.8]} /> {/* Slightly smaller for better fit */}
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Cube3D: React.FC = () => {
  const [cubeColors, setCubeColors] = useState(['#ff0000', '#0000ff']);
  const [isAnimating, setIsAnimating] = useState(true);

  const changeCubeColor = () => {
    setCubeColors([
      `hsl(${Math.random() * 360}, 100%, 50%)`,
      `hsl(${Math.random() * 360}, 100%, 50%)`,
    ]);
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  return (
    <Box className="cube3d-container">
      <Typography variant="h4" className="game-title" gutterBottom>
        Cube 3D
      </Typography>
      <Box className="cubes-wrapper">
        {cubeColors.map((color, index) => (
          <Box key={index} className="canvas-container">
            <Canvas>
              <ambientLight intensity={0.5} />
              <directionalLight position={[2, 2, 2]} intensity={0.8} />
              <OrbitControls 
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={3 * Math.PI / 4}
              />
              <Cube color={color} isAnimating={isAnimating} />
            </Canvas>
          </Box>
        ))}
      </Box>

      <Box className="controls-container">
        <Button
          onClick={changeCubeColor}
          className="color-button"
          variant="contained"
          size="large"
        >
          Change Colors
        </Button>
        <Button
          onClick={toggleAnimation}
          className={`animation-button ${isAnimating ? 'active' : ''}`}
          variant="contained"
          size="large"
        >
          {isAnimating ? 'Pause' : 'Play'} Animation
        </Button>
      </Box>
    </Box>
  );
};

export default Cube3D;