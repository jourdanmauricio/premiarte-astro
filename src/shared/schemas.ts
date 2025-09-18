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

const HomeMenuSchema = z.object({
  siteName: z.string().min(1, { message: 'Nombre del sitio requerido' }),
  logoId: z.number().min(1, { message: 'ID del logo requerido' }),
});

const HomeSliderSchema = z.object({
  image: z.number().min(1, { message: 'ID de imagen requerido' }),
  title: z.string().min(1, { message: 'Título requerido' }),
  recommended: z.boolean(),
  text: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
});

const HomeSettingsSchema = z.object({
  menu: HomeMenuSchema,
  slider: z.array(HomeSliderSchema),
  // .min(1, { message: 'Al menos un slide requerido' }),
});

export const SettingsFormSchema = z.object({
  home: HomeSettingsSchema,
  // Puedes agregar más secciones aquí
  // about: AboutConfigSchema,
  // contact: ContactConfigSchema,
});
