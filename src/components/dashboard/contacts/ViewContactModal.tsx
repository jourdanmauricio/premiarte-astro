import type { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import InputField from '@/components/ui/custom/input-field';
import TextareaField from '@/components/ui/custom/textarea-field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { contactFormSchema } from '@/shared/schemas';
import type { Contact } from '@/shared/types/contact';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

interface ViewContactModalProps {
  open: boolean;
  closeModal: () => void;
  contact: Contact | null;
}

const ViewContactModal = ({
  open,
  closeModal,
  contact,
}: ViewContactModalProps) => {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: contact?.name,
      email: contact?.email,
      phone: contact?.phone,
      message: contact?.message,
    },
  });
  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ver contacto</DialogTitle>
          <DialogDescription>
            Información detallada del contacto recibido.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className='space-y-4 mt-4'>
            <InputField label='Nombre' name='name' form={form} readOnly />
            <InputField label='Email' name='email' form={form} readOnly />
            <InputField label='Teléfono' name='phone' form={form} readOnly />
            <TextareaField
              label='Mensaje'
              name='message'
              form={form}
              rows={5}
              readOnly
            />
            <Button
              type='button'
              onClick={closeModal}
              className='mt-8 min-w-[150px] block ml-auto'
            >
              Cerrar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ViewContactModal;
