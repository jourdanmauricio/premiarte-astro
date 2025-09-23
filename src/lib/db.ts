import { turso } from './turso';

// Utilidades para trabajar con Turso
export class Database {
  // NEWSLETTER
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

  // CATEGORÍAS
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

  static async getImageById(id: number) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Image WHERE id = ?',
      args: [id],
    });
    return rows[0] || null;
  }

  // PRODUCTOS
  static async getAllProducts({
    categoryId,
    featured,
    status,
    page,
    limit,
  }: {
    featured?: boolean;
    status?: boolean;
    page?: number;
    limit?: number;
    categoryId?: number;
  }) {
    const conditions = [];
    const args = [];

    if (featured !== undefined) {
      conditions.push('p.isFeatured = ?');
      args.push(featured);
    }

    if (status !== undefined) {
      conditions.push('p.isActive = ?');
      args.push(status);
    }

    if (categoryId !== undefined) {
      conditions.push('p.categoryId = ?');
      args.push(categoryId);
    }

    // if (slug !== undefined) {
    //   conditions.push('p.slug = ?');
    //   args.push(slug);
    // } else {
    //   conditions.push('p.slug IS NOT NULL');
    // }

    const query = `
      SELECT p.*
      FROM Product p
      ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY p.createdAt DESC
      ${page !== undefined && limit !== undefined ? `LIMIT ${limit} OFFSET ${(page - 1) * limit}` : ''}
    `;

    const { rows } = await turso.execute({
      sql: query,
      args,
    });

    // Para cada producto, obtener sus imágenes, categorías y productos relacionados
    const productsWithRelations = await Promise.all(
      rows.map(async (row) => {
        const images = await this.getProductImages(Number(row.id));
        const categories = await this.getProductCategories(Number(row.id));
        const relatedProducts = await this.getProductRelatedProducts(
          Number(row.id)
        );

        return {
          ...row,
          isActive: Boolean(row.isActive),
          isFeatured: Boolean(row.isFeatured),
          images,
          categories,
          relatedProducts,
        };
      })
    );

    return productsWithRelations;
  }

  static async getAllProductsByCategory({
    categoryId,
    page,
    limit,
  }: {
    categoryId: number;
    page?: number;
    limit?: number;
    status?: boolean;
  }) {
    const conditions = [];
    const args = [];

    conditions.push('pc.categoryId = ?');
    args.push(categoryId);

    const query = `
      SELECT p.*
      FROM Product p,
      ProductCategory pc
      WHERE p.id = pc.productId
      ${conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : ''}
      ORDER BY p.createdAt DESC
      ${page !== undefined && limit !== undefined ? `LIMIT ${limit} OFFSET ${(page - 1) * limit}` : ''}
    `;

    const { rows } = await turso.execute({
      sql: query,
      args,
    });

    const productsWithRelations = await Promise.all(
      rows.map(async (row) => {
        const images = await this.getProductImages(Number(row.id));
        const categories = await this.getProductCategories(Number(row.id));
        const relatedProducts = await this.getProductRelatedProducts(
          Number(row.id)
        );

        return {
          ...row,
          isActive: Boolean(row.isActive),
          isFeatured: Boolean(row.isFeatured),
          images,
          categories,
          relatedProducts,
        };
      })
    );

    return productsWithRelations;
  }

  static async countProductsByCategory(categoryId: number) {
    const { rows } = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM ProductCategory WHERE categoryId = ?',
      args: [categoryId],
    });
    return rows[0]?.count || 0;
  }

  static async countProducts() {
    const { rows } = await turso.execute({
      sql: 'SELECT COUNT(*) as count FROM Product WHERE isActive = TRUE',
      args: [],
    });
    return rows[0]?.count || 0;
  }

  static async getProductById(id: number) {
    const { rows } = await turso.execute({
      sql: `SELECT * FROM Product WHERE id = ?`,
      args: [id],
    });

    if (!rows[0]) return null;

    const product = rows[0];
    const images = await this.getProductImages(Number(id));
    const categories = await this.getProductCategories(Number(id));
    const relatedProducts = await this.getProductRelatedProducts(Number(id));

    return {
      ...product,
      isActive: Boolean(product.isActive),
      isFeatured: Boolean(product.isFeatured),
      images,
      categories,
      relatedProducts,
    };
  }

  static async getProductBySlug(slug: string) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Product WHERE slug = ?',
      args: [slug],
    });

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    const images = await this.getProductImages(Number(row.id));
    const categories = await this.getProductCategories(Number(row.id));
    const relatedProducts = await this.getProductRelatedProducts(
      Number(row.id)
    );

    return {
      ...row,
      isActive: Boolean(row.isActive),
      isFeatured: Boolean(row.isFeatured),
      images,
      categories,
      relatedProducts,
    };
  }

  static async getProductBySku(sku: string) {
    const { rows } = await turso.execute({
      sql: 'SELECT * FROM Product WHERE sku = ?',
      args: [sku],
    });
    return rows[0] || null;
  }

  static async createProduct(data: {
    name: string;
    slug: string;
    description: string;
    sku?: string;
    price?: number;
    stock?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    retailPrice?: number;
    wholesalePrice?: number;
    discount?: number;
    discountType?: string;
    images?: number[];
    categories?: number[];
    relatedProducts?: number[];
  }) {
    // Crear el producto
    const { rows } = await turso.execute({
      sql: `
        INSERT INTO Product (
          name, slug, description, sku, price, stock, isActive, isFeatured,
          retailPrice, wholesalePrice, discount, discountType
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `,
      args: [
        data.name,
        data.slug,
        data.description,
        data.sku || null,
        data.price || 0,
        data.stock || 0,
        data.isActive ?? true,
        data.isFeatured ?? false,
        data.retailPrice || 0,
        data.wholesalePrice || 0,
        data.discount || 0,
        data.discountType || 'percentage',
      ],
    });

    const product = rows[0];

    // Asociar imágenes si se proporcionaron
    if (data.images && data.images.length > 0) {
      await this.setProductImages(Number(product.id), data.images);
    }

    // Asociar categorías si se proporcionaron
    if (data.categories && data.categories.length > 0) {
      await this.setProductCategories(Number(product.id), data.categories);
    }

    // Asociar productos relacionados si se proporcionaron
    if (data.relatedProducts && data.relatedProducts.length > 0) {
      await this.setProductRelatedProducts(
        Number(product.id),
        data.relatedProducts
      );
    }

    // Retornar producto completo
    return this.getProductById(Number(product.id));
  }

  static async updateProduct(
    id: number,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      sku?: string;
      price?: number;
      stock?: number;
      isActive?: boolean;
      isFeatured?: boolean;
      retailPrice?: number;
      wholesalePrice?: number;
      discount?: number;
      discountType?: string;
      images?: number[];
      categories?: number[];
      relatedProducts?: number[];
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
    if (data.sku !== undefined) {
      updates.push('sku = ?');
      args.push(data.sku);
    }
    if (data.price !== undefined) {
      updates.push('price = ?');
      args.push(data.price);
    }
    if (data.stock !== undefined) {
      updates.push('stock = ?');
      args.push(data.stock);
    }
    if (data.isActive !== undefined) {
      updates.push('isActive = ?');
      args.push(data.isActive);
    }
    if (data.isFeatured !== undefined) {
      updates.push('isFeatured = ?');
      args.push(data.isFeatured);
    }
    if (data.retailPrice !== undefined) {
      updates.push('retailPrice = ?');
      args.push(data.retailPrice);
    }
    if (data.wholesalePrice !== undefined) {
      updates.push('wholesalePrice = ?');
      args.push(data.wholesalePrice);
    }
    if (data.discount !== undefined) {
      updates.push('discount = ?');
      args.push(data.discount);
    }
    if (data.discountType !== undefined) {
      updates.push('discountType = ?');
      args.push(data.discountType);
    }

    // Si se actualiza el precio, actualizar también priceUpdatedAt
    if (
      data.price !== undefined ||
      data.retailPrice !== undefined ||
      data.wholesalePrice !== undefined
    ) {
      updates.push('priceUpdatedAt = CURRENT_TIMESTAMP');
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    args.push(id);

    // Actualizar producto
    await turso.execute({
      sql: `UPDATE Product SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    // Actualizar imágenes si se proporcionaron
    if (data.images !== undefined) {
      await this.setProductImages(id, data.images);
    }

    // Actualizar categorías si se proporcionaron
    if (data.categories !== undefined) {
      await this.setProductCategories(id, data.categories);
    }

    // Actualizar productos relacionados si se proporcionaron
    if (data.relatedProducts !== undefined) {
      await this.setProductRelatedProducts(id, data.relatedProducts);
    }

    // Retornar producto actualizado
    return this.getProductById(id);
  }

  static async deleteProduct(id: number) {
    // Las relaciones ProductImage se eliminan automáticamente por CASCADE
    await turso.execute({
      sql: 'DELETE FROM Product WHERE id = ?',
      args: [id],
    });
    return true;
  }

  // Métodos auxiliares para manejar imágenes de productos
  static async getProductImages(productId: number) {
    const { rows } = await turso.execute({
      sql: `
        SELECT pi.order_index, pi.isPrimary, i.id, i.url, i.alt, i.tag, i.observation
        FROM ProductImage pi
        JOIN Image i ON pi.imageId = i.id
        WHERE pi.productId = ?
        ORDER BY pi.isPrimary DESC, pi.order_index ASC
      `,
      args: [productId],
    });

    return rows.map((row) => ({
      id: row.id,
      url: row.url,
      alt: row.alt,
      tag: row.tag,
      observation: row.observation,
      order_index: row.order_index,
      isPrimary: Boolean(row.isPrimary),
    }));
  }

  // Método auxiliar para obtener solo IDs de imágenes (para compatibilidad)
  static async getProductImageIds(productId: number) {
    const { rows } = await turso.execute({
      sql: `
        SELECT pi.imageId
        FROM ProductImage pi
        WHERE pi.productId = ?
        ORDER BY pi.isPrimary DESC, pi.order_index ASC
      `,
      args: [productId],
    });

    return rows.map((row) => row.imageId);
  }

  static async setProductImages(productId: number, imageIds: number[]) {
    // Eliminar relaciones existentes
    await turso.execute({
      sql: 'DELETE FROM ProductImage WHERE productId = ?',
      args: [productId],
    });

    // Agregar nuevas relaciones una por una
    if (imageIds.length > 0) {
      for (let i = 0; i < imageIds.length; i++) {
        await turso.execute({
          sql: 'INSERT INTO ProductImage (productId, imageId, order_index, isPrimary) VALUES (?, ?, ?, ?)',
          args: [productId, imageIds[i], i, i === 0 ? 1 : 0],
        });
      }
    }
  }

  // Métodos auxiliares para manejar categorías de productos
  static async getProductCategories(productId: number) {
    const { rows } = await turso.execute({
      sql: `
        SELECT c.id, c.name, c.slug, c.description, c.featured, c.imageId,
               i.url as imageUrl, i.alt as imageAlt
        FROM ProductCategory pc
        JOIN Category c ON pc.categoryId = c.id
        LEFT JOIN Image i ON c.imageId = i.id
        WHERE pc.productId = ?
        ORDER BY pc.createdAt ASC
      `,
      args: [productId],
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
            alt: row.imageAlt,
          }
        : null,
    }));
  }

  // Método auxiliar para obtener solo IDs de categorías (para compatibilidad)
  static async getProductCategoryIds(productId: number) {
    const { rows } = await turso.execute({
      sql: `
        SELECT pc.categoryId
        FROM ProductCategory pc
        WHERE pc.productId = ?
        ORDER BY pc.createdAt ASC
      `,
      args: [productId],
    });

    return rows.map((row) => row.categoryId);
  }

  static async setProductCategories(productId: number, categoryIds: number[]) {
    // Eliminar relaciones existentes
    await turso.execute({
      sql: 'DELETE FROM ProductCategory WHERE productId = ?',
      args: [productId],
    });

    // Agregar nuevas relaciones una por una
    if (categoryIds.length > 0) {
      for (const categoryId of categoryIds) {
        await turso.execute({
          sql: 'INSERT INTO ProductCategory (productId, categoryId) VALUES (?, ?)',
          args: [productId, categoryId],
        });
      }
    }
  }

  // PRODUCTOS RELACIONADOS
  static async getProductRelatedProducts(productId: number): Promise<number[]> {
    const { rows } = await turso.execute({
      sql: `
        SELECT pr.relatedProductId
        FROM ProductRelated pr
        WHERE pr.productId = ?
        ORDER BY pr.createdAt ASC
      `,
      args: [productId],
    });
    return rows.map((row) => Number(row.relatedProductId));
  }

  static async setProductRelatedProducts(
    productId: number,
    relatedProductIds: number[]
  ) {
    // Eliminar relaciones existentes
    await turso.execute({
      sql: 'DELETE FROM ProductRelated WHERE productId = ?',
      args: [productId],
    });

    // Agregar nuevas relaciones una por una
    if (relatedProductIds.length > 0) {
      for (const relatedProductId of relatedProductIds) {
        // Evitar auto-referencias
        if (relatedProductId !== productId) {
          await turso.execute({
            sql: 'INSERT INTO ProductRelated (productId, relatedProductId) VALUES (?, ?)',
            args: [productId, relatedProductId],
          });
        }
      }
    }
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

  // NEWSLETTER SUBSCRIBERS
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

  // CONTACTO
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
