import React, { useState, useEffect } from 'react';
import './SchoolInfo.scss';
import { useToast } from '../../components/layout/ToastContext';
import { db, subscribeDbChange } from '../../services/db';
import { DataTableControls, FilterOption, SortOption } from '../../components/common/DataTableControls';
import { DataTablePagination } from '../../components/common/DataTablePagination';
import { exportToCsv } from '../../utils/csvExport';

interface Teacher {
  id: number;
  name: string;
  age: number;
  subject: string;
  gender: string;
  email: string;
}

const GENDER_FILTER_OPTIONS: FilterOption[] = [
  { label: 'Female Faculty', value: 'Female' },
  { label: 'Male Faculty', value: 'Male' },
];

const SORT_OPTIONS: SortOption[] = [
  { label: 'ID Number', value: 'id' },
  { label: 'Faculty Name', value: 'name' },
  { label: 'Department Subject', value: 'subject' },
  { label: 'Age', value: 'age' },
];

const Teachers: React.FC = () => {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 5 });

  const [openDialog, setOpenDialog] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    age: '',
    subject: '',
    gender: 'Female',
    email: '',
  });
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await db.teachers.getAll();
        if (mounted) setTeachers(data);
      } catch (err) {
        console.warn('Failed to load teachers from DB:', err);
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
  }, [search, genderFilter, sortBy, sortOrder]);

  const validateTeacherForm = (data: { name: string; age: string | number; subject: string; email: string }) => {
    const errors: Record<string, string> = {};
    if (!data.name.trim()) errors.name = 'Faculty member name is required';
    else if (data.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    const ageNum = Number(data.age);
    if (!data.age || isNaN(ageNum) || ageNum < 20 || ageNum > 99) {
      errors.age = 'Age must be between 20 and 99';
    }

    if (!data.subject.trim()) errors.subject = 'Department subject is required';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) errors.email = 'Email address is required';
    else if (!emailPattern.test(data.email.trim())) errors.email = 'Please enter a valid email format';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRemoveTeacher = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      const teacherName = teachers.find(t => t.id === id)?.name || 'Faculty Member';
      await db.teachers.delete(id);
      setTeachers(prev => prev.filter(teacher => teacher.id !== id));
      showToast(`${teacherName} removed from faculty records`, 'warning');
    }
  };

  const handleAddTeacher = async () => {
    if (!validateTeacherForm(newTeacher)) return;
    const addedName = newTeacher.name.trim();
    const created = await db.teachers.add({
      name: addedName,
      age: Number(newTeacher.age),
      subject: newTeacher.subject.trim(),
      gender: newTeacher.gender,
      email: newTeacher.email.trim(),
    });
    setTeachers(prev => [...prev.filter(t => t.id !== created.id), created]);
    showToast(`Added new faculty member: ${addedName}`, 'success');
    setNewTeacher({ name: '', age: '', subject: '', gender: 'Female', email: '' });
    setFormErrors({});
    setOpenDialog(false);
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacher({ ...teacher });
    setFormErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingTeacher) return;
    if (!validateTeacherForm(editingTeacher)) return;

    await db.teachers.update(editingTeacher.id, editingTeacher);
    setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? editingTeacher : t));
    showToast(`Updated faculty details for ${editingTeacher.name}`, 'info');
    setEditingTeacher(null);
    setFormErrors({});
  };

  const handleExportCsv = () => {
    if (filteredAndSortedTeachers.length === 0) {
      showToast('No teacher records to export', 'warning');
      return;
    }
    exportToCsv('teachers_directory', filteredAndSortedTeachers, ['id', 'name', 'subject', 'age', 'gender', 'email']);
    showToast('Exported faculty directory to CSV! 📊', 'success');
  };

  const handleHeaderSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedTeachers = teachers
    .filter(teacher =>
      teacher.name.toLowerCase().includes(search.toLowerCase()) &&
      (genderFilter === '' || teacher.gender === genderFilter)
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'subject') comparison = a.subject.localeCompare(b.subject);
      else if (sortBy === 'age') comparison = a.age - b.age;
      else comparison = a.id - b.id;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const paginatedTeachers = filteredAndSortedTeachers.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return parts.slice(1).map(n => n[0]).join('');
    }
    return name.substring(0, 2);
  };

  const getColorFromName = (name: string) => {
    const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'];
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
          <p className="school-subtitle">
            Table Info Directory: Search, filter, sort, export, and manage academic faculty members.
          </p>
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
          <div className="kpi-icon female"><i className="fas fa-female"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{femaleCount}</span>
            <span className="kpi-label">Female Professors</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon male"><i className="fas fa-male"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{maleCount}</span>
            <span className="kpi-label">Male Professors</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon stem"><i className="fas fa-atom"></i></div>
          <div className="kpi-info">
            <span className="kpi-value">{stemCount}</span>
            <span className="kpi-label">STEM Faculty</span>
          </div>
        </div>
      </div>

      {/* Reusable Data Table Controls */}
      <DataTableControls
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search faculty by name..."
        filterValue={genderFilter}
        onFilterChange={setGenderFilter}
        filterOptions={GENDER_FILTER_OPTIONS}
        filterPlaceholder="All Genders"
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
        addLabel="Add Faculty"
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
                <th className="cursor-pointer hover:text-cyan-400 select-none" onClick={() => handleHeaderSort('subject')}>
                  Subject {sortBy === 'subject' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="cursor-pointer hover:text-cyan-400 select-none" onClick={() => handleHeaderSort('age')}>
                  Age {sortBy === 'age' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th>Gender</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    <i className="fas fa-search mb-2 text-xl block text-gray-500" />
                    No faculty members match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedTeachers.map(teacher => (
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
                        <span className="font-semibold text-white">{teacher.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="subject-badge">{teacher.subject}</span>
                    </td>
                    <td>{teacher.age} yrs</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Card View */
        <div className="school-grid">
          {paginatedTeachers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400 bg-gray-900/40 rounded-2xl border border-gray-800">
              <i className="fas fa-search mb-2 text-2xl block text-gray-500" />
              No faculty records found.
            </div>
          ) : (
            paginatedTeachers.map(teacher => (
              <div key={teacher.id} className="school-card">
                <div
                  className="school-card-avatar"
                  style={{ backgroundColor: getColorFromName(teacher.name) }}
                >
                  {getInitials(teacher.name)}
                </div>
                <h3>{teacher.name}</h3>
                <p><strong>Department:</strong> <span className="subject-badge">{teacher.subject}</span></p>
                <p><strong>Age:</strong> {teacher.age} years</p>
                <p><strong>Gender:</strong> {teacher.gender}</p>
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
            ))
          )}
        </div>
      )}

      {/* Unified Pagination Component */}
      <DataTablePagination
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalRecords={filteredAndSortedTeachers.length}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
      />

      {/* Add Teacher Dialog with Validation */}
      {openDialog && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Add Faculty Member</h2>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Full Name (e.g. Dr. Ramesh Sharma)"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
              />
              {formErrors.name && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.name}</p>}
            </div>

            <div className="mb-3">
              <input
                type="number"
                placeholder="Age (e.g. 42)"
                value={newTeacher.age}
                onChange={(e) => setNewTeacher({ ...newTeacher, age: e.target.value })}
              />
              {formErrors.age && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.age}</p>}
            </div>

            <div className="mb-3">
              <input
                type="text"
                placeholder="Subject Department (e.g. Computer Science)"
                value={newTeacher.subject}
                onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
              />
              {formErrors.subject && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.subject}</p>}
            </div>

            <div className="mb-3">
              <select
                value={newTeacher.gender}
                onChange={(e) => setNewTeacher({ ...newTeacher, gender: e.target.value })}
                className="dialog-select"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <input
                type="email"
                placeholder="Email Address (e.g. professor@abc.com)"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              />
              {formErrors.email && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.email}</p>}
            </div>

            <div className="dialog-actions">
              <button onClick={() => setOpenDialog(false)} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleAddTeacher} className="submit-button">
                Save Faculty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Dialog with Validation */}
      {editingTeacher && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Edit Faculty Details</h2>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Full Name"
                value={editingTeacher.name}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
              />
              {formErrors.name && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.name}</p>}
            </div>

            <div className="mb-3">
              <input
                type="number"
                placeholder="Age"
                value={editingTeacher.age}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, age: Number(e.target.value) || 0 })}
              />
              {formErrors.age && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.age}</p>}
            </div>

            <div className="mb-3">
              <input
                type="text"
                placeholder="Subject"
                value={editingTeacher.subject}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
              />
              {formErrors.subject && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.subject}</p>}
            </div>

            <div className="mb-3">
              <select
                value={editingTeacher.gender}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, gender: e.target.value })}
                className="dialog-select"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-3">
              <input
                type="email"
                placeholder="Email Address"
                value={editingTeacher.email}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
              />
              {formErrors.email && <p className="text-red-400 text-xs mt-1 text-left">{formErrors.email}</p>}
            </div>

            <div className="dialog-actions">
              <button onClick={() => setEditingTeacher(null)} className="cancel-button">
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

export default Teachers;
