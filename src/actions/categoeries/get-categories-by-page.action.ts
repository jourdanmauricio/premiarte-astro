import z from 'zod';
import { defineAction } from 'astro:actions';
import { Database } from '@/lib/db';

export const getCategoriesByPage = defineAction({
  accept: 'json',
  input: z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(9),
  }),
  handler: async () => {
    const categories = await Database.getAllCategories({});
    return categories;
  },
});
