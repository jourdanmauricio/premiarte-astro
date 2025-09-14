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

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    // Login exitoso - crear sesión simple
    cookies.set(
      'user-session',
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }),
      {
        httpOnly: true,
        secure: false, // true en producción
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 días
      }
    );

    // Redirigir según rol
    if (user.role === 'admin') {
      return redirect('/dashboard');
    } else {
      return redirect('/cuenta');
    }
  } else {
    // Credenciales inválidas
    return redirect('/login?error=invalid');
  }
};
