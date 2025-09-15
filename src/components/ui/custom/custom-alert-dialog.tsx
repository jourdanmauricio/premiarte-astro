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

import { TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

type CustomAlertDialogProps = {
  open: boolean;
  onCloseDialog: () => void;
  onContinueClick: () => void;
  title: string;
  description: string;
  cancelButtonText: string;
  continueButtonText: string;
  dialogContentClassname?: string;
};

export default function CustomAlertDialog({
  open,
  onCloseDialog,
  onContinueClick,
  title,
  description,
  cancelButtonText,
  continueButtonText,
  dialogContentClassname,
}: CustomAlertDialogProps) {
  const DIALOG_CONTENT_CL = dialogContentClassname ?? 'max-w-xl p-16';
  function handleOnOpenChange() {
    onCloseDialog();
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOnOpenChange}>
      <AlertDialogContent className={DIALOG_CONTENT_CL}>
        <AlertDialogHeader>
          <Avatar className='mb-6 h-[60px] w-[60px] self-center bg-destructive-light text-center'>
            <TriangleAlert
              width={30}
              height={30}
              className='mx-auto self-center text-destructive'
            />
          </Avatar>
          <AlertDialogTitle className='text-red text-center text-[32px] text-destructive-dark'>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-grey-800 whitespace-pre-line text-center text-base'>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='w-1/2 border border-neutral-200'>
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onContinueClick}
            className={cn(
              buttonVariants({ variant: 'destructive' }),
              'w-1/2 bg-destructive hover:bg-destructive-light'
            )}
          >
            {continueButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
