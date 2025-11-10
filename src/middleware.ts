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

// export const onRequest = clerkMiddleware();
export const onRequest = clerkMiddleware((auth, context) => {
  const { userId, has } = auth();

  if (isProtectedRoutes(context.request) && !userId) {
    return Response.redirect(new URL('/', context.request.url));
  }

  return;
});
