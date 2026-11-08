import React, { useState, useEffect } from 'react';
import './SchoolInfo.scss';
import { useToast } from '../../components/layout/ToastContext';
import { db, subscribeDbChange } from '../../services/db';
import { DataTableControls, FilterOption, SortOption } from '../../components/common/DataTableControls';
import { DataTablePagination } from '../../components/common/DataTablePagination';
import { exportToCsv } from '../../utils/csvExport';

interface AttendanceRecord {
  id: number;
  name: string;
  role: string;
  gender: string;
  date: string;
  status: string;
}

const STATUS_FILTER_OPTIONS: FilterOption[] = [
  { label: 'Present Today', value: 'Present' },
  { label: 'Absent Today', value: 'Absent' },
  { label: 'Late Arrival', value: 'Late' },
];

const SORT_OPTIONS: SortOption[] = [
  { label: 'ID Number', value: 'id' },
  { label: 'Full Name', value: 'name' },
  { label: 'Role (Student/Staff)', value: 'role' },
  { label: 'Date', value: 'date' },
  { label: 'Status', value: 'status' },
];

const Attendance: React.FC = () => {
  const { showToast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 5 });

  // Add Attendance Modal state
  const [openDialog, setOpenDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({
    name: '',
    role: 'Student',
    gender: 'Male',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await db.attendance.getAll();
        if (mounted) setRecords(data);
      } catch (err) {
        console.warn('Failed to load attendance from DB:', err);
      }
    };
    load();
    const unsubscribe = subscribeDbChange(load);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [search, statusFilter, roleFilter, genderFilter, sortBy, sortOrder]);

  const validateAttendanceForm = (data: { name: string; date: string }) => {
    const errors: Record<string, string> = {};
    if (!data.name.trim()) errors.name = 'Full name is required';
    else if (data.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    if (!data.date.trim()) errors.date = 'Date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAttendance = async () => {
    if (!validateAttendanceForm(newRecord)) return;
    const addedName = newRecord.name.trim();
    const created = await db.attendance.add({
      name: addedName,
      role: newRecord.role,
      gender: newRecord.gender,
      date: newRecord.date,
      status: newRecord.status,
    });
    setRecords(prev => [...prev.filter(r => r.id !== created.id), created]);
    showToast(`Logged attendance for: ${addedName}`, 'success');
    setNewRecord({
      name: '',
      role: 'Student',
      gender: 'Male',
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
    });
    setFormErrors({});
    setOpenDialog(false);
  };

  const handleDeleteRecord = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this attendance log?')) {
      const targetRecord = records.find(r => r.id === id);
      await db.attendance.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      showToast(`Removed attendance record for ${targetRecord?.name || 'User'}`, 'warning');
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    const targetRecord = records.find(r => r.id === id);
    await db.attendance.updateStatus(id, newStatus);
    setRecords(records.map(record => 
      record.id === id ? { ...record, status: newStatus } : record
    ));
    if (targetRecord) {
      const toastType = newStatus === 'Present' ? 'success' : newStatus === 'Late' ? 'warning' : 'error';
      showToast(`Updated ${targetRecord.name}'s status to ${newStatus}`, toastType);
    }
  };

  const handleExportCsv = () => {
    if (filteredAndSortedRecords.length === 0) {
      showToast('No attendance records to export', 'warning');
      return;
    }
    exportToCsv('attendance_records', filteredAndSortedRecords, ['id', 'name', 'role', 'gender', 'date', 'status']);
    showToast('Exported attendance records to CSV! 📊', 'success');
  };

  const handleHeaderSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort
  const filteredAndSortedRecords = records
    .filter(record => 
      record.name.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === '' || record.status === statusFilter) &&
      (roleFilter === 'All' || record.role === roleFilter) &&
      (genderFilter === 'All' || record.gender === genderFilter)
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'role') comparison = a.role.localeCompare(b.role);
      else if (sortBy === 'date') comparison = a.date.localeCompare(b.date);
      else if (sortBy === 'status') comparison = a.status.localeCompare(b.status);
      else comparison = a.id - b.id;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const paginatedRecords = filteredAndSortedRecords.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const getInitials = (name: string) => {
    return name.trim().split(/\s+/).map(n => n[0]).join('') || '?';
  };

  const getColorFromName = (name: string) => {
    const colors = ['#38bdf8', '#818cf8', '#ec4899', '#10b981', '#f59e0b', '#6366f1'];
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
          <p className="school-subtitle">
            Table Info Directory: Monitor, search, sort, filter, and log real-time student & staff attendance.
          </p>
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

      {/* Reusable Data Table Controls */}
      <DataTableControls
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search attendance by name..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={STATUS_FILTER_OPTIONS}
        filterPlaceholder="All Attendance Statuses"
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onToggleSortOrder={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={() => {
          setFormErrors({});
          setOpenDialog(true);
        }}
        addLabel="Log Attendance"
        onExportCsv={handleExportCsv}
      />

      {/* Secondary filter chips for Role and Gender */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Filter Role:</span>
        {['All', 'Student', 'Teacher'].map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid #334155',
              background: roleFilter === role ? '#0284c7' : 'rgba(15, 23, 42, 0.6)',
              color: roleFilter === role ? '#ffffff' : '#94a3b8',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
          >
            {role}
          </button>
        ))}

        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginLeft: '12px' }}>Gender:</span>
        {['All', 'Male', 'Female'].map(gender => (
          <button
            key={gender}
            onClick={() => setGenderFilter(gender)}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid #334155',
              background: genderFilter === gender ? '#0284c7' : 'rgba(15, 23, 42, 0.6)',
              color: genderFilter === gender ? '#ffffff' : '#94a3b8',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
          >
            {gender}
          </button>
        ))}
      </div>

      {/* Content Rendering: List View vs Grid View */}
      {viewMode === 'list' ? (
        <div className="school-table-container">
          <table className="school-table">
            <thead>
              <tr>
                <th onClick={() => handleHeaderSort('id')} style={{ cursor: 'pointer' }}>
                  ID {sortBy === 'id' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleHeaderSort('name')} style={{ cursor: 'pointer' }}>
                  Name {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleHeaderSort('role')} style={{ cursor: 'pointer' }}>
                  Role {sortBy === 'role' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleHeaderSort('gender')} style={{ cursor: 'pointer' }}>
                  Gender {sortBy === 'gender' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleHeaderSort('date')} style={{ cursor: 'pointer' }}>
                  Date {sortBy === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleHeaderSort('status')} style={{ cursor: 'pointer' }}>
                  Status {sortBy === 'status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    <i className="fas fa-search" style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}></i>
                    No attendance records match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(record => (
                  <tr key={record.id}>
                    <td>#{record.id}</td>
                    <td>
                      <div className="school-avatar-name">
                        <div 
                          className="school-avatar"
                          style={{ backgroundColor: getColorFromName(record.name) }}
                        >
                          {getInitials(record.name)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{record.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`school-grade-badge ${record.role === 'Teacher' ? 'stem' : 'general'}`}>
                        {record.role}
                      </span>
                    </td>
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
                    <td>
                      <button 
                        onClick={() => handleDeleteRecord(record.id)} 
                        className="school-delete-button"
                        title="Delete record"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Cards View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {paginatedRecords.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              No attendance records found matching criteria.
            </div>
          ) : (
            paginatedRecords.map(record => (
              <div 
                key={record.id}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                      className="school-avatar"
                      style={{ backgroundColor: getColorFromName(record.name) }}
                    >
                      {getInitials(record.name)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}>{record.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>#{record.id} • {record.gender}</span>
                    </div>
                  </div>
                  <span className={`school-grade-badge ${record.role === 'Teacher' ? 'stem' : 'general'}`}>
                    {record.role}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#cbd5e1', borderTop: '1px solid #334155', paddingTop: '10px' }}>
                  <span><i className="far fa-calendar-alt" style={{ marginRight: '6px', color: '#38bdf8' }}></i> {record.date}</span>
                  <select
                    value={record.status}
                    onChange={(e) => updateStatus(record.id, e.target.value)}
                    className={`school-status-select ${record.status.toLowerCase()}`}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '8px' }}>
                  <button 
                    onClick={() => handleDeleteRecord(record.id)} 
                    className="school-delete-button"
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  >
                    <i className="fas fa-trash-alt" style={{ marginRight: '4px' }}></i> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reusable Data Table Pagination */}
      <DataTablePagination
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalRecords={filteredAndSortedRecords.length}
        pageSizeOptions={[5, 10, 20, 50]}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
      />

      {/* Log Attendance Dialog Modal */}
      {openDialog && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Log Attendance Record</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' }}>
              Add a new attendance record directly to the database.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <input
                  type="text"
                  placeholder="Full Name (Student or Teacher)"
                  value={newRecord.name}
                  onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: formErrors.name ? '1px solid #ef4444' : '1px solid #334155',
                    background: '#0f172a',
                    color: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.name && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Role</label>
                  <select
                    value={newRecord.role}
                    onChange={(e) => setNewRecord({ ...newRecord, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      background: '#0f172a',
                      color: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Gender</label>
                  <select
                    value={newRecord.gender}
                    onChange={(e) => setNewRecord({ ...newRecord, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      background: '#0f172a',
                      color: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Date</label>
                  <input
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: formErrors.date ? '1px solid #ef4444' : '1px solid #334155',
                      background: '#0f172a',
                      color: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.date && (
                    <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                      {formErrors.date}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>Status</label>
                  <select
                    value={newRecord.status}
                    onChange={(e) => setNewRecord({ ...newRecord, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      background: '#0f172a',
                      color: '#f8fafc',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="school-dialog-actions" style={{ marginTop: '20px' }}>
              <button 
                onClick={() => setOpenDialog(false)} 
                className="btn-cancel"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddAttendance} 
                className="btn-save"
              >
                <i className="fas fa-check" style={{ marginRight: '6px' }}></i> Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
