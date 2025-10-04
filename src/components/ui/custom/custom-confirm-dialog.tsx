import { cn } from '@/lib/utils';
import type { ReactElement } from 'react';
import { CircleAlert, X } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';

type CustomConfirmDialogProps = {
  open: boolean;
  onCloseDialog: () => void;
  onContinueClick: () => void;
  onCancelClick: () => void;
  title?: string | ReactElement;
  description: ReactElement;
  cancelButtonText: string;
  continueButtonText: string;
  className?: string;
  closeTopButton?: boolean;
  addIcon?: boolean;
  iconComponente?: ReactElement;
  isLoading?: boolean;
};

export default function CustomConfirmDialog({
  open,
  onCloseDialog,
  onContinueClick,
  onCancelClick,
  title,
  description,
  cancelButtonText,
  continueButtonText,
  className,
  closeTopButton = false,
  addIcon = true,
  iconComponente = (
    <Avatar className='mb-2 h-12 w-12 bg-primary-light-pale text-center'>
      <CircleAlert
        width={38}
        height={38}
        className='mx-auto self-center text-primary-dark-deep'
      />
    </Avatar>
  ),
  isLoading = false,
}: CustomConfirmDialogProps) {
  function handleOnOpenChange(open: boolean) {
    if (!open && !isLoading) {
      onCloseDialog();
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader className='text-center'>
          {addIcon && (
            <div className='flex justify-center'>{iconComponente}</div>
          )}
          <AlertDialogTitle className='text-center text-2xl font-medium text-primary-dark-deep'>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={isLoading ? undefined : onCancelClick}
            disabled={isLoading}
            className={cn(buttonVariants({ variant: 'outline' }), 'w-1/2')}
          >
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!isLoading) {
                onContinueClick();
              }
            }}
            disabled={isLoading}
            className={cn(buttonVariants({ variant: 'default' }), 'w-1/2')}
            autoFocus={true}
            asChild
          >
            <button type='button'>{continueButtonText}</button>
          </AlertDialogAction>
        </AlertDialogFooter>

        {closeTopButton && (
          <AlertDialogCancel
            onClick={isLoading ? undefined : onCancelClick}
            disabled={isLoading}
            className='absolute right-4 top-5 rounded-sm border-none opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none'
          >
            <X className='h-6 w-6' />
            <span className='sr-only'>Close</span>
          </AlertDialogCancel>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
