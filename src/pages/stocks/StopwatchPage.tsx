import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../tools/Tools.scss';
import { useToast } from '../../components/layout/ToastContext';

interface Lap {
  id: number;
  lapTimeMs: number;
  totalTimeMs: number;
  formattedLap: string;
  formattedTotal: string;
}

// Web Audio API Synthesizer for Stopwatch
class StopwatchSoundController {
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

  playBeep(freq: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }
}

const sounds = new StopwatchSoundController();

const StopwatchPage: React.FC = () => {
  const { showToast } = useToast();
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [lastLapTime, setLastLapTime] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    let interval: number | null = null;
    if (isRunning) {
      interval = window.setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else if (interval !== null) {
      window.clearInterval(interval);
    }
    return () => {
      if (interval !== null) window.clearInterval(interval);
    };
  }, [isRunning]);

  const formatTimeParts = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    return {
      main: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      ms: milliseconds.toString().padStart(2, '0'),
    };
  };

  const formatFullTime = (timeMs: number) => {
    const parts = formatTimeParts(timeMs);
    return `${parts.main}.${parts.ms}`;
  };

  const handleStart = () => {
    sounds.playBeep(880);
    setIsRunning(true);
  };

  const handlePause = () => {
    sounds.playBeep(520);
    setIsRunning(false);
  };

  const handleLap = () => {
    if (time > 0) {
      sounds.playBeep(1046.5);
      const lapTimeMs = time - lastLapTime;
      setLastLapTime(time);
      const newLap: Lap = {
        id: laps.length + 1,
        lapTimeMs,
        totalTimeMs: time,
        formattedLap: formatFullTime(lapTimeMs),
        formattedTotal: formatFullTime(time),
      };
      setLaps((prev) => [newLap, ...prev]);
      showToast(`Lap ${newLap.id} recorded: ${newLap.formattedLap}`, 'info');
    }
  };

  const handleReset = () => {
    sounds.playBeep(350);
    setIsRunning(false);
    setTime(0);
    setLastLapTime(0);
    setLaps([]);
    showToast('Stopwatch reset', 'info');
  };

  const handleCopyLaps = () => {
    if (laps.length === 0) return;
    const text = laps
      .map((l) => `Lap #${l.id} - ${l.formattedLap} (Total: ${l.formattedTotal})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    showToast('Laps copied to clipboard! 📋', 'success');
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    showToast(nextState ? 'Sound FX Enabled 🔊' : 'Sound FX Muted 🔇', 'info');
  };

  // Keyboard controls (Space to start/pause, L for lap, R for reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) handlePause();
        else handleStart();
      } else if (e.key === 'l' || e.key === 'L') {
        if (isRunning) handleLap();
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, time, lastLapTime]);

  const timeParts = formatTimeParts(time);

  // Identify fastest and slowest lap
  let minLapTime = Infinity;
  let maxLapTime = -Infinity;
  if (laps.length > 1) {
    laps.forEach((l) => {
      if (l.lapTimeMs < minLapTime) minLapTime = l.lapTimeMs;
      if (l.lapTimeMs > maxLapTime) maxLapTime = l.lapTimeMs;
    });
  }

  return (
    <div className="tool-view-wrapper">
      {/* Header */}
      <div className="tool-header-card">
        <div className="header-left">
          <span className="tool-badge">
            <i className="fas fa-stopwatch"></i> High-Accuracy Chronometer
          </span>
          <h1>Precision Stopwatch &amp; Splits</h1>
          <p>
            Millisecond split-timing engine with lap telemetry, delta statistics &amp; clipboard export
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
          <Link to="/counter" className="tool-nav-btn">
            <i className="fas fa-arrow-up-1-9"></i>
            <span>Counter</span>
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
        {/* Large Stopwatch Stage */}
        <div className={`stopwatch-stage-display ${isRunning ? 'running' : ''}`}>
          <div className="stopwatch-digits-clock">
            <span className="digit-main">{timeParts.main}</span>
            <span className="digit-ms">.{timeParts.ms}</span>
          </div>

          <div className="status-pill-running">
            <span className="pulse-dot"></span>
            <span>{isRunning ? 'Timer Running' : time > 0 ? 'Timer Paused' : 'Ready'}</span>
          </div>
        </div>

        {/* Primary Big Buttons */}
        <div className="stopwatch-primary-actions">
          {!isRunning ? (
            <button
              type="button"
              className="watch-btn start-btn"
              onClick={handleStart}
            >
              <i className="fas fa-play"></i>
              <span>{time > 0 ? 'Resume' : 'Start Timer'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="watch-btn pause-btn"
              onClick={handlePause}
            >
              <i className="fas fa-pause"></i>
              <span>Pause Timer</span>
            </button>
          )}

          <button
            type="button"
            className="watch-btn lap-btn"
            onClick={handleLap}
            disabled={!isRunning}
          >
            <i className="fas fa-flag"></i>
            <span>Record Lap</span>
          </button>

          <button
            type="button"
            className="watch-btn reset-btn"
            onClick={handleReset}
            disabled={time === 0}
          >
            <i className="fas fa-rotate-left"></i>
            <span>Reset</span>
          </button>
        </div>

        {/* Lap Table Analytics */}
        {laps.length > 0 && (
          <div className="laps-analytics-card">
            <div className="laps-card-header">
              <h3>
                <i className="fas fa-list-ol"></i> Recorded Laps ({laps.length})
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="clear-laps-btn text-cyan-400 hover:text-cyan-300"
                  onClick={handleCopyLaps}
                >
                  <i className="fas fa-copy"></i> Copy All
                </button>
                <button
                  type="button"
                  className="clear-laps-btn"
                  onClick={() => setLaps([])}
                >
                  <i className="fas fa-trash-can"></i> Clear
                </button>
              </div>
            </div>

            <div className="laps-table-wrapper">
              {laps.map((lap) => {
                const isFastest = laps.length > 1 && lap.lapTimeMs === minLapTime;
                const isSlowest = laps.length > 1 && lap.lapTimeMs === maxLapTime;

                return (
                  <div
                    key={lap.id}
                    className={`lap-row ${isFastest ? 'fastest' : ''} ${isSlowest ? 'slowest' : ''}`}
                  >
                    <span className="lap-tag">
                      Lap #{lap.id} {isFastest ? '⚡ Fastest' : isSlowest ? '🐢 Slowest' : ''}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="lap-time-value">{lap.formattedLap}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({lap.formattedTotal})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StopwatchPage;
