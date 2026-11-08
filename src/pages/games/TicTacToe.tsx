import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import {
  SmartToy,
  People,
  Refresh,
  Undo,
  VolumeUp,
  VolumeOff,
  EmojiEvents,
  Settings,
  Psychology,
} from '@mui/icons-material';
import ReactConfetti from 'react-confetti';
import { useToast } from '../../components/layout/ToastContext';
import { db } from '../../services/db';
import './Games.scss';

// ==========================================
// Web Audio API Sound Effects
// ==========================================
class SoundPlayer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMove(symbol: string) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const freq = symbol === 'X' ? 480 : 340;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch { /* ignore audio failure */ }
  }

  playWin() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const start = this.ctx!.currentTime + idx * 0.09;
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(start);
        osc.stop(start + 0.28);
      });
    } catch { /* ignore */ }
  }

  playDraw() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch { /* ignore */ }
  }
}

const sounds = new SoundPlayer(true);

// ==========================================
// Win & AI Logic
// ==========================================
type Board = Array<string | null>;

const calculateWinner = (squares: Board): { winner: string; line: number[] } | null => {
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
      return { winner: squares[a] as string, line: [a, b, c] };
    }
  }
  return null;
};

const getAvailableMoves = (board: Board): number[] => {
  const moves: number[] = [];
  board.forEach((val, idx) => {
    if (val === null) moves.push(idx);
  });
  return moves;
};

// Minimax AI (Unbeatable)
const getMinimaxMove = (board: Board, aiSymbol: string, humanSymbol: string): number => {
  const available = getAvailableMoves(board);
  if (available.length === 9) return 4; // center is mathematically best opening
  if (available.length === 8 && board[4] === null) return 4;

  const minimax = (currentBoard: Board, depth: number, isMaximizing: boolean): number => {
    const win = calculateWinner(currentBoard);
    if (win) {
      return win.winner === aiSymbol ? 10 - depth : depth - 10;
    }
    if (currentBoard.every(s => s !== null)) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = aiSymbol;
          const evaluation = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = null;
          maxEval = Math.max(maxEval, evaluation);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = humanSymbol;
          const evaluation = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = null;
          minEval = Math.min(minEval, evaluation);
        }
      }
      return minEval;
    }
  };

  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const move of available) {
    board[move] = aiSymbol;
    const score = minimax(board, 0, false);
    board[move] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
};

// Medium AI: Blocks wins & takes wins, 40% random
const getMediumMove = (board: Board, aiSymbol: string, humanSymbol: string): number => {
  const available = getAvailableMoves(board);

  // 1. Can AI win on this turn?
  for (const move of available) {
    board[move] = aiSymbol;
    if (calculateWinner(board)?.winner === aiSymbol) {
      board[move] = null;
      return move;
    }
    board[move] = null;
  }

  // 2. Can Human win on next turn? Block!
  for (const move of available) {
    board[move] = humanSymbol;
    if (calculateWinner(board)?.winner === humanSymbol) {
      board[move] = null;
      return move;
    }
    board[move] = null;
  }

  // 3. Take center if open
  if (board[4] === null && Math.random() > 0.3) return 4;

  // 4. Otherwise random
  return available[Math.floor(Math.random() * available.length)];
};

// Easy AI: Pure random
const getEasyMove = (board: Board): number => {
  const available = getAvailableMoves(board);
  return available[Math.floor(Math.random() * available.length)];
};

type GameMode = 'ai' | 'pvp';
type Difficulty = 'easy' | 'medium' | 'hard';

