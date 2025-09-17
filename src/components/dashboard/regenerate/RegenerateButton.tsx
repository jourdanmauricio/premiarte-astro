import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { regenerateService } from '@/lib/services/regenerateService';
import { toast } from 'sonner';

const RegenerateButton = () => {
  const [isSuccess, setIsSuccess] = useState(false);

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

    // Confirmar antes de regenerar
    if (
      window.confirm(
        '¿Estás seguro de que deseas regenerar todo el sitio?\n\nEsto iniciará un deploy completo en Coolify:\n1. Pull del código actualizado\n2. Build del proyecto\n3. Deploy de la nueva versión\n\nPuede tardar varios minutos.'
      )
    ) {
      regenerateMutation.mutate();
    }
  };

  return (
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
  );
};

export default RegenerateButton;
