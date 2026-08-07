import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ReactConfetti from 'react-confetti';
import './Games.scss';
import { useToast } from '../../components/layout/ToastContext';

// Color definitions for standard 3x3 Rubik's Cube
type ColorCode = 'W' | 'Y' | 'R' | 'O' | 'G' | 'B';

const COLOR_MAP: Record<ColorCode, { name: string; hex: string }> = {
  W: { name: 'White', hex: '#ffffff' },
  Y: { name: 'Yellow', hex: '#ffd700' },
  R: { name: 'Red', hex: '#ff4757' },
  O: { name: 'Orange', hex: '#ff7f50' },
  G: { name: 'Green', hex: '#2ed573' },
  B: { name: 'Blue', hex: '#1e90ff' },
};

// State representation: 6 faces (U, D, F, B, L, R), each 9 stickers
interface CubeState {
  U: ColorCode[];
  D: ColorCode[];
  F: ColorCode[];
  B: ColorCode[];
  L: ColorCode[];
  R: ColorCode[];
}

const SOLVED_CUBE: CubeState = {
  U: Array(9).fill('W'),
  D: Array(9).fill('Y'),
  F: Array(9).fill('R'),
  B: Array(9).fill('O'),
  L: Array(9).fill('G'),
  R: Array(9).fill('B'),
};

