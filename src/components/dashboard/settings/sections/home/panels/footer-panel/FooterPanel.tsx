import type z from 'zod';
import type { Image, SocialLink } from '@/shared/types';
import type { UseFormReturn } from 'react-hook-form';
import type { SettingsFormSchema } from '@/shared/schemas';
import InputField from '@/components/ui/custom/input-field';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomTable } from '@/components/ui/custom/CustomTable';
import { getSocialLinkColumns } from '@/components/dashboard/settings/sections/home/panels/footer-panel/table/solcialLinksColumns';
import { PlusIcon } from 'lucide-react';
import { SocialLinkModal } from '@/components/dashboard/settings/sections/home/panels/footer-panel/SocialLinkModal';
import { ImageSelector } from '@/components/ui/custom/single-image-selector/image-selector';
import TextareaField from '@/components/ui/custom/textarea-field';
import CustomAlertDialog from '@/components/ui/custom/custom-alert-dialog';

interface FooterPanelProps {
  form: UseFormReturn<z.infer<typeof SettingsFormSchema>>;
  images: Image[];
}

const FooterPanel = ({ form, images }: FooterPanelProps) => {
  const [logoImageSelectorOpen, setLogoImageSelectorOpen] = useState(false);
  const [currentSocialLinkIndex, setCurrentSocialLinkIndex] = useState<
    number | null
  >(null);
  const [socialLinkModalIsOpen, setSocialLinkModalIsOpen] = useState(false);
  const [currentSocialLink, setCurrentSocialLink] = useState<SocialLink | null>(
    null
  );
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

  const socialLinks = form.watch('home.footer') || [];

  const selectedLogoImage = images?.find(
    (img) => img.id === form.watch('home.footer.logoId')
  );

  const handleAddSocialLink = useCallback(() => {
    setCurrentSocialLink(null);
    setCurrentSocialLinkIndex(null);
    setSocialLinkModalIsOpen(true);
  }, []);

  const handleEditSocialLink = useCallback(
    (socialLink: SocialLink) => {
      const index =
        socialLinks.socialLinks?.findIndex(
          (link) =>
            link.href === socialLink.href && link.label === socialLink.label
        ) ?? null;
      setCurrentSocialLink(socialLink);
      setCurrentSocialLinkIndex(index !== -1 ? index : null);
      setSocialLinkModalIsOpen(true);
    },
    [socialLinks.socialLinks]
  );

  const handleDeleteSocialLink = useCallback((socialLink: SocialLink) => {
    setCurrentSocialLink(socialLink);
    setDeleteModalIsOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (currentSocialLink !== null) {
      const currentSocialLinks = [
        ...(form.getValues('home.footer.socialLinks') || []),
      ];
      const newSocialLinks = currentSocialLinks.filter(
        (_, index) => index !== currentSocialLinkIndex
      );
      form.setValue('home.footer.socialLinks', newSocialLinks, {
        shouldDirty: true,
      });
      setDeleteModalIsOpen(false);
      setCurrentSocialLink(null);
      setCurrentSocialLinkIndex(null);
    }
  }, [currentSocialLink, form]);

  const handleMoveSocialLink = useCallback(
    (fromIndex: number, toIndex: number) => {
      const currentTestimonials = [
        ...(form.getValues('home.testimonials.testimonials') || []),
      ];
      const [movedSlide] = currentTestimonials.splice(fromIndex, 1);
      currentTestimonials.splice(toIndex, 0, movedSlide);
      form.setValue('home.testimonials.testimonials', currentTestimonials, {
        shouldDirty: true,
      });
    },
    [form]
  );

  // Crear datos enriquecidos para la tabla
  const enrichedSocialLinks = useMemo(() => {
    return socialLinks.socialLinks
      ? socialLinks.socialLinks.map((socialLink, index) => {
          const image = images.find((img) => img.id === socialLink.image);
          return {
            ...socialLink,
            index,
            imageUrl: image?.url || '',
            imageAlt: image?.alt || 'Sin imagen',
          };
        })
      : [];
  }, [socialLinks.socialLinks, images]);

  const columns = useMemo(
    () =>
      getSocialLinkColumns({
        onEdit: handleEditSocialLink,
        onDelete: handleDeleteSocialLink,
        onMove: handleMoveSocialLink,
      }),
    [handleEditSocialLink, handleDeleteSocialLink, handleMoveSocialLink]
  );

  const handleImageSelection = (selectedImages: Image[]) => {
    if (selectedImages.length > 0) {
      form.setValue('home.footer.logoId', selectedImages[0].id, {
        shouldDirty: true,
      });
    }
    setLogoImageSelectorOpen(false);
  };

  return (
    <>
      <h2 className='text-xl font-bold text-gray-900'>Footer</h2>
      <p>Contenido del footer</p>

      <div className='grid grid-cols-2 gap-8 p-6 items-center'>
        <div className='space-y-2 w-full'>
          <label className='text-sm font-medium'>Logo Imagen</label>
          <div className='flex items-center gap-4'>
            {selectedLogoImage ? (
              <div className='flex items-center gap-4'>
                <img
                  src={selectedLogoImage.url}
                  alt={selectedLogoImage.alt}
                  className='w-16 h-16 object-cover rounded-md border'
                />
                <div>
                  <p className='text-sm font-medium'>{selectedLogoImage.alt}</p>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setLogoImageSelectorOpen(true)}
                  >
                    Cambiar imagen
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type='button'
                variant='outline'
                onClick={() => setLogoImageSelectorOpen(true)}
              >
                Seleccionar imagen
              </Button>
            )}
          </div>
        </div>

        <InputField
          label='Nombre del sitio'
          name='home.footer.siteName'
          form={form}
        />

        <InputField
          label='Texto del sitio'
          name='home.footer.siteText'
          form={form}
        />
        <div></div>

        <div className='col-span-2'>
          <div className='flex items-center justify-between gap-2'>
            <h3 className='text-lg font-bold text-gray-900'>Redes sociales</h3>
            <Button
              type='button'
              variant='default'
              onClick={handleAddSocialLink}
            >
              <PlusIcon className='size-5 mr-2' />
              Agregar Red Social
            </Button>
          </div>
          <CustomTable
            data={enrichedSocialLinks}
            columns={columns}
            isLoading={false}
            globalFilter={{}}
            error={false}
            sorting={[]}
            handleSorting={() => {}}
            pageIndex={0}
            setPageIndex={() => {}}
            globalFilterFn={() => true}
          />
        </div>

        <InputField
          label='Acerca de'
          name='home.footer.siteAbout'
          form={form}
        />
        <div></div>
        <div className='col-span-2'>
          <TextareaField
            label='Descripción de acerca de'
            name='home.footer.siteAboutDescription'
            form={form}
          />
        </div>

        <InputField
          label='Dirección'
          name='home.footer.siteAddress'
          form={form}
        />
        <InputField label='Ciudad' name='home.footer.siteCity' form={form} />
        <InputField label='Teléfono' name='home.footer.sitePhone' form={form} />
        <InputField label='Email' name='home.footer.siteEmail' form={form} />
      </div>

      {socialLinkModalIsOpen && (
        <SocialLinkModal
          open={socialLinkModalIsOpen}
          closeModal={() => setSocialLinkModalIsOpen(false)}
          socialLink={currentSocialLink}
          socialLinkIndex={currentSocialLinkIndex}
          form={form}
          images={images}
        />
      )}

      {logoImageSelectorOpen && (
        <ImageSelector
          open={logoImageSelectorOpen}
          closeModal={() => setLogoImageSelectorOpen(false)}
          onSelect={handleImageSelection}
          multipleSelect={false}
          selectedImages={selectedLogoImage ? [selectedLogoImage] : []}
        />
      )}
      {deleteModalIsOpen && (
        <CustomAlertDialog
          title='Eliminar red social'
          description={`¿Estás seguro de querer eliminar la red social "${currentSocialLink?.label}"? Esta acción no se puede deshacer.`}
          cancelButtonText='Cancelar'
          continueButtonText={'Eliminar'}
          onContinueClick={handleConfirmDelete}
          open={deleteModalIsOpen}
          onCloseDialog={() => {
            setDeleteModalIsOpen(false);
            setCurrentSocialLink(null);
            setCurrentSocialLinkIndex(null);
          }}
        />
      )}
    </>
  );
};

export { FooterPanel };
