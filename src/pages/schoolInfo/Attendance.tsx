import React, { useState } from 'react';
import './SchoolInfo.scss';

interface AttendanceRecord {
  id: number;
  name: string;
  role: string;
  gender: string;
  date: string;
  status: string;
}

const Attendance: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([
    { id: 1, name: 'Rahul Sharma', role: 'Student', gender: 'Male', date: new Date().toISOString().split('T')[0], status: 'Present' },
    { id: 2, name: "Priya Verma", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Absent" },
    { id: 3, name: "Ankit Singh", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Late" },
    { id: 4, name: "Sonam Gupta", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Absent" },
    { id: 5, name: "Rajesh Yadav", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 6, name: "Neetu Kumari", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Late" },
    { id: 7, name: "Vikas Mishra", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 8, name: "Pooja Singh", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Late" },
    { id: 9, name: "Mohan Patel", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Absent" },
    { id: 10, name: "Seema Devi", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 11, name: "Amit Kumar", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Absent" },
    { id: 12, name: "Rani Yadav", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Absent" },
    { id: 13, name: "Sanjay Gupta", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 14, name: "Kavita Singh", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 15, name: "Ravi Kumar", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 16, name: "Anita Sharma", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Late" },
    { id: 17, name: "Rohit Yadav", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 18, name: "Meera Devi", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 19, name: "Suresh Patel", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Late" },
    { id: 20, name: "Radha Singh", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 21, name: "Arjun Mehta", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 22, name: "Neha Chauhan", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 23, name: "Deepak Sharma", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 24, name: "Simran Kaur", role: "Student", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Late" },
    { id: 25, name: "Harsh Tiwari", role: "Student", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Absent" },
    { id: 26, name: "Dr. Ramesh Sharma", role: "Teacher", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Absent" },
    { id: 27, name: "Ms. Pooja Singh", role: "Teacher", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 28, name: "Mr. Sandeep Kumar", role: "Teacher", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Absent" },
    { id: 29, name: "Mrs. Anjali Verma", role: "Teacher", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 30, name: "Dr. Rajiv Mehta", role: "Teacher", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Late" },
    { id: 31, name: "Mr. Manoj Tiwari", role: "Teacher", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Absent" },
    { id: 32, name: "Ms. Neha Pandey", role: "Teacher", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Absent" },
    { id: 33, name: "Mr. Ashok Yadav", role: "Teacher", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 34, name: "Dr. Sunita Kapoor", role: "Teacher", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Late" },
    { id: 35, name: "Mrs. Priyanka Mishra", role: "Teacher", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Present" },
    { id: 36, name: "Mr. Rohan Malhotra", role: "Teacher", gender: "Male", date: new Date().toISOString().split('T')[0], status: "Late" },
    { id: 37, name: "Ms. Divya Chauhan", role: "Teacher", gender: "Female", date: new Date().toISOString().split('T')[0], status: "Present" },
  ]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 5 });

  const filteredRecords = records.filter(record => 
    record.name.toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter === 'All' || record.role === roleFilter) &&
    (statusFilter === 'All' || record.status === statusFilter) &&
    (genderFilter === 'All' || record.gender === genderFilter)
  );

  const paginatedRecords = filteredRecords.slice(
    (pagination.page - 1) * pagination.pageSize,
    pagination.page * pagination.pageSize
  );

  const updateStatus = (id: number, newStatus: string) => {
    setRecords(records.map(record => 
      record.id === id ? {...record, status: newStatus} : record
    ));
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
      <h1 className="school-title">Attendance</h1>
      <p className="school-subtitle">Manage attendance records here.</p>

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

      <div className="school-pagination">
        <button 
          disabled={pagination.page === 1}
          onClick={() => setPagination({...pagination, page: pagination.page - 1})}
        >
          Previous
        </button>
        <span>Page {pagination.page} of {Math.ceil(filteredRecords.length / pagination.pageSize)}</span>
        <button 
          disabled={pagination.page >= Math.ceil(filteredRecords.length / pagination.pageSize)}
          onClick={() => setPagination({...pagination, page: pagination.page + 1})}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Attendance;