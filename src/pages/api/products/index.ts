import type { APIRoute } from 'astro';

const users = [
  {
    id: '1',
    email: 'admin@tienda.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin',
  },
  {
    id: '2',
    email: 'cliente@test.com',
    password: 'cliente123',
    name: 'Cliente Test',
    role: 'cliente',
  },
];

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  return new Response(JSON.stringify(users), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
