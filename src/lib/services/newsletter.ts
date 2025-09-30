import { turso } from '../turso';

export class NewsletterService {
  static async getAllNewsletter() {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM NewsletterSubscriber ORDER BY createdAt DESC',
      args: [],
    });
    return rows;
  }

  static async deleteNewsletter(id: number) {
    await turso.execute({
      sql: 'DELETE FROM NewsletterSubscriber WHERE id = ?',
      args: [id],
    });
    return true;
  }

  static async getNewsletterById(id: number) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM NewsletterSubscriber WHERE id = ?',
      args: [id],
    });
    return rows[0] || null;
  }

  static async updateNewsletter(
    id: number,
    data: {
      isActive?: boolean;
    }
  ) {
    const { rows } = await turso.execute({
      sql: 'UPDATE NewsletterSubscriber SET isActive = ? WHERE id = ?',
      args: [data.isActive ?? true, id],
    });
    return rows[0] || null;
  }

  static async createNewsletterSubscriber(data: {
    name: string;
    email: string;
  }) {
    const { rows } = await turso.execute({
      sql: `
        INSERT INTO NewsletterSubscriber (name, email)
        VALUES (?, ?)
        RETURNING *
      `,
      args: [data.name, data.email],
    });
    return rows[0];
  }

  static async getNewsletterSubscriberByEmail(email: string) {
    const { rows } = await turso.execute({
      sql: `
        SELECT * FROM NewsletterSubscriber 
        WHERE email = ?
      `,
      args: [email],
    });
    return rows[0] || null;
  }

  static async reactivateNewsletterSubscriber(email: string) {
    const { rows } = await turso.execute({
      sql: `
        UPDATE NewsletterSubscriber 
        SET isActive = TRUE, unsubscribedAt = NULL, updatedAt = CURRENT_TIMESTAMP
        WHERE email = ?
        RETURNING *
      `,
      args: [email],
    });
    return rows[0];
  }

  static async getAllNewsletterSubscribers({
    active,
  }: { active?: boolean } = {}) {
    const query = `
      SELECT * FROM NewsletterSubscriber
      ${active !== undefined ? 'WHERE isActive = ?' : ''}
      ORDER BY subscribedAt DESC
    `;

    const { rows } = await turso.execute({
      sql: query,
      args: active !== undefined ? [active] : [],
    });

    return rows;
  }

  static async unsubscribeFromNewsletter(email: string) {
    const { rows } = await turso.execute({
      sql: `
        UPDATE NewsletterSubscriber 
        SET isActive = FALSE, unsubscribedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
        WHERE email = ?
        RETURNING *
      `,
      args: [email],
    });
    return rows[0];
  }
}
