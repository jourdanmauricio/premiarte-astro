import { Categories, db, Images } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
  // TODO

  await db.insert(Images).values([
    {
      url: 'https://res.cloudinary.com/dn7npxeof/image/upload/v1757250828/Premiarte/C0008_c7d2696a7c.jpg',
      alt: 'C0008',
      tag: 'categoría',
      observation: 'Imagen de la categoría C0008',
    },
    {
      url: 'https://res.cloudinary.com/dn7npxeof/image/upload/v1756714913/Premiarte/thumbnail_B0003_2d7d5a611c.png',
      alt: 'B0003',
      tag: 'categoría',
      observation: 'Imagen de la categoría B0003',
    },
    {
      url: 'https://res.cloudinary.com/dn7npxeof/image/upload/v1756701025/Premiarte/thumbnail_B0002_e07ff3d7fc.jpg',
      alt: 'B0002',
      tag: 'categoría',
      observation: 'Imagen de la categoría B0002',
    },
  ]);

  await db.insert(Categories).values([
    { name: 'Categoría 1', description: 'Descripción 1', image: 1 },
    { name: 'Categoría 2', description: 'Descripción 2', image: 2 },
    { name: 'Categoría 3', description: 'Descripción 3', image: 3 },
  ]);

  console.log('Seed executed!!!');
}
