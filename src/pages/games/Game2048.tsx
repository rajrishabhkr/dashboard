import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactConfetti from 'react-confetti';
import './Games.scss';
import { useToast } from '../../components/layout/ToastContext';

type Board = number[][];

const BOARD_SIZE = 4;

const TILE_COLORS: Record<number, { bg: string; text: string; glow: string }> = {
  2: { bg: '#1e293b', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.3)' },
  4: { bg: '#0f3a5e', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' },
  8: { bg: '#064e3b', text: '#34d399', glow: 'rgba(52, 211, 153, 0.4)' },
  16: { bg: '#065f46', text: '#4ade80', glow: 'rgba(74, 222, 128, 0.5)' },
  32: { bg: '#78350f', text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
  64: { bg: '#9a3412', text: '#fb923c', glow: 'rgba(251, 146, 60, 0.5)' },
  128: { bg: '#831843', text: '#f472b6', glow: 'rgba(244, 114, 182, 0.6)' },
  256: { bg: '#701a75', text: '#e879f9', glow: 'rgba(232, 121, 249, 0.6)' },
  512: { bg: '#4c1d95', text: '#c084fc', glow: 'rgba(192, 132, 252, 0.7)' },
  1024: { bg: '#1e1b4b', text: '#818cf8', glow: 'rgba(129, 140, 248, 0.8)' },
  2048: { bg: '#854d0e', text: '#fef08a', glow: 'rgba(254, 240, 138, 0.9)' },
};

// Web Audio API Synthesizer for 2048
class Game2048SoundController {
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

  playSlide() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playMerge() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 659.25].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.18, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + (idx + 1) * 0.04);
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
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + (idx + 1) * 0.08);
    });
  }

  playOver() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
}

const sounds = new Game2048SoundController();

const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));

