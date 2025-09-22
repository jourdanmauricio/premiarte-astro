import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { Database } from '@/lib/db';

export const subscribeToNewsletter = defineAction({
  accept: 'json',
  input: z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    email: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Correo electrónico inválido'),
  }),
  handler: async ({ name, email }) => {
    try {
      // Verificar si el email ya existe
      const existingSubscriber = await Database.getNewsletterSubscriberByEmail(email);
      
      if (existingSubscriber) {
        // Si existe pero está inactivo, reactivar
        if (!existingSubscriber.isActive) {
          await Database.reactivateNewsletterSubscriber(email);
          return {
            success: true,
            message: 'Te has suscrito exitosamente al newsletter',
          };
        } else {
          return {
            success: false,
            message: 'Este correo ya está suscrito al newsletter',
          };
        }
      }

      // Crear nueva suscripción
      const subscriber = await Database.createNewsletterSubscriber({
        name,
        email,
      });

      return {
        success: true,
        message: 'Te has suscrito exitosamente al newsletter',
        subscriber,
      };
    } catch (error) {
      console.error('Error al suscribirse al newsletter:', error);
      return {
        success: false,
        message: 'Error interno del servidor. Por favor, inténtalo más tarde.',
      };
    }
  },
});
