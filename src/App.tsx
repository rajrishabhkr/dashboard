import './App.scss'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home';
import Info from './pages/Info';
import Students from './pages/schoolInfo/Students';
import Teachers from './pages/schoolInfo/Teachers';
import Attendance from './pages/schoolInfo/Attendance';
import TicTacToe from './pages/games/TicTacToe';
import Cube3D from './pages/games/Cube3D';
import IPOList from './pages/stocks/IPOList';
import IPODetail from './pages/stocks/IPODetail';
import Calculator from './pages/stocks/Calculator';

const App = () => {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="info" element={<Info />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="tictactoe" element={<TicTacToe />} />
            <Route path="3dcube" element={<Cube3D />} />
            <Route path="ipolist" element={<IPOList />} />
            <Route path="/ipolist/details/:id" element={<IPODetail />} />
            <Route path="calculator" element={<Calculator />} />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App