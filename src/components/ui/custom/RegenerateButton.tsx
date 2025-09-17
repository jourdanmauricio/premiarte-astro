import { toast } from 'sonner';
import { useState } from 'react';
import { RefreshCwIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { regenerateService } from '@/lib/services/regenerateService';
import CustomConfirmDialog from '@/components/ui/custom/custom-confirm-dialog';
import { Avatar } from '@/components/ui/avatar';

const RegenerateButton = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateService.regenerateSite(),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        if (data.deploymentId) {
          toast.info(`Deployment ID: ${data.deploymentId}`);
        }
        setIsSuccess(true);

        // Resetear el estado de éxito después de 6 segundos
        setTimeout(() => setIsSuccess(false), 6000);
      } else {
        toast.error('Error en la regeneración del sitio');
      }
    },
    onError: (error) => {
      console.error('Error de regeneración:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al regenerar el sitio'
      );
    },
  });

  const handleRegenerate = () => {
    if (regenerateMutation.isPending) return;
    setShowConfirmDialog(true);
  };

  const handleConfirmRegenerate = () => {
    setShowConfirmDialog(false);
    regenerateMutation.mutate();
  };

  const handleCancelRegenerate = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Button
        onClick={handleRegenerate}
        disabled={regenerateMutation.isPending}
        className={`relative transition-all duration-300 ${
          isSuccess
            ? 'bg-green-600 hover:bg-green-700'
            : regenerateMutation.isError
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
        }`}
        size='sm'
      >
        {regenerateMutation.isPending ? (
          <>
            <RefreshCwIcon className='h-4 w-4 mr-2 animate-spin' />
            Regenerando...
          </>
        ) : isSuccess ? (
          <>
            <CheckIcon className='h-4 w-4 mr-2' />
            ¡Regenerado!
          </>
        ) : regenerateMutation.isError ? (
          <>
            <AlertCircleIcon className='h-4 w-4 mr-2' />
            Error
          </>
        ) : (
          <>
            <RefreshCwIcon className='h-4 w-4 mr-2' />
            Regenerar Sitio
          </>
        )}
      </Button>

      <CustomConfirmDialog
        open={showConfirmDialog}
        onCloseDialog={handleCancelRegenerate}
        onContinueClick={handleConfirmRegenerate}
        onCancelClick={handleCancelRegenerate}
        title='Regenerar Sitio'
        description={
          <div className='text-center'>
            <p>¿Estás seguro de que deseas regenerar todo el sitio?</p>
            <p className='mt-2 text-sm text-gray-600'>
              Puede tardar varios minutos.
            </p>
          </div>
        }
        cancelButtonText='Cancelar'
        continueButtonText='Regenerar'
        iconComponente={
          <Avatar className='mb-2 h-12 w-12 bg-blue-100 text-center'>
            <RefreshCwIcon
              width={38}
              height={38}
              className='mx-auto self-center text-blue-600'
            />
          </Avatar>
        }
      />
    </>
  );
};

export default RegenerateButton;
