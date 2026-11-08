import Dexie, { Table } from 'dexie';
import { defaultStudents, defaultTeachers, defaultAttendance, defaultIpo } from './seedData';

export interface StudentRecord {
  id: number;
  name: string;
  age: number;
  grade: string;
  gender: string;
  email: string;
  createdAt?: string;
}

export interface TeacherRecord {
  id: number;
  name: string;
  age: number;
  subject: string;
  gender: string;
  email: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: number;
  name: string;
  role: string;
  gender: string;
  date: string;
  status: string;
  updatedAt?: string;
}

export interface IPORecord {
  id: number;
  company: string;
  issueSize: string;
  priceRange: string;
  minInvestment: string;
  logoName?: string;
  createdAt?: string;
}

export interface GameScoreRecord {
  id?: number;
  game: string;
  score: number;
  date: string;
}

export interface ConfigRecord {
  key: string;
  value: any;
}

export class RishabhTechDatabase extends Dexie {
  students!: Table<StudentRecord, number>;
  teachers!: Table<TeacherRecord, number>;
  attendance!: Table<AttendanceRecord, number>;
  ipo!: Table<IPORecord, number>;
  gameScores!: Table<GameScoreRecord, number>;
  config!: Table<ConfigRecord, string>;

  constructor() {
    super('RishabhTechDB');

    this.version(1).stores({
      students: 'id, name, grade, gender, email',
      teachers: 'id, name, subject, gender, email',
      attendance: 'id, name, role, gender, date, status',
      ipo: 'id, company, issueSize',
      gameScores: '++id, game, score, date',
      config: 'key'
    });
  }

  /**
   * Initializes database with data if empty, migrating from localStorage if present
   * or falling back to initial seed JSON.
   */
  async initializeWithDefaults(): Promise<void> {
    try {
      const studentCount = await this.students.count();
      if (studentCount === 0) {
        const saved = localStorage.getItem('dashboard_students_data');
        const seed = saved ? JSON.parse(saved) : defaultStudents;
        await this.students.bulkPut(seed);
      }

      const teacherCount = await this.teachers.count();
      if (teacherCount === 0) {
        const saved = localStorage.getItem('dashboard_teachers_data');
        const seed = saved ? JSON.parse(saved) : defaultTeachers;
        await this.teachers.bulkPut(seed);
      }

      const attendanceCount = await this.attendance.count();
      if (attendanceCount === 0) {
        const saved = localStorage.getItem('dashboard_attendance_data');
        const seed = saved ? JSON.parse(saved) : defaultAttendance;
        await this.attendance.bulkPut(seed);
      }

      const ipoCount = await this.ipo.count();
      if (ipoCount === 0) {
        const saved = localStorage.getItem('dashboard_ipo_data');
        const seed = saved ? JSON.parse(saved) : defaultIpo;
        await this.ipo.bulkPut(seed);
      }
    } catch (err) {
      console.warn('Error during database initialization with defaults:', err);
    }
  }
}

export const localDb = new RishabhTechDatabase();
// Auto-initialize defaults on import
localDb.initializeWithDefaults().catch(console.error);