const addRandomTile = (board: Board): Board => {
  const newBoard = board.map((row) => [...row]);
  const emptyCoords: { r: number; c: number }[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c] === 0) emptyCoords.push({ r, c });
    }
  }

  if (emptyCoords.length === 0) return newBoard;

  const rand = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  newBoard[rand.r][rand.c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

const checkGameOver = (board: Board): boolean => {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return false;
      if (c < BOARD_SIZE - 1 && board[r][c] === board[r][c + 1]) return false;
      if (r < BOARD_SIZE - 1 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
};

const Game2048: React.FC = () => {
  const { showToast } = useToast();
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    return Number(localStorage.getItem('neon_2048_best')) || 0;
  });
  const [history, setHistory] = useState<{ board: Board; score: number }[]>([]);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize new game
  const initGame = useCallback(() => {
    let b = createEmptyBoard();
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setHistory([]);
    setIsWon(false);
    setIsGameOver(false);
    showToast('Started new Neon 2048 puzzle! 🎮', 'info');
  }, [showToast]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const slideAndMergeRow = (row: number[]): { newRow: number[]; gainedScore: number; merged: boolean } => {
    const nonZero = row.filter((val) => val !== 0);
    const newRow: number[] = [];
    let gainedScore = 0;
    let merged = false;

    let i = 0;
    while (i < nonZero.length) {
      if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
        const mergedVal = nonZero[i] * 2;
        newRow.push(mergedVal);
        gainedScore += mergedVal;
        merged = true;
        i += 2;
      } else {
        newRow.push(nonZero[i]);
        i++;
      }
    }

    while (newRow.length < BOARD_SIZE) {
      newRow.push(0);
    }

    return { newRow, gainedScore, merged };
  };

  const move = useCallback(
    (dir: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
      if (isGameOver) return;

      let changed = false;
      let totalGained = 0;
      let didMerge = false;
      const nextBoard: Board = createEmptyBoard();

      if (dir === 'LEFT') {
        for (let r = 0; r < BOARD_SIZE; r++) {
          const { newRow, gainedScore, merged } = slideAndMergeRow(board[r]);
          nextBoard[r] = newRow;
          totalGained += gainedScore;
          if (merged) didMerge = true;
          if (newRow.some((val, idx) => val !== board[r][idx])) changed = true;
        }
      } else if (dir === 'RIGHT') {
        for (let r = 0; r < BOARD_SIZE; r++) {
          const reversed = [...board[r]].reverse();
          const { newRow, gainedScore, merged } = slideAndMergeRow(reversed);
          nextBoard[r] = newRow.reverse();
          totalGained += gainedScore;
          if (merged) didMerge = true;
          if (nextBoard[r].some((val, idx) => val !== board[r][idx])) changed = true;
        }
      } else if (dir === 'UP') {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
          const { newRow, gainedScore, merged } = slideAndMergeRow(col);
          totalGained += gainedScore;
          if (merged) didMerge = true;
          for (let r = 0; r < BOARD_SIZE; r++) {
            nextBoard[r][c] = newRow[r];
            if (nextBoard[r][c] !== board[r][c]) changed = true;
          }
        }
      } else if (dir === 'DOWN') {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
          const { newRow, gainedScore, merged } = slideAndMergeRow(col);
          totalGained += gainedScore;
          if (merged) didMerge = true;
          const unreversed = newRow.reverse();
          for (let r = 0; r < BOARD_SIZE; r++) {
            nextBoard[r][c] = unreversed[r];
            if (nextBoard[r][c] !== board[r][c]) changed = true;
          }
        }
      }

      if (changed) {
        if (didMerge) sounds.playMerge();
        else sounds.playSlide();

        setHistory((prev) => [...prev, { board, score }]);

        const boardWithNew = addRandomTile(nextBoard);
        const nextScore = score + totalGained;
        setBoard(boardWithNew);
        setScore(nextScore);

        if (nextScore > bestScore) {
          setBestScore(nextScore);
          localStorage.setItem('neon_2048_best', String(nextScore));
        }

        // Check if reached 2048
        if (!isWon && boardWithNew.some((row) => row.some((val) => val >= 2048))) {
          setIsWon(true);
          sounds.playWin();
          showToast('🎉 CONGRATULATIONS! You reached 2048!', 'success');
        }

        // Check Game Over
        if (checkGameOver(boardWithNew)) {
          setIsGameOver(true);
          sounds.playOver();
          showToast(`Game Over! Final Score: ${nextScore}`, 'warning');
        }
      }
    },
    [board, score, bestScore, isGameOver, isWon, showToast]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          move('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          move('RIGHT');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          move('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          move('DOWN');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch Swipe for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) move('RIGHT');
      else move('LEFT');
    } else {
      if (dy > 0) move('DOWN');
      else move('UP');
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setBoard(last.board);
    setScore(last.score);
    setHistory((prev) => prev.slice(0, -1));
    setIsGameOver(false);
    sounds.playSlide();
    showToast('Undid previous move', 'info');
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    showToast(nextState ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇', 'info');
  };

  return (
    <div className="game-arcade-wrapper game2048-wrapper">
      {isWon && <ReactConfetti numberOfPieces={120} recycle={false} style={{ position: 'fixed' }} />}

      {/* Header */}
      <div className="arcade-header-card">
        <div className="header-meta">
          <span className="arcade-badge">
            <i className="fas fa-cubes"></i> Sliding Numbers Matrix
          </span>
          <h2 className="arcade-title">Neon 2048 Challenge</h2>
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
            title="Undo Move"
          >
            <i className="fas fa-undo"></i>
          </button>
          <button
            type="button"
            className="arcade-btn primary-btn"
            onClick={initGame}
          >
            <i className="fas fa-rotate-right"></i>
            <span>New Game</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="arcade-stats-bar">
        <div className="stat-pill">
          <span className="stat-name">Score</span>
          <span className="stat-num text-cyan-400">{score}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">Best Score</span>
          <span className="stat-num text-amber-400">{bestScore}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">Undo Stack</span>
          <span className="stat-num text-purple-400">{history.length}</span>
        </div>
      </div>

      {/* 2048 Grid Board */}
      <div
        className="game2048-board-frame"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid-4x4-canvas">
          {board.map((row, rIdx) =>
            row.map((val, cIdx) => {
              const tileStyle = TILE_COLORS[val] || {
                bg: '#3b0764',
                text: '#ffffff',
                glow: 'rgba(255, 255, 255, 0.9)',
              };

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`tile-cell ${val > 0 ? 'active-tile' : 'empty-tile'}`}
                  style={
                    val > 0
                      ? {
                          backgroundColor: tileStyle.bg,
                          color: tileStyle.text,
                          boxShadow: `0 0 16px ${tileStyle.glow}`,
                          border: `1px solid ${tileStyle.text}`,
                        }
                      : {}
                  }
                >
                  {val > 0 ? val : ''}
                </div>
              );
            })
          )}
        </div>

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="arcade-modal-overlay">
            <div className="arcade-game-over-box">
              <span className="crash-icon">🛑</span>
              <h3>No Moves Left!</h3>
              <p className="final-score-text">
                Final Score: <strong className="text-cyan-400 font-mono text-xl">{score}</strong>
              </p>
              <button
                type="button"
                className="arcade-modal-btn"
                onClick={initGame}
              >
                <i className="fas fa-play"></i>
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Win Modal */}
        {isWon && (
          <div className="arcade-modal-overlay">
            <div className="arcade-game-over-box">
              <span className="crash-icon">🏆</span>
              <h3>You Reached 2048!</h3>
              <p className="final-score-text">
                Score: <strong className="text-emerald-400 font-mono text-xl">{score}</strong>
              </p>
              <button
                type="button"
                className="arcade-modal-btn"
                onClick={() => setIsWon(false)}
              >
                <i className="fas fa-forward"></i>
                <span>Keep Playing</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch D-Pad */}
      <div className="arcade-touch-dpad">
        <button
          type="button"
          className="dpad-key up"
          onClick={() => move('UP')}
          aria-label="Up"
        >
          <i className="fas fa-chevron-up"></i>
        </button>
        <div className="dpad-horizontal-row">
          <button
            type="button"
            className="dpad-key left"
            onClick={() => move('LEFT')}
            aria-label="Left"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            type="button"
            className="dpad-key center-action"
            onClick={handleUndo}
            disabled={history.length === 0}
            aria-label="Undo"
          >
            <i className="fas fa-undo"></i>
          </button>
          <button
            type="button"
            className="dpad-key right"
            onClick={() => move('RIGHT')}
            aria-label="Right"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        <button
          type="button"
          className="dpad-key down"
          onClick={() => move('DOWN')}
          aria-label="Down"
        >
          <i className="fas fa-chevron-down"></i>
        </button>
      </div>

      <div className="arcade-hints-bar">
        <span><i className="fas fa-keyboard"></i> Use <strong>Arrow Keys</strong> or <strong>W/A/S/D</strong> to slide tiles</span>
        <span><i className="fas fa-mobile-screen"></i> Mobile: Swipe on screen or tap the touch D-pad to merge tiles</span>
      </div>
    </div>
  );
};

export default Game2048;
