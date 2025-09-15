import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../../../lib/services/categoriesService';

const CategoriesPage = () => {
  const {
    data: categories,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(),
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='text-lg'>Cargando categorías...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex justify-center items-center p-8'>
        <div className='text-red-500'>
          Error: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Gestión de Categorías</h1>

      {categories && categories.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {categories.map((category) => (
            <div
              key={category.id}
              className='bg-white rounded-lg shadow-md p-6 border border-gray-200'
            >
              {category.image && (
                <img
                  src={category.image.url}
                  alt={category.name}
                  className='w-full h-48 object-cover rounded-md mb-4'
                />
              )}
              <h3 className='text-xl font-semibold mb-2'>{category.name}</h3>
              <p className='text-gray-600'>{category.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className='text-center py-8'>
          <p className='text-gray-500'>No hay categorías disponibles</p>
        </div>
      )}
    </div>
  );
};

export { CategoriesPage };
