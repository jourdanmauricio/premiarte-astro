import z from 'zod';

export const ImageFormSchema = z.object({
  url: z.string().optional(),
  tag: z.string().optional(),
  alt: z.string().min(1, { message: 'Requiredo' }),
  observation: z.string().optional(),
});

export const CategoryFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  slug: z.string().min(1, { message: 'El slug es requerido' }),
  description: z.string().min(1, { message: 'La descripción es requerida' }),
  imageId: z.number().min(1, { message: 'La imagen es requerida' }),
  featured: z.boolean().optional(),
});

export const ProductFromSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  slug: z.string().min(1, { message: 'El slug es requerido' }),
  price: z.string().optional(),
  sku: z.string().min(1, { message: 'El SKU es requerido' }),
  description: z.string().min(1, { message: 'La descripción es requerida' }),
  stock: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  retailPrice: z.string().optional(),
  wholesalePrice: z.string().optional(),
  discount: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  relatedProducts: z.array(z.number()),
  images: z.array(z.number()),
  categories: z.array(
    z.object({ id: z.number(), name: z.string(), slug: z.string() })
  ),
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

const HomeHeroSchema = z.object({
  imageId: z.number().min(1, { message: 'ID de imagen requerido' }),
  title: z.string().min(1, { message: 'Título requerido' }),
  text: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  logoId: z.number().min(1, { message: 'ID de imagen requerido' }),
});

const HomeFeaturedProductsSchema = z.object({
  title: z.string().min(1, { message: 'Título requerido' }),
  text: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
});

const HomeSettingsSchema = z.object({
  menu: HomeMenuSchema,
  slider: z.array(HomeSliderSchema),
  hero: HomeHeroSchema,
  featuredProducts: HomeFeaturedProductsSchema,
  testimonials: z.object({
    title: z.string().min(1, { message: 'Título requerido' }),
    testimonials: z.array(
      z.object({
        name: z.string().min(1, { message: 'Nombre requerido' }),
        rating: z.string().min(1, { message: 'Puntuación requerida' }),
        description: z.string().min(1, { message: 'Descripción requerida' }),
      })
    ),
  }),
  services: z.object({
    title: z.string().min(1, { message: 'Título requerido' }),
    subtitle: z.string().optional(),
    services: z.array(
      z.object({
        title: z.string().min(1, { message: 'Título requerido' }),
        description: z.string().min(1, { message: 'Descripción requerida' }),
        image: z.number().min(1, { message: 'Imagen requerida' }),
      })
    ),
  }),
  featuredCategories: z.object({
    title: z.string().min(1, { message: 'Título requerido' }),
    text: z.string().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
  }),
});

export const SettingsFormSchema = z.object({
  home: HomeSettingsSchema,
  // Puedes agregar más secciones aquí
  // about: AboutConfigSchema,
  // contact: ContactConfigSchema,
});

export const contactFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Correo electrónico inválido'),
  phone: z.string().optional(),
  message: z.string().min(1, 'El mensaje es requerido'),
});
