import { turso } from '../turso';

export class BudgetService {
  static async getAllBudgets() {
    const { rows } = await turso.execute({
      sql: `SELECT 
        b.*,
        c.name,
        c.email,
        c.phone
      FROM Budget b
      LEFT JOIN Customer c ON b.customerId = c.id
      ORDER BY b.createdAt DESC`,
      args: [],
    });
    return rows;
  }

  static async getBudgetById(id: number) {
    const { rows } = await turso.execute({
      sql: `SELECT 
      b.id,
      b.customerId,
      c.name, 
      c.email,
      c.phone,
      b.type,
      b.observation,
      b.totalAmount,
      b.status,
      b.userId,
      b.isRead,
      b.expiresAt,
      b.approvedAt,
      b.rejectedAt,
      b.responsibleId,
      p.sku,
      p.slug,
      p.name as item_name,
      b.createdAt,
      i.url as imageUrl,
      i.alt as imageAlt,
      bi.retailPrice,
      bi.wholesalePrice,
      bi.price,
      bi.id as item_id,
      bi.productId,
      bi.quantity,
      bi.amount,
      bi.observation as item_observation

    FROM Budget b
    LEFT JOIN BudgetItem bi ON b.id = bi.budgetId
    LEFT JOIN Customer c ON b.customerId = c.id
    LEFT JOIN Product p ON bi.productId = p.id
    LEFT JOIN (
      SELECT pi1.productId, pi1.imageId
      FROM ProductImage pi1
      WHERE pi1.id = (
        SELECT pi2.id 
        FROM ProductImage pi2 
        WHERE pi2.productId = pi1.productId 
        ORDER BY pi2.isPrimary DESC, pi2.order_index ASC, pi2.id ASC
        LIMIT 1
      )
    ) pi ON p.id = pi.productId
    LEFT JOIN Image i ON pi.imageId = i.id
    WHERE b.id = ?`,
      args: [id],
    });

    if (rows.length === 0) {
      return null;
    }

    // El primer row contiene los datos del budget
    const firstRow = rows[0];
    const budget = {
      id: firstRow.id,
      name: firstRow.name,
      customerId: firstRow.customerId,
      email: firstRow.email,
      phone: firstRow.phone,
      responsibleId: firstRow.responsibleId,
      type: firstRow.type,
      observation: firstRow.observation,
      totalAmount: firstRow.totalAmount,
      status: firstRow.status,
      userId: firstRow.userId,
      isRead: firstRow.isRead,
      expiresAt: firstRow.expiresAt,
      approvedAt: firstRow.approvedAt,
      rejectedAt: firstRow.rejectedAt,
      createdAt: firstRow.createdAt,
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
        retailPrice: row.retailPrice,
        wholesalePrice: row.wholesalePrice,
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

  static async createBudget(data: {
    customerId: number;
    responsibleId: number;
    observation?: string;
    userId?: string;
    totalAmount: number;
    type: string;
    status: string;
    expiresAt?: string;
    items: {
      productId: number;
      amount: number;
      retailPrice: number;
      wholesalePrice: number;
      price: number;
      quantity: number;
      observation?: string;
    }[];
  }) {
    const { rows: budgetRows } = await turso.execute({
      sql: `
        INSERT INTO Budget (customerId, responsibleId, observation, userId, totalAmount, type, status, expiresAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        data.customerId,
        data.observation || null,
        data.responsibleId,
        data.userId || null,
        data.totalAmount,
        data.type,
        data.status,
        data.expiresAt || null,
      ],
    });

    const budget = budgetRows[0];
    const budgetId = budget.id as number;

    // Crear los items del presupuesto
    for (const item of data.items) {
      await turso.execute({
        sql: `
          INSERT INTO BudgetItem (
            budgetId, productId, quantity, retailPrice, wholesalePrice, price, amount, observation
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          budgetId,
          item.productId,
          item.quantity,
          item.retailPrice,
          item.wholesalePrice,
          item.price,
          item.amount,
          item.observation || '',
        ],
      });
    }

    return budget;
  }

  static async updateBudget(
    id: number,
    data: {
      observation?: string;
      totalAmount?: number;
      status?: string;
      expiresAt?: string;
      type?: string;
      responsibleId?: number;
      items?: {
        productId?: number;
        quantity?: number;
        retailPrice?: number;
        wholesalePrice?: number;
        price?: number;
        amount?: number;
        observation?: string;
        id?: number;
      }[];
    }
  ) {
    console.log('data!!!!!!!', data);
    const { rows } = await turso.execute({
      sql: 'UPDATE Budget SET observation = ?, totalAmount = ?, status = ?, expiresAt = ?, type = ?, responsibleId = ? WHERE id = ? RETURNING *',
      args: [
        data.observation || null,
        data.totalAmount || null,
        data.status || null,
        data.expiresAt || null,
        data.type || null,
        data.responsibleId || null,
        id,
      ],
    });

    // Eliminar los items del presupuesto
    await turso.execute({
      sql: 'DELETE FROM BudgetItem WHERE budgetId = ?',
      args: [id],
    });

    // Crear los items del presupuesto
    for (const item of data.items || []) {
      await turso.execute({
        sql: `
          INSERT INTO BudgetItem (
            budgetId, productId, quantity, retailPrice, wholesalePrice, price, amount, observation
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          item.productId || 0,
          item.quantity || 0,
          item.retailPrice || 0,
          item.wholesalePrice || 0,
          item.price || 0,
          item.amount || 0,
          item.observation || '',
        ],
      });
    }

    return rows[0];
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

  static async deleteBudget(id: number) {
    await turso.execute({
      sql: 'DELETE FROM Budget WHERE id = ?',
      args: [id],
    });
  }
}
