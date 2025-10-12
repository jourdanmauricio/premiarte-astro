import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoaderIcon } from 'lucide-react';

interface SubmitButtonProps extends ButtonProps {
  label: string;
  showSpinner: boolean;
  disabled: boolean;
}

const SubmitButton = ({
  label,
  showSpinner,
  disabled,
  ...rest
}: SubmitButtonProps) => {
  return (
    <Button
      type='submit'
      className={cn(
        'group relative overflow-hidden rounded-lg border-0 bg-gradient-to-r from-red-600 to-orange-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:from-red-700 hover:to-orange-700 hover:shadow-2xl',
        rest.className ? rest.className : ''
      )}
      disabled={showSpinner || disabled}
    >
      <span className='relative z-10'>
        {showSpinner ? <LoaderIcon className='h-5 w-5 animate-spin' /> : label}
      </span>
      <div className='absolute inset-0 translate-x-[-100%] bg-white/20 transition-transform duration-500 group-hover:translate-x-0'></div>
    </Button>
  );
};

export default SubmitButton;
