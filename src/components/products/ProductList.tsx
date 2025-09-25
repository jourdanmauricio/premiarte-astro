import type { ProductWithCategoriesAndImages } from '@/shared/types';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductListProps {
  products: ProductWithCategoriesAndImages[];
}
const ProductList = ({ products }: ProductListProps) => {
  return (
    <>
      <div className='flex flex-wrap justify-center gap-16'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
};

export { ProductList };
