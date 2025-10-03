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
  priceUpdatedAt: z.string().optional(),
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
  footer: z.object({
    siteName: z.string().optional(),
    logoId: z.number().optional(),
    siteText: z.string().optional(),
    socialLinks: z.array(
      z.object({
        href: z.string().optional(),
        label: z.string().optional(),
        image: z.number().optional(),
      })
    ),
    siteAbout: z.string().optional(),
    siteAboutDescription: z.string().optional(),
    siteAddress: z.string().optional(),
    siteCity: z.string().optional(),
    sitePhone: z.string().optional(),
    siteEmail: z.string().optional(),
  }),
});

export const SettingsFormSchema = z.object({
  home: HomeSettingsSchema,
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

export const UploadImageFormSchema = z.object({
  alt: z.string().min(1, 'El nombre alternativo es requerido'),
  tag: z.string().min(1, 'La carpeta es requerida'),
  observation: z.string().optional(),
});

export const BudgetItemFormSchema = z.object({
  id: z.number().optional(),
  productId: z.number().optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  sku: z.string().min(1, 'El SKU es requerido'),
  retailPrice: z.string().optional(),
  wholesalePrice: z.string().optional(),
  price: z.string().min(0, 'El precio es requerido'),
  quantity: z.string().min(1, 'La cantidad es requerida'),
  amount: z.string().min(0, 'El monto es requerido'),
  observation: z.string().optional(),
});

export const BudgetFormSchema = z.object({
  customerId: z.number(),
  responsibleId: z.string().min(1, 'El responsable es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().min(1, 'El email es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  type: z.enum(['wholesale', 'retail']),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
  totalAmount: z.string().min(0, 'El total debe ser mayor o igual a 0'),
  observation: z.string().optional(),
  createdAt: z.date().optional(),
  expiresAt: z.date().optional(),
  items: z.array(BudgetItemFormSchema),
});

// Formulario para la página de presupuestos
export const BudgetPageFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().min(1, 'El email es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  message: z.string().optional(),
});

export const CustomerFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().min(1, 'El email es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  type: z.enum(['wholesale', 'retail']),
  document: z.string().optional(),
  address: z.string().optional(),
  observation: z.string().optional(),
});

export const ResponsibleFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  cuit: z.string().min(1, 'El CUIT es requerido'),
  condition: z.string().min(1, 'La condición es requerida'),
  observation: z.string().optional(),
});
