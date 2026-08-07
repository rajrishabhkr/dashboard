import React, { useState, useEffect } from 'react';
import './SchoolInfo.scss';
import initialTeacherData from '../../store/teacherData.json';
import { useToast } from '../../components/layout/ToastContext';

interface Teacher {
  id: number;
  name: string;
  age: number;
  subject: string;
  gender: string;
  email: string;
}

const STORAGE_KEY = 'dashboard_teachers_data';

const Teachers: React.FC = () => {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return initialTeacherData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
  }, [teachers]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 5 });
  const [openDialog, setOpenDialog] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    age: '',
    subject: '',
    gender: '',
    email: ''
  });

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  React.useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [search, genderFilter]);

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(search.toLowerCase()) &&
    (genderFilter === '' || teacher.gender === genderFilter)
  );

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / pagination.pageSize));

  const paginatedTeachers = filteredTeachers.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const handleRemoveTeacher = (id: number) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      const teacherName = teachers.find(t => t.id === id)?.name || 'Faculty Member';
      setTeachers(teachers.filter(teacher => teacher.id !== id));
      showToast(`${teacherName} removed from faculty`, 'warning');
    }
  };

  const handleAddTeacher = () => {
    if (!newTeacher.name.trim() || !newTeacher.email.trim()) return;
    const newId = teachers.length ? Math.max(...teachers.map(t => t.id)) + 1 : 1;
    const addedName = newTeacher.name.trim();
    setTeachers([
      ...teachers,
      {
        id: newId,
        name: addedName,
        age: Number(newTeacher.age) || 35,
        subject: newTeacher.subject.trim() || 'General',
        gender: newTeacher.gender || 'Female',
        email: newTeacher.email.trim()
      }
    ]);
    showToast(`Added new faculty member: ${addedName}`, 'success');
    setNewTeacher({ name: '', age: '', subject: '', gender: '', email: '' });
    setOpenDialog(false);
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacher({ ...teacher });
  };

  const handleSaveEdit = () => {
    if (!editingTeacher || !editingTeacher.name.trim()) return;
    setTeachers(teachers.map(t => t.id === editingTeacher.id ? editingTeacher : t));
    showToast(`Updated faculty details for ${editingTeacher.name}`, 'info');
    setEditingTeacher(null);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return parts.slice(1).map(n => n[0]).join('');
    }
    return name.substring(0, 2);
  };

  const getColorFromName = (name: string) => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF5'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const totalTeachers = teachers.length;
  const maleCount = teachers.filter(t => t.gender === 'Male').length;
  const femaleCount = teachers.filter(t => t.gender === 'Female').length;
  const STEMSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
  const stemCount = teachers.filter(t => STEMSubjects.includes(t.subject)).length;

  return (
    <div className="school-container">
      <div className="school-header-section">
        <div>
          <h1 className="school-title">Faculty Directory</h1>
          <p className="school-subtitle">Manage, edit, add and remove teacher profiles.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="school-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon total"><i className="fas fa-chalkboard-teacher"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{totalTeachers}</span>
            <span className="kpi-label">Total Faculty</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon stem"><i className="fas fa-atom"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{stemCount}</span>
            <span className="kpi-label">STEM Educators</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon male"><i className="fas fa-mars"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{maleCount}</span>
            <span className="kpi-label">Male Teachers</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon female"><i className="fas fa-venus"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{femaleCount}</span>
            <span className="kpi-label">Female Teachers</span>
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
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="school-select"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <div className="school-view-toggle">
          <button 
            onClick={() => setViewMode('list')} 
            className={viewMode === 'list' ? 'active' : ''}
          >
            List
          </button>
          <button 
            onClick={() => setViewMode('grid')} 
            className={viewMode === 'grid' ? 'active' : ''}
          >
            Grid
          </button>
        </div>
        <button 
          onClick={() => setOpenDialog(true)}
          className="school-add-button"
        >
          <i className="fas fa-plus"></i> Add Teacher
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="school-table-container">
          <table className="school-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Subject</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTeachers.map(teacher => (
                <tr key={teacher.id}>
                  <td>#{teacher.id}</td>
                  <td>
                    <div className="school-avatar-name">
                      <div 
                        className="school-avatar"
                        style={{ backgroundColor: getColorFromName(teacher.name) }}
                      >
                        {getInitials(teacher.name)}
                      </div>
                      {teacher.name}
                    </div>
                  </td>
                  <td>{teacher.age}</td>
                  <td><span className="subject-badge">{teacher.subject}</span></td>
                  <td>{teacher.gender}</td>
                  <td>{teacher.email}</td>
                  <td>
                    <div className="action-buttons-group">
                      <button 
                        onClick={() => handleEditClick(teacher)}
                        className="school-edit-button"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleRemoveTeacher(teacher.id)}
                        className="school-delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="school-grid">
          {paginatedTeachers.map(teacher => (
            <div key={teacher.id} className="school-card">
              <div 
                className="school-card-avatar"
                style={{ backgroundColor: getColorFromName(teacher.name) }}
              >
                {getInitials(teacher.name)}
              </div>
              <h3>{teacher.name}</h3>
              <p><strong>Age:</strong> {teacher.age}</p>
              <p><strong>Subject:</strong> <span className="subject-badge">{teacher.subject}</span></p>
              <p><strong>Email:</strong> {teacher.email}</p>
              <div className="action-buttons-group">
                <button 
                  onClick={() => handleEditClick(teacher)}
                  className="school-edit-button"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleRemoveTeacher(teacher.id)}
                  className="school-delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Add Teacher Dialog */}
      {openDialog && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Add New Teacher</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
            />
            <input
              type="number"
              placeholder="Age"
              value={newTeacher.age}
              onChange={(e) => setNewTeacher({...newTeacher, age: e.target.value})}
            />
            <input
              type="text"
              placeholder="Subject (e.g. Mathematics)"
              value={newTeacher.subject}
              onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
            />
            <select
              value={newTeacher.gender}
              onChange={(e) => setNewTeacher({...newTeacher, gender: e.target.value})}
              className="dialog-select"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="email"
              placeholder="Email Address"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
            />
            <div className="school-dialog-actions">
              <button onClick={() => setOpenDialog(false)} className="btn-cancel">Cancel</button>
              <button onClick={handleAddTeacher} className="btn-save">Add Teacher</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Dialog */}
      {editingTeacher && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Edit Teacher Details</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={editingTeacher.name}
              onChange={(e) => setEditingTeacher({...editingTeacher, name: e.target.value})}
            />
            <input
              type="number"
              placeholder="Age"
              value={editingTeacher.age}
              onChange={(e) => setEditingTeacher({...editingTeacher, age: Number(e.target.value)})}
            />
            <input
              type="text"
              placeholder="Subject"
              value={editingTeacher.subject}
              onChange={(e) => setEditingTeacher({...editingTeacher, subject: e.target.value})}
            />
            <select
              value={editingTeacher.gender}
              onChange={(e) => setEditingTeacher({...editingTeacher, gender: e.target.value})}
              className="dialog-select"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="email"
              placeholder="Email Address"
              value={editingTeacher.email}
              onChange={(e) => setEditingTeacher({...editingTeacher, email: e.target.value})}
            />
            <div className="school-dialog-actions">
              <button onClick={() => setEditingTeacher(null)} className="btn-cancel">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-save">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;