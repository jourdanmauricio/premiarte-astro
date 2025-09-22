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

    const categoryData = await Database.getCategoryBySlug(category ?? '');

    console.log('category', category);
    console.log('categoryData', categoryData);

    const totalProducts = Number(
      await Database.countProductsByCategory(Number(categoryData?.id ?? 0))
    );

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

    const productsQuery = await Database.getAllProductsByCategory({
      categoryId: Number(categoryData?.id ?? 0),
      page,
      limit,
    });

    return {
      products: productsQuery,
      totalPages: totalPages,
    };
  },
});
