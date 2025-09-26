import Cookies from 'js-cookie';
import type { CartItem } from '@/shared/types/cart-Item';

export class CartCookiesClient {
  static getCart(): CartItem[] {
    const cart = JSON.parse(Cookies.get('cart') ?? '[]');
    return cart;
  }

  static addIem(cartItem: CartItem): CartItem[] {
    const cart = CartCookiesClient.getCart();

    const existingItem = cart.find(
      (item: CartItem) => item.productId === cartItem.productId
    );

    if (existingItem) {
      existingItem.quantity += cartItem.quantity;
    } else {
      cart.push(cartItem);
    }

    Cookies.set('cart', JSON.stringify(cart));
    return cart;
  }

  static updateItem(cartItem: CartItem): CartItem[] {
    const cart = CartCookiesClient.getCart();

    const existingItem = cart.find(
      (item: CartItem) => item.productId === cartItem.productId
    );

    if (existingItem) {
      existingItem.quantity = cartItem.quantity;
    } else {
      cart.push(cartItem);
    }

    Cookies.set('cart', JSON.stringify(cart));
    return cart;
  }

  static removeItem(productId: string): CartItem[] {
    const cart = CartCookiesClient.getCart();
    const updatedCart = cart.filter(
      (item: CartItem) => item.productId !== productId
    );
    Cookies.set('cart', JSON.stringify(updatedCart));
    return updatedCart;
  }
}
