import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ReactConfetti from 'react-confetti';
import './Games.scss';

interface CardItem {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_ICONS = ['🚀', '🎮', '🌟', '🎨', '🍕', '🐱', '🍩', '🏆', '💎', '🔥', '⚡', '🌈'];

const MemoryMatch: React.FC = () => {
  const [difficulty, setDifficulty] = useState<number>(8); // 4 pairs (8 cards), 8 pairs (16), 12 pairs (24)
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [bestScore, setBestScore] = useState<number>(() => {
    return Number(localStorage.getItem('memory_match_best')) || 0;
  });

  const pairCount = difficulty / 2;

  // Initialize deck
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
  };

  useEffect(() => {
    initializeGame(difficulty);
  }, [difficulty]);

  // Timer logic
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

  const handleCardClick = (index: number) => {
    if (!isActive) setIsActive(true);
    if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIndex, secondIndex] = newFlipped;

      if (cards[firstIndex].icon === cards[secondIndex].icon) {
        // Match found
        setTimeout(() => {
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
              setIsWon(true);
              setIsActive(false);
              const score = Math.max(10, 500 - moves * 10 - timer * 2);
              if (score > bestScore) {
                setBestScore(score);
                localStorage.setItem('memory_match_best', String(score));
              }
            }
            return nextMatches;
          });
        }, 350);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === firstIndex || i === secondIndex
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  const getStars = () => {
    if (moves <= pairCount + 2) return '⭐⭐⭐';
    if (moves <= pairCount + 6) return '⭐⭐';
    return '⭐';
  };

  return (
    <Box className="game-container memory-game-container">
      {isWon && <ReactConfetti style={{ position: 'fixed' }} />}

      <Typography variant="h4" className="game-title">
        Memory Card Match
      </Typography>

      <Box className="game-stats-bar">
        <div className="stat-box">
          <span className="stat-label">Diff:</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="snake-speed-select"
          >
            <option value={8}>Easy (8)</option>
            <option value={16}>Normal (16)</option>
            <option value={24}>Hard (24)</option>
          </select>
        </div>
        <div className="stat-box">
          <span className="stat-label">Pairs:</span>
          <span className="stat-value">{matches}/{pairCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Moves:</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Time:</span>
          <span className="stat-value">{timer}s</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Best:</span>
          <span className="stat-value">{bestScore}</span>
        </div>
      </Box>

      {isWon && (
        <Box className="victory-message">
          🎉 Victory! {getStars()} Score: {Math.max(10, 500 - moves * 10 - timer * 2)} pts ({moves} moves in {timer}s)
        </Box>
      )}

      <Box className={`memory-board grid-cards-${difficulty}`}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`memory-card ${card.isFlipped ? 'flipped' : ''} ${
              card.isMatched ? 'matched' : ''
            }`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">?</div>
              <div className="card-back">{card.icon}</div>
            </div>
          </div>
        ))}
      </Box>

      <Button
        variant="contained"
        className="reset-button"
        onClick={() => initializeGame(difficulty)}
      >
        Restart Game
      </Button>
    </Box>
  );
};

export default MemoryMatch;
