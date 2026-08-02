import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Stocks.scss';

const CounterPage: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [history, setHistory] = useState<number[]>([0]);

  const updateCount = (newVal: number) => {
    setCount(newVal);
    setHistory((prev) => [newVal, ...prev.slice(0, 9)]);
  };

  return (
    <div className="stock-container tool-page-container">
      <div className="tool-page-header">
        <h1 className="stock-title">
          <i className="fas fa-calculator"></i> Digital Counter
        </h1>
        <p className="tool-page-subtitle">
          Standalone digital counter utility with custom step increments and history log.
        </p>
      </div>

      <div className="single-tool-wrapper">
        <div className="tool-card large-card">
          <div className="counter-display">{count}</div>

          <div className="counter-step-control">
            <label htmlFor="counter-step-input">Step Increment:</label>
            <input
              id="counter-step-input"
              type="number"
              min="1"
              max="100"
              value={step}
              onChange={(e) => setStep(Math.max(1, Number(e.target.value) || 1))}
              className="step-input"
            />
          </div>

          <div className="tool-buttons">
            <button
              className="tool-btn btn-decrement"
              onClick={() => updateCount(count - step)}
            >
              <i className="fas fa-minus"></i> Subtract {step}
            </button>

            <button
              className="tool-btn btn-increment"
              onClick={() => updateCount(count + step)}
            >
              <i className="fas fa-plus"></i> Add {step}
            </button>
          </div>

          <div className="tool-preset-buttons">
            <span className="preset-label">Quick Presets:</span>
            <button onClick={() => updateCount(count + 5)} className="preset-btn">+5</button>
            <button onClick={() => updateCount(count + 10)} className="preset-btn">+10</button>
            <button onClick={() => updateCount(count + 50)} className="preset-btn">+50</button>
            <button onClick={() => updateCount(count + 100)} className="preset-btn">+100</button>
          </div>

          <div className="tool-buttons secondary-buttons">
            <button
              className="tool-btn btn-reset"
              onClick={() => updateCount(0)}
            >
              <i className="fas fa-redo"></i> Reset Counter to 0
            </button>
          </div>

          {/* History */}
          <div className="laps-container">
            <h3>Recent Counter History</h3>
            <div className="history-chips">
              {history.map((val, idx) => (
                <span key={idx} className="history-chip">
                  {val}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tool-back-link">
        <Link to="/stopwatch" className="stock-back-button">
          <i className="fas fa-stopwatch"></i> Switch to Stopwatch
        </Link>
      </div>
    </div>
  );
};

export default CounterPage;
