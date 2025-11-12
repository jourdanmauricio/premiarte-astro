import { turso } from '../turso';

export class OrderService {
  static async getAllOrders() {
    const { rows } = await turso.execute({
      sql: `SELECT 
        o.*,
        c.name,
        c.email,
        c.phone
      FROM "Order" o
      LEFT JOIN Customer c ON o.customerId = c.id
      ORDER BY o.createdAt DESC`,
      args: [],
    });
    return rows;
  }

  static async getOrderById(id: number) {
    const { rows } = await turso.execute({
      sql: `SELECT 
      o.id,
      o.customerId,
      c.name, 
      c.email,
      c.phone,
      o.type,
      o.observation,
      o.totalAmount,
      o.status,
      p.sku,
      p.slug,
      p.name as item_name,
      o.createdAt,
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
    FROM "Order" o
    LEFT JOIN OrderItem bi ON o.id = bi.orderId
    LEFT JOIN Customer c ON o.customerId = c.id
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
    WHERE o.id = ?`,
      args: [id],
    });

    if (rows.length === 0) {
      return null;
    }

    // El primer row contiene los datos del pedido
    const firstRow = rows[0];
    const order = {
      id: firstRow.id,
      name: firstRow.name,
      customerId: firstRow.customerId,
      email: firstRow.email,
      phone: firstRow.phone,
      type: firstRow.type,
      observation: firstRow.observation,
      totalAmount: firstRow.totalAmount,
      status: firstRow.status,
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
      ...order,
      items,
    };
  }

  static async createOrder(data: {
    customerId: number;
    observation?: string;
    totalAmount: number;
    type: string;
    status: string;
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
    const { rows: orderRows } = await turso.execute({
      sql: `
        INSERT INTO "Order" (customerId, observation, totalAmount, type, status)
        VALUES (?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        data.customerId,
        data.observation || null,
        data.totalAmount,
        data.type,
        data.status,
      ],
    });

    const order = orderRows[0];
    const orderId = order.id as number;

    // Crear los items del presupuesto
    for (const item of data.items) {
      await turso.execute({
        sql: `
          INSERT INTO OrderItem (
            orderId, productId, quantity, retailPrice, wholesalePrice, price, amount, observation
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          orderId,
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

    return order;
  }

  static async updateOrder(
    id: number,
    data: {
      observation?: string;
      totalAmount?: number;
      status?: string;
      type?: string;
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
    const { rows } = await turso.execute({
      sql: 'UPDATE "Order" SET observation = ?, totalAmount = ?, status = ?, type = ? WHERE id = ? RETURNING *',
      args: [
        data.observation || null,
        data.totalAmount || null,
        data.status || null,
        data.type || null,
        id,
      ],
    });

    // Eliminar los items del presupuesto
    await turso.execute({
      sql: 'DELETE FROM OrderItem WHERE orderId = ?',
      args: [id],
    });

    // Crear los items del presupuesto
    for (const item of data.items || []) {
      await turso.execute({
        sql: `
          INSERT INTO OrderItem (
            orderId, productId, quantity, retailPrice, wholesalePrice, price, amount, observation
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

  static async updateOrderStatus(
    id: number,
    status: 'pending' | 'approved' | 'rejected' | 'expired'
  ) {
    const statusDate =
      status === 'approved'
        ? 'approvedAt'
        : status === 'rejected'
          ? 'rejectedAt'
          : null;

    let sql = 'UPDATE "Order" SET status = ?, updatedAt = CURRENT_TIMESTAMP';
    let args: any[] = [status];

    if (statusDate) {
      sql += `, ${statusDate} = CURRENT_TIMESTAMP`;
    }

    sql += ' WHERE id = ? RETURNING *';
    args.push(id);

    const { rows } = await turso.execute({ sql, args });
    return rows[0];
  }

  //   static async markOrderAsRead(id: number) {
  //     const { rows } = await turso.execute({
  //       sql: 'UPDATE Order SET isRead = TRUE, updatedAt = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
  //       args: [id],
  //     });
  //     return rows[0];
  //   }

  static async deleteOrder(id: number) {
    await turso.execute({
      sql: 'DELETE FROM "Order" WHERE id = ?',
      args: [id],
    });
  }
}
