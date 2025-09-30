import { turso } from '../turso';

export class ContactService {
  static async createContact(data: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }) {
    const { rows } = await turso.execute({
      sql: `
        INSERT INTO Contact (name, email, phone, message)
        VALUES (?, ?, ?, ?)
        RETURNING *
      `,
      args: [data.name, data.email, data.phone, data.message],
    });
    return rows[0];
  }

  static async getAllContacts() {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Contact ORDER BY createdAt DESC',
      args: [],
    });
    return rows;
  }

  static async getContactById(id: number) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Contact WHERE id = ?',
      args: [id],
    });
    return rows[0] || null;
  }

  static async markContactAsRead(id: number) {
    const { rows } = await turso.execute({
      sql: 'UPDATE Contact SET isRead = TRUE, updatedAt = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      args: [id],
    });
    return rows[0];
  }

  static async deleteContact(id: number) {
    await turso.execute({
      sql: 'DELETE FROM Contact WHERE id = ?',
      args: [id],
    });
    return true;
  }
}
