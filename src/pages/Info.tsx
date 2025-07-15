import React, { useState, useEffect } from 'react';
import './Info.scss';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const Info: React.FC = () => {
  const [count, setCount] = useState(0);
  const [activeTab, setActiveTab] = useState('daily');

  // Task data
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Design Dashboard', completed: true },
    { id: 2, name: 'React Js', completed: true },
    { id: 3, name: 'Implement API', completed: false },
    { id: 4, name: 'Write Tests', completed: false },
    { id: 5, name: 'Deploy to Production', completed: false },
  ]);

  // Chart data
  const productivityData = [
    { name: 'Mon', value: 75 },
    { name: 'Tue', value: 90 },
    { name: 'Wed', value: 60 },
    { name: 'Thu', value: 85 },
    { name: 'Fri', value: 70 },
    { name: 'Sat', value: 50 },
    { name: 'Sun', value: 30 },
  ];

  const pieData = [
    { name: 'Completed', value: tasks.filter(t => t.completed).length },
    { name: 'Pending', value: tasks.filter(t => !t.completed).length },
  ];

  const COLORS = ['#2ed573', '#ff4757'];

  // Stopwatch Logic
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: number | null = null;

    if (isRunning) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (interval !== null) {
      window.clearInterval(interval);
    }

    return () => {
      if (interval !== null) window.clearInterval(interval);
    };
  }, [isRunning]);

  const startStopwatch = () => {
    setIsRunning(true);
  };

  const stopStopwatch = () => {
    setIsRunning(false);
  };

  const resetStopwatch = () => {
    setTime(0);
    setIsRunning(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="info-container">
      <div className="info-header">
        <h1>Info Dashboard</h1>
        <Link to="/" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>
      </div>

      {/* Progress Tracker Section */}
      <div className="progress-section">
        <h2>Task Progress</h2>
        
        <div className="progress-grid">
          <div className="task-list">
            <h3>My Tasks</h3>
            <ul>
              {tasks.map(task => (
                <li key={task.id} className={task.completed ? 'completed' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span>{task.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="charts-container">
            <div className="chart-tabs">
              <button 
                className={activeTab === 'daily' ? 'active' : ''}
                onClick={() => setActiveTab('daily')}
              >
                Daily Progress
              </button>
              <button 
                className={activeTab === 'overview' ? 'active' : ''}
                onClick={() => setActiveTab('overview')}
              >
                Task Overview
              </button>
            </div>

            <div className="chart-wrapper">
              {activeTab === 'daily' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productivityData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name }) => `${name}: ${(100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Counter Section */}
      <div className="counter-section">
        <h2>Counter</h2>
        <div className="counter-controls">
          <button
            className="counter-button"
            onClick={() => setCount((prev) => prev + 1)}
            aria-label="Increase counter"
          >
            Count is {count}
          </button>
          <button
            className="reset-button"
            onClick={() => setCount(0)}
            aria-label="Reset counter"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Stopwatch Section */}
      <div className="stopwatch-section">
        <h2>Stopwatch</h2>
        <div className="stopwatch-display">{formatTime(time)}</div>
        <div className="stopwatch-controls">
          <button onClick={startStopwatch} disabled={isRunning}>
            Start
          </button>
          <button onClick={stopStopwatch} disabled={!isRunning}>
            Stop
          </button>
          <button onClick={resetStopwatch}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default Info;