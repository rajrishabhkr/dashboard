import React, { useState } from 'react';
import './SchoolInfo.scss';

interface Teacher {
  id: number;
  name: string;
  age: number;
  subject: string;
  gender: string;
  email: string;
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 1, name: 'Dr. Ramesh Sharma', age: 45, subject: 'Mathematics', gender: 'Male', email: 'ramesh@abc.com' },
    { id: 2, name: 'Ms. Pooja Singh', age: 38, subject: 'English', gender: 'Female', email: 'pooja@abc.com' },
    { id: 3, name: 'Mr. Sandeep Kumar', age: 40, subject: 'Physics', gender: 'Male', email: 'sandeep@abc.com' },
    { id: 4, name: 'Mrs. Anjali Verma', age: 42, subject: 'Chemistry', gender: 'Female', email: 'anjali@abc.com' },
    { id: 5, name: 'Dr. Rajiv Mehta', age: 50, subject: 'Biology', gender: 'Male', email: 'rajiv@abc.com' },
    { id: 6, name: 'Mr. Manoj Tiwari', age: 41, subject: 'History', gender: 'Male', email: 'manoj@abc.com' },
    { id: 7, name: 'Ms. Neha Pandey', age: 35, subject: 'Geography', gender: 'Female', email: 'neha@abc.com' },
    { id: 8, name: 'Mr. Ashok Yadav', age: 47, subject: 'Economics', gender: 'Male', email: 'ashok@abc.com' },
    { id: 9, name: 'Dr. Sunita Kapoor', age: 39, subject: 'Civics', gender: 'Female', email: 'sunita@abc.com' },
    { id: 10, name: 'Mrs. Priyanka Mishra', age: 36, subject: 'Psychology', gender: 'Female', email: 'priyanka@abc.com' },
    { id: 11, name: 'Mr. Rohan Malhotra', age: 44, subject: 'Computer Science', gender: 'Male', email: 'rohan@abc.com' },
    { id: 12, name: 'Ms. Divya Chauhan', age: 37, subject: 'Political Science', gender: 'Female', email: 'divya@abc.com' },
  ]);
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

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(search.toLowerCase()) &&
    (genderFilter === '' || teacher.gender === genderFilter)
  );

  const paginatedTeachers = filteredTeachers.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const handleRemoveTeacher = (id: number) => {
    setTeachers(teachers.filter(teacher => teacher.id !== id));
  };

  const handleAddTeacher = () => {
    const newId = teachers.length ? Math.max(...teachers.map(t => t.id)) + 1 : 1;
    setTeachers([
      ...teachers,
      {
        id: newId,
        name: newTeacher.name,
        age: Number(newTeacher.age),
        subject: newTeacher.subject,
        gender: newTeacher.gender,
        email: newTeacher.email
      }
    ]);
    setNewTeacher({ name: '', age: '', subject: '', gender: '', email: '' });
    setOpenDialog(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').slice(1).map(n => n[0]).join('') || name.substring(1, 3);
  };

  const getColorFromName = (name: string) => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF5'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="school-container">
      <h1 className="school-title">Teachers</h1>
      <p className="school-subtitle">Manage teacher data here.</p>

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
          Add Teacher
        </button>
      </div>

      {viewMode === 'list' ? (
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
                <td>{teacher.id}</td>
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
                <td>{teacher.subject}</td>
                <td>{teacher.gender}</td>
                <td>{teacher.email}</td>
                <td>
                  <button 
                    onClick={() => handleRemoveTeacher(teacher.id)}
                    className="school-delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              <p>Age: {teacher.age}</p>
              <p>Subject: {teacher.subject}</p>
              <p>Email: {teacher.email}</p>
              <button 
                onClick={() => handleRemoveTeacher(teacher.id)}
                className="school-delete-button"
              >
                Delete
              </button>
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
        <span>Page {pagination.page} of {Math.ceil(filteredTeachers.length / pagination.pageSize)}</span>
        <button 
          disabled={pagination.page >= Math.ceil(filteredTeachers.length / pagination.pageSize)}
          onClick={() => setPagination({...pagination, page: pagination.page + 1})}
        >
          Next
        </button>
      </div>

      {openDialog && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Add New Teacher</h2>
            <input
              type="text"
              placeholder="Name"
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
              placeholder="Subject"
              value={newTeacher.subject}
              onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
            />
            <input
              type="text"
              placeholder="Gender"
              value={newTeacher.gender}
              onChange={(e) => setNewTeacher({...newTeacher, gender: e.target.value})}
            />
            <input
              type="email"
              placeholder="Email"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
            />
            <div className="school-dialog-actions">
              <button onClick={() => setOpenDialog(false)}>Cancel</button>
              <button onClick={handleAddTeacher}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;