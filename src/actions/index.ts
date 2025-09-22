import { subscribeToNewsletter } from '@/actions/newsletter/subscribe.action';
import { getProductsByPage } from '@/actions/products/get-products-by-page.action';
import { getProductBySlug } from '@/actions/products/get-product-by-slug.action';
import { getCategoriesByPage } from '@/actions/categoeries/get-categories-by-page.action';
import { getProductsByCategory } from '@/actions/products/get-products-by-category';

export const server = {
  // actions

  // newsletter
  subscribeToNewsletter,
  getProductsByPage,
  getProductBySlug,
  getCategoriesByPage,
  getProductsByCategory,
};
