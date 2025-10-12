import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PrimaryButtonProps {
  label: string;
  href: string;
  className?: string;
}

const PrimaryButton = ({ label, href, className }: PrimaryButtonProps) => {
  return (
    <Button
      className={cn(
        'group relative overflow-hidden rounded-lg border-0 bg-gradient-to-r from-red-600 to-orange-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:from-red-700 hover:to-orange-700 hover:shadow-2xl',
        className
      )}
      asChild
    >
      <a href={href || '/productos'}>
        <span className='relative z-10'>{label || 'Ver Productos'}</span>
        <div className='absolute inset-0 translate-x-[-100%] bg-white/20 transition-transform duration-500 group-hover:translate-x-0'></div>
      </a>
    </Button>
  );
};

export default PrimaryButton;
