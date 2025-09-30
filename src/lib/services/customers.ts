import { turso } from '../turso';

export class CustomerService {
  static async getCustomerByEmail(email: string) {
    const { rows } = await turso.execute({
      sql: `
        SELECT * FROM Customer 
        WHERE email = ?
      `,
      args: [email],
    });
    return rows[0] || null;
  }

  static async createCustomer(data: {
    name: string;
    email: string;
    phone: string;
    type?: 'wholesale' | 'retail';
    document?: string;
    address?: string;
    observation?: string;
  }) {
    const { rows } = await turso.execute({
      sql: `
        INSERT INTO Customer (name, email, phone, type, document, address, observation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        data.name,
        data.email,
        data.phone,
        data.type || 'retail',
        data.document || null,
        data.address || null,
        data.observation || null,
      ],
    });
    return rows[0];
  }

  static async getOrCreateCustomer(data: {
    name: string;
    email: string;
    phone: string;
    type?: 'wholesale' | 'retail';
    document?: string;
    address?: string;
    observation?: string;
  }) {
    // Primero intentar obtener el customer existente
    const existingCustomer = await this.getCustomerByEmail(data.email);

    if (existingCustomer) {
      // Si existe, actualizar datos si es necesario
      const { rows } = await turso.execute({
        sql: `
          UPDATE Customer 
          SET name = ?, phone = ?, type = ?, document = ?, address = ?, observation = ?, updatedAt = CURRENT_TIMESTAMP
          WHERE email = ?
          RETURNING *
        `,
        args: [
          data.name,
          data.phone,
          data.type || 'retail',
          data.document || null,
          data.address || null,
          data.observation || null,
          data.email,
        ],
      });
      return rows[0];
    }

    // Si no existe, crear uno nuevo
    return await this.createCustomer(data);
  }
}