const RubiksCube: React.FC = () => {
  const { showToast } = useToast();
  const [cube, setCube] = useState<CubeState>(SOLVED_CUBE);
  const [moves, setMoves] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(true);

  // Helper to rotate a single 3x3 face array clockwise
  const rotateFaceCW = (face: ColorCode[]): ColorCode[] => {
    return [
      face[6], face[3], face[0],
      face[7], face[4], face[1],
      face[8], face[5], face[2],
    ];
  };

  // Check if cube is fully solved
  const checkIsSolved = (state: CubeState): boolean => {
    const faces: (keyof CubeState)[] = ['U', 'D', 'F', 'B', 'L', 'R'];
    return faces.every((f) => state[f].every((sticker) => sticker === state[f][0]));
  };

  // Move definitions
  const applyMove = (move: string, currentCube: CubeState): CubeState => {
    const next = JSON.parse(JSON.stringify(currentCube)) as CubeState;

    switch (move) {
      case 'F': {
        next.F = rotateFaceCW(next.F);
        const temp = [next.U[6], next.U[7], next.U[8]];
        next.U[6] = next.L[8]; next.U[7] = next.L[5]; next.U[8] = next.L[2];
        next.L[2] = next.D[0]; next.L[5] = next.D[1]; next.L[8] = next.D[2];
        next.D[0] = next.R[6]; next.D[1] = next.R[3]; next.D[2] = next.R[0];
        next.R[0] = temp[0];  next.R[3] = temp[1];  next.R[6] = temp[2];
        break;
      }
      case "F'": {
        for (let i = 0; i < 3; i++) applyMove('F', next);
        return next;
      }
      case 'U': {
        next.U = rotateFaceCW(next.U);
        const temp = [next.F[0], next.F[1], next.F[2]];
        next.F[0] = next.R[0]; next.F[1] = next.R[1]; next.F[2] = next.R[2];
        next.R[0] = next.B[0]; next.R[1] = next.B[1]; next.R[2] = next.B[2];
        next.B[0] = next.L[0]; next.B[1] = next.L[1]; next.B[2] = next.L[2];
        next.L[0] = temp[0];   next.L[1] = temp[1];   next.L[2] = temp[2];
        break;
      }
      case "U'": {
        for (let i = 0; i < 3; i++) applyMove('U', next);
        return next;
      }
      case 'R': {
        next.R = rotateFaceCW(next.R);
        const temp = [next.U[2], next.U[5], next.U[8]];
        next.U[2] = next.F[2]; next.U[5] = next.F[5]; next.U[8] = next.F[8];
        next.F[2] = next.D[2]; next.F[5] = next.D[5]; next.F[8] = next.D[8];
        next.D[2] = next.B[6]; next.D[5] = next.B[3]; next.D[8] = next.B[0];
        next.B[0] = temp[2];   next.B[3] = temp[1];   next.B[6] = temp[0];
        break;
      }
      case "R'": {
        for (let i = 0; i < 3; i++) applyMove('R', next);
        return next;
      }
      case 'L': {
        next.L = rotateFaceCW(next.L);
        const temp = [next.U[0], next.U[3], next.U[6]];
        next.U[0] = next.B[8]; next.U[3] = next.B[5]; next.U[6] = next.B[2];
        next.B[2] = next.D[6]; next.B[5] = next.D[3]; next.B[8] = next.D[0];
        next.D[0] = next.F[0]; next.D[3] = next.F[3]; next.D[6] = next.F[6];
        next.F[0] = temp[0];   next.F[3] = temp[1];   next.F[6] = temp[2];
        break;
      }
      case "L'": {
        for (let i = 0; i < 3; i++) applyMove('L', next);
        return next;
      }
      case 'B': {
        next.B = rotateFaceCW(next.B);
        const temp = [next.U[0], next.U[1], next.U[2]];
        next.U[0] = next.R[2]; next.U[1] = next.R[5]; next.U[2] = next.R[8];
        next.R[2] = next.D[8]; next.R[5] = next.D[7]; next.R[8] = next.D[6];
        next.D[6] = next.L[0]; next.D[7] = next.L[3]; next.D[8] = next.L[6];
        next.L[0] = temp[2];   next.L[3] = temp[1];   next.L[6] = temp[0];
        break;
      }
      case "B'": {
        for (let i = 0; i < 3; i++) applyMove('B', next);
        return next;
      }
      case 'D': {
        next.D = rotateFaceCW(next.D);
        const temp = [next.F[6], next.F[7], next.F[8]];
        next.F[6] = next.L[6]; next.F[7] = next.L[7]; next.F[8] = next.L[8];
        next.L[6] = next.B[6]; next.L[7] = next.B[7]; next.L[8] = next.B[8];
        next.B[6] = next.R[6]; next.B[7] = next.R[7]; next.B[8] = next.R[8];
        next.R[6] = temp[0];   next.R[7] = temp[1];   next.R[8] = temp[2];
        break;
      }
      case "D'": {
        for (let i = 0; i < 3; i++) applyMove('D', next);
        return next;
      }
      default:
        break;
    }
    return next;
  };

  const handleMove = (move: string) => {
    const nextState = applyMove(move, cube);
    setCube(nextState);
    const newMoves = moves + 1;
    setMoves(newMoves);

    const solvedNow = checkIsSolved(nextState);
    setIsSolved(solvedNow);

    if (solvedNow && newMoves > 0) {
      showToast(`🏆 Rubik's Cube SOLVED in ${newMoves} moves!`, 'success');
    }
  };

  const scrambleCube = () => {
    const moveOptions = ['F', "F'", 'U', "U'", 'R', "R'", 'L', "L'", 'B', "B'", 'D', "D'"];
    let curr = SOLVED_CUBE;
    for (let i = 0; i < 20; i++) {
      const randMove = moveOptions[Math.floor(Math.random() * moveOptions.length)];
      curr = applyMove(randMove, curr);
    }
    setCube(curr);
    setMoves(0);
    setIsSolved(checkIsSolved(curr));
    showToast('Scrambled Rubik\'s Cube 🎲 Have fun solving!', 'info');
  };

  const resetCube = () => {
    setCube(SOLVED_CUBE);
    setMoves(0);
    setIsSolved(true);
    showToast('Rubik\'s Cube reset to solved state', 'info');
  };

  // Render a 3x3 face grid
  const renderFaceGrid = (faceData: ColorCode[], faceLabel: string) => (
    <div className="cube-face-box">
      <div className="face-title">{faceLabel}</div>
      <div className="face-grid">
        {faceData.map((color, idx) => (
          <div
            key={idx}
            className="cube-sticker"
            style={{ backgroundColor: COLOR_MAP[color].hex }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Box className="game-container rubiks-container">
      {isSolved && moves > 0 && <ReactConfetti style={{ position: 'fixed' }} />}

      <Typography variant="h4" className="game-title">
        Rubik's Cube 3x3 Puzzle
      </Typography>
      <Typography variant="body1" className="game-subtitle">
        Rotate faces to solve the 3x3 magic cube
      </Typography>

      {/* Stats Bar */}
      <div className="game-stats-bar">
        <div className="stat-box">
          <span className="stat-label">Moves:</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Status:</span>
          <span className={`stat-value ${isSolved ? 'solved-badge' : 'unsolved-badge'}`}>
            {isSolved ? '✅ Solved' : '🧩 Scrambled'}
          </span>
        </div>
        <button onClick={scrambleCube} className="cube-action-btn scramble-btn">
          🎲 Scramble
        </button>
        <button onClick={resetCube} className="cube-action-btn reset-btn">
          🔄 Reset
        </button>
      </div>

      {/* 2D Net View of 6 Faces */}
      <div className="rubiks-net-view">
        <div className="net-row top-row">
          <div className="empty-spacer" />
          {renderFaceGrid(cube.U, 'Up (White)')}
          <div className="empty-spacer" />
          <div className="empty-spacer" />
        </div>
        <div className="net-row middle-row">
          {renderFaceGrid(cube.L, 'Left (Green)')}
          {renderFaceGrid(cube.F, 'Front (Red)')}
          {renderFaceGrid(cube.R, 'Right (Blue)')}
          {renderFaceGrid(cube.B, 'Back (Orange)')}
        </div>
        <div className="net-row bottom-row">
          <div className="empty-spacer" />
          {renderFaceGrid(cube.D, 'Down (Yellow)')}
          <div className="empty-spacer" />
          <div className="empty-spacer" />
        </div>
      </div>

      {/* Face Turn Controls */}
      <div className="cube-controls-section">
        <h3>Rotate Faces</h3>
        <div className="controls-buttons-grid">
          <div className="move-pair">
            <button onClick={() => handleMove('F')} className="move-btn">F (Front CW)</button>
            <button onClick={() => handleMove("F'")} className="move-btn prime">F' (Front CCW)</button>
          </div>
          <div className="move-pair">
            <button onClick={() => handleMove('U')} className="move-btn">U (Up CW)</button>
            <button onClick={() => handleMove("U'")} className="move-btn prime">U' (Up CCW)</button>
          </div>
          <div className="move-pair">
            <button onClick={() => handleMove('R')} className="move-btn">R (Right CW)</button>
            <button onClick={() => handleMove("R'")} className="move-btn prime">R' (Right CCW)</button>
          </div>
          <div className="move-pair">
            <button onClick={() => handleMove('L')} className="move-btn">L (Left CW)</button>
            <button onClick={() => handleMove("L'")} className="move-btn prime">L' (Left CCW)</button>
          </div>
          <div className="move-pair">
            <button onClick={() => handleMove('B')} className="move-btn">B (Back CW)</button>
            <button onClick={() => handleMove("B'")} className="move-btn prime">B' (Back CCW)</button>
          </div>
          <div className="move-pair">
            <button onClick={() => handleMove('D')} className="move-btn">D (Down CW)</button>
            <button onClick={() => handleMove("D'")} className="move-btn prime">D' (Down CCW)</button>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default RubiksCube;
