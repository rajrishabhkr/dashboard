import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import './Info.scss';
import { useToast } from '../../components/layout/ToastContext';

interface TaskItem {
  id: number;
  name: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'normal';
}

const Info: React.FC = () => {
  const { showToast } = useToast();
  const [activeChartTab, setActiveChartTab] = useState<'weekly' | 'distribution'>('weekly');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'normal'>('medium');

  // Initial tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 1, name: 'Design High-Performance Dashboard UI', completed: true, priority: 'high' },
    { id: 2, name: 'Setup Supabase Cloud PostgreSQL Sync', completed: true, priority: 'high' },
    { id: 3, name: 'Implement Dexie IndexedDB Local Storage', completed: true, priority: 'medium' },
    { id: 4, name: 'Revamp Retro Mini Games Suite & Sound FX', completed: true, priority: 'medium' },
    { id: 5, name: 'Optimize Full Mobile Responsiveness (320px+)', completed: false, priority: 'high' },
    { id: 6, name: 'Build & Deploy APK for Android Ecosystem', completed: false, priority: 'normal' },
    { id: 7, name: 'Automated CI/CD Pipeline & GitHub Pages Host', completed: true, priority: 'normal' },
  ]);

  // Productivity data by day of the week
  const weeklyVelocityData = [
    { day: 'Mon', completed: 8, points: 85 },
    { day: 'Tue', completed: 12, points: 95 },
    { day: 'Wed', completed: 6, points: 65 },
    { day: 'Thu', completed: 14, points: 100 },
    { day: 'Fri', completed: 10, points: 88 },
    { day: 'Sat', completed: 5, points: 55 },
    { day: 'Sun', completed: 4, points: 40 },
  ];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const distributionData = [
    { name: 'Completed Tasks', value: completedTasks, color: '#22c55e' },
    { name: 'Pending Tasks', value: pendingTasks, color: '#f59e0b' },
  ];

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const nextVal = !task.completed;
          showToast(
            `Task "${task.name}" marked as ${nextVal ? 'Completed ✅' : 'Pending ⏳'}`,
            'info'
          );
          return { ...task, completed: nextVal };
        }
        return task;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      showToast('Please enter a valid task description', 'warning');
      return;
    }

    const newTask: TaskItem = {
      id: Date.now(),
      name: newTaskName.trim(),
      completed: false,
      priority: newTaskPriority,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskName('');
    showToast(`Added new task: "${newTask.name}"`, 'success');
  };

  const handleDeleteTask = (id: number, name: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast(`Removed task "${name}"`, 'info');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="info-dashboard-container">
      {/* Top Header Bar */}
      <header className="info-header-bar">
        <div className="header-left">
          <span className="badge-pill">
            <i className="fas fa-chart-line"></i> Operations Center
          </span>
          <h1>Executive Productivity &amp; Analytics Hub</h1>
          <p>
            Real-time task tracking, completion velocity, productivity analytics &amp; system diagnostics
          </p>
        </div>

        <Link to="/" className="back-btn" onClick={() => showToast('Returning to Home page', 'info')}>
          <i className="fas fa-arrow-left"></i>
          <span>Back to Home</span>
        </Link>
      </header>

      {/* 4 Top KPI Cards */}
      <section className="kpi-cards-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <i className="fas fa-list-check"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-val">{totalTasks}</span>
            <span className="kpi-title">Total Tasks</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <i className="fas fa-circle-check"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-val">{completedTasks}</span>
            <span className="kpi-title">Completed Tasks</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon amber">
            <i className="fas fa-clock-rotate-left"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-val">{pendingTasks}</span>
            <span className="kpi-title">In-Progress Tasks</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <i className="fas fa-gauge-high"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-val">{completionRate}%</span>
            <span className="kpi-title">Productivity Rate</span>
          </div>
        </div>
      </section>

      {/* Main Dual Grid: Tasks + Charts */}
      <section className="dashboard-main-grid">
        {/* Task Management Panel */}
        <div className="task-manager-box">
          <div className="box-top-row">
            <h3>
              <i className="fas fa-tasks"></i> Task Tracker
            </h3>
            <div className="filter-tabs">
              <button
                type="button"
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({totalTasks})
              </button>
              <button
                type="button"
                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Pending ({pendingTasks})
              </button>
              <button
                type="button"
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Done ({completedTasks})
              </button>
            </div>
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="add-task-form">
            <input
              type="text"
              placeholder="Add a new milestone or task..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="task-input"
            />
            <select
              value={newTaskPriority}
              onChange={(e) =>
                setNewTaskPriority(e.target.value as 'high' | 'medium' | 'normal')
              }
              className="priority-select"
            >
              <option value="normal">Normal</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button type="submit" className="add-task-btn">
              <i className="fas fa-plus"></i>
              <span>Add</span>
            </button>
          </form>

          {/* Task List */}
          <div className="tasks-scroll-list">
            {filteredTasks.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No tasks match current filter.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item-card ${task.completed ? 'completed' : ''}`}
                >
                  <div className="task-left">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="custom-checkbox"
                      title={task.completed ? 'Mark pending' : 'Mark completed'}
                    />
                    <span className="task-title">{task.name}</span>
                  </div>

                  <div className="task-right">
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                    <button
                      type="button"
                      className="delete-task-btn"
                      onClick={() => handleDeleteTask(task.id, task.name)}
                      title="Delete task"
                    >
                      <i className="fas fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Charts Panel */}
        <div className="analytics-chart-box">
          <div className="chart-top-bar">
            <h3>
              <i className="fas fa-chart-pie"></i> Visual Metrics
            </h3>
            <div className="chart-toggle-tabs">
              <button
                type="button"
                className={`chart-tab-btn ${activeChartTab === 'weekly' ? 'active' : ''}`}
                onClick={() => setActiveChartTab('weekly')}
              >
                Weekly Velocity
              </button>
              <button
                type="button"
                className={`chart-tab-btn ${activeChartTab === 'distribution' ? 'active' : ''}`}
                onClick={() => setActiveChartTab('distribution')}
              >
                Status Distribution
              </button>
            </div>
          </div>

          <div className="chart-render-wrap">
            {activeChartTab === 'weekly' ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={weeklyVelocityData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(56, 189, 248, 0.4)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    }}
                  />
                  <Bar dataKey="points" name="Productivity Points" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="completed" name="Tasks Completed" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={6}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(56, 189, 248, 0.4)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* System Diagnostics Section */}
      <section className="system-diagnostics-section">
        <h3>
          <i className="fas fa-microchip"></i> System Architecture &amp; Health Diagnostics
        </h3>
        <div className="diagnostics-grid">
          <div className="diag-item">
            <span className="diag-label">Core Runtime Engine</span>
            <span className="diag-value">
              <span className="status-dot"></span> React 18 &bull; Vite 6 &bull; TypeScript 5
            </span>
          </div>

          <div className="diag-item">
            <span className="diag-label">Storage Architecture</span>
            <span className="diag-value">
              <span className="status-dot"></span> Dual Dexie IndexedDB + Supabase Cloud
            </span>
          </div>

          <div className="diag-item">
            <span className="diag-label">Graphics Acceleration</span>
            <span className="diag-value">
              <span className="status-dot"></span> Three.js WebGL &bull; 60 FPS Canvas
            </span>
          </div>

          <div className="diag-item">
            <span className="diag-label">Cloud Deployment</span>
            <span className="diag-value">
              <span className="status-dot"></span> GitHub Pages Production Edge
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Info;
