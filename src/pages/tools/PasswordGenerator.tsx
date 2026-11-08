import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Tools.scss';
import { useToast } from '../../components/layout/ToastContext';

type GeneratorMode = 'password' | 'passphrase' | 'pin';

const WORD_BANK = [
  'aurora', 'beacon', 'cipher', 'dynamo', 'eclipse', 'falcon', 'galaxy',
  'horizon', 'infinity', 'jupiter', 'kinetic', 'lunar', 'matrix', 'nebula',
  'orbit', 'pulsar', 'quantum', 'radar', 'stellar', 'titan', 'uranus',
  'vortex', 'warp', 'xenon', 'zenith', 'crypto', 'shadow', 'blaze', 'hyper',
];

// Web Audio API Synthesizer for Password Tool
class ToolSoundController {
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

  playGenerate() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCopy() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
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
}

const sounds = new ToolSoundController();

const PasswordGenerator: React.FC = () => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<GeneratorMode>('password');
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState<boolean>(true);
  const [passphraseWords, setPassphraseWords] = useState<number>(4);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Strength computation
  const calculateStrength = useCallback((pwd: string) => {
    if (!pwd) return { score: 0, text: 'Empty', color: '#94a3b8', crackTime: '0 seconds' };

    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;

    const entropy = pwd.length * (Math.log2(pool || 1));

    if (entropy < 30) {
      return { score: 20, text: 'Very Weak', color: '#ef4444', crackTime: 'Instantly' };
    }
    if (entropy < 50) {
      return { score: 45, text: 'Moderate', color: '#f59e0b', crackTime: 'Few hours to days' };
    }
    if (entropy < 75) {
      return { score: 75, text: 'Strong', color: '#10b981', crackTime: 'Thousands of years' };
    }
    return { score: 100, text: 'Military Grade', color: '#38bdf8', crackTime: 'Billions of years' };
  }, []);

  const generate = useCallback(() => {
    let result = '';

    if (mode === 'password') {
      let chars = '';
      if (includeLower) chars += avoidAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
      if (includeUpper) chars += avoidAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (includeNumbers) chars += avoidAmbiguous ? '23456789' : '0123456789';
      if (includeSymbols) chars += '!@#$%^&*()_+~|}{[]:;?><,.-=';

      if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

      const array = new Uint32Array(length);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else if (mode === 'passphrase') {
      const words: string[] = [];
      const array = new Uint32Array(passphraseWords);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < passphraseWords; i++) {
        words.push(WORD_BANK[array[i] % WORD_BANK.length]);
      }
      result = words.join('-');
    } else if (mode === 'pin') {
      const digits = '0123456789';
      const array = new Uint32Array(length);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += digits[array[i] % digits.length];
      }
    }

    sounds.playGenerate();
    setGeneratedPassword(result);
    setHistory((prev) => [result, ...prev.filter((p) => p !== result).slice(0, 4)]);
  }, [mode, length, includeUpper, includeLower, includeNumbers, includeSymbols, avoidAmbiguous, passphraseWords]);

  useEffect(() => {
    generate();
  }, [generate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    sounds.playCopy();
    showToast('Password copied to clipboard! 📋', 'success');
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.enabled = nextState;
    showToast(nextState ? 'Audio Sound Enabled 🔊' : 'Audio Sound Muted 🔇', 'info');
  };

  const strength = calculateStrength(generatedPassword);

  return (
    <div className="tool-view-wrapper">
      {/* Header */}
      <div className="tool-header-card">
        <div className="header-left">
          <span className="tool-badge">
            <i className="fas fa-shield-halved"></i> Cyber Security Studio
          </span>
          <h1>Password &amp; Security Vault</h1>
          <p>
            Cryptographically secure entropy generator with custom complexity &amp; brute-force analysis
          </p>
        </div>

        <div className="tool-header-actions">
          <button
            type="button"
            className="tool-nav-btn"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            <i className={`fas fa-volume-${soundEnabled ? 'high' : 'xmark'}`}></i>
          </button>
          <Link to="/calculator" className="tool-nav-btn">
            <i className="fas fa-calculator"></i>
            <span>Calculator</span>
          </Link>
          <Link to="/counter" className="tool-nav-btn">
            <i className="fas fa-arrow-up-1-9"></i>
            <span>Counter</span>
          </Link>
          <Link to="/stopwatch" className="tool-nav-btn">
            <i className="fas fa-stopwatch"></i>
            <span>Stopwatch</span>
          </Link>
        </div>
      </div>

      {/* Main Console Frame */}
      <div className="tool-console-card">
        {/* Output Display & Strength */}
        <div className="password-display-card">
          <div className="password-text-row">
            <span className="password-string">{generatedPassword || 'Generating...'}</span>
            <div className="pass-action-buttons">
              <button
                type="button"
                className="icon-action-btn"
                onClick={generate}
                title="Generate New Password"
              >
                <i className="fas fa-rotate"></i>
              </button>
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => copyToClipboard(generatedPassword)}
                title="Copy Password"
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
          </div>

          <div className="strength-meter-wrap">
            <div className="strength-labels">
              <span className="strength-score" style={{ color: strength.color }}>
                {strength.text} ({strength.score}%)
              </span>
              <span className="crack-time">Estimated Crack Time: {strength.crackTime}</span>
            </div>
            <div className="strength-bar-track">
              <div
                className="strength-bar-fill"
                style={{ width: `${strength.score}%`, backgroundColor: strength.color }}
              />
            </div>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="password-config-grid">
          {/* Mode & Length */}
          <div className="config-box">
            <div className="config-title">
              <i className="fas fa-sliders"></i> Security Parameters
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Mode</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    mode === 'password'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  onClick={() => {
                    setMode('password');
                    setLength(16);
                  }}
                >
                  Password
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    mode === 'passphrase'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  onClick={() => setMode('passphrase')}
                >
                  Passphrase
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    mode === 'pin'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  onClick={() => {
                    setMode('pin');
                    setLength(6);
                  }}
                >
                  PIN
                </button>
              </div>
            </div>

            {mode === 'passphrase' ? (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Word Count</label>
                <div className="length-slider-row">
                  <input
                    type="range"
                    min={3}
                    max={8}
                    value={passphraseWords}
                    onChange={(e) => setPassphraseWords(Number(e.target.value))}
                    className="range-slider"
                  />
                  <div className="length-bubble">{passphraseWords}</div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Character Length</label>
                <div className="length-slider-row">
                  <input
                    type="range"
                    min={mode === 'pin' ? 4 : 8}
                    max={mode === 'pin' ? 16 : 64}
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="range-slider"
                  />
                  <div className="length-bubble">{length}</div>
                </div>
              </div>
            )}
          </div>

          {/* Character Options */}
          <div className="config-box">
            <div className="config-title">
              <i className="fas fa-font"></i> Character Inclusions
            </div>

            {mode === 'password' ? (
              <div className="checkbox-options-list">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeUpper}
                    onChange={(e) => setIncludeUpper(e.target.checked)}
                  />
                  <span>Uppercase Letters (A-Z)</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeLower}
                    onChange={(e) => setIncludeLower(e.target.checked)}
                  />
                  <span>Lowercase Letters (a-z)</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                  />
                  <span>Numbers &amp; Digits (0-9)</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                  />
                  <span>Special Symbols (!@#$%^&amp;*)</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={avoidAmbiguous}
                    onChange={(e) => setAvoidAmbiguous(e.target.checked)}
                  />
                  <span className="text-slate-300 text-xs">Exclude Ambiguous (l, 1, I, O, 0)</span>
                </label>
              </div>
            ) : (
              <div className="text-xs text-slate-400 leading-relaxed pt-2">
                {mode === 'passphrase' ? (
                  <span>
                    Passphrases use the Diceware entropy technique: combining high-frequency memorable words that are virtually impossible for computers to brute-force yet effortless for humans to memorize.
                  </span>
                ) : (
                  <span>
                    Numeric PIN generator uses high-entropy cryptographically random bytes suitable for hardware tokens, cards, and device access codes.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Generated History */}
        {history.length > 0 && (
          <div className="tool-history-panel">
            <h3>
              <i className="fas fa-clock-rotate-left"></i> Session Password Vault (Recent 5)
            </h3>
            <div className="history-chips-row">
              {history.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="history-badge cursor-pointer hover:border-cyan-400 hover:bg-slate-700/80 transition-all"
                  onClick={() => copyToClipboard(item)}
                  title="Click to copy"
                >
                  <span>{item}</span>
                  <i className="fas fa-copy text-xs text-slate-400 ml-1"></i>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordGenerator;
