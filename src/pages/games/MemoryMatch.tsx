import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import './Games.scss';
import { useToast } from '../../components/layout/ToastContext';

interface CardItem {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_ICONS = ['🚀', '🎮', '🌟', '🎨', '🍕', '🐱', '🍩', '🏆', '💎', '🔥', '⚡', '🌈'];

// Web Audio API Synthesizer for Memory Match
class MemorySoundController {
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

  playFlip() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playMatch() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + (idx + 1) * 0.08);
    });
  }

  playMismatch() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playWin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
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

const sounds = new MemorySoundController();

const MemoryMatch: React.FC = () => {
  const { showToast } = useToast();
  const [difficulty, setDifficulty] = useState<number>(16); // 8, 16, 24
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [bestScore, setBestScore] = useState<number>(() => {
    return Number(localStorage.getItem('memory_match_best')) || 0;
  });

  const pairCount = difficulty / 2;

  // Deck generation
  const initializeGame = (count: number = difficulty) => {
    const selectedIcons = ALL_ICONS.slice(0, count / 2);
    const duplicatedIcons = [...selectedIcons, ...selectedIcons];
    const shuffled = duplicatedIcons
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
    setTimer(0);
    setIsActive(false);
    showToast(`Started Memory Match (${count} cards)`, 'info');
  };

  useEffect(() => {
    initializeGame(difficulty);
  }, [difficulty]);

  // Timer
  useEffect(() => {
    let interval: number | null = null;
    if (isActive && !isWon) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isActive, isWon]);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    showToast(nextState ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇', 'info');
  };

  const handleCardClick = (index: number) => {
    if (!isActive) setIsActive(true);
    if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    sounds.playFlip();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIndex, secondIndex] = newFlipped;

      if (cards[firstIndex].icon === cards[secondIndex].icon) {
        // Match!
        setTimeout(() => {
          sounds.playMatch();
          setCards((prev) =>
            prev.map((card, i) =>
              i === firstIndex || i === secondIndex
                ? { ...card, isMatched: true }
                : card
            )
          );
          setFlippedCards([]);
          setMatches((prev) => {
            const nextMatches = prev + 1;
            if (nextMatches === pairCount) {
              sounds.playWin();
              setIsWon(true);
              setIsActive(false);
              const score = Math.max(10, 600 - (moves + 1) * 12 - timer * 3);
              if (score > bestScore) {
                setBestScore(score);
                localStorage.setItem('memory_match_best', String(score));
                showToast(`🏆 NEW ALL-TIME RECORD: ${score} pts!`, 'success');
              } else {
                showToast(`🎉 Puzzle solved in ${moves + 1} moves!`, 'success');
              }
            }
            return nextMatches;
          });
        }, 300);
      } else {
        // Mismatch
        setTimeout(() => {
          sounds.playMismatch();
          setCards((prev) =>
            prev.map((card, i) =>
              i === firstIndex || i === secondIndex
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 750);
      }
    }
  };

  const currentScore = Math.max(10, 600 - moves * 12 - timer * 3);

  const getStars = () => {
    if (moves <= pairCount + 2) return '⭐⭐⭐';
    if (moves <= pairCount + 6) return '⭐⭐';
    return '⭐';
  };

  return (
    <div className="game-arcade-wrapper memory-arcade-wrapper">
      {isWon && <ReactConfetti numberOfPieces={140} recycle={false} style={{ position: 'fixed' }} />}

      {/* Arcade Header */}
      <div className="arcade-header-card">
        <div className="header-meta">
          <span className="arcade-badge">
            <i className="fas fa-brain"></i> Cognition Lab
          </span>
          <h2 className="arcade-title">Memory Matrix Match</h2>
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
            className="arcade-btn primary-btn"
            onClick={() => initializeGame(difficulty)}
          >
            <i className="fas fa-rotate-right"></i>
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="arcade-stats-bar">
        <div className="stat-pill">
          <span className="stat-name">Pairs Matched</span>
          <span className="stat-num text-cyan-400">
            {matches} / {pairCount}
          </span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">Moves</span>
          <span className="stat-num text-amber-400">{moves}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">Timer</span>
          <span className="stat-num text-emerald-400">{timer}s</span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">High Score</span>
          <span className="stat-num text-purple-400">{bestScore}</span>
        </div>
        <div className="stat-pill selector-pill">
          <span className="stat-name">Difficulty</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="arcade-select"
          >
            <option value={8}>Casual (8)</option>
            <option value={16}>Normal (16)</option>
            <option value={24}>Master (24)</option>
          </select>
        </div>
      </div>

      {/* Card Grid Area */}
      <div className="memory-board-viewport">
        <div className={`memory-cards-grid grid-${difficulty}`}>
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`memory-card-3d ${card.isFlipped ? 'flipped' : ''} ${
                card.isMatched ? 'matched' : ''
              }`}
              onClick={() => handleCardClick(index)}
              role="button"
              tabIndex={0}
              aria-label={`Card ${index + 1}`}
            >
              <div className="card-face-flipper">
                <div className="card-face card-front">
                  <span className="front-icon">
                    <i className="fas fa-atom"></i>
                  </span>
                </div>
                <div className="card-face card-back">
                  <span className="emoji-symbol">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Victory Modal */}
        {isWon && (
          <div className="arcade-modal-overlay">
            <div className="arcade-game-over-box">
              <span className="crash-icon">🏆</span>
              <h3>Memory Solved!</h3>
              <div className="text-2xl mb-2">{getStars()}</div>
              <p className="final-score-text">
                Score: <strong className="text-emerald-400 font-mono text-xl">{currentScore} pts</strong>
              </p>
              <p className="text-sm text-slate-300 mb-4">
                Completed in <strong className="text-white">{moves} moves</strong> ({timer} seconds)
              </p>
              <button
                type="button"
                className="arcade-modal-btn"
                onClick={() => initializeGame(difficulty)}
              >
                <i className="fas fa-rotate-right"></i>
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="arcade-hints-bar">
        <span><i className="fas fa-hand-pointer"></i> Tap or click any card to reveal its symbol</span>
        <span><i className="fas fa-star"></i> Match pairs consecutively to preserve accuracy &amp; speed score</span>
      </div>
    </div>
  );
};

export default MemoryMatch;
