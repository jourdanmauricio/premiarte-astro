import type { APIRoute } from 'astro';
import { Categories, db, eq, Images } from 'astro:db';

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const categories = await db
    .select({
      id: Categories.id,
      name: Categories.name,
      description: Categories.description,
      image: {
        id: Images.id,
        url: Images.url,
      },
    })
    .from(Categories)
    .leftJoin(Images, eq(Categories.image, Images.id));

  console.log('categories', categories);

  return new Response(JSON.stringify(categories), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
