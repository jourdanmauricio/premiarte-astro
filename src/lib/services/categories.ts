import { turso } from '../turso';

export class CategoryService {
  static async getAllCategories({ featured }: { featured?: boolean }) {
    const query = `
      SELECT 
        c.id, c.name, c.slug, c.description, c.featured,
        i.id as imageId, i.url as imageUrl
      FROM Category c
      LEFT JOIN Image i ON c.imageId = i.id
      ${featured ? 'WHERE c.featured = ?' : ''}
      ORDER BY c.createdAt DESC
    `;

    const { rows } = await turso.execute({
      sql: query,
      args: featured ? [featured] : [],
    });

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
}
