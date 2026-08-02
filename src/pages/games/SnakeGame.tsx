import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import './Games.scss';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];


const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [bonusFood, setBonusFood] = useState<Position | null>(null);
  const [direction, setDirection] = useState<Direction>('UP');
  const [nextDirection, setNextDirection] = useState<Direction>('UP');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [wrapMode, setWrapMode] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('snake_game_highscore')) || 0;
  });
  const [speed, setSpeed] = useState<number>(110);

  // Generate random food position not on snake
  const getRandomFoodPos = (currentSnake: Position[]): Position => {
    let newPos: Position;
    while (true) {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newPos.x && segment.y === newPos.y
      );
      if (!isOnSnake) break;
    }
    return newPos;
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection('UP');
    setNextDirection('UP');
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setFood(getRandomFoodPos(INITIAL_SNAKE));
    setBonusFood(null);
  };

  // Keyboard direction controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setNextDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          break;
        case ' ':
          setIsPaused((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Main game tick
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const moveSnake = () => {
      setDirection(nextDirection);
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };

        switch (nextDirection) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Wall interaction
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE
        ) {
          if (wrapMode) {
            if (head.x < 0) head.x = GRID_SIZE - 1;
            if (head.x >= GRID_SIZE) head.x = 0;
            if (head.y < 0) head.y = GRID_SIZE - 1;
            if (head.y >= GRID_SIZE) head.y = 0;
          } else {
            setIsGameOver(true);
            return prevSnake;
          }
        }

        // Check self collision
        if (
          prevSnake.some(
            (segment) => segment.x === head.x && segment.y === head.y
          )
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check normal food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((prevScore) => {
            const nextScore = prevScore + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('snake_game_highscore', String(nextScore));
            }
            if (nextScore > 0 && nextScore % 50 === 0) {
              setBonusFood(getRandomFoodPos(newSnake));
            }
            return nextScore;
          });
          setFood(getRandomFoodPos(newSnake));
        }
        // Check bonus food collision
        else if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
          setScore((prevScore) => {
            const nextScore = prevScore + 50;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              localStorage.setItem('snake_game_highscore', String(nextScore));
            }
            return nextScore;
          });
          setBonusFood(null);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [nextDirection, food, bonusFood, isGameOver, isPaused, speed, wrapMode, highScore]);

  const handleMobileControl = (dir: Direction) => {
    if (
      (dir === 'UP' && direction !== 'DOWN') ||
      (dir === 'DOWN' && direction !== 'UP') ||
      (dir === 'LEFT' && direction !== 'RIGHT') ||
      (dir === 'RIGHT' && direction !== 'LEFT')
    ) {
      setNextDirection(dir);
    }
  };

  return (
    <Box className="game-container snake-game-container">
      <Typography variant="h4" className="game-title">
        Retro Snake Game
      </Typography>

      <Box className="game-stats-bar">
        <div className="stat-box">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">High:</span>
          <span className="stat-value">{highScore}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Mode:</span>
          <button
            onClick={() => setWrapMode(!wrapMode)}
            className="snake-mode-toggle-btn"
          >
            {wrapMode ? '🌀 Wrap' : '🧱 Walls'}
          </button>
        </div>
        <div className="stat-box">
          <span className="stat-label">Speed:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="snake-speed-select"
          >
            <option value={150}>Easy</option>
            <option value={110}>Medium</option>
            <option value={70}>Fast</option>
          </select>
        </div>
      </Box>

      {/* Snake Canvas Grid */}
      <div className="snake-grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE;
          const y = Math.floor(index / GRID_SIZE);
          const isSnakeHead = snake[0].x === x && snake[0].y === y;
          const isSnakeBody = snake.slice(1).some((s) => s.x === x && s.y === y);
          const isFoodCell = food.x === x && food.y === y;
          const isBonusCell = bonusFood && bonusFood.x === x && bonusFood.y === y;

          return (
            <div
              key={index}
              className={`grid-cell ${
                isSnakeHead
                  ? 'snake-head'
                  : isSnakeBody
                  ? 'snake-body'
                  : isBonusCell
                  ? 'bonus-food-cell'
                  : isFoodCell
                  ? 'food-cell'
                  : ''
              }`}
            />
          );
        })}

        {isGameOver && (
          <div className="game-over-overlay">
            <h2>💥 Game Over!</h2>
            <p>Final Score: {score}</p>
            <Button variant="contained" onClick={resetGame}>
              Play Again
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Touch D-Pad */}
      <div className="mobile-dpad">
        <button className="dpad-btn up" onClick={() => handleMobileControl('UP')}>
          ▲
        </button>
        <div className="dpad-middle">
          <button className="dpad-btn left" onClick={() => handleMobileControl('LEFT')}>
            ◀
          </button>
          <button className="dpad-btn pause" onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? '▶' : '❚❚'}
          </button>
          <button className="dpad-btn right" onClick={() => handleMobileControl('RIGHT')}>
            ▶
          </button>
        </div>
        <button className="dpad-btn down" onClick={() => handleMobileControl('DOWN')}>
          ▼
        </button>
      </div>

      <Button variant="contained" className="reset-button" onClick={resetGame}>
        Restart Game
      </Button>
    </Box>
  );
};

export default SnakeGame;
