import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Database } from '@/lib/db';

export const sendContactForm = defineAction({
  accept: 'json',
  input: z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Correo electrónico inválido'),
    phone: z.string().optional(),
    message: z.string().min(1, 'El mensaje es requerido'),
  }),
  handler: async ({ name, email, phone, message }) => {
    try {
      const contact = await Database.createContact({
        name,
        email,
        phone: phone || '',
        message,
      });

      return {
        success: true,
        message: 'Mensaje enviado correctamente. Te contactaremos pronto.',
        data: contact,
      };
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      return {
        success: false,
        message: 'Error interno del servidor. Por favor, inténtalo más tarde.',
      };
    }
  },
});
