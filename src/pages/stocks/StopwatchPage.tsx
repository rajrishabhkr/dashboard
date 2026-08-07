import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Stocks.scss';
import { useToast } from '../../components/layout/ToastContext';

interface Lap {
  id: number;
  time: number;
  formatted: string;
}

const StopwatchPage: React.FC = () => {
  const { showToast } = useToast();
  const [time, setTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<Lap[]>([]);

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

  const formatTime = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleLap = () => {
    if (time > 0) {
      const formattedTime = formatTime(time);
      setLaps((prev) => [
        {
          id: prev.length + 1,
          time,
          formatted: formattedTime,
        },
        ...prev,
      ]);
      showToast(`Lap ${laps.length + 1} recorded: ${formattedTime}`, 'success');
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    showToast('Stopwatch reset', 'info');
  };

  return (
    <div className="stock-container tool-page-container">
      <div className="tool-page-header">
        <h1 className="stock-title">
          <i className="fas fa-stopwatch"></i> Precision Stopwatch
        </h1>
        <p className="tool-page-subtitle">
          High-accuracy timing utility with lap recording and statistics.
        </p>
      </div>

      <div className="single-tool-wrapper">
        <div className="tool-card large-card">
          <div className={`stopwatch-display ${isRunning ? 'active' : ''}`}>
            {formatTime(time)}
          </div>

          <div className="tool-buttons">
            {!isRunning ? (
              <button
                className="tool-btn btn-start"
                onClick={() => setIsRunning(true)}
              >
                <i className="fas fa-play"></i> Start Timer
              </button>
            ) : (
              <button
                className="tool-btn btn-pause"
                onClick={() => setIsRunning(false)}
              >
                <i className="fas fa-pause"></i> Pause Timer
              </button>
            )}

            <button
              className="tool-btn btn-lap"
              onClick={handleLap}
              disabled={!isRunning && time === 0}
            >
              <i className="fas fa-flag"></i> Record Lap
            </button>

            <button
              className="tool-btn btn-reset"
              onClick={handleReset}
            >
              <i className="fas fa-redo"></i> Reset
            </button>
          </div>

          {laps.length > 0 && (
            <div className="laps-container">
              <h3>Recorded Laps ({laps.length})</h3>
              <ul className="laps-list">
                {laps.map((lap) => (
                  <li key={lap.id} className="lap-item">
                    <span className="lap-number">Lap #{lap.id}</span>
                    <span className="lap-time">{lap.formatted}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="tool-back-link">
        <Link to="/counter" className="stock-back-button">
          <i className="fas fa-calculator"></i> Switch to Digital Counter
        </Link>
      </div>
    </div>
  );
};

export default StopwatchPage;
