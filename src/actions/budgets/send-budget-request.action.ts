import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Database } from '@/lib/db';
import type {
  CreateBudgetData,
  CreateBudgetItemData,
  CartItem,
  ProductWithCategoriesAndImages,
} from '@/shared/types';

export const sendBudgetRequest = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Correo electrónico inválido'),
    phone: z.string().min(1, 'El teléfono es requerido'),
    message: z.string().optional(),
  }),
  handler: async ({ name, email, phone, message }, context) => {
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

      // const products = cart;

      // Obtener información del usuario autenticado (si existe)
      const userId = context.locals.auth()?.userId || undefined;

      // Crear o recuperar el customer
      const customer = await Database.getOrCreateCustomer({
        name,
        email,
        phone,
        type: 'retail', // Por defecto retail, se puede cambiar según la lógica de negocio
      });

      if (!customer || !customer.id) {
        throw new Error('No se pudo crear o recuperar el cliente');
      }

      let totalAmount = 0;
      // Crear items del presupuesto
      const budgetItems: CreateBudgetItemData[] = cart.map((item) => {
        const dbProduct = products.find(
          (product) => product.id === Number(item.productId)
        );
        if (!dbProduct) {
          throw new Error('Product with id ' + item.productId + ' not found');
        }

        const price =
          customer.type === 'retail'
            ? Number(dbProduct.retailPrice)
            : Number(dbProduct.wholesalePrice);

        totalAmount += Number(price) * Number(item.quantity);

        return {
          retailPrice: Number(dbProduct.retailPrice),
          wholesalePrice: Number(dbProduct.wholesalePrice),
          price: price,
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          amount: Number(price) * Number(item.quantity),
          observation: '',
        };
      });

      // Crear datos del presupuesto
      const budgetData: CreateBudgetData = {
        customerId: Number(customer.id),
        observation: message || '',
        userId,
        items: budgetItems,
        totalAmount: totalAmount,
        type: String(customer.type || 'retail'),
      };

      // Crear presupuesto en la base de datos
      const budget = await Database.createBudget(budgetData);

      // Limpiar carrito después de enviar el presupuesto exitosamente
      context.cookies.delete('cart');

      return {
        success: true,
        message: 'Te contactaremos pronto con la cotización.',
        data: {
          budgetId: budget.id,
          totalItems: budgetItems.length,
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
