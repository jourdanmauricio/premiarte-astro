import { turso } from '../turso';

export class ResponsibleService {
  static async getAllResponsibles() {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Responsible ORDER BY createdAt DESC',
      args: [],
    });
    return rows;
  }

  static async getResponsibleById(id: number) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Responsible WHERE id = ?',
      args: [id],
    });
    return rows[0] || null;
  }

  static async getResponsibleByCuit(cuit: string) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Responsible WHERE cuit = ?',
      args: [cuit],
    });
    return rows[0] || null;
  }

  static async createResponsible(data: {
    name: string;
    cuit: string;
    condition: string;
    observation?: string;
  }) {
    const { rows } = await turso.execute({
      sql: `
        INSERT INTO Responsible (name, cuit, condition, observation)
        VALUES (?, ?, ?, ?)
        RETURNING *
      `,
      args: [data.name, data.cuit, data.condition, data.observation || null],
    });
    return rows[0];
  }

  static async updateResponsible(
    id: number,
    data: {
      name: string;
      cuit: string;
      condition: string;
      observation?: string;
    }
  ) {
    const { rows } = await turso.execute({
      sql: `
        UPDATE Responsible 
        SET name = ?, cuit = ?, condition = ?, observation = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
        RETURNING *
      `,
      args: [
        data.name,
        data.cuit,
        data.condition,
        data.observation || null,
        id,
      ],
    });

    return rows[0];
  }

  static async deleteResponsible(id: number) {
    await turso.execute({
      sql: 'DELETE FROM Responsible WHERE id = ?',
      args: [id],
    });
    return true;
  }

  static async countBudgetsByResponsible(responsibleId: number) {
    const { rows } = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM Budget WHERE responsibleId = ?',
      args: [responsibleId],
    });
    return rows[0].count;
  }

  static async getResponsiblesWithBudgetCount() {
    const { rows } = await turso.execute({
      sql: `
        SELECT 
          r.*,
          COUNT(b.id) as budgetCount
        FROM Responsible r
        LEFT JOIN Budget b ON r.id = b.responsibleId
        GROUP BY r.id
        ORDER BY r.createdAt DESC
      `,
      args: [],
    });
    return rows;
  }
}
