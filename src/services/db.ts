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

      if (config.mode === 'cloud' && client) {
        try {
          const { data, error } = await client
            .from('students')
            .select('*')
            .order('id', { ascending: true });
          if (!error && data && data.length > 0) {
            // Cache in localDb
            await localDb.students.bulkPut(data);
            return data as StudentRecord[];
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
      const newId = student.id || (all.length ? Math.max(...all.map(s => s.id)) + 1 : 1);
      const record: StudentRecord = {
        ...student,
        id: newId,
        createdAt: new Date().toISOString(),
      };

      await localDb.students.put(record);
      // Keep localStorage in sync for backward compatibility
      const updated = await localDb.students.toArray();
      localStorage.setItem('dashboard_students_data', JSON.stringify(updated));

      // Sync to cloud if configured
      const client = getSupabaseClient();
      if (client) {
        client.from('students').upsert(record).then(({ error }) => {
          if (error) console.warn('Supabase student sync warning:', error);
        });
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
        client.from('students').update(changes).eq('id', id).then(({ error }) => {
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

      if (config.mode === 'cloud' && client) {
        try {
          const { data, error } = await client
            .from('teachers')
            .select('*')
            .order('id', { ascending: true });
          if (!error && data && data.length > 0) {
            await localDb.teachers.bulkPut(data);
            return data as TeacherRecord[];
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
      const newId = teacher.id || (all.length ? Math.max(...all.map(t => t.id)) + 1 : 1);
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
        client.from('teachers').upsert(record).then(({ error }) => {
          if (error) console.warn('Supabase teacher sync warning:', error);
        });
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
        client.from('teachers').update(changes).eq('id', id).then(({ error }) => {
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

      if (config.mode === 'cloud' && client) {
        try {
          const { data, error } = await client
            .from('attendance')
            .select('*')
            .order('id', { ascending: true });
          if (!error && data && data.length > 0) {
            await localDb.attendance.bulkPut(data);
            return data as AttendanceRecord[];
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
        const updated = { ...existing, status: newStatus, updatedAt: new Date().toISOString() };
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
      const newId = record.id || (all.length ? Math.max(...all.map(a => a.id)) + 1 : 1);
      const newRecord: AttendanceRecord = { ...record, id: newId };

      await localDb.attendance.put(newRecord);
      const updated = await localDb.attendance.toArray();
      localStorage.setItem('dashboard_attendance_data', JSON.stringify(updated));

      const client = getSupabaseClient();
      if (client) {
        client.from('attendance').upsert(newRecord).then(({ error }) => {
          if (error) console.warn('Supabase attendance add warning:', error);
        });
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

      if (config.mode === 'cloud' && client) {
        try {
          const { data, error } = await client
            .from('ipo_list')
            .select('*')
            .order('id', { ascending: true });
          if (!error && data && data.length > 0) {
            // Map logo_name or logoName
            const mapped: IPORecord[] = data.map((item: any) => ({
              id: item.id,
              company: item.company,
              issueSize: item.issue_size || item.issueSize,
              priceRange: item.price_range || item.priceRange,
              minInvestment: item.min_investment || item.minInvestment,
              logoName: item.logo_name || item.logoName,
              createdAt: item.created_at,
            }));
            await localDb.ipo.bulkPut(mapped);
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
      const newId = ipoItem.id || (all.length ? Math.max(...all.map(i => i.id)) + 1 : 1);
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
        client.from('ipo_list').upsert({
          id: record.id,
          company: record.company,
          issue_size: record.issueSize,
          price_range: record.priceRange,
          min_investment: record.minInvestment,
          logo_name: record.logoName,
        }).then(({ error }) => {
          if (error) console.warn('Supabase IPO add warning:', error);
        });
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
   * Push all local data into Supabase Cloud
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

      let syncedCounts = { students: 0, teachers: 0, attendance: 0, ipo: 0 };

      if (students.length > 0) {
        const { error } = await client.from('students').upsert(students);
        if (error) throw new Error(`Students table sync failed: ${error.message}`);
        syncedCounts.students = students.length;
      }

      if (teachers.length > 0) {
        const { error } = await client.from('teachers').upsert(teachers);
        if (error) throw new Error(`Teachers table sync failed: ${error.message}`);
        syncedCounts.teachers = teachers.length;
      }

      if (attendance.length > 0) {
        const { error } = await client.from('attendance').upsert(attendance);
        if (error) throw new Error(`Attendance table sync failed: ${error.message}`);
        syncedCounts.attendance = attendance.length;
      }

      if (ipo.length > 0) {
        const ipoMapped = ipo.map(item => ({
          id: item.id,
          company: item.company,
          issue_size: item.issueSize,
          price_range: item.priceRange,
          min_investment: item.minInvestment,
          logo_name: item.logoName || null,
        }));
        const { error } = await client.from('ipo_list').upsert(ipoMapped);
        if (error) throw new Error(`IPO table sync failed: ${error.message}`);
        syncedCounts.ipo = ipo.length;
      }

      return {
        success: true,
        message: `Successfully uploaded ${syncedCounts.students} students, ${syncedCounts.teachers} teachers, ${syncedCounts.attendance} attendance records, and ${syncedCounts.ipo} IPOs to free Supabase PostgreSQL cloud!`,
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
        client.from('students').select('*'),
        client.from('teachers').select('*'),
        client.from('attendance').select('*'),
        client.from('ipo_list').select('*'),
      ]);

      if (sRes.error) throw sRes.error;
      if (tRes.error) throw tRes.error;
      if (aRes.error) throw aRes.error;
      if (iRes.error) throw iRes.error;

      if (sRes.data && sRes.data.length > 0) {
        await localDb.students.clear();
        await localDb.students.bulkPut(sRes.data);
        localStorage.setItem('dashboard_students_data', JSON.stringify(sRes.data));
      }

      if (tRes.data && tRes.data.length > 0) {
        await localDb.teachers.clear();
        await localDb.teachers.bulkPut(tRes.data);
        localStorage.setItem('dashboard_teachers_data', JSON.stringify(tRes.data));
      }

      if (aRes.data && aRes.data.length > 0) {
        await localDb.attendance.clear();
        await localDb.attendance.bulkPut(aRes.data);
        localStorage.setItem('dashboard_attendance_data', JSON.stringify(aRes.data));
      }

      if (iRes.data && iRes.data.length > 0) {
        const mapped: IPORecord[] = iRes.data.map((item: any) => ({
          id: item.id,
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
        message: 'Successfully pulled latest records from Supabase into Local DB!',
        details: {
          students: sRes.data?.length || 0,
          teachers: tRes.data?.length || 0,
          attendance: aRes.data?.length || 0,
          ipo: iRes.data?.length || 0,
        },
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Pull from cloud failed' };
    }
  },

  /**
   * Export all database records to JSON string
   */
  async exportBackup(): Promise<string> {
    const students = await localDb.students.toArray();
    const teachers = await localDb.teachers.toArray();
    const attendance = await localDb.attendance.toArray();
    const ipo = await localDb.ipo.toArray();

    const dump = {
      app: 'Rishabh Tech Dashboard',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tables: {
        students,
        teachers,
        attendance,
        ipo,
      },
    };
    return JSON.stringify(dump, null, 2);
  },

  /**
   * Import all database records from JSON string
   */
  async importBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      const tables = parsed.tables || parsed;

      if (tables.students && Array.isArray(tables.students)) {
        await localDb.students.clear();
        await localDb.students.bulkPut(tables.students);
        localStorage.setItem('dashboard_students_data', JSON.stringify(tables.students));
      }
      if (tables.teachers && Array.isArray(tables.teachers)) {
        await localDb.teachers.clear();
        await localDb.teachers.bulkPut(tables.teachers);
        localStorage.setItem('dashboard_teachers_data', JSON.stringify(tables.teachers));
      }
      if (tables.attendance && Array.isArray(tables.attendance)) {
        await localDb.attendance.clear();
        await localDb.attendance.bulkPut(tables.attendance);
        localStorage.setItem('dashboard_attendance_data', JSON.stringify(tables.attendance));
      }
      if (tables.ipo && Array.isArray(tables.ipo)) {
        await localDb.ipo.clear();
        await localDb.ipo.bulkPut(tables.ipo);
        localStorage.setItem('dashboard_ipo_data', JSON.stringify(tables.ipo));
      }

      notifyDbChange();
      return { success: true, message: 'Database backup successfully restored!' };
    } catch (err: any) {
      return { success: false, message: `Import error: ${err.message}` };
    }
  },

  /**
   * Reset local database to factory seed data
   */
  async resetToDefaults(): Promise<void> {
    await localDb.students.clear();
    await localDb.students.bulkPut(defaultStudents);
    localStorage.setItem('dashboard_students_data', JSON.stringify(defaultStudents));

    await localDb.teachers.clear();
    await localDb.teachers.bulkPut(defaultTeachers);
    localStorage.setItem('dashboard_teachers_data', JSON.stringify(defaultTeachers));

    await localDb.attendance.clear();
    await localDb.attendance.bulkPut(defaultAttendance);
    localStorage.setItem('dashboard_attendance_data', JSON.stringify(defaultAttendance));

    await localDb.ipo.clear();
    await localDb.ipo.bulkPut(defaultIpo);
    localStorage.setItem('dashboard_ipo_data', JSON.stringify(defaultIpo));

    notifyDbChange();
  },
};
