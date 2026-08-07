import React, { useState, useEffect } from 'react';
import './SchoolInfo.scss';
import initialStudentData from '../../store/studentData.json';
import { useToast } from '../../components/layout/ToastContext';

interface Student {
  id: number;
  name: string;
  age: number;
  grade: string;
  gender: string;
  email: string;
}

const STORAGE_KEY = 'dashboard_students_data';

const Students: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return initialStudentData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students]);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 5 });
  const [openDialog, setOpenDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    age: '',
    grade: '',
    gender: '',
    email: ''
  });

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  React.useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [search, gradeFilter]);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(search.toLowerCase()) &&
    (gradeFilter === '' || student.grade === gradeFilter)
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pagination.pageSize));

  const paginatedStudents = filteredStudents.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const handleRemoveStudent = (id: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const studentName = students.find(s => s.id === id)?.name || 'Student';
      setStudents(students.filter(student => student.id !== id));
      showToast(`${studentName} removed from records`, 'warning');
    }
  };

  const handleAddStudent = () => {
    if (!newStudent.name.trim() || !newStudent.email.trim()) return;
    const newId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const addedName = newStudent.name.trim();
    setStudents([
      ...students,
      {
        id: newId,
        name: addedName,
        age: Number(newStudent.age) || 18,
        grade: newStudent.grade.toUpperCase() || 'A',
        gender: newStudent.gender || 'Male',
        email: newStudent.email.trim()
      }
    ]);
    showToast(`Added new student: ${addedName}`, 'success');
    setNewStudent({ name: '', age: '', grade: '', gender: '', email: '' });
    setOpenDialog(false);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent({ ...student });
  };

  const handleSaveEdit = () => {
    if (!editingStudent || !editingStudent.name.trim()) return;
    setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
    showToast(`Updated student details for ${editingStudent.name}`, 'info');
    setEditingStudent(null);
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

  const totalStudents = students.length;
  const gradeACount = students.filter(s => s.grade === 'A').length;
  const gradeBCount = students.filter(s => s.grade === 'B').length;
  const gradeCCount = students.filter(s => s.grade === 'C').length;

  return (
    <div className="school-container">
      <div className="school-header-section">
        <div>
          <h1 className="school-title">Students Directory</h1>
          <p className="school-subtitle">Manage, edit, add and remove student records.</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="school-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon total"><i className="fas fa-user-graduate"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{totalStudents}</span>
            <span className="kpi-label">Total Students</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon grade-a"><i className="fas fa-award"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{gradeACount}</span>
            <span className="kpi-label">Grade A Honors</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon grade-b"><i className="fas fa-medal"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{gradeBCount}</span>
            <span className="kpi-label">Grade B Scholars</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon grade-c"><i className="fas fa-star"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{gradeCCount}</span>
            <span className="kpi-label">Grade C Students</span>
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
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="school-select"
        >
          <option value="">All Grades</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
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
          <i className="fas fa-plus"></i> Add Student
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
                <th>Grade</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map(student => (
                <tr key={student.id}>
                  <td>#{student.id}</td>
                  <td>
                    <div className="school-avatar-name">
                      <div 
                        className="school-avatar"
                        style={{ backgroundColor: getColorFromName(student.name) }}
                      >
                        {getInitials(student.name)}
                      </div>
                      {student.name}
                    </div>
                  </td>
                  <td>{student.age}</td>
                  <td><span className={`grade-badge grade-${student.grade.toLowerCase()}`}>{student.grade}</span></td>
                  <td>{student.gender}</td>
                  <td>{student.email}</td>
                  <td>
                    <div className="action-buttons-group">
                      <button 
                        onClick={() => handleEditClick(student)}
                        className="school-edit-button"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleRemoveStudent(student.id)}
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
          {paginatedStudents.map(student => (
            <div key={student.id} className="school-card">
              <div 
                className="school-card-avatar"
                style={{ backgroundColor: getColorFromName(student.name) }}
              >
                {getInitials(student.name)}
              </div>
              <h3>{student.name}</h3>
              <p><strong>Age:</strong> {student.age}</p>
              <p><strong>Grade:</strong> <span className={`grade-badge grade-${student.grade.toLowerCase()}`}>{student.grade}</span></p>
              <p><strong>Email:</strong> {student.email}</p>
              <div className="action-buttons-group">
                <button 
                  onClick={() => handleEditClick(student)}
                  className="school-edit-button"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleRemoveStudent(student.id)}
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

      {/* Add Student Dialog */}
      {openDialog && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Add New Student</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
            />
            <input
              type="number"
              placeholder="Age"
              value={newStudent.age}
              onChange={(e) => setNewStudent({...newStudent, age: e.target.value})}
            />
            <select
              value={newStudent.grade}
              onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
              className="dialog-select"
            >
              <option value="">Select Grade</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
            <select
              value={newStudent.gender}
              onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})}
              className="dialog-select"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="email"
              placeholder="Email Address"
              value={newStudent.email}
              onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
            />
            <div className="school-dialog-actions">
              <button onClick={() => setOpenDialog(false)} className="btn-cancel">Cancel</button>
              <button onClick={handleAddStudent} className="btn-save">Add Student</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Dialog */}
      {editingStudent && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Edit Student Details</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={editingStudent.name}
              onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
            />
            <input
              type="number"
              placeholder="Age"
              value={editingStudent.age}
              onChange={(e) => setEditingStudent({...editingStudent, age: Number(e.target.value)})}
            />
            <select
              value={editingStudent.grade}
              onChange={(e) => setEditingStudent({...editingStudent, grade: e.target.value})}
              className="dialog-select"
            >
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
            <select
              value={editingStudent.gender}
              onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})}
              className="dialog-select"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="email"
              placeholder="Email Address"
              value={editingStudent.email}
              onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
            />
            <div className="school-dialog-actions">
              <button onClick={() => setEditingStudent(null)} className="btn-cancel">Cancel</button>
              <button onClick={handleSaveEdit} className="btn-save">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;