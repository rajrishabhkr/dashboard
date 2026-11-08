import React, { useState, useEffect, useCallback } from 'react';
import './Calculator.scss';
import { useToast } from '../../components/layout/ToastContext';

// Procedural audio synthesizer for tactile feedback
const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.06) => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio context errors if blocked
  }
};

// Safe calculation engine
const calculate = (expression: string): string => {
  try {
    if (!expression.trim()) return '0';
    // Replace visual tokens
    let sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, Math.PI.toString())
      .replace(/[^0-9+\-*/().]/g, '');

    if (!sanitized) return '0';
    const fn = new Function(`return ${sanitized}`);
    const res = fn();
    if (!isFinite(res) || isNaN(res)) throw new Error('Math error');
    // Round cleanly if floating point inaccuracy
    return Number(res.toFixed(10)).toString();
  } catch {
    return 'Error';
  }
};

const Calculator: React.FC = () => {
  const { showToast } = useToast();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sound = useCallback((f: number, type: OscillatorType = 'sine', d = 0.06) => {
    if (soundEnabled) playTone(f, type, d);
  }, [soundEnabled]);

  const handleButtonClick = useCallback((value: string) => {
    if (value === '=') {
      if (!input) return;
      const res = calculate(input);
      setResult(res);
      if (res === 'Error') {
        sound(150, 'sawtooth', 0.2);
        showToast('Syntax / Math Error!', 'error');
      } else {
        sound(660, 'sine', 0.12);
        setHistory((prev) => [`${input} = ${res}`, ...prev.slice(0, 9)]);
        showToast(`Result: ${res}`, 'success');
      }
    } else if (value === 'C') {
      sound(280, 'sine', 0.08);
      setInput('');
      setResult('');
    } else if (value === '⌫') {
      sound(340, 'sine', 0.05);
      setInput((prev) => prev.slice(0, -1));
    } else if (value === 'sqrt') {
      const current = result || input;
      if (!current || current === 'Error') return;
      try {
        const num = parseFloat(calculate(current));
        if (num < 0) throw new Error('Invalid');
        const val = Number(Math.sqrt(num).toFixed(10)).toString();
        setInput(`√(${current})`);
        setResult(val);
        sound(520, 'triangle', 0.08);
      } catch {
        sound(150, 'sawtooth', 0.2);
        setResult('Error');
      }
    } else if (value === 'sqr') {
      const current = result || input;
      if (!current || current === 'Error') return;
      try {
        const num = parseFloat(calculate(current));
        const val = Number((num * num).toFixed(10)).toString();
        setInput(`(${current})²`);
        setResult(val);
        sound(520, 'triangle', 0.08);
      } catch {
        sound(150, 'sawtooth', 0.2);
        setResult('Error');
      }
    } else if (value === '%') {
      const current = result || input;
      if (!current || current === 'Error') return;
      try {
        const num = parseFloat(calculate(current));
        const val = (num / 100).toString();
        setInput(val);
        setResult(val);
        sound(450, 'sine', 0.06);
      } catch {
        sound(150, 'sawtooth', 0.2);
      }
    } else {
      sound(440, 'sine', 0.04);
      // Prevent multiple decimal points in a single number token
      if (value === '.') {
        const parts = input.split(/[-+*/×÷]/);
        if (parts[parts.length - 1].includes('.')) return;
      }
      setInput((prev) => prev + value);
    }
  }, [input, result, showToast, sound]);

  // Memory functions
  const handleMemory = (action: 'MC' | 'MR' | 'M+' | 'M-') => {
    const currentVal = parseFloat(result || calculate(input) || '0');
    if (isNaN(currentVal)) return;

    if (action === 'MC') {
      setMemory(0);
      sound(260, 'sine', 0.08);
      showToast('Memory cleared (MC)', 'info');
    } else if (action === 'MR') {
      sound(480, 'sine', 0.08);
      setInput((prev) => prev + memory.toString());
      showToast(`Recalled ${memory} (MR)`, 'info');
    } else if (action === 'M+') {
      setMemory((prev) => prev + currentVal);
      sound(560, 'sine', 0.08);
      showToast(`Added ${currentVal} to memory (M+)`, 'success');
    } else if (action === 'M-') {
      setMemory((prev) => prev - currentVal);
      sound(420, 'sine', 0.08);
      showToast(`Subtracted ${currentVal} from memory (M-)`, 'info');
    }
  };

  const copyResult = () => {
    const toCopy = result || input || '0';
    navigator.clipboard.writeText(toCopy);
    sound(600, 'triangle', 0.08);
    showToast(`Copied "${toCopy}" to clipboard! 📋`, 'success');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      const allowedKeys = /[0-9+\-*/.=]|Enter|Backspace|Delete|\(|\)|%/;
      
      if (allowedKeys.test(key)) {
        event.preventDefault();
        if (key === 'Enter' || key === '=') {
          handleButtonClick('=');
        } else if (key === 'Backspace') {
          handleButtonClick('⌫');
        } else if (key === 'Delete') {
          handleButtonClick('C');
        } else if (key === '*') {
          handleButtonClick('×');
        } else if (key === '/') {
          handleButtonClick('÷');
        } else {
          handleButtonClick(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButtonClick]);

  return (
    <div className="calculator-container">
      <div className="calculator-wrapper">
        {/* Header HUD */}
        <div className="calc-header-hud">
          <div className="hud-title-wrap">
            <span className="hud-icon"><i className="fas fa-calculator"></i></span>
            <div>
              <h1 className="hud-title">Precision Cyber Calculator</h1>
              <span className="hud-subtitle">Scientific Math & Real-Time Expression Engine</span>
            </div>
          </div>
          <div className="hud-controls">
            <button 
              className={`hud-btn ${soundEnabled ? 'active' : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            >
              <i className={`fas fa-volume-${soundEnabled ? 'up' : 'mute'}`}></i>
            </button>
            <button 
              className="hud-btn"
              onClick={copyResult}
              title="Copy Result"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
        </div>

        {/* Digital OLED Display */}
        <div className="calculator-display-hud">
          <div className="calc-screen-top">
            <span className="calc-mode-tag">DEG</span>
            {memory !== 0 && <span className="calc-mem-tag">MEM: {memory}</span>}
            <span className="calc-history-preview">
              {history.length > 0 ? history[0] : 'Ready'}
            </span>
          </div>
          <div className="calc-expression-row">
            <span className="calc-input-text">{input || '0'}</span>
          </div>
          <div className="calc-result-row">
            <span className="calc-equals-symbol">=</span>
            <span className="calc-result-val">{result || (input ? calculate(input) : '0')}</span>
          </div>
        </div>

        {/* Memory Bar */}
        <div className="calc-memory-bar">
          <button className="mem-btn" onClick={() => handleMemory('MC')}>MC</button>
          <button className="mem-btn" onClick={() => handleMemory('MR')}>MR</button>
          <button className="mem-btn" onClick={() => handleMemory('M+')}>M+</button>
          <button className="mem-btn" onClick={() => handleMemory('M-')}>M-</button>
          <button className="mem-btn fn-btn" onClick={() => handleButtonClick('sqrt')}>√x</button>
          <button className="mem-btn fn-btn" onClick={() => handleButtonClick('sqr')}>x²</button>
          <button className="mem-btn fn-btn" onClick={() => handleButtonClick('%')}>%</button>
        </div>

        {/* Tactile Keypad */}
        <div className="calculator-grid">
          {/* Row 1 */}
          <button className="calc-key key-clear" onClick={() => handleButtonClick('C')}>C</button>
          <button className="calc-key key-special" onClick={() => handleButtonClick('(')}>(</button>
          <button className="calc-key key-special" onClick={() => handleButtonClick(')')}>)</button>
          <button className="calc-key key-op" onClick={() => handleButtonClick('÷')}>÷</button>

          {/* Row 2 */}
          <button className="calc-key key-num" onClick={() => handleButtonClick('7')}>7</button>
          <button className="calc-key key-num" onClick={() => handleButtonClick('8')}>8</button>
          <button className="calc-key key-num" onClick={() => handleButtonClick('9')}>9</button>
          <button className="calc-key key-op" onClick={() => handleButtonClick('×')}>×</button>

          {/* Row 3 */}
          <button className="calc-key key-num" onClick={() => handleButtonClick('4')}>4</button>
          <button className="calc-key key-num" onClick={() => handleButtonClick('5')}>5</button>
          <button className="calc-key key-num" onClick={() => handleButtonClick('6')}>6</button>
          <button className="calc-key key-op" onClick={() => handleButtonClick('-')}>−</button>

          {/* Row 4 */}
          <button className="calc-key key-num" onClick={() => handleButtonClick('1')}>1</button>
          <button className="calc-key key-num" onClick={() => handleButtonClick('2')}>2</button>
          <button className="calc-key key-num" onClick={() => handleButtonClick('3')}>3</button>
          <button className="calc-key key-op" onClick={() => handleButtonClick('+')}>+</button>

          {/* Row 5 */}
          <button className="calc-key key-num" onClick={() => handleButtonClick('0')}>0</button>
          <button className="calc-key key-num" onClick={() => handleButtonClick('.')}>.</button>
          <button className="calc-key key-back" onClick={() => handleButtonClick('⌫')} title="Backspace">⌫</button>
          <button className="calc-key key-equals" onClick={() => handleButtonClick('=')}>=</button>
        </div>

        {/* Calculation History Reel */}
        {history.length > 0 && (
          <div className="calc-history-drawer">
            <div className="drawer-header">
              <span><i className="fas fa-history"></i> Session Tape</span>
              <button className="clear-history-link" onClick={() => setHistory([])}>Clear</button>
            </div>
            <div className="drawer-items">
              {history.map((item, idx) => (
                <div 
                  key={idx} 
                  className="drawer-item"
                  onClick={() => {
                    const ans = item.split('=')[1]?.trim();
                    if (ans) {
                      setInput(ans);
                      sound(480, 'sine', 0.05);
                    }
                  }}
                  title="Click to load into display"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
