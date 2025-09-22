import type { ProductWithCategoriesAndImages } from '@/shared/types';

interface ProductCardProps {
  product: ProductWithCategoriesAndImages;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className='group relative w-64'>
      <a href={`/productos/${product.slug}`}>
        <img
          src={product.images[0].url}
          alt={product.images[0].alt}
          className='w-full h-full object-contain'
        />
        <h4>{product.name}</h4>
        <p>{product.categories[0].name}</p>
      </a>
    </div>
  );
};

export { ProductCard };
