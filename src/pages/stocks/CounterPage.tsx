import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../tools/Tools.scss';
import { useToast } from '../../components/layout/ToastContext';

// Web Audio API Synthesizer for Digital Counter
class CounterSoundController {
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

  playStep(freq: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playReset() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
}

const sounds = new CounterSoundController();

const CounterPage: React.FC = () => {
  const { showToast } = useToast();
  const [count, setCount] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [goal, setGoal] = useState<number>(100);
  const [history, setHistory] = useState<number[]>([0]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const updateCount = (newVal: number) => {
    if (newVal > count) {
      sounds.playStep(600);
    } else if (newVal < count) {
      sounds.playStep(400);
    }

    setCount(newVal);
    setHistory((prev) => [newVal, ...prev.slice(0, 7)]);

    if (newVal === 0) {
      sounds.playReset();
      showToast('Counter reset to 0', 'info');
    } else if (newVal === goal) {
      showToast(`🎯 Goal reached: ${goal}! Awesome!`, 'success');
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    showToast(nextState ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇', 'info');
  };

  // Keyboard controls (+, -, r)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '+' || e.key === '=' || e.key === 'ArrowUp') {
        updateCount(count + step);
      } else if (e.key === '-' || e.key === '_' || e.key === 'ArrowDown') {
        updateCount(count - step);
      } else if (e.key === 'r' || e.key === 'R') {
        updateCount(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [count, step]);

  const goalPercent = Math.min(100, Math.max(0, Math.round((count / goal) * 100)));

  return (
    <div className="tool-view-wrapper">
      {/* Header */}
      <div className="tool-header-card">
        <div className="header-left">
          <span className="tool-badge">
            <i className="fas fa-arrow-up-1-9"></i> Numeric Tally Station
          </span>
          <h1>Digital Precision Counter</h1>
          <p>
            Interactive digital step counter with customizable increments, milestone tracking &amp; history log
          </p>
        </div>

        <div className="tool-header-actions">
          <button
            type="button"
            className="tool-nav-btn"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            <i className={`fas fa-volume-${soundEnabled ? 'high' : 'xmark'}`}></i>
          </button>
          <Link to="/stopwatch" className="tool-nav-btn">
            <i className="fas fa-stopwatch"></i>
            <span>Stopwatch</span>
          </Link>
          <Link to="/calculator" className="tool-nav-btn">
            <i className="fas fa-calculator"></i>
            <span>Calculator</span>
          </Link>
          <Link to="/password-generator" className="tool-nav-btn">
            <i className="fas fa-key"></i>
            <span>Password Tool</span>
          </Link>
        </div>
      </div>

      {/* Main Console Frame */}
      <div className="tool-console-card">
        {/* Large Digital Stage Display */}
        <div className="counter-stage-display">
          <div className="counter-display-label">Current Value</div>
          <div className="counter-digital-num">{count}</div>

          {/* Goal Progress */}
          <div className="goal-progress-wrap">
            <div className="goal-labels">
              <span>Goal: {goal}</span>
              <span>{goalPercent}% Completed</span>
            </div>
            <div className="goal-progress-bar">
              <div
                className="goal-progress-fill"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Primary Big Buttons */}
        <div className="counter-primary-actions">
          <button
            type="button"
            className="counter-large-btn decrement"
            onClick={() => updateCount(count - step)}
          >
            <i className="fas fa-minus"></i>
            <span>Subtract {step}</span>
          </button>

          <button
            type="button"
            className="counter-large-btn increment"
            onClick={() => updateCount(count + step)}
          >
            <i className="fas fa-plus"></i>
            <span>Add {step}</span>
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="counter-controls-bar">
          <div className="step-input-group">
            <label htmlFor="counter-step">Step Size:</label>
            <select
              id="counter-step"
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              className="counter-step-select"
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="step-input-group">
            <label htmlFor="counter-goal">Target Goal:</label>
            <select
              id="counter-goal"
              value={goal}
              onChange={(e) => {
                const newGoal = Number(e.target.value);
                setGoal(newGoal);
                showToast(`Target goal updated: ${newGoal}`, 'info');
              }}
              className="counter-step-select"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </div>

          <div className="presets-group">
            <button type="button" onClick={() => updateCount(count + 1)} className="preset-chip-btn">+1</button>
            <button type="button" onClick={() => updateCount(count + 5)} className="preset-chip-btn">+5</button>
            <button type="button" onClick={() => updateCount(count + 10)} className="preset-chip-btn">+10</button>
            <button type="button" onClick={() => updateCount(count + 50)} className="preset-chip-btn">+50</button>
            <button type="button" onClick={() => updateCount(count + 100)} className="preset-chip-btn">+100</button>
          </div>

          <button
            type="button"
            className="reset-action-btn"
            onClick={() => updateCount(0)}
          >
            <i className="fas fa-rotate-left"></i>
            <span>Reset to 0</span>
          </button>
        </div>

        {/* History Log */}
        {history.length > 0 && (
          <div className="tool-history-panel">
            <h3>
              <i className="fas fa-clock-rotate-left"></i> Recent Tally Log
            </h3>
            <div className="history-chips-row">
              {history.map((val, idx) => (
                <span key={idx} className="history-badge">
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterPage;
