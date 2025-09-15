import z from 'zod';

export const ImageFormSchema = z.object({
  url: z.string().optional(),
  tag: z.string().optional(),
  alt: z.string().min(1, { message: 'Requiredo' }),
  observation: z.string().optional(),
});

export const CategoryFormSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  slug: z.string().min(1, { message: 'El slug es requerido' }),
  description: z.string().min(1, { message: 'La descripción es requerida' }),
  imageId: z.number().min(1, { message: 'La imagen es requerida' }),
  featured: z.boolean().optional(),
});
