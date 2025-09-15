import z from 'zod';

export const ImageFormSchema = z.object({
  url: z.string().optional(),
  tag: z.string().optional(),
  alt: z.string().min(1, { message: 'Requiredo' }),
  observation: z.string().optional(),
});
