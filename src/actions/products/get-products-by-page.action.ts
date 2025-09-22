import { z } from 'astro:content';
import { defineAction } from 'astro:actions';
import { Database } from '@/lib/db';

export const getProductsByPage = defineAction({
  accept: 'json',
  input: z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(9),
    slug: z.string().optional(),
    // featured: z.boolean().optional().default(false),
  }),
  handler: async ({ page, limit }) => {
    page = page <= 0 ? 1 : page;

    const totalProducts = Number(await Database.countProducts());
    const totalPages = Math.ceil(totalProducts / limit);

    if (page > totalPages) {
      return {
        products: [],
        totalPages: totalPages,
      };
    }

    const productsQuery = await Database.getAllProducts({
      page,
      limit,
      status: true,
    });

    return {
      products: productsQuery,
      totalPages: totalPages,
    };
  },
});
