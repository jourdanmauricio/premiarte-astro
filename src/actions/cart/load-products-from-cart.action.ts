import z from 'zod';
import { defineAction } from 'astro:actions';
import { Database } from '@/lib/db';
import type { CartItem } from '@/shared/types/cart-Item';
import type {
  ProductWithCategoriesAndImages,
  ProductWithDetails,
} from '@/shared/types';

// las actions poseen acceso a las cookies, no necesitamos el input
export const loadProductsFromCart = defineAction({
  accept: 'json',
  //   input: z.object({
  //     cart: z.array(z.object({
  //       productId: z.string(),
  //       quantity: z.string(),
  //     })),
  //   }),
  handler: async (_, ctx) => {
    // console.log('context', ctx);
    // console.log('cookies', ctx.cookies.get('cart'));
    const cart = JSON.parse(
      ctx.cookies.get('cart')?.value ?? '[]'
    ) as CartItem[];

    if (cart.length === 0) {
      return [];
    }

    const products = (await Promise.all(
      cart.map(async (item) => {
        const product = await Database.getProductById(Number(item.productId));
        return {
          ...product,
          quantity: Number(item.quantity),
        };
      })
    )) as unknown as ProductWithCategoriesAndImages[];

    console.log('products', products[0].images);

    return cart.map((item) => {
      const dbProduct = products.find(
        (product) => product.id === Number(item.productId)
      );
      if (!dbProduct) {
        throw new Error('Product with id ' + item.productId + ' not found');
      }

      const { name, sku, images, slug } = dbProduct;

      return {
        productId: item.productId,
        name,
        sku,
        slug,
        image: images?.[0],
        quantity: item.quantity,
      };
    });
  },
});
