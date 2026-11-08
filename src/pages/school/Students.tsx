import React, { useState, useEffect } from 'react';
import './SchoolInfo.scss';
import { useToast } from '../../components/layout/ToastContext';
import { db, subscribeDbChange } from '../../services/db';
import { DataTableControls, FilterOption, SortOption } from '../../components/common/DataTableControls';
import { DataTablePagination } from '../../components/common/DataTablePagination';
import { exportToCsv } from '../../utils/csvExport';

interface Student {
  id: number;
  name: string;
  age: number;
  grade: string;
  gender: string;
  email: string;
}

const GRADE_FILTER_OPTIONS: FilterOption[] = [
  { label: 'Grade A Honors', value: 'A' },
  { label: 'Grade B Scholars', value: 'B' },
  { label: 'Grade C Students', value: 'C' },
];

const SORT_OPTIONS: SortOption[] = [
  { label: 'ID Number', value: 'id' },
  { label: 'Full Name', value: 'name' },
  { label: 'Academic Grade', value: 'grade' },
  { label: 'Age', value: 'age' },
];

const Students: React.FC = () => {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 5 });

  // Add / Edit Dialogs & Validations
  const [openDialog, setOpenDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    age: '',
    grade: 'A',
    gender: 'Male',
    email: '',
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await db.students.getAll();
        if (mounted) setStudents(data);
      } catch (err) {
        console.warn('Failed to load students from DB:', err);
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
  }, [search, gradeFilter, sortBy, sortOrder]);

  const validateStudentForm = (data: { name: string; age: string | number; email: string }) => {
    const errors: Record<string, string> = {};
    if (!data.name.trim()) errors.name = 'Full name is required';
    else if (data.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    const ageNum = Number(data.age);
    if (!data.age || isNaN(ageNum) || ageNum < 5 || ageNum > 99) {
      errors.age = 'Age must be between 5 and 99';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) errors.email = 'Email address is required';
    else if (!emailPattern.test(data.email.trim())) errors.email = 'Please enter a valid email format';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRemoveStudent = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      const studentName = students.find(s => s.id === id)?.name || 'Student';
      await db.students.delete(id);
      setStudents(prev => prev.filter(student => student.id !== id));
      showToast(`${studentName} removed from records`, 'warning');
    }
  };

  const handleAddStudent = async () => {
    if (!validateStudentForm(newStudent)) return;
    const addedName = newStudent.name.trim();
    const created = await db.students.add({
      name: addedName,
      age: Number(newStudent.age),
      grade: newStudent.grade.toUpperCase(),
      gender: newStudent.gender,
      email: newStudent.email.trim(),
    });
    setStudents(prev => [...prev.filter(s => s.id !== created.id), created]);
    showToast(`Added new scholar: ${addedName}`, 'success');
    setNewStudent({ name: '', age: '', grade: 'A', gender: 'Male', email: '' });
    setFormErrors({});
    setOpenDialog(false);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent({ ...student });
    setFormErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    if (!validateStudentForm(editingStudent)) return;

    await db.students.update(editingStudent.id, editingStudent);
    setStudents(prev => prev.map(s => s.id === editingStudent.id ? editingStudent : s));
    showToast(`Updated scholar details for ${editingStudent.name}`, 'info');
    setEditingStudent(null);
    setFormErrors({});
  };

  const handleExportCsv = () => {
    if (filteredAndSortedStudents.length === 0) {
      showToast('No student records to export', 'warning');
      return;
    }
    exportToCsv('students_directory', filteredAndSortedStudents, ['id', 'name', 'age', 'grade', 'gender', 'email']);
    showToast('Exported students directory to CSV! 📊', 'success');
  };

  // Header click sort toggle
  const handleHeaderSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter & Sort
  const filteredAndSortedStudents = students
    .filter(student =>
      student.name.toLowerCase().includes(search.toLowerCase()) &&
      (gradeFilter === '' || student.grade === gradeFilter)
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'grade') comparison = a.grade.localeCompare(b.grade);
      else if (sortBy === 'age') comparison = a.age - b.age;
      else comparison = a.id - b.id;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const paginatedStudents = filteredAndSortedStudents.slice(
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

  const totalStudents = students.length;
  const gradeACount = students.filter(s => s.grade === 'A').length;
  const gradeBCount = students.filter(s => s.grade === 'B').length;
  const gradeCCount = students.filter(s => s.grade === 'C').length;

  return (
    <div className="school-container">
      <div className="school-header-section">
        <div>
          <h1 className="school-title">Students Directory</h1>
          <p className="school-subtitle">
            Table Info Directory: Search, filter, sort, export, and manage student scholar records.
          </p>
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

      {/* Reusable Data Table Controls (Search, Filter, Sort, View, Export, Add) */}
      <DataTableControls
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search students by name..."
        filterValue={gradeFilter}
        onFilterChange={setGradeFilter}
        filterOptions={GRADE_FILTER_OPTIONS}
        filterPlaceholder="All Academic Grades"
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
        addLabel="Add Student"
        onExportCsv={handleExportCsv}
      />

      {/* Table List View */}
      {viewMode === 'list' ? (
        <div className="school-table-container">
          <table className="school-table">
            <thead>
              <tr>
                <th className="cursor-pointer hover:text-cyan-400 select-none" onClick={() => handleHeaderSort('id')}>
                  ID {sortBy === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="cursor-pointer hover:text-cyan-400 select-none" onClick={() => handleHeaderSort('name')}>
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="cursor-pointer hover:text-cyan-400 select-none" onClick={() => handleHeaderSort('age')}>
                  Age {sortBy === 'age' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="cursor-pointer hover:text-cyan-400 select-none" onClick={() => handleHeaderSort('grade')}>
                  Grade {sortBy === 'grade' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th>Gender</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    <i className="fas fa-search mb-2 text-xl block text-gray-500" />
                    No students match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => (
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
                        <span className="font-semibold text-white">{student.name}</span>
                      </div>
                    </td>
                    <td>{student.age} yrs</td>
                    <td>
                      <span className={`grade-badge grade-${student.grade.toLowerCase()}`}>
                        Grade {student.grade}
                      </span>
                    </td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Card View */
        <div className="school-grid">
          {paginatedStudents.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400 bg-gray-900/40 rounded-2xl border border-gray-800">
              <i className="fas fa-search mb-2 text-2xl block text-gray-500" />
              No student records found.
            </div>
          ) : (
            paginatedStudents.map(student => (
              <div key={student.id} className="school-card">
                <div
                  className="school-card-avatar"
                  style={{ backgroundColor: getColorFromName(student.name) }}
                >
                  {getInitials(student.name)}
                </div>
                <h3>{student.name}</h3>
                <p><strong>ID:</strong> #{student.id}</p>
                <p><strong>Age:</strong> {student.age} years</p>
                <p>
                  <strong>Grade:</strong>{' '}
                  <span className={`grade-badge grade-${student.grade.toLowerCase()}`}>
                    {student.grade}
                  </span>
                </p>
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
            ))
          )}
        </div>
      )}

      {/* Unified Pagination Component */}
      <DataTablePagination
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalRecords={filteredAndSortedStudents.length}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
      />

      {/* Add Student Dialog with Form Validation */}
      {openDialog && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Add New Student</h2>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Full Name (e.g. Aryan Sharma)"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />
              {formErrors.name && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.name}</p>}
            </div>

            <div className="mb-3">
              <input
                type="number"
                placeholder="Age (e.g. 18)"
                value={newStudent.age}
                onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
              />
              {formErrors.age && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.age}</p>}
            </div>

            <div className="mb-3">
              <select
                value={newStudent.grade}
                onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                className="dialog-select"
              >
                <option value="A">Grade A (Honors)</option>
                <option value="B">Grade B (Scholars)</option>
                <option value="C">Grade C (Standard)</option>
              </select>
            </div>

            <div className="mb-3">
              <select
                value={newStudent.gender}
                onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                className="dialog-select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <input
                type="email"
                placeholder="Email Address (e.g. student@abc.com)"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              />
              {formErrors.email && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.email}</p>}
            </div>

            <div className="dialog-actions">
              <button onClick={() => setOpenDialog(false)} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleAddStudent} className="submit-button">
                Save Scholar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Dialog with Form Validation */}
      {editingStudent && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Edit Student Details</h2>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Full Name"
                value={editingStudent.name}
                onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
              />
              {formErrors.name && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.name}</p>}
            </div>

            <div className="mb-3">
              <input
                type="number"
                placeholder="Age"
                value={editingStudent.age}
                onChange={(e) => setEditingStudent({ ...editingStudent, age: Number(e.target.value) || 0 })}
              />
              {formErrors.age && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.age}</p>}
            </div>

            <div className="mb-3">
              <select
                value={editingStudent.grade}
                onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}
                className="dialog-select"
              >
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>

            <div className="mb-3">
              <select
                value={editingStudent.gender}
                onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value })}
                className="dialog-select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <input
                type="email"
                placeholder="Email Address"
                value={editingStudent.email}
                onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
              />
              {formErrors.email && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.email}</p>}
            </div>

            <div className="dialog-actions">
              <button onClick={() => setEditingStudent(null)} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="submit-button">
                Update Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
