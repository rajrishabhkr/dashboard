import React, { useState } from 'react';
import './SchoolInfo.scss';

interface Student {
  id: number;
  name: string;
  age: number;
  grade: string;
  gender: string;
  email: string;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: 'Rahul Sharma', age: 20, grade: 'A', gender: 'Male', email: 'rahul@abc.com' },
    { id: 2, name: 'Priya Verma', age: 21, grade: 'B', gender: 'Female', email: 'priya@abc.com' },
    { id: 3, name: 'Ankit Singh', age: 22, grade: 'C', gender: 'Male', email: 'ankit@abc.com' },
    { id: 4, name: 'Sonam Gupta', age: 19, grade: 'A', gender: 'Female', email: 'sonam@abc.com' },
    { id: 5, name: 'Rajesh Yadav', age: 20, grade: 'B', gender: 'Male', email: 'rajesh@abc.com' },
    { id: 6, name: 'Neetu Kumari', age: 21, grade: 'A', gender: 'Female', email: 'neetu@abc.com' },
    { id: 7, name: 'Vikas Mishra', age: 22, grade: 'C', gender: 'Male', email: 'vikas@abc.com' },
    { id: 8, name: 'Pooja Singh', age: 19, grade: 'B', gender: 'Female', email: 'pooja@abc.com' },
    { id: 9, name: 'Mohan Patel', age: 20, grade: 'A', gender: 'Male', email: 'mohan@abc.com' },
    { id: 10, name: 'Seema Devi', age: 21, grade: 'C', gender: 'Female', email: 'seema@abc.com' },
    { id: 11, name: 'Amit Kumar', age: 22, grade: 'A', gender: 'Male', email: 'amit@abc.com' },
    { id: 12, name: 'Rani Yadav', age: 19, grade: 'B', gender: 'Female', email: 'rani@abc.com' },
    { id: 13, name: 'Sanjay Gupta', age: 20, grade: 'C', gender: 'Male', email: 'sanjay@abc.com' },
    { id: 14, name: 'Kavita Singh', age: 21, grade: 'A', gender: 'Female', email: 'kavita@abc.com' },
    { id: 15, name: 'Ravi Kumar', age: 22, grade: 'B', gender: 'Male', email: 'ravi@abc.com' },
    { id: 16, name: 'Anita Sharma', age: 19, grade: 'C', gender: 'Female', email: 'anita@abc.com' },
    { id: 17, name: 'Rohit Yadav', age: 20, grade: 'A', gender: 'Male', email: 'rohit@abc.com' },
    { id: 18, name: 'Meera Devi', age: 21, grade: 'B', gender: 'Female', email: 'meera@abc.com' },
    { id: 19, name: 'Suresh Patel', age: 22, grade: 'C', gender: 'Male', email: 'suresh@abc.com' },
    { id: 20, name: 'Radha Singh', age: 19, grade: 'A', gender: 'Female', email: 'radha@abc.com' },
    { id: 21, name: 'Arjun Mehta', age: 20, grade: 'B', gender: 'Male', email: 'arjun@abc.com' },
    { id: 22, name: 'Neha Chauhan', age: 21, grade: 'A', gender: 'Female', email: 'neha@abc.com' },
    { id: 23, name: 'Deepak Sharma', age: 22, grade: 'C', gender: 'Male', email: 'deepak@abc.com' },
    { id: 24, name: 'Simran Kaur', age: 19, grade: 'B', gender: 'Female', email: 'simran@abc.com' },
    { id: 25, name: 'Harsh Tiwari', age: 20, grade: 'A', gender: 'Male', email: 'harsh@abc.com' },
  ]);
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

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(search.toLowerCase()) &&
    (gradeFilter === '' || student.grade === gradeFilter)
  );

  const paginatedStudents = filteredStudents.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const handleRemoveStudent = (id: number) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const handleAddStudent = () => {
    const newId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
    setStudents([
      ...students,
      {
        id: newId,
        name: newStudent.name,
        age: Number(newStudent.age),
        grade: newStudent.grade,
        gender: newStudent.gender,
        email: newStudent.email
      }
    ]);
    setNewStudent({ name: '', age: '', grade: '', gender: '', email: '' });
    setOpenDialog(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
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
      <h1 className="school-title">Students</h1>
      <p className="school-subtitle">Manage student data here.</p>

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
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
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
          Add Student
        </button>
      </div>

      {viewMode === 'list' ? (
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
                <td>{student.id}</td>
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
                <td>{student.grade}</td>
                <td>{student.gender}</td>
                <td>{student.email}</td>
                <td>
                  <button 
                    onClick={() => handleRemoveStudent(student.id)}
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
          {paginatedStudents.map(student => (
            <div key={student.id} className="school-card">
              <div 
                className="school-card-avatar"
                style={{ backgroundColor: getColorFromName(student.name) }}
              >
                {getInitials(student.name)}
              </div>
              <h3>{student.name}</h3>
              <p>Age: {student.age}</p>
              <p>Grade: {student.grade}</p>
              <p>Email: {student.email}</p>
              <button 
                onClick={() => handleRemoveStudent(student.id)}
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
        <span>Page {pagination.page} of {Math.ceil(filteredStudents.length / pagination.pageSize)}</span>
        <button 
          disabled={pagination.page >= Math.ceil(filteredStudents.length / pagination.pageSize)}
          onClick={() => setPagination({...pagination, page: pagination.page + 1})}
        >
          Next
        </button>
      </div>

      {openDialog && (
        <div className="school-dialog">
          <div className="school-dialog-content">
            <h2>Add New Student</h2>
            <input
              type="text"
              placeholder="Name"
              value={newStudent.name}
              onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
            />
            <input
              type="number"
              placeholder="Age"
              value={newStudent.age}
              onChange={(e) => setNewStudent({...newStudent, age: e.target.value})}
            />
            <input
              type="text"
              placeholder="Grade"
              value={newStudent.grade}
              onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
            />
            <input
              type="text"
              placeholder="Gender"
              value={newStudent.gender}
              onChange={(e) => setNewStudent({...newStudent, gender: e.target.value})}
            />
            <input
              type="email"
              placeholder="Email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
            />
            <div className="school-dialog-actions">
              <button onClick={() => setOpenDialog(false)}>Cancel</button>
              <button onClick={handleAddStudent}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;