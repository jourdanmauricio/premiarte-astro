import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Database } from '@/lib/db';
import type {
  CreateQuoteData,
  CreateQuoteItemData,
  CartItem,
  ProductWithCategoriesAndImages,
} from '@/shared/types';

export const sendQuoteRequest = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    last_name: z.string().min(1, 'El apellido es requerido'),
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Correo electrónico inválido'),
    phone: z.string().min(1, 'El teléfono es requerido'),
    message: z.string().optional(),
  }),
  handler: async ({ name, last_name, email, phone, message }, context) => {
    try {
      // Obtener productos del carrito desde cookies (misma lógica que loadProductsFromCart)
      const cart = JSON.parse(
        context.cookies.get('cart')?.value ?? '[]'
      ) as CartItem[];

      if (cart.length === 0) {
        return {
          success: false,
          message: 'No hay productos en el carrito para solicitar presupuesto.',
        };
      }

      // Cargar detalles de productos desde la base de datos
      const products = (await Promise.all(
        cart.map(async (item) => {
          const product = await Database.getProductById(Number(item.productId));
          return {
            ...product,
            quantity: Number(item.quantity),
          };
        })
      )) as unknown as ProductWithCategoriesAndImages[];

      // Obtener información del usuario autenticado (si existe)
      const userId = context.locals.auth()?.userId || undefined;

      // Crear items del presupuesto
      const quoteItems: CreateQuoteItemData[] = cart.map((item) => {
        const dbProduct = products.find(
          (product) => product.id === Number(item.productId)
        );
        if (!dbProduct) {
          throw new Error('Product with id ' + item.productId + ' not found');
        }

        const { name: productName, sku, images, slug, price } = dbProduct;
        const primaryImage = images?.[0];

        return {
          productId: Number(item.productId),
          sku: sku || `PROD-${item.productId}`, // Generar SKU si no existe
          slug,
          name: productName,
          imageUrl: primaryImage?.url || '',
          imageAlt: primaryImage?.alt || productName,
          price: (price || 0) * 100, // Convertir a centavos
          quantity: Number(item.quantity),
          observation: undefined, // Por ahora no hay observaciones por item
        };
      });

      // Calcular monto total
      const totalAmount = quoteItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Crear datos del presupuesto
      const quoteData: CreateQuoteData = {
        name,
        lastName: last_name,
        email,
        phone,
        observation: message || undefined,
        userId,
        items: quoteItems,
      };

      // Crear presupuesto en la base de datos
      const quote = await Database.createQuote(quoteData, totalAmount);

      // Limpiar carrito después de enviar el presupuesto exitosamente
      context.cookies.delete('cart');

      return {
        success: true,
        message: 'Te contactaremos pronto con la cotización.',
        data: {
          quoteId: quote.id,
          totalItems: quoteItems.length,
          totalAmount: totalAmount / 100, // Convertir de centavos a pesos para mostrar
        },
      };
    } catch (error) {
      console.error('Error al enviar el presupuesto:', error);
      return {
        success: false,
        message: 'Error interno del servidor. Por favor, inténtalo más tarde.',
      };
    }
  },
});
