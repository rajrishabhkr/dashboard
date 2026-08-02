import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import './Games.scss';

const COLORS = [
  { id: 'red', color: '#ff4757', lightColor: '#ff6b81', label: '🔴 Red' },
  { id: 'green', color: '#2ed573', lightColor: '#7bed9f', label: '🟢 Green' },
  { id: 'blue', color: '#1e90ff', lightColor: '#70a1ff', label: '🔵 Blue' },
  { id: 'yellow', color: '#ffa502', lightColor: '#eccc68', label: '🟡 Yellow' },
];

const ColorRush: React.FC = () => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('color_rush_highscore')) || 0;
  });
  const [speedMs, setSpeedMs] = useState<number>(650);
  const [message, setMessage] = useState<string>('Press Start to play!');

  // Start new game
  const startGame = () => {
    setSequence([]);
    setUserSequence([]);
    setScore(0);
    setCombo(1);
    setIsPlaying(true);
    setMessage('Watch the pattern carefully...');
    addNewColor([]);
  };

  // Add next color step to sequence
  const addNewColor = (currentSequence: string[]) => {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)].id;
    const nextSeq = [...currentSequence, randomColor];
    setSequence(nextSeq);
    setUserSequence([]);
    playSequence(nextSeq);
  };

  // Play pattern sequence
  const playSequence = (seq: string[]) => {
    setIsPlaying(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < seq.length) {
        flashColor(seq[i]);
        i++;
      } else {
        clearInterval(interval);
        setIsPlaying(true);
        setMessage('Your turn! Repeat the pattern.');
      }
    }, speedMs);
  };

  const flashColor = (colorId: string) => {
    setActiveColor(colorId);
    setTimeout(() => {
      setActiveColor(null);
    }, Math.max(200, speedMs - 200));
  };

  const handleColorClick = (colorId: string) => {
    if (!isPlaying) return;

    flashColor(colorId);
    const nextUserSeq = [...userSequence, colorId];
    setUserSequence(nextUserSeq);

    const currentIndex = nextUserSeq.length - 1;

    if (nextUserSeq[currentIndex] !== sequence[currentIndex]) {
      // Game Over
      setMessage(`💥 Game Over! Final Score: ${score}`);
      setIsPlaying(false);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('color_rush_highscore', String(score));
      }
      return;
    }

    if (nextUserSeq.length === sequence.length) {
      const nextCombo = combo + 1;
      const pointsGained = 10 * combo;
      const nextScore = score + pointsGained;
      setScore(nextScore);
      setCombo(nextCombo);

      if (nextScore > highScore) {
        setHighScore(nextScore);
        localStorage.setItem('color_rush_highscore', String(nextScore));
      }

      setMessage(`🔥 Perfect! Round ${sequence.length + 1} (+${pointsGained} pts)`);
      setTimeout(() => {
        addNewColor(sequence);
      }, 900);
    }
  };

  return (
    <Box className="game-container color-rush-container">
      <Typography variant="h4" className="game-title">
        Color Rush (Pattern Memory)
      </Typography>

      <Box className="game-stats-bar">
        <div className="stat-box">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Streak:</span>
          <span className="stat-value">{combo}x</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">High:</span>
          <span className="stat-value">{highScore}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Pace:</span>
          <select
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            className="snake-speed-select"
          >
            <option value={800}>Slow</option>
            <option value={650}>Medium</option>
            <option value={450}>Fast</option>
          </select>
        </div>
      </Box>

      <Typography variant="h6" className="game-status-msg">
        {message}
      </Typography>

      <div className="color-grid">
        {COLORS.map((item) => (
          <button
            key={item.id}
            className={`color-pad ${item.id} ${
              activeColor === item.id ? 'active' : ''
            }`}
            style={{
              backgroundColor: activeColor === item.id ? item.lightColor : item.color,
            }}
            onClick={() => handleColorClick(item.id)}
            disabled={!isPlaying}
          />
        ))}
      </div>

      <Button
        variant="contained"
        className="reset-button"
        onClick={startGame}
      >
        {sequence.length > 0 ? 'Restart Game' : 'Start Game'}
      </Button>
    </Box>
  );
};

export default ColorRush;
