import {
  localDb,
  StudentRecord,
  TeacherRecord,
  AttendanceRecord,
  IPORecord,
} from './localDb';
import {
  getSupabaseClient,
  getSupabaseConfig,
} from './supabaseClient';
import {
  defaultStudents,
  defaultTeachers,
  defaultAttendance,
  defaultIpo,
} from './seedData';

type ChangeListener = () => void;
const listeners = new Set<ChangeListener>();

export const notifyDbChange = () => {
  listeners.forEach(fn => {
    try { fn(); } catch (e) { console.error('DB listener error:', e); }
  });
};

export const subscribeDbChange = (fn: ChangeListener) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

/**
 * Calculates the next safe unique primary key ID across both Local IndexedDB and Supabase.
 * Avoids any duplicate primary key collisions.
 */
async function getNextId(
  tableName: 'students' | 'teachers' | 'attendance' | 'ipo_list',
  localRecords: { id: number }[]
): Promise<number> {
  const maxLocal = localRecords.length > 0 ? Math.max(...localRecords.map(r => Number(r.id) || 0)) : 0;
  let maxCloud = 0;

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data } = await client
        .from(tableName)
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        maxCloud = Number(data[0].id) || 0;
      }
    } catch (err) {
      console.warn(`Could not fetch max ID from cloud table ${tableName}:`, err);
    }
  }

  return Math.max(maxLocal, maxCloud) + 1;
}

/**
 * Unified Database Service offering local IndexedDB (Dexie) + Cloud (Supabase PostgreSQL).
 */
