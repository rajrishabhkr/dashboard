import './App.scss'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/home/Home';
import Info from './pages/home/Info';
import Students from './pages/school/Students';
import Teachers from './pages/school/Teachers';
import Attendance from './pages/school/Attendance';
import TicTacToe from './pages/games/TicTacToe';
import Cube3D from './pages/games/Cube3D';
import RubiksCube from './pages/games/RubiksCube';
import MemoryMatch from './pages/games/MemoryMatch';
import ColorRush from './pages/games/ColorRush';
import SnakeGame from './pages/games/SnakeGame';
import Game2048 from './pages/games/Game2048';
import BrickBreaker from './pages/games/BrickBreaker';
import IPOList from './pages/stocks/IPOList';
import IPODetail from './pages/stocks/IPODetail';
import Calculator from './pages/stocks/Calculator';
import CounterPage from './pages/stocks/CounterPage';
import StopwatchPage from './pages/stocks/StopwatchPage';
import PasswordGenerator from './pages/tools/PasswordGenerator';
import DatabasePage from './pages/database/DatabasePage';

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="info" element={<Info />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="tictactoe" element={<TicTacToe />} />
          <Route path="3dcube" element={<Cube3D />} />
          <Route path="rubiks-cube" element={<RubiksCube />} />
          <Route path="snake" element={<SnakeGame />} />
          <Route path="memory-match" element={<MemoryMatch />} />
          <Route path="color-rush" element={<ColorRush />} />
          <Route path="2048" element={<Game2048 />} />
          <Route path="brick-breaker" element={<BrickBreaker />} />
          <Route path="ipolist" element={<IPOList />} />
          <Route path="ipolist/details/:id" element={<IPODetail />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="counter" element={<CounterPage />} />
          <Route path="stopwatch" element={<StopwatchPage />} />
          <Route path="password-generator" element={<PasswordGenerator />} />
          <Route path="database" element={<DatabasePage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
