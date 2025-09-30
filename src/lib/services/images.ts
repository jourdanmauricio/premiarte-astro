import { turso } from '../turso';

export class ImageService {
  static async getAllImages() {
    const { rows } = await turso.execute(`
      SELECT * FROM Image ORDER BY createdAt DESC
    `);
    return rows;
  }

  static async createImage(data: {
    url: string;
    alt: string;
    tag?: string;
    observation?: string;
  }) {
    const { rows } = await turso.execute({
      sql: `
        INSERT INTO Image (url, alt, tag, observation)
        VALUES (?, ?, ?, ?)
        RETURNING *
      `,
      args: [data.url, data.alt, data.tag || null, data.observation || null],
    });

    return rows[0];
  }

  static async updateImage(
    id: number,
    data: {
      url?: string;
      alt?: string;
      tag?: string;
      observation?: string;
    }
  ) {
    const updates = [];
    const args = [];

    if (data.url !== undefined) {
      updates.push('url = ?');
      args.push(data.url);
    }
    if (data.alt !== undefined) {
      updates.push('alt = ?');
      args.push(data.alt);
    }
    if (data.tag !== undefined) {
      updates.push('tag = ?');
      args.push(data.tag);
    }
    if (data.observation !== undefined) {
      updates.push('observation = ?');
      args.push(data.observation);
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(id);

    const { rows } = await turso.execute({
      sql: `UPDATE Image SET ${updates.join(', ')} WHERE id = ? RETURNING *`,
      args,
    });

    return rows[0];
  }

  static async deleteImage(id: number) {
    await turso.execute({
      sql: 'DELETE FROM Image WHERE id = ?',
      args: [id],
    });
    return true;
  }

  static async getImageById(id: number) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Image WHERE id = ?',
      args: [id],
    });
    return rows[0] || null;
  }
}