const TicTacToe: React.FC = () => {
  const { showToast } = useToast();

  // Mode & Config State
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O'>('X');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Custom player names for 2P mode
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Board & Gameplay State
  const [squares, setSquares] = useState<Board>(Array(9).fill(null));
  const [history, setHistory] = useState<Board[]>([Array(9).fill(null)]);
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [winningLine, setWinningLine] = useState<number[]>([]);

  // Scores
  const [scores, setScores] = useState({
    p1Wins: 0,
    p2Wins: 0,
    ties: 0,
    streak: 0,
  });

  const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
  const winInfo = calculateWinner(squares);
  const winner = winInfo?.winner || null;
  const isDraw = !winner && squares.every((s) => s !== null);

  // Update sound settings
  useEffect(() => {
    sounds.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Load past stats from DB on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await db.gameScores.getStats('tictactoe');
        setScores(prev => ({
          ...prev,
          p1Wins: stats.wins,
          p2Wins: stats.losses,
          ties: stats.ties,
        }));
      } catch (e) {
        console.warn('Could not load game stats:', e);
      }
    };
    loadStats();
  }, []);

  // Handle Confetti
  useEffect(() => {
    if (winner) {
      sounds.playWin();
      setCelebrate(true);
      const timer = setTimeout(() => setCelebrate(false), 4500);
      return () => clearTimeout(timer);
    } else if (isDraw) {
      sounds.playDraw();
    }
  }, [winner, isDraw]);

  // Reset Board (new round)
  const resetRound = useCallback(() => {
    const empty = Array(9).fill(null);
    setSquares(empty);
    setHistory([empty]);
    setXIsNext(true);
    setCelebrate(false);
    setWinningLine([]);
    setIsAiThinking(false);
  }, []);

  // Change Game Mode
  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    resetRound();
    showToast(newMode === 'ai' ? '🤖 1 Player vs Computer activated!' : '👥 2 Player Pass & Play activated!', 'info');
  };

  // Turn Handling for Human Click
  const handleClick = (index: number) => {
    if (squares[index] || winner || isAiThinking) return;

    // In AI mode, verify it's the human's turn
    if (mode === 'ai') {
      const isHumanTurn = (playerSymbol === 'X' && xIsNext) || (playerSymbol === 'O' && !xIsNext);
      if (!isHumanTurn) return;
    }

    const currentMark = xIsNext ? 'X' : 'O';
    sounds.playMove(currentMark);

    const nextSquares = [...squares];
    nextSquares[index] = currentMark;
    setSquares(nextSquares);
    setHistory(prev => [...prev, nextSquares]);

    const result = calculateWinner(nextSquares);
    if (result) {
      setWinningLine(result.line);
      handleGameEnd(result.winner);
    } else if (nextSquares.every(s => s !== null)) {
      handleGameEnd('draw');
    } else {
      setXIsNext(!xIsNext);
    }
  };

  // AI Turn Trigger
  useEffect(() => {
    if (mode !== 'ai' || winner || isDraw) return;

    const isAiTurn = (aiSymbol === 'X' && xIsNext) || (aiSymbol === 'O' && !xIsNext);
    if (!isAiTurn) return;

    setIsAiThinking(true);
    const aiTimer = setTimeout(() => {
      let aiIndex = -1;
      if (difficulty === 'easy') {
        aiIndex = getEasyMove(squares);
      } else if (difficulty === 'medium') {
        aiIndex = getMediumMove(squares, aiSymbol, playerSymbol);
      } else {
        aiIndex = getMinimaxMove(squares, aiSymbol, playerSymbol);
      }

      if (aiIndex !== -1 && squares[aiIndex] === null) {
        sounds.playMove(aiSymbol);
        const nextSquares = [...squares];
        nextSquares[aiIndex] = aiSymbol;
        setSquares(nextSquares);
        setHistory(prev => [...prev, nextSquares]);

        const result = calculateWinner(nextSquares);
        if (result) {
          setWinningLine(result.line);
          handleGameEnd(result.winner);
        } else if (nextSquares.every(s => s !== null)) {
          handleGameEnd('draw');
        } else {
          setXIsNext(!xIsNext);
        }
      }
      setIsAiThinking(false);
    }, 400);

    return () => clearTimeout(aiTimer);
  }, [xIsNext, mode, squares, winner, isDraw, aiSymbol, playerSymbol, difficulty]);

  // Handle Game End & Record to DB
  const handleGameEnd = (outcome: string) => {
    if (outcome === 'draw') {
      setScores(prev => ({ ...prev, ties: prev.ties + 1, streak: 0 }));
      db.gameScores.recordGame('tictactoe', 0);
      showToast('🤝 It is a Draw!', 'info');
    } else if (outcome === playerSymbol) {
      const winnerName = mode === 'ai' ? 'You' : player1Name;
      setScores(prev => ({
        ...prev,
        p1Wins: prev.p1Wins + 1,
        streak: prev.streak + 1,
      }));
      db.gameScores.recordGame('tictactoe', 1);
      showToast(`🎉 ${winnerName} won the match!`, 'success');
    } else {
      const winnerName = mode === 'ai' ? 'Computer' : player2Name;
      setScores(prev => ({
        ...prev,
        p2Wins: prev.p2Wins + 1,
        streak: 0,
      }));
      db.gameScores.recordGame('tictactoe', -1);
      showToast(mode === 'ai' ? '🤖 Computer won this round!' : `🎉 ${winnerName} won!`, mode === 'ai' ? 'warning' : 'success');
    }
  };

  // Undo Move
  const handleUndo = () => {
    if (history.length <= 1 || winner || isAiThinking) return;

    if (mode === 'ai') {
      // In AI mode, rollback 2 states (both AI move and human move)
      const targetIndex = Math.max(0, history.length - 3);
      const newHistory = history.slice(0, targetIndex + 1);
      const targetBoard = newHistory[newHistory.length - 1];
      setSquares(targetBoard);
      setHistory(newHistory);
      // Turn returns to human
      setXIsNext(playerSymbol === 'X');
      setWinningLine([]);
      setCelebrate(false);
      showToast('Undid last turn ↩️', 'info');
    } else {
      // In 2P mode, rollback 1 state
      const newHistory = history.slice(0, history.length - 1);
      const targetBoard = newHistory[newHistory.length - 1];
      setSquares(targetBoard);
      setHistory(newHistory);
      setXIsNext(!xIsNext);
      setWinningLine([]);
      setCelebrate(false);
      showToast('Undid 1 move ↩️', 'info');
    }
  };

  // Reset Scores
  const handleResetScores = () => {
    if (window.confirm('Reset all scoreboard records and game history?')) {
      setScores({ p1Wins: 0, p2Wins: 0, ties: 0, streak: 0 });
      db.gameScores.clearHistory('tictactoe');
      showToast('Scoreboard reset to zero', 'info');
    }
  };

  const isWinningSquare = (index: number) => winningLine.includes(index);

  // Status banner
  const getStatusText = () => {
    if (winner) {
      if (mode === 'ai') {
        return winner === playerSymbol ? '🏆 Victory! You Won!' : '🤖 Computer Won!';
      }
      return `🏆 ${winner === 'X' ? player1Name : player2Name} Wins!`;
    }
    if (isDraw) return '🤝 Stalemate! It is a Draw!';
    if (isAiThinking) return '🤖 Computer is thinking...';

    if (mode === 'ai') {
      const isHuman = (playerSymbol === 'X' && xIsNext) || (playerSymbol === 'O' && !xIsNext);
      return isHuman ? `Your Turn (${playerSymbol})` : `Computer Turn (${aiSymbol})`;
    }
    return `${xIsNext ? player1Name : player2Name}'s Turn (${xIsNext ? 'X' : 'O'})`;
  };

  return (
    <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-center font-sans">
      {celebrate && (
        <ReactConfetti
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}
          numberOfPieces={280}
          recycle={false}
        />
      )}

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-lg bg-gray-900/90 backdrop-blur-xl border border-gray-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all">
        {/* Glow Accent Header */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <span className="text-xl font-black">X</span>
            </div>
            <div>
              <Typography variant="h5" className="font-extrabold tracking-tight text-white flex items-center gap-2">
                Tic Tac Toe
              </Typography>
              <span className="text-xs text-gray-400 font-medium">Smart AI &amp; 2-Player Pass-and-Play</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}>
              <IconButton
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-gray-300 hover:text-white"
                size="small"
              >
                {soundEnabled ? <VolumeUp fontSize="small" /> : <VolumeOff fontSize="small" className="text-red-400" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Match Settings">
              <IconButton
                onClick={() => setSettingsOpen(true)}
                className="text-gray-300 hover:text-white"
                size="small"
              >
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800/80 rounded-2xl mb-5 border border-gray-700/50">
          <button
            onClick={() => handleModeChange('ai')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all ${
              mode === 'ai'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/40'
            }`}
          >
            <SmartToy fontSize="small" />
            <span>1 Player (vs AI)</span>
          </button>

          <button
            onClick={() => handleModeChange('pvp')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all ${
              mode === 'pvp'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/25'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/40'
            }`}
          >
            <People fontSize="small" />
            <span>2 Players (Local)</span>
          </button>
        </div>

        {/* AI Difficulty Bar (only in 1P mode) */}
        {mode === 'ai' && (
          <div className="flex items-center justify-between bg-gray-800/40 border border-gray-700/30 rounded-xl px-3 py-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
              <Psychology fontSize="small" className="text-cyan-400" />
              <span>AI Brain:</span>
            </div>
            <div className="flex gap-1.5">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setDifficulty(level);
                    resetRound();
                    showToast(`AI difficulty set to: ${level.toUpperCase()}`, 'info');
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                    difficulty === level
                      ? level === 'hard'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/50 shadow-sm'
                        : level === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {level === 'hard' ? 'Unbeatable 🧠' : level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scoreboard Bar */}
        <div className="grid grid-cols-3 gap-2 text-center mb-5">
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              {mode === 'ai' ? 'You (X)' : `${player1Name} (X)`}
            </span>
            <div className="text-2xl font-black text-white mt-0.5">{scores.p1Wins}</div>
          </div>

          <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Ties</span>
            <div className="text-2xl font-black text-white mt-0.5">{scores.ties}</div>
          </div>

          <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
              {mode === 'ai' ? 'Computer (O)' : `${player2Name} (O)`}
            </span>
            <div className="text-2xl font-black text-white mt-0.5">{scores.p2Wins}</div>
          </div>
        </div>

        {/* Win Streak Indicator */}
        {scores.streak > 1 && (
          <div className="mb-4 text-center">
            <Chip
              icon={<EmojiEvents className="text-amber-300" />}
              label={`🔥 ${scores.streak} Match Win Streak!`}
              className="bg-amber-500/20 text-amber-200 border border-amber-500/40 font-bold"
              size="small"
            />
          </div>
        )}

        {/* Active Turn Status Banner */}
        <div className={`py-2 px-4 rounded-xl text-center font-bold text-sm mb-5 transition-all duration-300 flex items-center justify-center gap-2 ${
          winner
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : isDraw
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : isAiThinking
            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse'
            : 'bg-gray-800/50 text-gray-200 border border-gray-700/40'
        }`}>
          <span>{getStatusText()}</span>
        </div>

        {/* 3x3 Game Board Grid */}
        <div className="grid grid-cols-3 gap-3 aspect-square max-w-[340px] mx-auto mb-6">
          {squares.map((value, idx) => {
            const isWinnerCell = isWinningSquare(idx);
            return (
              <button
                key={idx}
                onClick={() => handleClick(idx)}
                disabled={Boolean(value || winner || isAiThinking)}
                className={`relative flex items-center justify-center rounded-2xl text-4xl sm:text-5xl font-black transition-all duration-200 select-none shadow-md ${
                  value === null && !winner && !isAiThinking
                    ? 'bg-gray-800/70 hover:bg-gray-700/80 active:scale-95 border border-gray-700/60 cursor-pointer hover:border-gray-500'
                    : 'bg-gray-800/90 border border-gray-700/80 cursor-default'
                } ${
                  isWinnerCell
                    ? 'bg-gradient-to-br from-amber-500/30 to-yellow-500/20 border-2 border-yellow-400 ring-4 ring-yellow-400/30 shadow-[0_0_25px_rgba(250,204,21,0.5)] animate-pulse'
                    : ''
                }`}
              >
                {value === 'X' && (
                  <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)] animate-scaleIn">
                    X
                  </span>
                )}
                {value === 'O' && (
                  <span className="text-pink-400 drop-shadow-[0_0_12px_rgba(244,114,182,0.7)] animate-scaleIn">
                    O
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="contained"
            onClick={resetRound}
            startIcon={<Refresh />}
            className="flex-1 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-cyan-500/20 text-white capitalize text-sm"
          >
            {winner || isDraw ? 'Play Again' : 'Restart Board'}
          </Button>

          <Tooltip title="Undo last move">
            <span>
              <Button
                variant="outlined"
                onClick={handleUndo}
                disabled={history.length <= 1 || Boolean(winner) || isAiThinking}
                className="py-2.5 rounded-xl font-bold border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800/60 capitalize text-sm"
              >
                <Undo fontSize="small" />
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="Clear match statistics">
            <IconButton
              onClick={handleResetScores}
              className="text-gray-400 hover:text-red-400 border border-gray-700/60 rounded-xl"
              size="small"
            >
              <EmojiEvents fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Settings Modal Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        PaperProps={{
          className: 'bg-gray-900 border border-gray-700 text-white rounded-3xl p-2 max-w-sm w-full',
        }}
      >
        <DialogTitle className="text-white font-extrabold flex items-center justify-between">
          <span>Game Options</span>
          <Chip label="Settings" size="small" className="bg-gray-800 text-gray-300" />
        </DialogTitle>
        <DialogContent className="space-y-4">
          {mode === 'ai' ? (
            <div>
              <Typography variant="body2" className="text-gray-400 font-semibold mb-2">
                Choose Your Symbol (in vs AI)
              </Typography>
              <RadioGroup
                row
                value={playerSymbol}
                onChange={(e) => {
                  setPlayerSymbol(e.target.value as 'X' | 'O');
                  resetRound();
                }}
              >
                <FormControlLabel
                  value="X"
                  control={<Radio sx={{ color: '#38bdf8', '&.Mui-checked': { color: '#38bdf8' } }} />}
                  label="Play as X (Go First)"
                  className="text-gray-200"
                />
                <FormControlLabel
                  value="O"
                  control={<Radio sx={{ color: '#f472b6', '&.Mui-checked': { color: '#f472b6' } }} />}
                  label="Play as O (Computer Goes First)"
                  className="text-gray-200"
                />
              </RadioGroup>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Typography variant="body2" className="text-gray-400 font-semibold mb-1">
                  Player 1 Name (X)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value || 'Player 1')}
                  sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { borderColor: '#4b5563' } }}
                />
              </div>
              <div>
                <Typography variant="body2" className="text-gray-400 font-semibold mb-1">
                  Player 2 Name (O)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value || 'Player 2')}
                  sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { borderColor: '#4b5563' } }}
                />
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-800">
            <Typography variant="body2" className="text-gray-400 font-semibold mb-1">
              Audio Feedback
            </Typography>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Synthesized Web Audio FX</span>
              <Button
                size="small"
                variant={soundEnabled ? 'contained' : 'outlined'}
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? 'bg-cyan-600' : 'border-gray-600 text-gray-400'}
              >
                {soundEnabled ? 'Enabled' : 'Muted'}
              </Button>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} className="text-cyan-400 font-bold">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TicTacToe;
