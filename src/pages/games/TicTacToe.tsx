import React, { useState, useEffect } from 'react';
import { Button, Typography, Grid, Box } from '@mui/material';
import ReactConfetti from 'react-confetti';
import './Games.scss';

const TicTacToe: React.FC = () => {
  const [squares, setSquares] = useState<Array<string | null>>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [celebrate, setCelebrate] = useState(false);
  const [winningLine, setWinningLine] = useState<number[]>([]);

  const handleClick = (i: number) => {
    if (squares[i] || calculateWinner(squares)) return;
    const newSquares = squares.slice();
    newSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(newSquares);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setCelebrate(false);
    setWinningLine([]);
  };

  const winner = calculateWinner(squares);
  const status = winner
    ? `Winner: ${winner}`
    : squares.every((square) => square)
    ? 'Draw!'
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  useEffect(() => {
    if (winner) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 5000);
    }
  }, [winner]);

  useEffect(() => {
    if (celebrate) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [celebrate]);

  const isWinningSquare = (index: number) => winningLine.includes(index);

  return (
    <Box className="tic-tac-toe-container">
      {celebrate && <ReactConfetti style={{ position: 'fixed' }} />}

      <Typography variant="h4" className="game-title">
        Tic Tac Toe
      </Typography>
      <Typography variant="h6" className="game-status">
        {status}
      </Typography>

      <Grid container className="game-board">
        {squares.map((value, index) => (
          <Grid item key={index} className="grid-item">
            <Button
              className={`square-button ${value || winner ? 'disabled' : ''} ${
                isWinningSquare(index) ? 'winning-square' : ''
              }`}
              onClick={() => handleClick(index)}
              disabled={!!value || !!winner}
            >
              {value}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        className="reset-button"
        onClick={resetGame}
      >
        Reset Game
      </Button>
    </Box>
  );
};

const calculateWinner = (squares: Array<string | null>): string | null => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

export default TicTacToe;