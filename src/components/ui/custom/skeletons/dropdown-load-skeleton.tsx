import { FormLabel } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

type DropdownLoadSkeletonProps = {
  className?: string;
  label?: string;
  labelClassName?: string;
  disabled?: boolean;
};

export default function DropdownLoadSkeleton({
  className,
  label,
  labelClassName,
  disabled = false,
}: DropdownLoadSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <FormLabel className={`text-[1rem] font-semibold ${labelClassName}`}>
        {label}
      </FormLabel>
      <Skeleton
        className={`h-10 w-full border border-gray-200 ${disabled ? 'animate-none bg-neutral-50' : ''}`}
      >
        <div className='ml-3 flex h-full items-center text-sm'>
          {disabled ? '' : 'Cargando datos'}
        </div>
      </Skeleton>
    </div>
  );
}
