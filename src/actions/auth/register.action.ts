import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const registerUser = defineAction({
  accept: 'form',
  input: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    remenber_me: z.boolean().optional(),
  }),
  handler: async ({ email, password, remenber_me }) => {
    console.log('email, password, remenber_me', email, password, remenber_me);
    return true;
  },
});
