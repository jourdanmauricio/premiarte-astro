import { turso } from './turso';

// Utilidades para trabajar con Turso
export class Database {
  // CATEGORÍAS
  static async getAllCategories() {
    const { rows } = await turso.execute(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.featured,
        i.id as imageId, i.url as imageUrl
      FROM Category c
      LEFT JOIN Image i ON c.imageId = i.id
      ORDER BY c.createdAt DESC
    `);

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      featured: Boolean(row.featured),
      image: row.imageId
        ? {
            id: row.imageId,
            url: row.imageUrl,
          }
        : null,
    }));
  }

  static async createCategory(data: {
    name: string;
    slug: string;
    description: string;
    imageId: number;
    featured?: boolean;
  }) {
    const { rows } = await turso.execute({
      sql: `
        INSERT INTO Category (name, slug, description, imageId, featured)
        VALUES (?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        data.name,
        data.slug,
        data.description,
        data.imageId,
        data.featured || false,
      ],
    });

    return rows[0];
  }

  static async updateCategory(
    id: number,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      imageId?: number;
      featured?: boolean;
    }
  ) {
    const updates = [];
    const args = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      args.push(data.name);
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?');
      args.push(data.slug);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      args.push(data.description);
    }
    if (data.imageId !== undefined) {
      updates.push('imageId = ?');
      args.push(data.imageId);
    }
    if (data.featured !== undefined) {
      updates.push('featured = ?');
      args.push(data.featured);
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(id);

    const { rows } = await turso.execute({
      sql: `UPDATE Category SET ${updates.join(', ')} WHERE id = ? RETURNING *`,
      args,
    });

    return rows[0];
  }

  static async getCategoryById(id: number) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Category WHERE id = ?',
      args: [id],
    });
    return rows[0] || null;
  }

  static async getCategoryBySlug(slug: string) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Category WHERE slug = ?',
      args: [slug],
    });
    return rows[0] || null;
  }

  static async deleteCategory(id: number) {
    await turso.execute({
      sql: 'DELETE FROM Category WHERE id = ?',
      args: [id],
    });
    return true;
  }

  static async countProductsByCategory(categoryId: number) {
    const { rows } = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM Product WHERE categoryId = ?',
      args: [categoryId],
    });
    return rows[0]?.count || 0;
  }

  static async getImageById(id: number) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Image WHERE id = ?',
      args: [id],
    });
    return rows[0] || null;
  }

  // PRODUCTOS
  static async getAllProducts() {
    const { rows } = await turso.execute(`
      SELECT 
        p.*,
        c.name as categoryName,
        c.slug as categorySlug
      FROM Product p
      LEFT JOIN Category c ON p.categoryId = c.id
      ORDER BY p.createdAt DESC
    `);

    return rows.map((row) => ({
      ...row,
      isActive: Boolean(row.isActive),
      isFeatured: Boolean(row.isFeatured),
      category: row.categoryName
        ? {
            id: row.categoryId,
            name: row.categoryName,
            slug: row.categorySlug,
          }
        : null,
      images: null, // Temporal
      categories: null, // Temporal
      relatedProducts: [], // Temporal
    }));
  }

  // IMÁGENES
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

  // CONFIGURACIONES
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
