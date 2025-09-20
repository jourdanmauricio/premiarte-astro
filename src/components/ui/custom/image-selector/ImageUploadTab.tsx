import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaService } from '@/lib/services/mediaService';
import { toast } from 'sonner';
import type { Image } from '@/shared/types';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import InputField from '@/components/ui/custom/input-field';
import Dropdown from '@/components/ui/custom/dropdown';

const imageTagsList = [
  { id: 'Categorías', description: 'Categorías' },
  { id: 'Productos', description: 'Productos' },
  { id: 'Páginas', description: 'Páginas' },
  { id: 'Otros', description: 'Otros' },
];

const ImageFormSchema = z.object({
  alt: z.string().min(1, 'El nombre alternativo es requerido'),
  tag: z.string().min(1, 'La carpeta es requerida'),
  observation: z.string().optional(),
});

interface ImageUploadTabProps {
  onUploadSuccess: (image: Image) => void;
  onStateChange?: (state: {
    canSubmit: boolean;
    isLoading: boolean;
    submit: () => void;
  }) => void;
}

const defaultValues = {
  alt: '',
  tag: 'Otros',
  observation: '',
};

export function ImageUploadTab({
  onUploadSuccess,
  onStateChange,
}: ImageUploadTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof ImageFormSchema>>({
    resolver: zodResolver(ImageFormSchema),
    defaultValues,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: z.infer<typeof ImageFormSchema>) => {
      if (!selectedFile) {
        throw new Error('No se ha seleccionado ningún archivo');
      }
      return mediaService.uploadImage(selectedFile, {
        alt: data.alt,
        tag: data.tag,
        observation: data.observation,
      });
    },
    onSuccess: (result) => {
      // Invalidar queries para actualizar la lista
      queryClient.invalidateQueries({ queryKey: ['images'] });
      onUploadSuccess(result);
      resetForm();
      toast.success('Imagen subida correctamente');
    },
    onError: (error) => {
      console.error('Error al subir imagen:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al subir la imagen'
      );
    },
  });

  // Notificar al padre sobre el estado
  useEffect(() => {
    if (onStateChange) {
      const canSubmit = Boolean(selectedFile && form.formState.isValid);
      const isLoading = uploadMutation.isPending;
      const submit = () => {
        if (canSubmit) {
          const formData = form.getValues();
          uploadMutation.mutate(formData);
        }
      };
      onStateChange({ canSubmit, isLoading, submit });
    }
  }, [
    selectedFile,
    form.formState.isValid,
    uploadMutation.isPending,
    onStateChange,
    form,
    uploadMutation,
  ]);

  const resetForm = () => {
    form.reset(defaultValues);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-completar campos del formulario
    const fileName = file.name.split('.')[0];
    form.setValue('alt', fileName);
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='space-y-6'>
      {/* Área de drop */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${selectedFile ? 'border-green-500 bg-green-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileInputChange}
          className='hidden'
        />

        {previewUrl ? (
          <div className='space-y-4'>
            <img
              src={previewUrl}
              alt='Preview'
              className='max-h-64 mx-auto rounded-lg shadow-md'
            />
            <p className='text-sm text-gray-600'>{selectedFile?.name}</p>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl('');
              }}
            >
              Cambiar imagen
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='text-6xl text-gray-400'>📁</div>
            <div>
              <p className='text-lg font-medium text-gray-900 mb-2'>
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className='text-sm text-gray-500'>
                Formatos soportados: JPG, PNG, GIF, WebP
              </p>
            </div>
            <Button type='button' variant='outline' onClick={handleBrowseClick}>
              Seleccionar archivo
            </Button>
          </div>
        )}
      </div>

      {/* Formulario */}
      {selectedFile && (
        <Form {...form}>
          <form className='space-y-4'>
            <InputField
              label='Nombre alternativo (ALT)'
              name='alt'
              placeholder='Descripción de la imagen'
              form={form}
            />

            <Dropdown
              list={imageTagsList}
              label='Carpeta'
              name='tag'
              placeholder='Selecciona una carpeta'
              form={form}
            />

            <InputField
              label='Observaciones (opcional)'
              name='observation'
              placeholder='Notas adicionales sobre la imagen'
              form={form}
            />
          </form>
        </Form>
      )}
    </div>
  );
}
