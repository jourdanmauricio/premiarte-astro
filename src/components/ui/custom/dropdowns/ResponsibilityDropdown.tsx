import { Suspense } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import Dropdown from '@/components/ui/custom/dropdown';
import DropdownLoadSkeleton from '@/components/ui/custom/skeletons/dropdown-load-skeleton';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { responsiblesService } from '@/lib/services/responsiblesService';
import type { Responsible } from '@/shared/types';

type ResponsibilityDropdownProps = {
  name: string;
  form: UseFormReturn<any>;
  className?: string;
  labelClassName?: string;
  required?: boolean;
  onChange?: (item: { id: string; description: string }) => void;
};

const ResponsibilityDropdown = ({
  name,
  form,
  className,
  labelClassName,
  required,
  onChange,
}: ResponsibilityDropdownProps) => {
  const label = 'Responsable' + (required ? '*' : '');

  const { data } = useSuspenseQuery({
    queryKey: ['responsibles'],
    queryFn: async () => {
      const response = await responsiblesService.getResponsibles();
      return response.map((responsible: Responsible) => ({
        id: responsible.id.toString(),
        description: responsible.name,
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
        label={label}
        placeholder={'Seleccione un responsable'}
        list={data || []}
        form={form}
        className={className}
        labelClassName={labelClassName}
        onChange={onChange}
      />
    </Suspense>
  );
};

export { ResponsibilityDropdown };
