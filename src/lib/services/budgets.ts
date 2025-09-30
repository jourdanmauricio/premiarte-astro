import { turso } from '../turso';

export class BudgetService {
  static async getAllBudgets() {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Budget ORDER BY createdAt DESC',
      args: [],
    });
    return rows;
  }

  static async getBudgetById(id: number) {
    const { rows } = await turso.execute({
      sql: `SELECT 
      b.id as budget_id,
      c.name, 
      c.email,
      c.phone,
      c.observation,
      c.totalAmount,
      q.status,
      q.userId,
      q.isRead,
      q.expiresAt,
      q.approvedAt,
      q.rejectedAt,
      q.createdAt,
      q.updatedAt,
      qi.id as item_id,
      qi.productId,
      qi.sku,
      qi.slug,
      qi.name as item_name,
      qi.imageUrl,
      qi.imageAlt,
      qi.price,
      qi.quantity,
      qi.amount,
      qi.observation as item_observation
    FROM Budget q
    LEFT JOIN BudgetItem qi ON q.id = qi.budgetId,
    LEFT JOIN Customer c ON q.customerId = c.id
    WHERE q.id = ?`,
      args: [id],
    });

    if (rows.length === 0) {
      return null;
    }

    // El primer row contiene los datos del budget
    const firstRow = rows[0];
    const budget = {
      id: firstRow.budget_id,
      name: firstRow.name,
      email: firstRow.email,
      phone: firstRow.phone,
      observation: firstRow.observation,
      totalAmount: firstRow.totalAmount,
      status: firstRow.status,
      userId: firstRow.userId,
      isRead: firstRow.isRead,
      expiresAt: firstRow.expiresAt,
      approvedAt: firstRow.approvedAt,
      rejectedAt: firstRow.rejectedAt,
      createdAt: firstRow.createdAt,
      updatedAt: firstRow.updatedAt,
    };

    // Procesar todos los items (incluyendo el caso donde no hay items)
    const items = rows
      .filter((row) => row.item_id !== null) // Filtrar rows donde hay items
      .map((row) => ({
        id: row.item_id,
        productId: row.productId,
        sku: row.sku,
        slug: row.slug,
        name: row.item_name,
        imageUrl: row.imageUrl,
        imageAlt: row.imageAlt,
        price: row.price,
        quantity: row.quantity,
        amount: row.amount,
        observation: row.item_observation,
      }));

    return {
      ...budget,
      items,
    };
  }

  static async deleteBudget(id: number) {
    await turso.execute({
      sql: 'DELETE FROM Budget WHERE id = ?',
      args: [id],
    });
  }

  static async createBudget(data: {
    customerId: number;
    observation?: string;
    userId?: string;
    items: {
      productId: number;
      sku: string;
      slug: string;
      name: string;
      imageUrl: string;
      imageAlt: string;
      price?: number | null;
      quantity: number;
      observation?: string;
    }[];
  }) {
    // Calcular el monto total del presupuesto
    const totalAmount = data.items.reduce((total, item) => {
      const price = item.price || 0;
      return total + price * item.quantity;
    }, 0);

    // Crear el presupuesto principal
    const { rows: budgetRows } = await turso.execute({
      sql: `
        INSERT INTO Budget (customerId, observation, totalAmount, userId)
        VALUES (?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        data.customerId,
        data.observation || null,
        totalAmount,
        data.userId || null,
      ],
    });

    const budget = budgetRows[0];
    const budgetId = budget.id as number;

    // Crear los items del presupuesto
    for (const item of data.items) {
      const price = item.price || 0;
      const amount = price * item.quantity;

      await turso.execute({
        sql: `
          INSERT INTO BudgetItem (
            budgetId, productId, sku, slug, name, imageUrl, imageAlt, 
            price, quantity, amount, observation
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          budgetId,
          item.productId,
          item.sku,
          item.slug,
          item.name,
          item.imageUrl,
          item.imageAlt,
          price,
          item.quantity,
          amount,
          item.observation || null,
        ],
      });
    }

    return budget;
  }

  static async updateBudgetStatus(
    id: number,
    status: 'pending' | 'approved' | 'rejected' | 'expired'
  ) {
    const statusDate =
      status === 'approved'
        ? 'approvedAt'
        : status === 'rejected'
          ? 'rejectedAt'
          : null;

    let sql = 'UPDATE Budget SET status = ?, updatedAt = CURRENT_TIMESTAMP';
    let args: any[] = [status];

    if (statusDate) {
      sql += `, ${statusDate} = CURRENT_TIMESTAMP`;
    }

    sql += ' WHERE id = ? RETURNING *';
    args.push(id);

    const { rows } = await turso.execute({ sql, args });
    return rows[0];
  }

  static async markBudgetAsRead(id: number) {
    const { rows } = await turso.execute({
      sql: 'UPDATE Budget SET isRead = TRUE, updatedAt = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      args: [id],
    });
    return rows[0];
  }
}
