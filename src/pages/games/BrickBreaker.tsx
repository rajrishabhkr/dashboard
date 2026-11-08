import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactConfetti from 'react-confetti';
import './Games.scss';
import { useToast } from '../../components/layout/ToastContext';

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  status: number;
  color: string;
  points: number;
}

// Web Audio API Synthesizer for Brick Breaker
class BrickSoundController {
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

  playPaddleHit() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playBrickHit() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playLifeLost() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playVictory() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.25, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + (idx + 1) * 0.09);
    });
  }
}

const sounds = new BrickSoundController();

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 420;
const BRICK_ROWS = 4;
const BRICK_COLS = 6;
const BRICK_WIDTH = 64;
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = (CANVAS_WIDTH - (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;

const ROW_CONFIG = [
  { color: '#f43f5e', points: 50 },
  { color: '#fbbf24', points: 30 },
  { color: '#34d399', points: 20 },
  { color: '#38bdf8', points: 10 },
];

const BrickBreaker: React.FC = () => {
  const { showToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('neon_breakout_best')) || 0;
  });

  // Mutable Game Engine State
  const gameStateRef = useRef({
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT - 60,
    ballRadius: 7,
    dx: 3.5,
    dy: -3.5,
    paddleWidth: 90,
    paddleHeight: 12,
    paddleX: (CANVAS_WIDTH - 90) / 2,
    paddleSpeed: 7,
    leftPressed: false,
    rightPressed: false,
    bricks: [] as Brick[],
  });

  const initBricks = useCallback((): Brick[] => {
    const list: Brick[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const x = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
        const y = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
        list.push({
          x,
          y,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          status: 1,
          color: ROW_CONFIG[r].color,
          points: ROW_CONFIG[r].points,
        });
      }
    }
    return list;
  }, []);

  const resetGame = useCallback(() => {
    const g = gameStateRef.current;
    g.ballX = CANVAS_WIDTH / 2;
    g.ballY = CANVAS_HEIGHT - 60;
    g.dx = 3.5 * (Math.random() > 0.5 ? 1 : -1);
    g.dy = -3.5;
    g.paddleX = (CANVAS_WIDTH - g.paddleWidth) / 2;
    g.bricks = initBricks();

    setScore(0);
    setLives(3);
    setIsPlaying(true);
    setIsGameOver(false);
    setIsWon(false);
    showToast('Cyber Breakout launched! 🚀', 'info');
  }, [initBricks, showToast]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Touch and Mouse tracking for paddle
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const relativeX = (e.clientX - rect.left) * scaleX;
    const g = gameStateRef.current;
    g.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - g.paddleWidth, relativeX - g.paddleWidth / 2));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const relativeX = (e.touches[0].clientX - rect.left) * scaleX;
    const g = gameStateRef.current;
    g.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - g.paddleWidth, relativeX - g.paddleWidth / 2));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const g = gameStateRef.current;
      if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        g.rightPressed = true;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        g.leftPressed = true;
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const g = gameStateRef.current;
      if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        g.rightPressed = false;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        g.leftPressed = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const g = gameStateRef.current;

      // Clear Canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Draw Bricks
      g.bricks.forEach((b) => {
        if (b.status === 1) {
          ctx.fillStyle = b.color;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, b.width, b.height, 4);
          ctx.fill();
        }
      });

      // Draw Paddle
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(g.paddleX, CANVAS_HEIGHT - g.paddleHeight - 12, g.paddleWidth, g.paddleHeight, 6);
      ctx.fill();

      // Draw Ball
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(g.ballX, g.ballY, g.ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isPlaying && !isGameOver && !isWon) {
        // Move Paddle by keyboard
        if (g.rightPressed && g.paddleX < CANVAS_WIDTH - g.paddleWidth) {
          g.paddleX += g.paddleSpeed;
        } else if (g.leftPressed && g.paddleX > 0) {
          g.paddleX -= g.paddleSpeed;
        }

        // Brick collision detection
        let activeBricksCount = 0;
        g.bricks.forEach((b) => {
          if (b.status === 1) {
            activeBricksCount++;
            if (
              g.ballX > b.x &&
              g.ballX < b.x + b.width &&
              g.ballY > b.y &&
              g.ballY < b.y + b.height
            ) {
              g.dy = -g.dy;
              b.status = 0;
              sounds.playBrickHit();

              setScore((prev) => {
                const newScore = prev + b.points;
                if (newScore > highScore) {
                  setHighScore(newScore);
                  localStorage.setItem('neon_breakout_best', String(newScore));
                }
                return newScore;
              });
            }
          }
        });

        // Win check
        if (activeBricksCount === 0) {
          setIsWon(true);
          sounds.playVictory();
          showToast('🏆 CONGRATULATIONS! Board Cleared!', 'success');
          return;
        }

        // Wall collisions
        if (g.ballX + g.dx > CANVAS_WIDTH - g.ballRadius || g.ballX + g.dx < g.ballRadius) {
          g.dx = -g.dx;
        }
        if (g.ballY + g.dy < g.ballRadius) {
          g.dy = -g.dy;
        } else if (g.ballY + g.dy > CANVAS_HEIGHT - g.ballRadius - g.paddleHeight - 12) {
          // Paddle hit check
          if (g.ballX > g.paddleX - 4 && g.ballX < g.paddleX + g.paddleWidth + 4) {
            sounds.playPaddleHit();
            // Variable reflection angle based on hit position
            const hitPoint = (g.ballX - (g.paddleX + g.paddleWidth / 2)) / (g.paddleWidth / 2);
            g.dx = hitPoint * 4.5;
            g.dy = -Math.abs(g.dy);
          } else if (g.ballY + g.dy > CANVAS_HEIGHT - g.ballRadius) {
            // Ball dropped
            sounds.playLifeLost();
            setLives((prevLives) => {
              const nextLives = prevLives - 1;
              if (nextLives <= 0) {
                setIsGameOver(true);
                showToast('💥 Out of Lives! Game Over.', 'warning');
              } else {
                showToast(`Life lost! ${nextLives} lives remaining.`, 'info');
                // Reset ball position
                g.ballX = CANVAS_WIDTH / 2;
                g.ballY = CANVAS_HEIGHT - 60;
                g.dx = 3.5 * (Math.random() > 0.5 ? 1 : -1);
                g.dy = -3.5;
                g.paddleX = (CANVAS_WIDTH - g.paddleWidth) / 2;
              }
              return nextLives;
            });
          }
        }

        g.ballX += g.dx;
        g.ballY += g.dy;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGameOver, isWon, highScore, showToast]);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    showToast(nextState ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇', 'info');
  };

  return (
    <div className="game-arcade-wrapper breakout-wrapper">
      {isWon && <ReactConfetti numberOfPieces={120} recycle={false} style={{ position: 'fixed' }} />}

      {/* Header */}
      <div className="arcade-header-card">
        <div className="header-meta">
          <span className="arcade-badge">
            <i className="fas fa-burst"></i> Kinetic Arcade
          </span>
          <h2 className="arcade-title">Neon Brick Breaker</h2>
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
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Game' : 'Resume Game'}
          >
            <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
          </button>
          <button
            type="button"
            className="arcade-btn primary-btn"
            onClick={resetGame}
          >
            <i className="fas fa-rotate-right"></i>
            <span>Restart</span>
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
          <span className="stat-name">Lives</span>
          <span className="stat-num text-rose-400">
            {'❤️'.repeat(Math.max(0, lives)) || '💀'}
          </span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">Best Score</span>
          <span className="stat-num text-amber-400">{highScore}</span>
        </div>
      </div>

      {/* Canvas Frame */}
      <div className="breakout-canvas-frame">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="breakout-canvas"
        />

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="arcade-modal-overlay">
            <div className="arcade-game-over-box">
              <span className="crash-icon">💥</span>
              <h3>Game Over!</h3>
              <p className="final-score-text">
                Final Score: <strong className="text-cyan-400 font-mono text-xl">{score}</strong>
              </p>
              <button
                type="button"
                className="arcade-modal-btn"
                onClick={resetGame}
              >
                <i className="fas fa-play"></i>
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Win Modal */}
        {isWon && (
          <div className="arcade-modal-overlay">
            <div className="arcade-game-over-box">
              <span className="crash-icon">🏆</span>
              <h3>Stage Cleared!</h3>
              <p className="final-score-text">
                Score: <strong className="text-emerald-400 font-mono text-xl">{score}</strong>
              </p>
              <button
                type="button"
                className="arcade-modal-btn"
                onClick={resetGame}
              >
                <i className="fas fa-play"></i>
                <span>Next Stage</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Paddle Controls */}
      <div className="mobile-paddle-bar">
        <button
          type="button"
          className="paddle-ctrl-btn"
          onMouseDown={() => (gameStateRef.current.leftPressed = true)}
          onMouseUp={() => (gameStateRef.current.leftPressed = false)}
          onTouchStart={() => (gameStateRef.current.leftPressed = true)}
          onTouchEnd={() => (gameStateRef.current.leftPressed = false)}
        >
          <i className="fas fa-chevron-left"></i> Left
        </button>
        <button
          type="button"
          className="paddle-ctrl-btn"
          onMouseDown={() => (gameStateRef.current.rightPressed = true)}
          onMouseUp={() => (gameStateRef.current.rightPressed = false)}
          onTouchStart={() => (gameStateRef.current.rightPressed = true)}
          onTouchEnd={() => (gameStateRef.current.rightPressed = false)}
        >
          Right <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <div className="arcade-hints-bar">
        <span><i className="fas fa-computer-mouse"></i> Move mouse or slide touch on screen to guide the paddle</span>
        <span><i className="fas fa-keyboard"></i> Desktop: <strong>A/D</strong> or <strong>Left/Right Arrows</strong> | <strong>Space</strong> to Pause</span>
      </div>
    </div>
  );
};

export default BrickBreaker;
