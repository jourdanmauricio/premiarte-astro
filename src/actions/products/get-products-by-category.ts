import { z } from 'astro:content';
import { defineAction } from 'astro:actions';
import { Database } from '@/lib/db';

export const getProductsByCategory = defineAction({
  accept: 'json',
  input: z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(9),
    category: z.string().optional(),
    // featured: z.boolean().optional().default(false),
  }),
  handler: async ({ page, limit, category }) => {
    page = page <= 0 ? 1 : page;

    let totalProducts = 0;
    let categoryData = null;

    if (category !== 'productos') {
      categoryData = await Database.getCategoryBySlug(category ?? '');
      totalProducts = Number(
        await Database.countProductsByCategory(Number(categoryData?.id ?? 0))
      );
    } else {
      totalProducts = Number(await Database.countProducts());
    }

    console.log('category', category);
    console.log('categoryData', categoryData);
    console.log('totalProducts', totalProducts);
    const totalPages = Math.ceil(totalProducts / limit);

    if (page > totalPages) {
      return {
        products: [],
        totalPages: totalPages,
      };
    }

    console.log('page', page);
    console.log('limit', limit);

    let productsQuery = [];

    if (category !== 'productos') {
      productsQuery = await Database.getAllProductsByCategory({
        categoryId: Number(categoryData?.id ?? 0),
        page,
        limit,
      });
    } else {
      productsQuery = await Database.getAllProducts({
        page,
        limit,
      });
    }

    return {
      products: productsQuery,
      totalPages: totalPages,
    };
  },
});
