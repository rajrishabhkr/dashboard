import React, { useState } from 'react';
import ReactConfetti from 'react-confetti';
import './Games.scss';
import { useToast } from '../../components/layout/ToastContext';

type ColorCode = 'W' | 'Y' | 'R' | 'O' | 'G' | 'B';

const COLOR_MAP: Record<ColorCode, { name: string; hex: string; glow: string }> = {
  W: { name: 'White', hex: '#ffffff', glow: 'rgba(255, 255, 255, 0.4)' },
  Y: { name: 'Yellow', hex: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
  R: { name: 'Red', hex: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  O: { name: 'Orange', hex: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
  G: { name: 'Green', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  B: { name: 'Blue', hex: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.4)' },
};

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

// Web Audio API Synthesizer for Rubik's Cube
class RubiksSoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTurn() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playScramble() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [220, 280, 340, 420].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.15, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + (idx + 1) * 0.05);
    });
  }

  playWin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.25, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + (idx + 1) * 0.1);
    });
  }
}

const sounds = new RubiksSoundController();

const RubiksCube: React.FC = () => {
  const { showToast } = useToast();
  const [cube, setCube] = useState<CubeState>(SOLVED_CUBE);
  const [history, setHistory] = useState<CubeState[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const rotateFaceCW = (face: ColorCode[]): ColorCode[] => {
    return [
      face[6], face[3], face[0],
      face[7], face[4], face[1],
      face[8], face[5], face[2],
    ];
  };

  const checkIsSolved = (state: CubeState): boolean => {
    const faces: (keyof CubeState)[] = ['U', 'D', 'F', 'B', 'L', 'R'];
    return faces.every((f) => state[f].every((sticker) => sticker === state[f][0]));
  };

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
    sounds.playTurn();
    setHistory((prev) => [...prev, cube]);
    const nextState = applyMove(move, cube);
    setCube(nextState);
    const newMoves = moves + 1;
    setMoves(newMoves);

    const solvedNow = checkIsSolved(nextState);
    setIsSolved(solvedNow);

    if (solvedNow && newMoves > 0) {
      sounds.playWin();
      showToast(`🏆 Rubik's Cube SOLVED in ${newMoves} moves!`, 'success');
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setCube(lastState);
    setHistory((prev) => prev.slice(0, -1));
    setMoves((prev) => Math.max(0, prev - 1));
    setIsSolved(checkIsSolved(lastState));
    sounds.playTurn();
    showToast('Undid last move', 'info');
  };

  const scrambleCube = () => {
    sounds.playScramble();
    const moveOptions = ['F', "F'", 'U', "U'", 'R', "R'", 'L', "L'", 'B', "B'", 'D', "D'"];
    let curr = SOLVED_CUBE;
    for (let i = 0; i < 22; i++) {
      const randMove = moveOptions[Math.floor(Math.random() * moveOptions.length)];
      curr = applyMove(randMove, curr);
    }
    setCube(curr);
    setHistory([]);
    setMoves(0);
    setIsSolved(checkIsSolved(curr));
    showToast('Scrambled 3x3 Rubik\'s Cube 🎲 Have fun solving!', 'info');
  };

  const resetCube = () => {
    setCube(SOLVED_CUBE);
    setHistory([]);
    setMoves(0);
    setIsSolved(true);
    showToast('Rubik\'s Cube reset to solved state', 'info');
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    showToast(nextState ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇', 'info');
  };

  const renderFaceGrid = (faceData: ColorCode[], faceLabel: string, colorBadge: string) => (
    <div className="rubik-face-card">
      <div className="face-header-label">
        <span className="dot" style={{ backgroundColor: colorBadge }}></span>
        <span>{faceLabel}</span>
      </div>
      <div className="stickers-3x3-grid">
        {faceData.map((color, idx) => (
          <div
            key={idx}
            className="cube-sticker-cell"
            style={{
              backgroundColor: COLOR_MAP[color].hex,
              boxShadow: `0 0 10px ${COLOR_MAP[color].glow}`,
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="game-arcade-wrapper rubiks-arcade-wrapper">
      {isSolved && moves > 0 && <ReactConfetti numberOfPieces={140} recycle={false} style={{ position: 'fixed' }} />}

      {/* Header */}
      <div className="arcade-header-card">
        <div className="header-meta">
          <span className="arcade-badge">
            <i className="fas fa-cubes"></i> 3D Logic Puzzle
          </span>
          <h2 className="arcade-title">Rubik's Cube 3x3 Simulator</h2>
        </div>

        <div className="arcade-header-actions">
          <button
            type="button"
            className="arcade-btn icon-btn"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            <i className={`fas fa-volume-${soundEnabled ? 'high' : 'xmark'}`}></i>
          </button>
          <button
            type="button"
            className="arcade-btn icon-btn"
            onClick={handleUndo}
            disabled={history.length === 0}
            title="Undo Last Move"
          >
            <i className="fas fa-undo"></i>
          </button>
          <button
            type="button"
            className="arcade-btn secondary-btn"
            onClick={scrambleCube}
          >
            <i className="fas fa-shuffle"></i>
            <span>Scramble</span>
          </button>
          <button
            type="button"
            className="arcade-btn primary-btn"
            onClick={resetCube}
          >
            <i className="fas fa-rotate-right"></i>
            <span>Solve</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="arcade-stats-bar">
        <div className="stat-pill">
          <span className="stat-name">Moves Executed</span>
          <span className="stat-num text-cyan-400">{moves}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">Cube State</span>
          <span className={`stat-num ${isSolved ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isSolved ? '✅ Fully Solved' : '🧩 Scrambled'}
          </span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">Undo Stack</span>
          <span className="stat-num text-purple-400">{history.length}</span>
        </div>
      </div>

      {/* 2D Net View of 6 Cube Faces */}
      <div className="rubiks-unfolded-net">
        <div className="net-grid-layout">
          {/* Top Row: Up */}
          <div className="net-row row-top">
            <div className="spacer-cell" />
            {renderFaceGrid(cube.U, 'Up', '#ffffff')}
            <div className="spacer-cell" />
            <div className="spacer-cell" />
          </div>

          {/* Middle Row: Left, Front, Right, Back */}
          <div className="net-row row-mid">
            {renderFaceGrid(cube.L, 'Left', '#10b981')}
            {renderFaceGrid(cube.F, 'Front', '#ef4444')}
            {renderFaceGrid(cube.R, 'Right', '#0ea5e9')}
            {renderFaceGrid(cube.B, 'Back', '#f97316')}
          </div>

          {/* Bottom Row: Down */}
          <div className="net-row row-bot">
            <div className="spacer-cell" />
            {renderFaceGrid(cube.D, 'Down', '#fbbf24')}
            <div className="spacer-cell" />
            <div className="spacer-cell" />
          </div>
        </div>
      </div>

      {/* Face Turn Controls */}
      <div className="rubiks-controls-panel">
        <div className="panel-title">
          <i className="fas fa-arrows-spin"></i> Rotate Cube Faces (Standard Singmaster Notation)
        </div>

        <div className="face-buttons-grid">
          <div className="move-pair-card">
            <span className="pair-title">Front Face</span>
            <div className="pair-buttons">
              <button type="button" onClick={() => handleMove('F')} className="face-btn cw">F (CW)</button>
              <button type="button" onClick={() => handleMove("F'")} className="face-btn ccw">F' (CCW)</button>
            </div>
          </div>

          <div className="move-pair-card">
            <span className="pair-title">Up Face</span>
            <div className="pair-buttons">
              <button type="button" onClick={() => handleMove('U')} className="face-btn cw">U (CW)</button>
              <button type="button" onClick={() => handleMove("U'")} className="face-btn ccw">U' (CCW)</button>
            </div>
          </div>

          <div className="move-pair-card">
            <span className="pair-title">Right Face</span>
            <div className="pair-buttons">
              <button type="button" onClick={() => handleMove('R')} className="face-btn cw">R (CW)</button>
              <button type="button" onClick={() => handleMove("R'")} className="face-btn ccw">R' (CCW)</button>
            </div>
          </div>

          <div className="move-pair-card">
            <span className="pair-title">Left Face</span>
            <div className="pair-buttons">
              <button type="button" onClick={() => handleMove('L')} className="face-btn cw">L (CW)</button>
              <button type="button" onClick={() => handleMove("L'")} className="face-btn ccw">L' (CCW)</button>
            </div>
          </div>

          <div className="move-pair-card">
            <span className="pair-title">Back Face</span>
            <div className="pair-buttons">
              <button type="button" onClick={() => handleMove('B')} className="face-btn cw">B (CW)</button>
              <button type="button" onClick={() => handleMove("B'")} className="face-btn ccw">B' (CCW)</button>
            </div>
          </div>

          <div className="move-pair-card">
            <span className="pair-title">Down Face</span>
            <div className="pair-buttons">
              <button type="button" onClick={() => handleMove('D')} className="face-btn cw">D (CW)</button>
              <button type="button" onClick={() => handleMove("D'")} className="face-btn ccw">D' (CCW)</button>
            </div>
          </div>
        </div>
      </div>

      <div className="arcade-hints-bar">
        <span><i className="fas fa-book"></i> F = Front, U = Up, R = Right, L = Left, B = Back, D = Down (' denotes Counter-Clockwise)</span>
        <span><i className="fas fa-rotate-left"></i> Click Undo to step backwards through your moves</span>
      </div>
    </div>
  );
};

export default RubiksCube;
