import { z } from 'astro:content';
import { defineAction } from 'astro:actions';
import { Database } from '@/lib/db';

export const getProductBySlug = defineAction({
  accept: 'json',
  input: z.object({
    slug: z.string(),
  }),
  handler: async ({ slug }) => {
    const product = await Database.getProductBySlug(slug);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    return product;
  },
});
