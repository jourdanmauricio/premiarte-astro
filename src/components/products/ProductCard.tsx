import type { ProductWithCategoriesAndImages } from '@/shared/types';

interface ProductCardProps {
  product: ProductWithCategoriesAndImages;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className='group relative w-64'>
      <a href={`/productos/${product.slug}`} className='h-64 w-64'>
        <img
          src={product.images[0].url}
          alt={product.images[0].alt}
          className='object-contain'
          width={256}
          height={256}
        />
      </a>
      <p className='pill my-2'>{product.categories[0].name}</p>
      <h4 className='text-sm font-medium'>{product.name}</h4>
    </div>
  );
};

export { ProductCard };
