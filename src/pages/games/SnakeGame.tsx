import React, { useState, useEffect, useRef } from 'react';
import ReactConfetti from 'react-confetti';
import './Games.scss';
import { useToast } from '../../components/layout/ToastContext';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

// Web Audio API Synthesizer for Snake Game
class SnakeSoundController {
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

  playEat() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playBonus() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.25, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + (idx + 1) * 0.06);
    });
  }

  playCrash() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }
}

const sounds = new SnakeSoundController();

const SnakeGame: React.FC = () => {
  const { showToast } = useToast();
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [bonusFood, setBonusFood] = useState<Position | null>(null);
  const [direction, setDirection] = useState<Direction>('UP');
  const [nextDirection, setNextDirection] = useState<Direction>('UP');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [wrapMode, setWrapMode] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('snake_game_highscore')) || 0;
  });
  const [speed, setSpeed] = useState<number>(100);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Generate random food not on snake
  const getRandomFoodPos = (currentSnake: Position[]): Position => {
    let newPos: Position;
    while (true) {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newPos.x && segment.y === newPos.y
      );
      if (!isOnSnake) break;
    }
    return newPos;
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection('UP');
    setNextDirection('UP');
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setFood(getRandomFoodPos(INITIAL_SNAKE));
    setBonusFood(null);
    setShowConfetti(false);
    showToast('Snake Game restarted! 🐍', 'info');
  };

  const toggleWrapMode = () => {
    const nextVal = !wrapMode;
    setWrapMode(nextVal);
    showToast(`Wall mode: ${nextVal ? 'Wrap Pass-Through 🌀' : 'Solid Wall Collision 🧱'}`, 'info');
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    showToast(nextState ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇', 'info');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setNextDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          setIsPaused((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Game Loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const moveSnake = () => {
      setDirection(nextDirection);
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };

        switch (nextDirection) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Wall interaction
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE
        ) {
          if (wrapMode) {
            if (head.x < 0) head.x = GRID_SIZE - 1;
            if (head.x >= GRID_SIZE) head.x = 0;
            if (head.y < 0) head.y = GRID_SIZE - 1;
            if (head.y >= GRID_SIZE) head.y = 0;
          } else {
            sounds.playCrash();
            setIsGameOver(true);
            return prevSnake;
          }
        }

        // Self collision
        if (
          prevSnake.some(
            (segment) => segment.x === head.x && segment.y === head.y
          )
        ) {
          sounds.playCrash();
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Normal food collision
        if (head.x === food.x && head.y === food.y) {
          sounds.playEat();
          setScore((prevScore) => {
            const nextScore = prevScore + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('snake_game_highscore', String(nextScore));
              setShowConfetti(true);
            }
            if (nextScore > 0 && nextScore % 50 === 0) {
              setBonusFood(getRandomFoodPos(newSnake));
            }
            return nextScore;
          });
          setFood(getRandomFoodPos(newSnake));
        }
        // Bonus food collision
        else if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
          sounds.playBonus();
          showToast('+50 BONUS STARS! 🌟', 'success');
          setScore((prevScore) => {
            const nextScore = prevScore + 50;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('snake_game_highscore', String(nextScore));
              setShowConfetti(true);
            }
            return nextScore;
          });
          setBonusFood(null);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [nextDirection, food, bonusFood, isGameOver, isPaused, speed, wrapMode, highScore]);

  // Touch Swipe Handlers for mobile canvas
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

    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // Tap, not swipe

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && direction !== 'LEFT') setNextDirection('RIGHT');
      else if (dx < 0 && direction !== 'RIGHT') setNextDirection('LEFT');
    } else {
      if (dy > 0 && direction !== 'UP') setNextDirection('DOWN');
      else if (dy < 0 && direction !== 'DOWN') setNextDirection('UP');
    }
  };

  const handleMobileControl = (dir: Direction) => {
    if (
      (dir === 'UP' && direction !== 'DOWN') ||
      (dir === 'DOWN' && direction !== 'UP') ||
      (dir === 'LEFT' && direction !== 'RIGHT') ||
      (dir === 'RIGHT' && direction !== 'LEFT')
    ) {
      setNextDirection(dir);
    }
  };

  return (
    <div className="game-arcade-wrapper">
      {showConfetti && <ReactConfetti numberOfPieces={120} recycle={false} style={{ position: 'fixed' }} />}

      {/* Arcade Header */}
      <div className="arcade-header-card">
        <div className="header-meta">
          <span className="arcade-badge">
            <i className="fas fa-gamepad"></i> Retro Arcade
          </span>
          <h2 className="arcade-title">Cyber Snake 2077</h2>
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
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i>
          </button>
          <button
            type="button"
            className="arcade-btn primary-btn"
            onClick={resetGame}
          >
            <i className="fas fa-rotate-right"></i>
            <span>Reset</span>
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
          <span className="stat-name">High Score</span>
          <span className="stat-num text-amber-400">{highScore}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">Length</span>
          <span className="stat-num text-emerald-400">{snake.length}</span>
        </div>
        <div className="stat-pill selector-pill">
          <span className="stat-name">Walls</span>
          <button
            type="button"
            onClick={toggleWrapMode}
            className={`mode-toggle-chip ${wrapMode ? 'active' : ''}`}
          >
            {wrapMode ? '🌀 Wrap' : '🧱 Solid'}
          </button>
        </div>
        <div className="stat-pill selector-pill">
          <span className="stat-name">Speed</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="arcade-select"
          >
            <option value={140}>Casual</option>
            <option value={100}>Normal</option>
            <option value={60}>Turbo</option>
          </select>
        </div>
      </div>

      {/* Snake Game Grid */}
      <div 
        className="snake-board-frame"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="snake-grid-canvas">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.slice(1).some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;
            const isBonus = bonusFood && bonusFood.x === x && bonusFood.y === y;

            return (
              <div
                key={index}
                className={`snake-cell ${
                  isHead
                    ? 'snake-head-cell'
                    : isBody
                    ? 'snake-body-cell'
                    : isBonus
                    ? 'bonus-orb-cell'
                    : isFood
                    ? 'food-orb-cell'
                    : ''
                }`}
              />
            );
          })}
        </div>

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="arcade-modal-overlay">
            <div className="arcade-game-over-box">
              <span className="crash-icon">💥</span>
              <h3>Game Over!</h3>
              <p className="final-score-text">
                Final Score: <strong className="text-cyan-400 font-mono text-xl">{score}</strong>
              </p>
              {score >= highScore && score > 0 && (
                <div className="new-high-badge">🏆 NEW ALL-TIME HIGH SCORE!</div>
              )}
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

        {/* Paused Overlay */}
        {isPaused && !isGameOver && (
          <div className="arcade-modal-overlay">
            <div className="arcade-game-over-box">
              <span className="crash-icon">⏸️</span>
              <h3>Game Paused</h3>
              <button
                type="button"
                className="arcade-modal-btn"
                onClick={() => setIsPaused(false)}
              >
                <i className="fas fa-play"></i>
                <span>Resume Game</span>
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
          onClick={() => handleMobileControl('UP')}
          aria-label="Up"
        >
          <i className="fas fa-chevron-up"></i>
        </button>
        <div className="dpad-horizontal-row">
          <button
            type="button"
            className="dpad-key left"
            onClick={() => handleMobileControl('LEFT')}
            aria-label="Left"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            type="button"
            className="dpad-key center-action"
            onClick={() => setIsPaused(!isPaused)}
            aria-label="Pause or Resume"
          >
            <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i>
          </button>
          <button
            type="button"
            className="dpad-key right"
            onClick={() => handleMobileControl('RIGHT')}
            aria-label="Right"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        <button
          type="button"
          className="dpad-key down"
          onClick={() => handleMobileControl('DOWN')}
          aria-label="Down"
        >
          <i className="fas fa-chevron-down"></i>
        </button>
      </div>

      <div className="arcade-hints-bar">
        <span><i className="fas fa-keyboard"></i> Desktop: <strong>W/A/S/D</strong> or <strong>Arrow Keys</strong> | <strong>Space</strong> to Pause</span>
        <span><i className="fas fa-mobile-screen"></i> Mobile: Swipe on screen or use touch D-pad</span>
      </div>
    </div>
  );
};

export default SnakeGame;
