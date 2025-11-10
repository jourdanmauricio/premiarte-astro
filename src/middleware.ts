import { sequence, defineMiddleware } from 'astro:middleware';
import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from '@clerk/astro/server';

const isProtectedRoutes = createRouteMatcher([
  '/dashboard(.*)',
  '/api/media(.*)',
  '/api/products(.*)',
  '/api/categories(.*)',
  '/api/settings(.*)',
  '/api/regenerate(.*)',
]);

// Middleware para manejar Cloudflare proxy con SSL Flexible
// Cloudflare envía el protocolo original en X-Forwarded-Proto
const cloudflareProxyMiddleware = defineMiddleware((context, next) => {
  const forwardedProto = context.request.headers.get('x-forwarded-proto');
  const forwardedHost = context.request.headers.get('x-forwarded-host');

  // Si Cloudflare indica que la conexión original era HTTPS
  if (forwardedProto === 'https' && forwardedHost) {
    // Reconstruir la URL con HTTPS
    const url = new URL(context.request.url);
    url.protocol = 'https:';
    url.host = forwardedHost;

    // Crear nueva request con el protocolo y host correctos
    const newRequest = new Request(url.toString(), {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
      // @ts-ignore - Astro maneja esto correctamente
      duplex: 'half',
    });

    context.request = newRequest;
  }

  return next();
});

// Middleware de Clerk con protección de rutas
const clerkAuthMiddleware = clerkMiddleware((auth, context) => {
  const { userId } = auth();

  if (isProtectedRoutes(context.request) && !userId) {
    return Response.redirect(new URL('/', context.request.url));
  }

  return;
});

// Combinar middlewares: primero Cloudflare, luego Clerk
export const onRequest = sequence(
  cloudflareProxyMiddleware,
  clerkAuthMiddleware
);
