import React, { useState } from 'react';
import ReactConfetti from 'react-confetti';
import './Games.scss';
import { useToast } from '../../components/layout/ToastContext';

interface ColorPadConfig {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  freq: number;
  icon: string;
}

const COLOR_PADS: ColorPadConfig[] = [
  { id: 'red', name: 'Ruby', color: '#ef4444', glowColor: '#f87171', freq: 261.63, icon: 'fa-gem' },
  { id: 'green', name: 'Emerald', color: '#10b981', glowColor: '#34d399', freq: 329.63, icon: 'fa-clover' },
  { id: 'blue', name: 'Sapphire', color: '#0ea5e9', glowColor: '#38bdf8', freq: 392.0, icon: 'fa-bolt' },
  { id: 'yellow', name: 'Amber', color: '#f59e0b', glowColor: '#fbbf24', freq: 523.25, icon: 'fa-fire' },
];

// Web Audio API Synthesizer for Color Rush
class ColorRushSoundController {
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

  playTone(freq: number, durationMs: number = 280) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + durationMs / 1000);
  }

  playError() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playLevelUp() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25].forEach((freq, idx) => {
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
}

const sounds = new ColorRushSoundController();

const ColorRush: React.FC = () => {
  const { showToast } = useToast();
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePad, setActivePad] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [speedMs, setSpeedMs] = useState<number>(550);
  const [statusMessage, setStatusMessage] = useState<string>('Press Start Game to Begin Pattern');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('color_rush_highscore')) || 0;
  });

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    showToast(nextState ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇', 'info');
  };

  const flashColor = (padId: string, duration: number = 300) => {
    const pad = COLOR_PADS.find((p) => p.id === padId);
    if (pad) sounds.playTone(pad.freq, duration);
    setActivePad(padId);
    setTimeout(() => {
      setActivePad(null);
    }, duration);
  };

  const startGame = () => {
    setSequence([]);
    setUserSequence([]);
    setScore(0);
    setCombo(1);
    setShowConfetti(false);
    setIsPlaying(true);
    setStatusMessage('Watch the pattern sequence carefully...');
    showToast('Color Rush round initiated! ⚡', 'info');
    addNewColor([]);
  };

  const addNewColor = (currentSequence: string[]) => {
    const randomPad = COLOR_PADS[Math.floor(Math.random() * COLOR_PADS.length)].id;
    const nextSeq = [...currentSequence, randomPad];
    setSequence(nextSeq);
    setUserSequence([]);
    playSequence(nextSeq);
  };

  const playSequence = (seq: string[]) => {
    setIsPlaying(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < seq.length) {
        flashColor(seq[i], Math.max(220, speedMs - 150));
        i++;
      } else {
        clearInterval(interval);
        setIsPlaying(true);
        setStatusMessage('Your turn! Repeat the pattern sequence.');
      }
    }, speedMs);
  };

  const handlePadClick = (padId: string) => {
    if (!isPlaying) return;

    flashColor(padId, 250);
    const nextUserSeq = [...userSequence, padId];
    setUserSequence(nextUserSeq);

    const currentIndex = nextUserSeq.length - 1;

    // Check wrong tap
    if (nextUserSeq[currentIndex] !== sequence[currentIndex]) {
      sounds.playError();
      setIsPlaying(false);
      setStatusMessage(`💥 Pattern Missed! Final Score: ${score}`);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('color_rush_highscore', String(score));
        setShowConfetti(true);
        showToast(`🏆 NEW ALL-TIME HIGH SCORE: ${score} pts!`, 'success');
      } else {
        showToast(`Game Over! Score: ${score}`, 'warning');
      }
      return;
    }

    // Completed full pattern step
    if (nextUserSeq.length === sequence.length) {
      sounds.playLevelUp();
      const pointsGained = 15 * combo;
      const nextScore = score + pointsGained;
      const nextCombo = combo + 1;
      setScore(nextScore);
      setCombo(nextCombo);

      if (nextScore > highScore) {
        setHighScore(nextScore);
        localStorage.setItem('color_rush_highscore', String(nextScore));
        setShowConfetti(true);
      }

      setStatusMessage(`🔥 Round ${sequence.length} Clear! (+${pointsGained} pts)`);
      setTimeout(() => {
        addNewColor(sequence);
      }, 750);
    }
  };

  return (
    <div className="game-arcade-wrapper color-rush-wrapper">
      {showConfetti && <ReactConfetti numberOfPieces={120} recycle={false} style={{ position: 'fixed' }} />}

      {/* Arcade Header */}
      <div className="arcade-header-card">
        <div className="header-meta">
          <span className="arcade-badge">
            <i className="fas fa-wave-square"></i> Audio-Visual Reflex
          </span>
          <h2 className="arcade-title">Neon Color Rush</h2>
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
            onClick={startGame}
          >
            <i className="fas fa-play"></i>
            <span>{sequence.length > 0 ? 'Restart' : 'Start'}</span>
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
          <span className="stat-name">Streak</span>
          <span className="stat-num text-emerald-400">{combo}x</span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">High Score</span>
          <span className="stat-num text-amber-400">{highScore}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-name">Sequence Length</span>
          <span className="stat-num text-purple-400">{sequence.length}</span>
        </div>
        <div className="stat-pill selector-pill">
          <span className="stat-name">Pace</span>
          <select
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            className="arcade-select"
          >
            <option value={750}>Casual</option>
            <option value={550}>Normal</option>
            <option value={380}>Turbo</option>
          </select>
        </div>
      </div>

      {/* Dynamic Status Banner */}
      <div className="status-announcement-banner">
        <span className="pulse-indicator"></span>
        <span className="banner-text">{statusMessage}</span>
      </div>

      {/* 4 Interactive Neon Pads */}
      <div className="color-pads-arena">
        {COLOR_PADS.map((pad) => {
          const isActive = activePad === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              className={`neon-color-pad ${pad.id} ${isActive ? 'active-pulse' : ''}`}
              style={{
                backgroundColor: isActive ? pad.glowColor : pad.color,
                boxShadow: isActive
                  ? `0 0 35px ${pad.glowColor}, inset 0 0 20px rgba(255, 255, 255, 0.8)`
                  : `0 4px 15px rgba(0, 0, 0, 0.4)`,
              }}
              onClick={() => handlePadClick(pad.id)}
              disabled={!isPlaying}
              aria-label={`${pad.name} Pad`}
            >
              <div className="pad-inner-glow">
                <i className={`fas ${pad.icon}`}></i>
                <span className="pad-name-label">{pad.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="arcade-hints-bar">
        <span><i className="fas fa-headphones"></i> Listen to unique note frequencies for each quadrant</span>
        <span><i className="fas fa-bolt"></i> Streak multiplier increases your score gain for every successive round</span>
      </div>
    </div>
  );
};

export default ColorRush;