export const db = {
  // ==========================================
  // Students Repository
  // ==========================================
  students: {
    async getAll(): Promise<StudentRecord[]> {
      const config = getSupabaseConfig();
      const client = getSupabaseClient();

      // In hybrid or cloud mode, fetch latest records from Supabase
      if ((config.mode === 'cloud' || config.mode === 'hybrid') && client) {
        try {
          const { data, error } = await client
            .from('students')
            .select('*')
            .order('id', { ascending: true });

          if (!error && data && data.length > 0) {
            const mapped: StudentRecord[] = data.map((item: any) => ({
              id: Number(item.id),
              name: item.name,
              age: Number(item.age) || 18,
              grade: item.grade || 'A',
              gender: item.gender || 'Male',
              email: item.email || '',
              createdAt: item.created_at || new Date().toISOString(),
            }));
            await localDb.students.clear();
            await localDb.students.bulkPut(mapped);
            localStorage.setItem('dashboard_students_data', JSON.stringify(mapped));
            return mapped;
          }
        } catch (err) {
          console.warn('Cloud fetch students failed, falling back to local DB:', err);
        }
      }

      await localDb.initializeWithDefaults();
      const localRecords = await localDb.students.toArray();
      if (localRecords.length === 0) {
        return defaultStudents;
      }
      return localRecords;
    },

    async add(student: Omit<StudentRecord, 'id'> & { id?: number }): Promise<StudentRecord> {
      const all = await localDb.students.toArray();
      const newId = student.id || await getNextId('students', all);
      const record: StudentRecord = {
        ...student,
        id: newId,
        createdAt: new Date().toISOString(),
      };

      await localDb.students.put(record);
      const updated = await localDb.students.toArray();
      localStorage.setItem('dashboard_students_data', JSON.stringify(updated));

      // Sync cleanly to Supabase (only send schema columns)
      const client = getSupabaseClient();
      if (client) {
        const cloudPayload = {
          id: record.id,
          name: record.name,
          age: record.age,
          grade: record.grade,
          gender: record.gender,
          email: record.email,
        };
        try {
          const { error } = await client.from('students').upsert(cloudPayload, { onConflict: 'id' });
          if (error) console.error('Supabase student sync error:', error.message, error);
        } catch (e) {
          console.error('Supabase student sync exception:', e);
        }
      }

      notifyDbChange();
      return record;
    },

    async update(id: number, changes: Partial<StudentRecord>): Promise<void> {
      const existing = await localDb.students.get(id);
      if (!existing) return;
      const updated = { ...existing, ...changes };
      await localDb.students.put(updated);

      const all = await localDb.students.toArray();
      localStorage.setItem('dashboard_students_data', JSON.stringify(all));

      const client = getSupabaseClient();
      if (client) {
        const cloudChanges: any = { ...changes };
        delete cloudChanges.createdAt; // strip camelCase
        client.from('students').update(cloudChanges).eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase student update warning:', error);
        });
      }

      notifyDbChange();
    },

    async delete(id: number): Promise<void> {
      await localDb.students.delete(id);
      const all = await localDb.students.toArray();
      localStorage.setItem('dashboard_students_data', JSON.stringify(all));

      const client = getSupabaseClient();
      if (client) {
        client.from('students').delete().eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase student delete warning:', error);
        });
      }

      notifyDbChange();
    },
  },

  // ==========================================
  // Teachers Repository
  // ==========================================
  teachers: {
    async getAll(): Promise<TeacherRecord[]> {
      const config = getSupabaseConfig();
      const client = getSupabaseClient();

      if ((config.mode === 'cloud' || config.mode === 'hybrid') && client) {
        try {
          const { data, error } = await client
            .from('teachers')
            .select('*')
            .order('id', { ascending: true });

          if (!error && data && data.length > 0) {
            const mapped: TeacherRecord[] = data.map((item: any) => ({
              id: Number(item.id),
              name: item.name,
              age: Number(item.age) || 35,
              subject: item.subject || 'General',
              gender: item.gender || 'Female',
              email: item.email || '',
              createdAt: item.created_at || new Date().toISOString(),
            }));
            await localDb.teachers.clear();
            await localDb.teachers.bulkPut(mapped);
            localStorage.setItem('dashboard_teachers_data', JSON.stringify(mapped));
            return mapped;
          }
        } catch (err) {
          console.warn('Cloud fetch teachers failed, falling back to local DB:', err);
        }
      }

      await localDb.initializeWithDefaults();
      const localRecords = await localDb.teachers.toArray();
      if (localRecords.length === 0) {
        return defaultTeachers;
      }
      return localRecords;
    },

    async add(teacher: Omit<TeacherRecord, 'id'> & { id?: number }): Promise<TeacherRecord> {
      const all = await localDb.teachers.toArray();
      const newId = teacher.id || await getNextId('teachers', all);
      const record: TeacherRecord = {
        ...teacher,
        id: newId,
        createdAt: new Date().toISOString(),
      };

      await localDb.teachers.put(record);
      const updated = await localDb.teachers.toArray();
      localStorage.setItem('dashboard_teachers_data', JSON.stringify(updated));

      const client = getSupabaseClient();
      if (client) {
        const cloudPayload = {
          id: record.id,
          name: record.name,
          age: record.age,
          subject: record.subject,
          gender: record.gender,
          email: record.email,
        };
        try {
          const { error } = await client.from('teachers').upsert(cloudPayload, { onConflict: 'id' });
          if (error) console.error('Supabase teacher sync error:', error.message, error);
        } catch (e) {
          console.error('Supabase teacher sync exception:', e);
        }
      }

      notifyDbChange();
      return record;
    },

    async update(id: number, changes: Partial<TeacherRecord>): Promise<void> {
      const existing = await localDb.teachers.get(id);
      if (!existing) return;
      const updated = { ...existing, ...changes };
      await localDb.teachers.put(updated);

      const all = await localDb.teachers.toArray();
      localStorage.setItem('dashboard_teachers_data', JSON.stringify(all));

      const client = getSupabaseClient();
      if (client) {
        const cloudChanges: any = { ...changes };
        delete cloudChanges.createdAt;
        client.from('teachers').update(cloudChanges).eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase teacher update warning:', error);
        });
      }

      notifyDbChange();
    },

    async delete(id: number): Promise<void> {
      await localDb.teachers.delete(id);
      const all = await localDb.teachers.toArray();
      localStorage.setItem('dashboard_teachers_data', JSON.stringify(all));

      const client = getSupabaseClient();
      if (client) {
        client.from('teachers').delete().eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase teacher delete warning:', error);
        });
      }

      notifyDbChange();
    },
  },

  // ==========================================
  // Attendance Repository
  // ==========================================
  attendance: {
    async getAll(): Promise<AttendanceRecord[]> {
      const config = getSupabaseConfig();
      const client = getSupabaseClient();

      if ((config.mode === 'cloud' || config.mode === 'hybrid') && client) {
        try {
          const { data, error } = await client
            .from('attendance')
            .select('*')
            .order('id', { ascending: true });

          if (!error && data && data.length > 0) {
            const mapped: AttendanceRecord[] = data.map((item: any) => ({
              id: Number(item.id),
              name: item.name,
              role: item.role || 'Student',
              gender: item.gender || 'Male',
              date: item.date,
              status: item.status || 'Present',
            }));
            await localDb.attendance.clear();
            await localDb.attendance.bulkPut(mapped);
            localStorage.setItem('dashboard_attendance_data', JSON.stringify(mapped));
            return mapped;
          }
        } catch (err) {
          console.warn('Cloud fetch attendance failed, falling back to local DB:', err);
        }
      }

      await localDb.initializeWithDefaults();
      const localRecords = await localDb.attendance.toArray();
      if (localRecords.length === 0) {
        return defaultAttendance;
      }
      return localRecords;
    },

    async updateStatus(id: number, newStatus: string): Promise<void> {
      const existing = await localDb.attendance.get(id);
      if (existing) {
        const updated = { ...existing, status: newStatus };
        await localDb.attendance.put(updated);
      }

      const all = await localDb.attendance.toArray();
      localStorage.setItem('dashboard_attendance_data', JSON.stringify(all));

      const client = getSupabaseClient();
      if (client) {
        client.from('attendance').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase attendance update warning:', error);
        });
      }

      notifyDbChange();
    },

    async add(record: Omit<AttendanceRecord, 'id'> & { id?: number }): Promise<AttendanceRecord> {
      const all = await localDb.attendance.toArray();
      const newId = record.id || await getNextId('attendance', all);
      const newRecord: AttendanceRecord = { ...record, id: newId };

      await localDb.attendance.put(newRecord);
      const updated = await localDb.attendance.toArray();
      localStorage.setItem('dashboard_attendance_data', JSON.stringify(updated));

      const client = getSupabaseClient();
      if (client) {
        const cloudPayload = {
          id: newRecord.id,
          name: newRecord.name,
          role: newRecord.role,
          gender: newRecord.gender,
          date: newRecord.date,
          status: newRecord.status,
        };
        try {
          const { error } = await client.from('attendance').upsert(cloudPayload, { onConflict: 'id' });
          if (error) console.error('Supabase attendance add error:', error.message, error);
        } catch (e) {
          console.error('Supabase attendance add exception:', e);
        }
      }

      notifyDbChange();
      return newRecord;
    },

    async delete(id: number): Promise<void> {
      await localDb.attendance.delete(id);
      const all = await localDb.attendance.toArray();
      localStorage.setItem('dashboard_attendance_data', JSON.stringify(all));

      const client = getSupabaseClient();
      if (client) {
        client.from('attendance').delete().eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase attendance delete warning:', error);
        });
      }

      notifyDbChange();
    },
  },

  // ==========================================
  // IPO Repository
  // ==========================================
  ipo: {
    async getAll(): Promise<IPORecord[]> {
      const config = getSupabaseConfig();
      const client = getSupabaseClient();

      if ((config.mode === 'cloud' || config.mode === 'hybrid') && client) {
        try {
          const { data, error } = await client
            .from('ipo_list')
            .select('*')
            .order('id', { ascending: true });

          if (!error && data && data.length > 0) {
            const mapped: IPORecord[] = data.map((item: any) => ({
              id: Number(item.id),
              company: item.company,
              issueSize: item.issue_size || item.issueSize,
              priceRange: item.price_range || item.priceRange,
              minInvestment: item.min_investment || item.minInvestment,
              logoName: item.logo_name || item.logoName,
              createdAt: item.created_at,
            }));
            await localDb.ipo.clear();
            await localDb.ipo.bulkPut(mapped);
            localStorage.setItem('dashboard_ipo_data', JSON.stringify(mapped));
            return mapped;
          }
        } catch (err) {
          console.warn('Cloud fetch IPOs failed, falling back to local DB:', err);
        }
      }

      await localDb.initializeWithDefaults();
      const localRecords = await localDb.ipo.toArray();
      if (localRecords.length === 0) {
        return defaultIpo;
      }
      return localRecords;
    },

    async add(ipoItem: Omit<IPORecord, 'id'> & { id?: number }): Promise<IPORecord> {
      const all = await localDb.ipo.toArray();
      const newId = ipoItem.id || await getNextId('ipo_list', all);
      const record: IPORecord = {
        ...ipoItem,
        id: newId,
        createdAt: new Date().toISOString(),
      };

      await localDb.ipo.put(record);
      const updated = await localDb.ipo.toArray();
      localStorage.setItem('dashboard_ipo_data', JSON.stringify(updated));

      const client = getSupabaseClient();
      if (client) {
        const cloudPayload = {
          id: record.id,
          company: record.company,
          issue_size: record.issueSize,
          price_range: record.priceRange,
          min_investment: record.minInvestment,
          logo_name: record.logoName || null,
        };
        try {
          const { error } = await client.from('ipo_list').upsert(cloudPayload, { onConflict: 'id' });
          if (error) console.error('Supabase IPO add error:', error.message, error);
        } catch (e) {
          console.error('Supabase IPO add exception:', e);
        }
      }

      notifyDbChange();
      return record;
    },

    async delete(id: number): Promise<void> {
      await localDb.ipo.delete(id);
      const all = await localDb.ipo.toArray();
      localStorage.setItem('dashboard_ipo_data', JSON.stringify(all));

      const client = getSupabaseClient();
      if (client) {
        client.from('ipo_list').delete().eq('id', id).then(({ error }) => {
          if (error) console.warn('Supabase IPO delete warning:', error);
        });
      }

      notifyDbChange();
    },
  },

  // ==========================================
  // Game Scores Repository
  // ==========================================
  gameScores: {
    async recordGame(game: string, score: number) {
      try {
        await localDb.gameScores.add({
          game,
          score,
          date: new Date().toISOString(),
        });
        notifyDbChange();
      } catch (err) {
        console.warn('Failed to record game score:', err);
      }
    },
    async getHistory(game: string, limit: number = 10) {
      try {
        return await localDb.gameScores
          .where('game')
          .equals(game)
          .reverse()
          .limit(limit)
          .toArray();
      } catch {
        return [];
      }
    },
    async getStats(game: string) {
      try {
        const records = await localDb.gameScores.where('game').equals(game).toArray();
        const wins = records.filter(r => r.score === 1).length;
        const losses = records.filter(r => r.score === -1).length;
        const ties = records.filter(r => r.score === 0).length;
        return { total: records.length, wins, losses, ties };
      } catch {
        return { total: 0, wins: 0, losses: 0, ties: 0 };
      }
    },
    async clearHistory(game: string) {
      try {
        await localDb.gameScores.where('game').equals(game).delete();
        notifyDbChange();
      } catch (err) {
        console.warn('Failed to clear game history:', err);
      }
    }
  },

  // ==========================================
  // Users & Authentication Repository
  // ==========================================
  users: {
    async authenticate(username: string, password: string): Promise<{ success: boolean; user?: { username: string; name: string; role: string }; message?: string }> {
      try {
        await localDb.initializeWithDefaults();
        const cleanUser = username.trim().toLowerCase();
        const cleanPass = password.trim();
        const encoded = btoa(cleanPass);

        // 1. Check local IndexedDB users table
        const localUser = await localDb.users.where('username').equalsIgnoreCase(cleanUser).first();
        if (localUser && localUser.passwordHash === encoded) {
          return {
            success: true,
            user: { username: localUser.username, name: localUser.name, role: localUser.role }
          };
        }

        // 2. Check Supabase cloud users table if connected
        const client = getSupabaseClient();
        if (client) {
          try {
            const { data } = await client
              .from('users')
              .select('*')
              .eq('username', cleanUser)
              .maybeSingle();

            if (data && data.password_hash === encoded) {
              await localDb.users.put({
                username: data.username,
                passwordHash: data.password_hash,
                role: data.role || 'admin',
                name: data.name || data.username,
                createdAt: data.created_at || new Date().toISOString()
              });
              return {
                success: true,
                user: { username: data.username, name: data.name || data.username, role: data.role || 'admin' }
              };
            }
          } catch (e) {
            console.warn('Cloud user auth lookup error:', e);
          }
        }

        return { success: false, message: 'Invalid username or password in database records.' };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Database authentication error.' };
      }
    },

    async getProfile(username: string) {
      await localDb.initializeWithDefaults();
      return await localDb.users.where('username').equalsIgnoreCase(username.trim()).first();
    },

    async getAll(): Promise<any[]> {
      await localDb.initializeWithDefaults();
      return await localDb.users.toArray();
    }
  },

  // ==========================================
  // Statistics & Sync Management
  // ==========================================
  async getStats() {
    await localDb.initializeWithDefaults();
    const studentsCount = await localDb.students.count();
    const teachersCount = await localDb.teachers.count();
    const attendanceCount = await localDb.attendance.count();
    const ipoCount = await localDb.ipo.count();

    const config = getSupabaseConfig();
    return {
      studentsCount,
      teachersCount,
      attendanceCount,
      ipoCount,
      totalRecords: studentsCount + teachersCount + attendanceCount + ipoCount,
      mode: config.mode,
      isCloudConfigured: config.isConfigured,
      cloudUrl: config.url,
    };
  },

  /**
   * Push all local data into Supabase Cloud with clean schema mapping
   */
  async syncLocalToCloud(): Promise<{ success: boolean; message: string; details?: any }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not configured. Please enter your project URL and Anon Key.' };
    }

    try {
      const students = await localDb.students.toArray();
      const teachers = await localDb.teachers.toArray();
      const attendance = await localDb.attendance.toArray();
      const ipo = await localDb.ipo.toArray();

      const syncedCounts = { students: 0, teachers: 0, attendance: 0, ipo: 0 };

      if (students.length > 0) {
        const mapped = students.map(s => ({
          id: s.id,
          name: s.name,
          age: s.age,
          grade: s.grade,
          gender: s.gender,
          email: s.email,
        }));
        const { error } = await client.from('students').upsert(mapped, { onConflict: 'id' });
        if (error) throw new Error(`Students table sync failed: ${error.message}`);
        syncedCounts.students = students.length;
      }

      if (teachers.length > 0) {
        const mapped = teachers.map(t => ({
          id: t.id,
          name: t.name,
          age: t.age,
          subject: t.subject,
          gender: t.gender,
          email: t.email,
        }));
        const { error } = await client.from('teachers').upsert(mapped, { onConflict: 'id' });
        if (error) throw new Error(`Teachers table sync failed: ${error.message}`);
        syncedCounts.teachers = teachers.length;
      }

      if (attendance.length > 0) {
        const mapped = attendance.map(a => ({
          id: a.id,
          name: a.name,
          role: a.role,
          gender: a.gender,
          date: a.date,
          status: a.status,
        }));
        const { error } = await client.from('attendance').upsert(mapped, { onConflict: 'id' });
        if (error) throw new Error(`Attendance table sync failed: ${error.message}`);
        syncedCounts.attendance = attendance.length;
      }

      if (ipo.length > 0) {
        const mapped = ipo.map(item => ({
          id: item.id,
          company: item.company,
          issue_size: item.issueSize,
          price_range: item.priceRange,
          min_investment: item.minInvestment,
          logo_name: item.logoName || null,
        }));
        const { error } = await client.from('ipo_list').upsert(mapped, { onConflict: 'id' });
        if (error) throw new Error(`IPO table sync failed: ${error.message}`);
        syncedCounts.ipo = ipo.length;
      }

      return {
        success: true,
        message: `Successfully uploaded ${syncedCounts.students} students, ${syncedCounts.teachers} teachers, ${syncedCounts.attendance} attendance records, and ${syncedCounts.ipo} IPOs to Supabase PostgreSQL!`,
        details: syncedCounts,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Sync to cloud failed' };
    }
  },

  /**
   * Pull all cloud data from Supabase into local IndexedDB
   */
  async syncCloudToLocal(): Promise<{ success: boolean; message: string; details?: any }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase client is not configured.' };
    }

    try {
      const [sRes, tRes, aRes, iRes] = await Promise.all([
        client.from('students').select('*').order('id', { ascending: true }),
        client.from('teachers').select('*').order('id', { ascending: true }),
        client.from('attendance').select('*').order('id', { ascending: true }),
        client.from('ipo_list').select('*').order('id', { ascending: true }),
      ]);

      if (sRes.error) throw sRes.error;
      if (tRes.error) throw tRes.error;
      if (aRes.error) throw aRes.error;
      if (iRes.error) throw iRes.error;

      if (sRes.data && sRes.data.length > 0) {
        const mapped: StudentRecord[] = sRes.data.map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          age: Number(item.age) || 18,
          grade: item.grade || 'A',
          gender: item.gender || 'Male',
          email: item.email || '',
          createdAt: item.created_at || new Date().toISOString(),
        }));
        await localDb.students.clear();
        await localDb.students.bulkPut(mapped);
        localStorage.setItem('dashboard_students_data', JSON.stringify(mapped));
      }

      if (tRes.data && tRes.data.length > 0) {
        const mapped: TeacherRecord[] = tRes.data.map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          age: Number(item.age) || 35,
          subject: item.subject || 'General',
          gender: item.gender || 'Female',
          email: item.email || '',
          createdAt: item.created_at || new Date().toISOString(),
        }));
        await localDb.teachers.clear();
        await localDb.teachers.bulkPut(mapped);
        localStorage.setItem('dashboard_teachers_data', JSON.stringify(mapped));
      }

      if (aRes.data && aRes.data.length > 0) {
        const mapped: AttendanceRecord[] = aRes.data.map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          role: item.role || 'Student',
          gender: item.gender || 'Male',
          date: item.date,
          status: item.status || 'Present',
        }));
        await localDb.attendance.clear();
        await localDb.attendance.bulkPut(mapped);
        localStorage.setItem('dashboard_attendance_data', JSON.stringify(mapped));
      }

      if (iRes.data && iRes.data.length > 0) {
        const mapped: IPORecord[] = iRes.data.map((item: any) => ({
          id: Number(item.id),
          company: item.company,
          issueSize: item.issue_size || item.issueSize,
          priceRange: item.price_range || item.priceRange,
          minInvestment: item.min_investment || item.minInvestment,
          logoName: item.logo_name || item.logoName,
          createdAt: item.created_at,
        }));
        await localDb.ipo.clear();
        await localDb.ipo.bulkPut(mapped);
        localStorage.setItem('dashboard_ipo_data', JSON.stringify(mapped));
      }

      notifyDbChange();

      return {
        success: true,
        message: `Successfully synchronized ${sRes.data?.length || 0} students, ${tRes.data?.length || 0} teachers, ${aRes.data?.length || 0} attendance records, and ${iRes.data?.length || 0} IPOs from Supabase Cloud to local device!`,
        details: {
          students: sRes.data?.length || 0,
          teachers: tRes.data?.length || 0,
          attendance: aRes.data?.length || 0,
          ipo: iRes.data?.length || 0,
        },
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Sync from cloud failed' };
    }
  },

  async exportBackup(): Promise<string> {
    const students = await localDb.students.toArray();
    const teachers = await localDb.teachers.toArray();
    const attendance = await localDb.attendance.toArray();
    const ipo = await localDb.ipo.toArray();
    const gameScores = await localDb.gameScores.toArray();

    const backup = {
      version: 2,
      exportDate: new Date().toISOString(),
      data: {
        students,
        teachers,
        attendance,
        ipo,
        gameScores,
      },
    };
    return JSON.stringify(backup, null, 2);
  },

  async importBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const backup = JSON.parse(jsonString);
      if (!backup.data) throw new Error('Invalid backup file structure.');

      if (backup.data.students?.length) {
        await localDb.students.clear();
        await localDb.students.bulkPut(backup.data.students);
        localStorage.setItem('dashboard_students_data', JSON.stringify(backup.data.students));
      }
      if (backup.data.teachers?.length) {
        await localDb.teachers.clear();
        await localDb.teachers.bulkPut(backup.data.teachers);
        localStorage.setItem('dashboard_teachers_data', JSON.stringify(backup.data.teachers));
      }
      if (backup.data.attendance?.length) {
        await localDb.attendance.clear();
        await localDb.attendance.bulkPut(backup.data.attendance);
        localStorage.setItem('dashboard_attendance_data', JSON.stringify(backup.data.attendance));
      }
      if (backup.data.ipo?.length) {
        await localDb.ipo.clear();
        await localDb.ipo.bulkPut(backup.data.ipo);
        localStorage.setItem('dashboard_ipo_data', JSON.stringify(backup.data.ipo));
      }

      notifyDbChange();
      return { success: true, message: 'Backup successfully imported into local database!' };
    } catch (e: any) {
      return { success: false, message: 'Import failed: ' + e.message };
    }
  },

  async resetToDefaults(): Promise<void> {
    await localDb.students.clear();
    await localDb.teachers.clear();
    await localDb.attendance.clear();
    await localDb.ipo.clear();
    await localDb.gameScores.clear();
    await localDb.initializeWithDefaults();

    localStorage.removeItem('dashboard_students_data');
    localStorage.removeItem('dashboard_teachers_data');
    localStorage.removeItem('dashboard_attendance_data');
    localStorage.removeItem('dashboard_ipo_data');

    notifyDbChange();
  },
};
