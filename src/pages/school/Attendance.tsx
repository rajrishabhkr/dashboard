import React, { useState, useEffect } from 'react';
import './SchoolInfo.scss';
import initialAttendanceData from '../../store/attendanceData.json';
import { useToast } from '../../components/layout/ToastContext';

interface AttendanceRecord {
  id: number;
  name: string;
  role: string;
  gender: string;
  date: string;
  status: string;
}

const STORAGE_KEY = 'dashboard_attendance_data';

const Attendance: React.FC = () => {
  const { showToast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return initialAttendanceData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 5 });

  React.useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [search, roleFilter, statusFilter, genderFilter]);

  const filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter === 'All' || record.role === roleFilter) &&
    (statusFilter === 'All' || record.status === statusFilter) &&
    (genderFilter === 'All' || record.gender === genderFilter)
  );

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pagination.pageSize));

  const paginatedRecords = filteredRecords.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const updateStatus = (id: number, newStatus: string) => {
    const targetRecord = records.find(r => r.id === id);
    setRecords(records.map(record => 
      record.id === id ? {...record, status: newStatus} : record
    ));
    if (targetRecord) {
      const toastType = newStatus === 'Present' ? 'success' : newStatus === 'Late' ? 'warning' : 'error';
      showToast(`Updated ${targetRecord.name}'s status to ${newStatus}`, toastType);
    }
  };

  const getInitials = (name: string) => {
    return name.trim().split(/\s+/).map(n => n[0]).join('') || '?';
  };

  const getColorFromName = (name: string) => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF5'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const totalRecords = records.length;
  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const lateCount = records.filter(r => r.status === 'Late').length;
  const attendanceRate = totalRecords ? Math.round((presentCount / totalRecords) * 100) : 0;

  return (
    <div className="school-container">
      <div className="school-header-section">
        <div>
          <h1 className="school-title">Attendance Tracking</h1>
          <p className="school-subtitle">Monitor and update daily student & faculty attendance logs.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="school-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon total"><i className="fas fa-clipboard-list"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{attendanceRate}%</span>
            <span className="kpi-label">Attendance Rate</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon present"><i className="fas fa-user-check"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{presentCount}</span>
            <span className="kpi-label">Present Today</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon absent"><i className="fas fa-user-times"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{absentCount}</span>
            <span className="kpi-label">Absent Today</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon late"><i className="fas fa-user-clock"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{lateCount}</span>
            <span className="kpi-label">Late Arrivals</span>
          </div>
        </div>
      </div>

      <div className="school-controls">
        <input
          type="text"
          placeholder="Search by Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="school-search"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="school-select"
        >
          <option value="All">All Roles</option>
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="school-select"
        >
          <option value="All">All Statuses</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
        </select>
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="school-select"
        >
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div className="school-table-container">
        <table className="school-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Gender</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map(record => (
              <tr key={record.id}>
                <td>
                  <div className="school-avatar-name">
                    <div 
                      className="school-avatar"
                      style={{ backgroundColor: getColorFromName(record.name) }}
                    >
                      {getInitials(record.name)}
                    </div>
                    {record.name}
                  </div>
                </td>
                <td>{record.role}</td>
                <td>{record.gender}</td>
                <td>{record.date}</td>
                <td>
                  <select
                    value={record.status}
                    onChange={(e) => updateStatus(record.id, e.target.value)}
                    className={`school-status-select ${record.status.toLowerCase()}`}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="school-pagination">
        <button 
          disabled={pagination.page === 1}
          onClick={() => setPagination({...pagination, page: pagination.page - 1})}
        >
          Previous
        </button>
        <span>Page {pagination.page} of {totalPages}</span>
        <button 
          disabled={pagination.page >= totalPages}
          onClick={() => setPagination({...pagination, page: pagination.page + 1})}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Attendance;