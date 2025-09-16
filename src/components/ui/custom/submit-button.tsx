import { cn } from '@/lib/utils';
import { LoaderIcon } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';

type SubmitButtonProps = {
  label: string;
  showSpinner: boolean;
  disabled?: boolean;
};

export default function SubmitButton({
  label,
  showSpinner,
  disabled = false,
  ...rest
}: SubmitButtonProps & ButtonProps) {
  return (
    <Button
      {...rest}
      type='submit'
      className={cn('ml-2', rest.className ? rest.className : '')}
      disabled={showSpinner || disabled}
    >
      {showSpinner ? <LoaderIcon className='h-5 w-5 animate-spin' /> : label}
    </Button>
  );
}
