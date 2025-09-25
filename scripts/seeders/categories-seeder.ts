import { turso } from '../../src/lib/turso';

// Datos de categorías para el seeder
const categoriesData = [
  {
    name: 'Banderas',
    slug: 'banderas',
    description:
      'Banderas institucionales, corporativas y promocionales para eventos especiales y representación de marcas con calidad premium',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Boligrafos',
    slug: 'boligrafos',
    description:
      'Bolígrafos personalizados de alta calidad ideales para regalos corporativos, eventos y promociones empresariales duraderas',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Copas',
    slug: 'copas',
    description:
      'Copas trofeo elegantes para competencias deportivas, ceremonias de premiación y reconocimientos especiales con diseño exclusivo',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Cristales',
    slug: 'cristales',
    description:
      'Figuras, premios y piezas en cristal de alta calidad con grabados precisos para ocasiones especiales y reconocimientos',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Cuadros',
    slug: 'cuadros',
    description:
      'Cuadros conmemorativos, diplomas y reconocimientos enmarcados con materiales premium para decoración y homenajes especiales',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Enmarcado',
    slug: 'enmarcado',
    description:
      'Servicio profesional de enmarcado para diplomas, fotografías y obras de arte con variedad de estilos y materiales disponibles',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Escritura',
    slug: 'escritura',
    description:
      'Artículos de escritura personalizados incluyendo portaminas, marcadores y sets ejecutivos para regalos empresariales de calidad',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Grabado',
    slug: 'grabado',
    description:
      'Servicios de grabado láser y tradicional sobre metales, cristales y plásticos para personalización precisa de productos',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Indumentaria',
    slug: 'indumentaria',
    description:
      'Ropa corporativa, uniformes y prendas promocionales personalizadas con bordado y estampado de alta durabilidad y calidad',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Llaveros',
    slug: 'llaveros',
    description:
      'Llaveros personalizados en diversos materiales y diseños ideales para regalos promocionales, eventos y recuerdos corporativos',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Mates',
    slug: 'mates',
    description:
      'Mates personalizados, sets de mate y yerbera con diseños exclusivos para regalos tradicionales y promociones especiales',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Medallas',
    slug: 'medallas',
    description:
      'Medallas deportivas, conmemorativas y de reconocimiento en metales nobles con terminaciones de alta calidad y durabilidad',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Merchandising',
    slug: 'merchandising',
    description:
      'Productos promocionales y merchandising corporativo para estrategias de marketing, fidelización de clientes y eventos especiales',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Placas',
    slug: 'placas',
    description:
      'Placas recordatorias, identificatorias y conmemorativas en bronce, aluminio y acero para interiores y exteriores duraderas',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Placas Profesionales',
    slug: 'placas-profesionales',
    description:
      'Placas para consultorios, profesionales independientes y empresas con diseños elegantes y información grabada permanentemente',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Plaquetas',
    slug: 'plaquetas',
    description:
      'Plaquetas conmemorativas en metales nobles para reconocimientos, aniversarios y homenajes especiales con grabados precisos',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Plaquetas Enmarcadas',
    slug: 'plaquetas-enmarcadas',
    description:
      'Plaquetas enmarcadas en madera con vidrio para reconocimientos institucionales, jubilaciones y eventos corporativos importantes',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Platos y Bandejas',
    slug: 'platos-y-bandejas',
    description:
      'Platos y bandejas grabadas para aniversarios, bodas y eventos especiales con diseños personalizados y elegancia distintiva',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Premios',
    slug: 'premios',
    description:
      'Premios y reconocimientos especiales en diversos materiales para ceremonias, logros destacados y eventos corporativos memorables',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Protección Sanitaria',
    slug: 'proteccion-sanitaria',
    description:
      'Elementos de protección e higiene personalizados para empresas, instituciones y cumplimiento de protocolos sanitarios actuales',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Regaleria',
    slug: 'regaleria',
    description:
      'Amplia variedad de regalos corporativos y personales para todas las ocasiones con opciones de personalización y calidad garantizada',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Sellos',
    slug: 'sellos',
    description:
      'Sellos personalizados para oficinas, profesionales y empresas con diferentes tipos de entintado y diseños a medida',
    imageId: 1,
    featured: false,
  },
  {
    name: 'Trofeos',
    slug: 'trofeos',
    description:
      'Trofeos deportivos, académicos y corporativos en diversos estilos y tamaños para reconocer logros y competencias importantes',
    imageId: 1,
    featured: false,
  },
];

