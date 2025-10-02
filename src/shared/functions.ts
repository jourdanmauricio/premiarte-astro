import type { ProductWithDetails } from '@/shared/types';

export const getFolderIcon = (folderId: string) => {
  const icons: Record<string, string> = {
    Todas: '📁',
    Categorías: '📂',
    Productos: '📦',
    Páginas: '📄',
    Otros: '🗂️',
  };
  return icons[folderId] || '📁';
};

export const setPrices = (
  type: 'retail' | 'wholesale',
  product: ProductWithDetails
) => {
  const price =
    type === 'retail'
      ? product.retailPrice
        ? product.retailPrice.toString()
        : '0'
      : product.wholesalePrice
        ? product.wholesalePrice!.toString()
        : '0';
  const retailPrice = product.retailPrice
    ? product.retailPrice.toString()
    : '0';

  const wholesalePrice = product.wholesalePrice
    ? product.wholesalePrice.toString()
    : '0';

  return { price, retailPrice, wholesalePrice };
};
