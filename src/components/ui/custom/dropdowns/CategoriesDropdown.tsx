import { Suspense } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import Dropdown from '@/components/ui/custom/dropdown';
import DropdownLoadSkeleton from '@/components/ui/custom/skeletons/dropdown-load-skeleton';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { responsiblesService } from '@/lib/services/responsiblesService';
import type { Category, Responsible } from '@/shared/types';
import { categoriesService } from '@/lib/services/categoriesService';

type CategoriesFilterProps = {
  name: string;
  form: UseFormReturn<any>;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  onChange?: (item: { id: string; description: string }) => void;
  label?: string;
  placeholder?: string;
};

const CategoriesDropdown = ({
  name,
  form,
  className,
  labelClassName,
  required,
  onChange,
  label,
  placeholder,
}: CategoriesFilterProps) => {
  const labelName = label ?? 'Categoría' + (required ? '*' : '');

  const { data } = useSuspenseQuery({
    queryKey: ['categories-dropdown'],
    queryFn: async () => {
      const response = await categoriesService.getCategories();
      return response.map((category: Category) => ({
        id: category.id.toString(),
        description: category.name,
      }));
    },
  });

  return (
    <Suspense
      fallback={
        <DropdownLoadSkeleton labelClassName={labelClassName} label={label} />
      }
    >
      <Dropdown
        name={name}
        label={labelName}
        placeholder={placeholder || 'Seleccione...'}
        list={data || []}
        form={form}
        className={className}
        labelClassName={labelClassName}
        onChange={onChange}
        enableClean
      />
    </Suspense>
  );
};

export { CategoriesDropdown };