export class CategoriesSeeder {
  static async cleanDatabase() {
    console.log('🧹 Limpiando base de datos...');

    try {
      // Eliminar en orden debido a las foreign keys
      await turso.execute('DELETE FROM QuoteItem');
      await turso.execute('DELETE FROM Quote');
      await turso.execute('DELETE FROM ProductRelated');
      await turso.execute('DELETE FROM ProductCategory');
      await turso.execute('DELETE FROM ProductImage');
      await turso.execute('DELETE FROM Product');
      await turso.execute('DELETE FROM Category');
      await turso.execute('DELETE FROM Image');

      // Resetear autoincrement counters
      await turso.execute(
        'DELETE FROM sqlite_sequence WHERE name IN ("Product", "Category", "Image", "Quote", "QuoteItem")'
      );

      console.log('✅ Base de datos limpiada exitosamente');
    } catch (error) {
      console.error('❌ Error limpiando base de datos:', error);
      throw error;
    }
  }

  static async seedImages() {
    console.log('📸 Creando imagen por defecto...');

    try {
      const { rows } = await turso.execute({
        sql: `
          INSERT INTO Image (url, alt, tag, observation)
          VALUES (?, ?, ?, ?)
          RETURNING id
        `,
        args: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
          'Imagen por defecto para categorías',
          'category',
          'Imagen placeholder para todas las categorías',
        ],
      });

      const imageId = rows[0]?.id as number;
      console.log(`  ✅ Imagen creada (ID: ${imageId})`);
      return [imageId];
    } catch (error) {
      console.error('❌ Error creando imagen:', error);
      throw error;
    }
  }

  static async seedCategories(imageIds: number[]) {
    console.log('📂 Creando categorías...');

    const categoryIds: number[] = [];

    for (let i = 0; i < categoriesData.length; i++) {
      const category = categoriesData[i];
      const imageId = imageIds[0]; // Usar la primera (y única) imagen

      try {
        const { rows } = await turso.execute({
          sql: `
            INSERT INTO Category (name, slug, description, imageId, featured)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id
          `,
          args: [
            category.name,
            category.slug,
            category.description,
            imageId,
            category.featured,
          ],
        });

        const categoryId = rows[0]?.id as number;
        categoryIds.push(categoryId);
        console.log(
          `  ✅ Categoría creada: ${category.name} (ID: ${categoryId})`
        );
      } catch (error) {
        console.error(`  ❌ Error creando categoría ${category.name}:`, error);
        throw error;
      }
    }

    return categoryIds;
  }

  static async run() {
    console.log('🌱 Iniciando seeder de categorías...\n');

    try {
      // 1. Limpiar base de datos
      await this.cleanDatabase();
      console.log('');

      // 2. Crear imágenes
      const imageIds = await this.seedImages();
      console.log('');

      // 3. Crear categorías
      const categoryIds = await this.seedCategories(imageIds);
      console.log('');

      // 4. Resumen
      console.log('📊 Resumen del seeding:');
      console.log(`  • ${imageIds.length} imágenes creadas`);
      console.log(`  • ${categoryIds.length} categorías creadas`);
      console.log(
        `  • ${categoriesData.filter((c) => c.featured).length} categorías destacadas`
      );
      console.log('');
      console.log('🎉 ¡Seeder completado exitosamente!');

      return {
        success: true,
        imagesCreated: imageIds.length,
        categoriesCreated: categoryIds.length,
        imageIds,
        categoryIds,
      };
    } catch (error) {
      console.error('💥 Error ejecutando seeder:', error);
      throw error;
    }
  }

  static async verify() {
    console.log('🔍 Verificando datos creados...\n');

    try {
      // Verificar imágenes
      const { rows: images } = await turso.execute(
        'SELECT COUNT(*) as count FROM Image'
      );
      const imageCount = images[0]?.count as number;

      // Verificar categorías
      const { rows: categories } = await turso.execute(
        'SELECT COUNT(*) as count FROM Category'
      );
      const categoryCount = categories[0]?.count as number;

      // Verificar categorías destacadas
      const { rows: featuredCategories } = await turso.execute(
        'SELECT COUNT(*) as count FROM Category WHERE featured = 1'
      );
      const featuredCount = featuredCategories[0]?.count as number;

      console.log('📈 Estado actual de la base de datos:');
      console.log(`  • Imágenes: ${imageCount}`);
      console.log(`  • Categorías: ${categoryCount}`);
      console.log(`  • Categorías destacadas: ${featuredCount}`);
      console.log('');

      // Mostrar categorías creadas
      const { rows: categoryList } = await turso.execute(`
        SELECT c.id, c.name, c.slug, c.featured, i.url as imageUrl
        FROM Category c
        LEFT JOIN Image i ON c.imageId = i.id
        ORDER BY c.id
      `);

      console.log('📋 Categorías creadas:');
      categoryList.forEach((cat: any) => {
        const featured = cat.featured ? '⭐' : '  ';
        console.log(`  ${featured} ${cat.id}. ${cat.name} (${cat.slug})`);
      });

      return {
        imageCount,
        categoryCount,
        featuredCount,
        categories: categoryList,
      };
    } catch (error) {
      console.error('❌ Error verificando datos:', error);
      throw error;
    }
  }
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  CategoriesSeeder.run()
    .then(() => CategoriesSeeder.verify())
    .then(() => {
      console.log('✨ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}
