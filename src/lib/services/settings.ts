import { turso } from '../turso';

export class SettingService {
  static async getAllSettings() {
    const { rows } = await turso.execute('SELECT * FROM Setting ORDER BY key');
    return rows;
  }

  static async getSetting(key: string) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Setting WHERE key = ?',
      args: [key],
    });
    return rows[0] || null;
  }

  static async setSetting(key: string, value: string) {
    const { rows } = await turso.execute({
      sql: `
        INSERT INTO Setting (key, value) 
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET 
          value = excluded.value,
          updatedAt = CURRENT_TIMESTAMP
        RETURNING *
      `,
      args: [key, value],
    });
    return rows[0];
  }
}
