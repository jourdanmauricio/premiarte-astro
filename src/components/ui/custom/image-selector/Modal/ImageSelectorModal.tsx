import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Image } from '@/shared/types';
import { ImageUploadTab } from './tabs/ImageUploadTab';
import ImageSelectorTab from '@/components/ui/custom/image-selector/Modal/tabs/ImageSelectorTab';

export const imageTagsList = [
  { id: 'Todas', description: 'Todas' },
  { id: 'Categorías', description: 'Categorías' },
  { id: 'Productos', description: 'Productos' },
  { id: 'Páginas', description: 'Páginas' },
  { id: 'Otros', description: 'Otros' },
];

interface ImageSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (images: Image[]) => void;
  allImages: Image[];
  selectedImageIds: number[];
  maxImages: number;
  defaultTag: string;
}

export function ImageSelectorModal({
  open,
  onClose,
  onSelect,
  allImages,
  selectedImageIds,
  maxImages,
  defaultTag,
}: ImageSelectorModalProps) {
  const [activeTab, setActiveTab] = useState('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelected, setTempSelected] = useState<Image[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<{
    canSubmit: boolean;
    isLoading: boolean;
    submit: () => void;
  }>({
    canSubmit: false,
    isLoading: false,
    submit: () => {},
  });

  // Reset when modal opens/closes
  useEffect(() => {
    if (open) {
      setTempSelected([]);
      setSearchTerm('');
      setSelectedFolder(null);
      setActiveTab('select');
    }
  }, [open]);

  // Agrupar imágenes por carpeta
  const folderData = imageTagsList.map((folder) => {
    const count =
      folder.id === 'Todas'
        ? allImages.length
        : allImages.filter(
            (img) =>
              img.tag === folder.id || (!img.tag && folder.id === 'Otros')
          ).length;

    return {
      ...folder,
      count,
    };
  });

  // Filtrar imágenes según carpeta y búsqueda
  const filteredImages = allImages.filter((image) => {
    // Filtro por carpeta
    let folderMatch = true;
    if (selectedFolder && selectedFolder !== 'Todas') {
      if (selectedFolder === 'Otros') {
        folderMatch = !image.tag || image.tag === 'Otros';
      } else {
        folderMatch = image.tag === selectedFolder;
      }
    }

    // Filtro por búsqueda
    const searchMatch =
      !searchTerm ||
      image.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.tag && image.tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return folderMatch && searchMatch;
  });

  const canSelectMore = () => {
    return selectedImageIds.length + tempSelected.length < maxImages;
  };

  const handleUploadSuccess = useCallback((newImage: Image) => {
    // Cambiar a tab de selección y agregar la nueva imagen
    setActiveTab('select');
    setTempSelected([newImage]);
  }, []);

  const handleStateChange = useCallback(
    (state: { canSubmit: boolean; isLoading: boolean; submit: () => void }) => {
      setUploadState(state);
    },
    []
  );

  const handleConfirm = () => {
    onSelect(tempSelected);
    setTempSelected([]);
    setSearchTerm('');
    setSelectedFolder(null);
  };

  const handleCancel = () => {
    setTempSelected([]);
    setSearchTerm('');
    setSelectedFolder(null);
    onClose();
  };

  const getFolderIcon = (folderId: string) => {
    const icons: Record<string, string> = {
      Todas: '📁',
      Categorías: '📂',
      Productos: '📦',
      Páginas: '📄',
      Otros: '🗂️',
    };
    return icons[folderId] || '📁';
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className='sm:max-w-6xl w-full max-h-[90vh] h-[90vh] flex flex-col'>
        <DialogHeader className='w-full'>
          <DialogTitle>Selector de Imágenes</DialogTitle>
          <DialogDescription>
            Selecciona hasta {maxImages} imágenes. Ya tienes{' '}
            {selectedImageIds.length} seleccionadas.
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 flex flex-col min-h-0'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='flex flex-col h-full'
          >
            <TabsList className='grid w-full grid-cols-2 flex-shrink-0'>
              <TabsTrigger value='select'>Seleccionar</TabsTrigger>
              <TabsTrigger value='upload'>Subir</TabsTrigger>
            </TabsList>

            <TabsContent
              value='select'
              className='flex-1 mt-4 overflow-hidden flex flex-col'
            >
              <ImageSelectorTab
                tempSelected={tempSelected}
                canSelectMore={canSelectMore}
                selectedImageIds={selectedImageIds}
                maxImages={maxImages}
                selectedFolder={selectedFolder}
                folderData={folderData}
                setSelectedFolder={setSelectedFolder}
                getFolderIcon={getFolderIcon}
                filteredImages={filteredImages}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setTempSelected={setTempSelected}
              />
            </TabsContent>

            <TabsContent value='upload' className='flex-1 mt-4 overflow-auto'>
              <ImageUploadTab
                onUploadSuccess={handleUploadSuccess}
                onStateChange={handleStateChange}
                defaultTag={defaultTag}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Botones condicionales según la tab activa */}
        {activeTab === 'select' && (
          <div className='flex justify-end gap-3 pt-4 border-t flex-shrink-0'>
            <Button variant='outline' onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={tempSelected.length === 0}
            >
              Agregar {tempSelected.length} imagen
              {tempSelected.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className='flex justify-end gap-3 pt-4 border-t flex-shrink-0'>
            <Button variant='outline' onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              onClick={uploadState.submit}
              disabled={!uploadState.canSubmit || uploadState.isLoading}
            >
              {uploadState.isLoading ? 'Subiendo...' : 'Subir imagen'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
